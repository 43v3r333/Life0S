import { ICommand } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { AccountType } from "../../../Domain/Entities/Account.js";

export class CreateAccountCommand implements ICommand<string> {
  public readonly _responseType?: Result<string>;

  constructor(
    public readonly ledgerId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly type: AccountType,
    public readonly parentId?: string,
    public readonly isHalal: boolean = true,
    public readonly tenantId: string = "system-default",
    public readonly correlationId: string = "corr_" + Math.random().toString(36).substr(2, 9)
  ) {}
}
