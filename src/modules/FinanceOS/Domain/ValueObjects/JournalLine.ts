import { ValueObject } from "../../../../sdk/domain.js";

export class JournalLine extends ValueObject {
  constructor(
    public readonly accountId: string,
    public readonly type: "Debit" | "Credit",
    public readonly amount: number
  ) {
    super();
    if (amount <= 0) {
      throw new Error("Journal line amount must be greater than zero.");
    }
  }

  protected *getEqualityComponents(): Iterable<any> {
    yield this.accountId;
    yield this.type;
    yield this.amount;
  }
}
