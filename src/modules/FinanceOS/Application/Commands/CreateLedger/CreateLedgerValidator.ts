import { IValidator } from "../../../../../sdk/cqrs.js";
import { CreateLedgerCommand } from "./CreateLedgerCommand.js";

export class CreateLedgerValidator implements IValidator<CreateLedgerCommand> {
  public validate(request: CreateLedgerCommand): string | null {
    if (!request.name || request.name.trim() === "") {
      return "Ledger name is required and cannot be empty.";
    }
    if (!request.currency || request.currency.trim().length !== 3) {
      return "Currency code must be a valid 3-letter standard ISO code (e.g., GBP, USD, EUR).";
    }
    return null;
  }
}
