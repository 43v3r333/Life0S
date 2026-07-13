import { IValidator } from "../../../../../sdk/cqrs.js";
import { PostJournalEntryCommand } from "./PostJournalEntryCommand.js";

export class PostJournalEntryValidator implements IValidator<PostJournalEntryCommand> {
  public validate(request: PostJournalEntryCommand): string | null {
    if (!request.ledgerId || request.ledgerId.trim() === "") {
      return "Ledger ID is required.";
    }
    if (!request.description || request.description.trim() === "") {
      return "Journal entry description is required.";
    }
    if (!request.lines || request.lines.length < 2) {
      return "A journal entry must contain at least two transaction lines (double entry).";
    }
    
    let debitsTotal = 0;
    let creditsTotal = 0;

    for (let i = 0; i < request.lines.length; i++) {
      const line = request.lines[i];
      if (!line.accountId) {
        return `Line ${i + 1} is missing an account ID assignment.`;
      }
      if (line.amount <= 0) {
        return `Line ${i + 1} amount must be greater than zero.`;
      }
      if (line.type !== "Debit" && line.type !== "Credit") {
        return `Line ${i + 1} type must be either 'Debit' or 'Credit'.`;
      }
      if (line.type === "Debit") {
        debitsTotal += line.amount;
      } else {
        creditsTotal += line.amount;
      }
    }

    if (Math.abs(debitsTotal - creditsTotal) > 0.0001) {
      return `Double entry unbalance: Total Debits (£${debitsTotal.toFixed(2)}) must equal Total Credits (£${creditsTotal.toFixed(2)}).`;
    }

    return null;
  }
}
