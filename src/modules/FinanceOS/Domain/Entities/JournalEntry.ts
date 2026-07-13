import { Entity, DomainException } from "../../../../sdk/domain.js";
import { JournalLine } from "../ValueObjects/JournalLine.js";
import { DoubleEntryBalancesRule } from "../BusinessRules/DoubleEntryBalancesRule.js";
import { HalalTransactionRule } from "../BusinessRules/HalalTransactionRule.js";

export class JournalEntry extends Entity<string> {
  public isPosted: boolean = false;
  public postedUtc?: string;

  constructor(
    id: string,
    tenantId: string,
    public readonly ledgerId: string,
    public readonly description: string,
    public readonly lines: JournalLine[],
    public readonly isPurified: boolean = false,
    public readonly signature?: string,
    createdBy: string = "System",
    modifiedBy: string = "System",
    createdUtc: string = new Date().toISOString(),
    modifiedUtc: string = new Date().toISOString(),
    version: number = 1
  ) {
    super(id, tenantId, createdBy, modifiedBy, createdUtc, modifiedUtc, version);
    
    // Check Double Entry balances immediately upon constructor validation
    DomainException.checkRule(new DoubleEntryBalancesRule(this.lines));
    
    // Check Halal Shariah compliance constraints
    DomainException.checkRule(new HalalTransactionRule(this.lines, this.description, this.isPurified));
  }

  public post(): void {
    if (this.isPosted) {
      throw new Error("Journal entry has already been posted to the general ledger.");
    }
    this.isPosted = true;
    this.postedUtc = new Date().toISOString();
  }
}
