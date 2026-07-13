import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { GetPortfolioValuationQuery } from "./GetPortfolioValuationQuery.js";
import { 
  HalalInvestmentSpecification, 
  InvestmentCandidate 
} from "../../../Domain/Specifications/HalalInvestmentSpecification.js";
import { getDb, saveDb } from "../../../../../../server/db.js";

export interface PortfolioSummary {
  totalValue: number;
  compliantValue: number;
  nonCompliantValue: number;
  complianceRate: number;
  purificationObligation: number;
  holdings: any[];
}

export class GetPortfolioValuationHandler implements IRequestHandler<GetPortfolioValuationQuery, Result<PortfolioSummary>> {
  public async handle(request: GetPortfolioValuationQuery): Promise<Result<PortfolioSummary>> {
    try {
      console.log(`[APPLICATION] [QUERY] Retrieving portfolio valuation for tenant: ${request.tenantId}`);

      const db = getDb();
      db.portfolio = db.portfolio || [];

      // Seed default holdings if empty to ensure data availability on first load
      if (db.portfolio.length === 0) {
        db.portfolio = [
          { id: "inv_1", name: "Wahed FTSE USA Shariah ETF", symbol: "HLAL", type: "ETF", shares: 420, currentPrice: 42.5, purchasePrice: 38.0, status: "Compliant", interestDebtRatio: 8.4, impureRevenueRatio: 1.2, dividendPaid: 150 },
          { id: "inv_2", name: "SP Funds S&P 500 Shariah ETF", symbol: "SPSK", type: "ETF", shares: 280, currentPrice: 31.2, purchasePrice: 29.5, status: "Compliant", interestDebtRatio: 12.1, impureRevenueRatio: 2.1, dividendPaid: 95 },
          { id: "inv_3", name: "Physical Allocated Gold Bar (Vaulted)", symbol: "GOLD", type: "Precious Metals", shares: 200, currentPrice: 77.0, purchasePrice: 65.5, status: "Compliant", interestDebtRatio: 0, impureRevenueRatio: 0, dividendPaid: 0 },
          { id: "inv_4", name: "Conventional High-Yield Tech Bond", symbol: "COVT", type: "Bond", shares: 100, currentPrice: 10.0, purchasePrice: 10.0, status: "Non-Compliant", interestDebtRatio: 95.0, impureRevenueRatio: 98.0, dividendPaid: 45 }
        ];
        await saveDb();
      }

      const spec = new HalalInvestmentSpecification();
      
      let totalValue = 0;
      let compliantValue = 0;
      let nonCompliantValue = 0;
      let purificationObligation = 0;

      const evaluatedHoldings = db.portfolio.map((hold: any) => {
        const value = hold.shares * hold.currentPrice;
        totalValue += value;

        // Map holding to domain specification candidate
        const candidate: InvestmentCandidate = {
          name: hold.name,
          symbol: hold.symbol,
          status: hold.status,
          interestDebtRatio: hold.interestDebtRatio || 0,
          impureRevenueRatio: hold.impureRevenueRatio || 0
        };

        // Evaluate business rule via specification pattern
        const isCompliant = spec.isSatisfiedBy(candidate);

        if (isCompliant) {
          compliantValue += value;
          // Calculate dividend purification: (dividendPaid * impureRevenueRatio / 100)
          const purification = hold.dividendPaid ? (hold.dividendPaid * (candidate.impureRevenueRatio / 100)) : 0;
          purificationObligation += purification;
        } else {
          nonCompliantValue += value;
          // Non-compliant assets: 100% of dividends paid or interest yield must be purified
          purificationObligation += hold.dividendPaid || 0;
        }

        return {
          ...hold,
          value: parseFloat(value.toFixed(2)),
          isCompliant,
          calculatedPurification: parseFloat((hold.dividendPaid ? (hold.dividendPaid * ((hold.impureRevenueRatio || 0) / 100)) : 0).toFixed(2))
        };
      });

      const summary: PortfolioSummary = {
        totalValue: parseFloat(totalValue.toFixed(2)),
        compliantValue: parseFloat(compliantValue.toFixed(2)),
        nonCompliantValue: parseFloat(nonCompliantValue.toFixed(2)),
        complianceRate: totalValue > 0 ? parseFloat(((compliantValue / totalValue) * 100).toFixed(2)) : 100,
        purificationObligation: parseFloat(purificationObligation.toFixed(2)),
        holdings: evaluatedHoldings
      };

      return Result.success(summary);
    } catch (err: any) {
      console.error(`[APPLICATION] [QUERY FAILURE] GetPortfolioValuation failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/query-failed",
        title: "Portfolio Evaluation Failed",
        status: 500,
        detail: err.message || "An unexpected error occurred during security screening."
      });
    }
  }
}
