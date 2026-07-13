import { ICommand } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";

export class CreateLedgerCommand implements ICommand<string> {
  public readonly _responseType?: Result<string>;

  constructor(
    public readonly name: string,
    public readonly currency: string,
    public readonly tenantId: string = "system-default",
    public readonly correlationId: string = "corr_" + Math.random().toString(36).substr(2, 9)
  ) {}
}
