import { ICommand } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";

export class ImportBankStatementCommand implements ICommand<string[]> {
  public readonly _responseType?: Result<string[]>;

  constructor(
    public readonly ledgerId: string,
    public readonly csvContent: string,
    public readonly tenantId: string = "system-default",
    public readonly correlationId: string = "corr_" + Math.random().toString(36).substr(2, 9)
  ) {}
}
