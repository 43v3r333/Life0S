import { IQuery } from "../../../../../sdk/cqrs.js";

export class GetPortfolioValuationQuery implements IQuery<any> {
  public readonly _responseType?: any;

  constructor(
    public readonly bypassCache: boolean = true,
    public readonly tenantId: string = "system-default"
  ) {}
}
