import { Repository } from "../../../../sdk/repository.js";
import { Ledger } from "../../Domain/Entities/Ledger.js";
import { Account, AccountType } from "../../Domain/Entities/Account.js";
import { JournalEntry } from "../../Domain/Entities/JournalEntry.js";
import { JournalLine } from "../../Domain/ValueObjects/JournalLine.js";
import { getDb, saveDb } from "../../../../../server/db.js";

type StoredRecord = Record<string, unknown> & { id: string; tenantId: string; isDeleted?: boolean };

export class LedgerRepository extends Repository<any> {
  constructor(tenantId: string = "system-default") {
    super("ledgers", tenantId);
  }

  public async getLedgerById(id: string): Promise<Ledger | null> {
    const rawLedgers = this.getCollection();
    const raw = rawLedgers.find(l => l.id === id && l.tenantId === this._tenantId && !l.isDeleted);
    if (!raw) return null;

    // Load related accounts from accounts database collection
    const db = getDb();
    const rawAccounts = db.accounts || [];
    const ledgerAccounts = rawAccounts
      .filter((a: StoredRecord) => a.ledgerId === id && a.tenantId === this._tenantId && !a.isDeleted)
      .map((a: StoredRecord) => new Account(
        String(a.id),
        String(a.tenantId),
        String(a.code),
        String(a.name),
        a.type as AccountType,
        a.parentId as string | undefined,
        Number(a.balance || 0),
        a.isHalal !== false,
        Number(a.purifiedAmount || 0),
        String(a.createdBy || "System"),
        String(a.modifiedBy || "System"),
        String(a.createdUtc || new Date().toISOString()),
        String(a.modifiedUtc || new Date().toISOString()),
        Number(a.version || 1)
      ));

    return new Ledger(
      String(raw.id),
      String(raw.tenantId),
      String(raw.name),
      String(raw.currency),
      raw.status as "Active" | "Archived",
      ledgerAccounts,
      String(raw.createdBy || "System"),
      String(raw.modifiedBy || "System"),
      String(raw.createdUtc || new Date().toISOString()),
      String(raw.modifiedUtc || new Date().toISOString()),
      Number(raw.version || 1)
    );
  }

  public async saveLedger(ledger: Ledger): Promise<void> {
    if (ledger.tenantId !== this._tenantId) {
      throw new Error("[FINANCE REPOSITORY] Tenant scope violation while saving ledger.");
    }
    const rawLedgers = this.getCollection();
    const idx = rawLedgers.findIndex(l => l.id === ledger.id && l.tenantId === this._tenantId);
    const serializedLedger = {
      id: ledger.id,
      tenantId: ledger.tenantId,
      name: ledger.name,
      currency: ledger.currency,
      status: ledger.status,
      createdBy: ledger.createdBy,
      modifiedBy: ledger.modifiedBy,
      createdUtc: ledger.createdUtc,
      modifiedUtc: ledger.modifiedUtc,
      version: ledger.version,
      isDeleted: ledger.isDeleted
    };

    if (idx !== -1) {
      rawLedgers[idx] = serializedLedger;
    } else {
      rawLedgers.push(serializedLedger);
    }
    this.setCollection(rawLedgers);

    // Save accounts inside the ledger
    const db = getDb();
    const allAccounts = db.accounts || [];
    
    for (const acc of ledger.accounts) {
      if (acc.tenantId !== this._tenantId) {
        throw new Error("[FINANCE REPOSITORY] Tenant scope violation while saving account.");
      }
      const accIdx = allAccounts.findIndex((a: StoredRecord) => a.id === acc.id && a.tenantId === this._tenantId);
      const serializedAccount = {
        id: acc.id,
        ledgerId: ledger.id,
        tenantId: acc.tenantId,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        parentId: acc.parentId,
        balance: acc.balance,
        isHalal: acc.isHalal,
        purifiedAmount: acc.purifiedAmount,
        createdBy: acc.createdBy,
        modifiedBy: acc.modifiedBy,
        createdUtc: acc.createdUtc,
        modifiedUtc: acc.modifiedUtc,
        version: acc.version,
        isDeleted: acc.isDeleted
      };

      if (accIdx !== -1) {
        allAccounts[accIdx] = serializedAccount;
      } else {
        allAccounts.push(serializedAccount);
      }
    }
    db.accounts = allAccounts;

    await saveDb();
  }
}

export class JournalEntryRepository extends Repository<any> {
  constructor(tenantId: string = "system-default") {
    super("journalEntries", tenantId);
  }

  public async getJournalById(id: string): Promise<JournalEntry | null> {
    const rawCollection = this.getCollection();
    const raw = rawCollection.find(j => j.id === id && j.tenantId === this._tenantId && !j.isDeleted);
    if (!raw) return null;

    const lines = ((raw.lines as { accountId: string; type: "Debit" | "Credit"; amount: number }[] | undefined) || []).map(l => new JournalLine(l.accountId, l.type, l.amount));

    return JournalEntry.rehydrate({
      id: raw.id,
      tenantId: raw.tenantId,
      ledgerId: String(raw.ledgerId),
      description: String(raw.description),
      lines,
      isPurified: raw.isPurified === true,
      signature: typeof raw.signature === "string" ? raw.signature : undefined,
      isPosted: raw.isPosted === true,
      postedUtc: typeof raw.postedUtc === "string" ? raw.postedUtc : undefined,
      createdBy: String(raw.createdBy || "System"),
      modifiedBy: String(raw.modifiedBy || "System"),
      createdUtc: String(raw.createdUtc || new Date().toISOString()),
      modifiedUtc: String(raw.modifiedUtc || new Date().toISOString()),
      version: Number(raw.version || 1),
      isDeleted: raw.isDeleted === true
    });
  }

  public async saveJournal(entry: JournalEntry): Promise<void> {
    if (entry.tenantId !== this._tenantId) {
      throw new Error("[FINANCE REPOSITORY] Tenant scope violation while saving journal.");
    }
    const rawCollection = this.getCollection();
    const idx = rawCollection.findIndex(j => j.id === entry.id && j.tenantId === this._tenantId);
    const serialized = {
      id: entry.id,
      tenantId: entry.tenantId,
      ledgerId: entry.ledgerId,
      description: entry.description,
      isPurified: entry.isPurified,
      signature: entry.signature,
      isPosted: entry.isPosted,
      postedUtc: entry.postedUtc,
      lines: entry.lines.map(l => ({ accountId: l.accountId, type: l.type, amount: l.amount })),
      createdBy: entry.createdBy,
      modifiedBy: entry.modifiedBy,
      createdUtc: entry.createdUtc,
      modifiedUtc: entry.modifiedUtc,
      version: entry.version,
      isDeleted: entry.isDeleted
    };

    if (idx !== -1) {
      rawCollection[idx] = serialized;
    } else {
      rawCollection.push(serialized);
    }
    this.setCollection(rawCollection);
    await saveDb();
  }
}
