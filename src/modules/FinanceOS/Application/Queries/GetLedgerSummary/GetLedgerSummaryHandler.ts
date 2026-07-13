import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { GetLedgerSummaryQuery } from "./GetLedgerSummaryQuery.js";
import { LedgerRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";

export interface LedgerSummaryReport {
  ledgerId: string;
  name: string;
  currency: string;
  status: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  reconciliationBalance: number;
  isBalanced: boolean;
  accounts: any[];
}

export class GetLedgerSummaryHandler implements IRequestHandler<GetLedgerSummaryQuery, Result<LedgerSummaryReport>> {
  public async handle(request: GetLedgerSummaryQuery): Promise<Result<LedgerSummaryReport>> {
    try {
      console.log(`[APPLICATION] [QUERY] Compiling ledger report for ledger: ${request.ledgerId}`);

      const repo = new LedgerRepository(request.tenantId);
      const ledger = await repo.getLedgerById(request.ledgerId);
      
      if (!ledger) {
        return Result.failure({
          type: "https://projectjannah.io/errors/not-found",
          title: "Ledger Not Found",
          status: 404,
          detail: `Ledger with ID '${request.ledgerId}' was not found in current Tenant context.`
        });
      }

      let totalAssets = 0;
      let totalLiabilities = 0;
      let totalEquity = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;

      for (const account of ledger.accounts) {
        switch (account.type) {
          case "Asset":
            totalAssets += account.balance;
            break;
          case "Liability":
            totalLiabilities += account.balance;
            break;
          case "Equity":
            totalEquity += account.balance;
            break;
          case "Revenue":
            totalRevenue += account.balance;
            break;
          case "Expense":
            totalExpenses += account.balance;
            break;
        }
      }

      // Accounting Equation: Assets = Liabilities + Equity + (Revenue - Expenses)
      // reconciliationBalance = Assets - (Liabilities + Equity + (Revenue - Expenses))
      const netProfit = totalRevenue - totalExpenses;
      const rightHandSide = totalLiabilities + totalEquity + netProfit;
      const reconciliationBalance = totalAssets - rightHandSide;
      const isBalanced = Math.abs(reconciliationBalance) < 0.0001;

      const report: LedgerSummaryReport = {
        ledgerId: ledger.id,
        name: ledger.name,
        currency: ledger.currency,
        status: ledger.status,
        totalAssets: parseFloat(totalAssets.toFixed(2)),
        totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
        totalEquity: parseFloat(totalEquity.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        reconciliationBalance: parseFloat(reconciliationBalance.toFixed(2)),
        isBalanced,
        accounts: ledger.accounts.map(a => ({
          id: a.id,
          code: a.code,
          name: a.name,
          type: a.type,
          parentId: a.parentId,
          balance: parseFloat(a.balance.toFixed(2)),
          isHalal: a.isHalal,
          purifiedAmount: parseFloat(a.purifiedAmount.toFixed(2))
        }))
      };

      return Result.success(report);
    } catch (err: any) {
      console.error(`[APPLICATION] [QUERY FAILURE] GetLedgerSummary failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/query-failed",
        title: "Report Generation Denied",
        status: 500,
        detail: err.message || "An unexpected error occurred during statement compilation."
      });
    }
  }
}
