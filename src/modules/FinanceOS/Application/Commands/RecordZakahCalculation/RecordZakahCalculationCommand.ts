import { ICommand } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { ZakahBreakdown } from "../../Queries/CalculateZakah/ZakahCalculator.js";

export interface RecordedZakahCalculationResult {
  id: string;
  auditId: string;
  correlationId: string;
  breakdown: ZakahBreakdown;
  idempotentReplay: boolean;
}

export class RecordZakahCalculationCommand implements ICommand<RecordedZakahCalculationResult> {
  public readonly _responseType?: Result<RecordedZakahCalculationResult>;

  constructor(
    public readonly ledgerId: string,
    public readonly goldPricePerGram: number,
    public readonly silverPricePerGram: number,
    public readonly idempotencyKey: string,
    public readonly tenantId: string = "system-default",
    public readonly correlationId: string = "corr_" + Math.random().toString(36).substr(2, 9)
  ) {}
}
