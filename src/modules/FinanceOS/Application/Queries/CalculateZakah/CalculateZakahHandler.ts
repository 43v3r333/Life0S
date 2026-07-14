import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { CalculateZakahQuery } from "./CalculateZakahQuery.js";
import { LedgerRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";
import { calculateZakahBreakdown, ZakahBreakdown } from "./ZakahCalculator.js";

export type { ZakahBreakdown } from "./ZakahCalculator.js";

export class CalculateZakahHandler implements IRequestHandler<CalculateZakahQuery, Result<ZakahBreakdown>> {
  public async handle(request: CalculateZakahQuery): Promise<Result<ZakahBreakdown>> {
    try {
      console.log(`[APPLICATION] [QUERY] Previewing Zakah liability for ledger: ${request.ledgerId}`);

      const repo = new LedgerRepository(request.tenantId);
      const ledger = await repo.getLedgerById(request.ledgerId);
      if (!ledger) {
        return Result.failure({
          type: "https://projectjannah.io/errors/not-found",
          title: "Ledger Not Found",
          status: 404,
          detail: `Ledger with ID '${request.ledgerId}' was not found for Zakah calculation.`
        });
      }

      return Result.success(calculateZakahBreakdown(ledger, request.goldPricePerGram, request.silverPricePerGram));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during tax calculation.";
      console.error(`[APPLICATION] [QUERY FAILURE] CalculateZakah failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/query-failed",
        title: "Report Generation Denied",
        status: 500,
        detail: message
      });
    }
  }
}
