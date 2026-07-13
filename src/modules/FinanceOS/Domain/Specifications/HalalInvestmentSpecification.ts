import { BaseSpecification } from "../../../../sdk/domain.js";

export interface InvestmentCandidate {
  name: string;
  symbol: string;
  status: string; // e.g., "Compliant", "Screened-Compliant", "Non-Compliant"
  interestDebtRatio: number; // max 33%
  impureRevenueRatio: number; // max 5%
}

export class HalalInvestmentSpecification extends BaseSpecification<InvestmentCandidate> {
  public isSatisfiedBy(candidate: InvestmentCandidate): boolean {
    if (!candidate) return false;
    
    const hasCompliantStatus = 
      candidate.status === "Compliant" || 
      candidate.status === "Screened-Compliant" ||
      candidate.status === "Halal (Permissible)" ||
      candidate.status === "Halal (Compliant)" ||
      candidate.status === "Halal (Screened-Permissible)";
    
    const compliesWithDebtLimit = candidate.interestDebtRatio < 33;
    const compliesWithImpureLimit = candidate.impureRevenueRatio < 5;

    return hasCompliantStatus && compliesWithDebtLimit && compliesWithImpureLimit;
  }
}
