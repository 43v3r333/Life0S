import { BusinessRule } from "../../../../sdk/domain.js";
import { JournalLine } from "../ValueObjects/JournalLine.js";

export class DoubleEntryBalancesRule implements BusinessRule {
  public readonly message = "Double-entry violation: The sum of Debits must exactly equal the sum of Credits inside a Journal Entry.";

  constructor(private readonly lines: JournalLine[]) {}

  public isBroken(): boolean {
    if (!this.lines || this.lines.length === 0) return true;

    let totalDebits = 0;
    let totalCredits = 0;

    for (const line of this.lines) {
      if (line.type === "Debit") {
        totalDebits += line.amount;
      } else {
        totalCredits += line.amount;
      }
    }

    // Use epsilon or simple rounding to handle JS floating point issues
    return Math.abs(totalDebits - totalCredits) > 0.0001;
  }
}
