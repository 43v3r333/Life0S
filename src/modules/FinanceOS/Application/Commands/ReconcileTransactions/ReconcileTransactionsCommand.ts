import { ICommand } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";

export class ReconcileTransactionsCommand implements ICommand<void> {
  public readonly _responseType?: Result<void>;

  constructor(
    public readonly ledgerId: string,
    public readonly statementLineId: string,
    public readonly journalEntryId: string,
    public readonly tenantId: string = "system-default",
    public readonly correlationId: string = "corr_" + Math.random().toString(36).substr(2, 9)
  ) {}
}
