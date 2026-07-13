import { AggregateRoot, DomainException } from "../../../../sdk/domain.js";
import { Account, AccountType } from "./Account.js";
import { JournalEntry } from "./JournalEntry.js";
import { JournalLine } from "../ValueObjects/JournalLine.js";
import { 
  LedgerCreatedEvent, 
  AccountCreatedEvent, 
  JournalEntryPostedEvent 
} from "../DomainEvents/FinanceEvents.js";

export class Ledger extends AggregateRoot<string> {
  private readonly _accounts: Account[] = [];

  constructor(
    id: string,
    tenantId: string,
    public readonly name: string,
    public readonly currency: string,
    public status: "Active" | "Archived" = "Active",
    accounts: Account[] = [],
    createdBy: string = "System",
    modifiedBy: string = "System",
    createdUtc: string = new Date().toISOString(),
    modifiedUtc: string = new Date().toISOString(),
    version: number = 1
  ) {
    super(id, tenantId, createdBy, modifiedBy, createdUtc, modifiedUtc, version);
    this._accounts = [...accounts];
  }

  public get accounts(): readonly Account[] {
    return this._accounts;
  }

  public static create(id: string, tenantId: string, name: string, currency: string): Ledger {
    const ledger = new Ledger(id, tenantId, name, currency);
    ledger.raiseDomainEvent(new LedgerCreatedEvent(id, tenantId, name, currency));
    return ledger;
  }

  public createAccount(
    id: string,
    code: string,
    name: string,
    type: AccountType,
    parentId?: string,
    isHalal: boolean = true
  ): Account {
    // Check if account code already exists
    const existing = this._accounts.find(a => a.code === code);
    if (existing) {
      throw new Error(`Account code '${code}' already exists in ledger '${this.id}'.`);
    }

    // Verify parent account if specified
    if (parentId) {
      const parent = this._accounts.find(a => a.id === parentId);
      if (!parent) {
        throw new Error(`Parent account with ID '${parentId}' not found.`);
      }
    }

    const account = new Account(id, this.tenantId, code, name, type, parentId, 0, isHalal, 0, this.createdBy);
    this._accounts.push(account);

    this.raiseDomainEvent(new AccountCreatedEvent(id, this.tenantId, code, name, type, parentId));
    return account;
  }

  public postJournalEntry(
    id: string,
    description: string,
    lines: JournalLine[],
    isPurified: boolean = false
  ): JournalEntry {
    // Instantiate Journal Entry - this will run double-entry & compliance validations!
    const entry = new JournalEntry(id, this.tenantId, this.id, description, lines, isPurified, "sig_" + Math.random().toString(36).substr(2, 9), this.createdBy);
    entry.post();

    // Apply ledger entries to account balances
    for (const line of lines) {
      const account = this._accounts.find(a => a.id === line.accountId);
      if (!account) {
        throw new Error(`Account with ID '${line.accountId}' does not exist in this Ledger.`);
      }

      // Accounting equation impact based on account type
      // Debits increase Assets and Expenses, decrease Liabilities, Equity, and Revenue.
      // Credits increase Liabilities, Equity, and Revenue, decrease Assets and Expenses.
      let impactAmount = 0;
      const isDebit = line.type === "Debit";

      if (account.type === "Asset" || account.type === "Expense") {
        impactAmount = isDebit ? line.amount : -line.amount;
      } else {
        impactAmount = isDebit ? -line.amount : line.amount;
      }

      account.updateBalance(impactAmount);
      
      // If interest purification event, apply purification impact
      if (isPurified && (description.toLowerCase().includes("interest") || description.toLowerCase().includes("riba"))) {
        account.purify(line.amount);
      }
    }

    this.raiseDomainEvent(
      new JournalEntryPostedEvent(
        entry.id,
        this.tenantId,
        description,
        lines.map(l => ({ accountId: l.accountId, type: l.type, amount: l.amount }))
      )
    );

    return entry;
  }
}
