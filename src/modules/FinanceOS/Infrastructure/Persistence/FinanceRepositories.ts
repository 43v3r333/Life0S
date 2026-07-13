import { Repository } from "../../../../sdk/repository.js";
import { Ledger } from "../../Domain/Entities/Ledger.js";
import { Account, AccountType } from "../../Domain/Entities/Account.js";
import { JournalEntry } from "../../Domain/Entities/JournalEntry.js";
import { JournalLine } from "../../Domain/ValueObjects/JournalLine.js";
import { getDb, saveDb } from "../../../../../server/db.js";

export class LedgerRepository extends Repository<any> {
  constructor(tenantId: string = "system-default") {
    super("ledgers", tenantId);
  }

  public async getLedgerById(id: string): Promise<Ledger | null> {
    const rawLedgers = this.getCollection();
    const raw = rawLedgers.find(l => l.id === id && !l.isDeleted);
    if (!raw) return null;

    // Load related accounts from accounts database collection
    const db = getDb();
    const rawAccounts = db.accounts || [];
    const ledgerAccounts = rawAccounts
      .filter((a: any) => a.ledgerId === id && !a.isDeleted)
      .map((a: any) => new Account(
        a.id,
        a.tenantId,
        a.code,
        a.name,
        a.type as AccountType,
        a.parentId,
        a.balance,
        a.isHalal,
        a.purifiedAmount,
        a.createdBy,
        a.modifiedBy,
        a.createdUtc,
        a.modifiedUtc,
        a.version
      ));

    return new Ledger(
      raw.id,
      raw.tenantId,
      raw.name,
      raw.currency,
      raw.status,
      ledgerAccounts,
      raw.createdBy,
      raw.modifiedBy,
      raw.createdUtc,
      raw.modifiedUtc,
      raw.version
    );
  }

  public async saveLedger(ledger: Ledger): Promise<void> {
    const rawLedgers = this.getCollection();
    const idx = rawLedgers.findIndex(l => l.id === ledger.id);
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
      const accIdx = allAccounts.findIndex((a: any) => a.id === acc.id);
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
    const raw = rawCollection.find(j => j.id === id && !j.isDeleted);
    if (!raw) return null;

    const lines = (raw.lines || []).map((l: any) => new JournalLine(l.accountId, l.type, l.amount));

    return new JournalEntry(
      raw.id,
      raw.tenantId,
      raw.ledgerId,
      raw.description,
      lines,
      raw.isPurified,
      raw.signature,
      raw.createdBy,
      raw.modifiedBy,
      raw.createdUtc,
      raw.modifiedUtc,
      raw.version
    );
  }

  public async saveJournal(entry: JournalEntry): Promise<void> {
    const rawCollection = this.getCollection();
    const idx = rawCollection.findIndex(j => j.id === entry.id);
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
