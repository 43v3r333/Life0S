import { IValidator } from "../../../../../sdk/cqrs.js";
import { CreateAccountCommand } from "./CreateAccountCommand.js";

export class CreateAccountValidator implements IValidator<CreateAccountCommand> {
  public validate(request: CreateAccountCommand): string | null {
    if (!request.ledgerId || request.ledgerId.trim() === "") {
      return "Ledger ID is required.";
    }
    if (!request.code || request.code.trim() === "") {
      return "Account code is required.";
    }
    if (!request.name || request.name.trim() === "") {
      return "Account name is required.";
    }
    const validTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
    if (!validTypes.includes(request.type)) {
      return `Invalid Account Type: '${request.type}'. Must be one of: Asset, Liability, Equity, Revenue, Expense.`;
    }
    return null;
  }
}
