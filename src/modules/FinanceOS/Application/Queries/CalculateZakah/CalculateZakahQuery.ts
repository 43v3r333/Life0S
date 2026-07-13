import { IQuery } from "../../../../../sdk/cqrs.js";

export class CalculateZakahQuery implements IQuery<any> {
  public readonly _responseType?: any;

  constructor(
    public readonly ledgerId: string,
    public readonly goldPricePerGram: number = 77.0, // Default £77/g
    public readonly silverPricePerGram: number = 0.95, // Default £0.95/g
    public readonly bypassCache: boolean = true,
    public readonly tenantId: string = "system-default"
  ) {}
}
