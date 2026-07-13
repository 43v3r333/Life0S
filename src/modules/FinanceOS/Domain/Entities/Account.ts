import { Entity } from "../../../../sdk/domain.js";

export type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

export class Account extends Entity<string> {
  public balance: number;
  public purifiedAmount: number;

  constructor(
    id: string,
    tenantId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly type: AccountType,
    public readonly parentId: string | undefined,
    balance: number = 0,
    public readonly isHalal: boolean = true,
    purifiedAmount: number = 0,
    createdBy: string = "System",
    modifiedBy: string = "System",
    createdUtc: string = new Date().toISOString(),
    modifiedUtc: string = new Date().toISOString(),
    version: number = 1
  ) {
    super(id, tenantId, createdBy, modifiedBy, createdUtc, modifiedUtc, version);
    this.balance = balance;
    this.purifiedAmount = purifiedAmount;
  }

  public updateBalance(amount: number): void {
    this.balance += amount;
  }

  public purify(amount: number): void {
    if (amount <= 0) return;
    this.purifiedAmount += amount;
    this.balance -= amount; // remove from account balance upon purification
  }
}
