import { BusinessRule } from "../../../../sdk/domain.js";
import { JournalLine } from "../ValueObjects/JournalLine.js";

export class HalalTransactionRule implements BusinessRule {
  public readonly message = "Shariah Compliance violation: Unsanctioned conventional interest (Riba) recorded in a Halal account without proper purification tracking.";

  constructor(
    private readonly lines: JournalLine[],
    private readonly description: string,
    private readonly isPurified: boolean
  ) {}

  public isBroken(): boolean {
    const lowerDesc = this.description.toLowerCase();
    const isInterestRelated = lowerDesc.includes("interest") || lowerDesc.includes("riba") || lowerDesc.includes("usury");
    
    // If interest related and NOT flagged as purified, it breaks the rule
    if (isInterestRelated && !this.isPurified) {
      return true;
    }
    return false;
  }
}
