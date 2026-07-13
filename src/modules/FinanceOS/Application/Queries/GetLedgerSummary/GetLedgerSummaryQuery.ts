import { IQuery } from "../../../../../sdk/cqrs.js";

export class GetLedgerSummaryQuery implements IQuery<any> {
  public readonly _responseType?: any;

  constructor(
    public readonly ledgerId: string,
    public readonly bypassCache: boolean = true,
    public readonly tenantId: string = "system-default"
  ) {}
}
