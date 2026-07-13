import { ICommand } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";

export interface JournalLineInput {
  accountId: string;
  type: "Debit" | "Credit";
  amount: number;
}

export class PostJournalEntryCommand implements ICommand<string> {
  public readonly _responseType?: Result<string>;

  constructor(
    public readonly ledgerId: string,
    public readonly description: string,
    public readonly lines: JournalLineInput[],
    public readonly isPurified: boolean = false,
    public readonly tenantId: string = "system-default",
    public readonly correlationId: string = "corr_" + Math.random().toString(36).substr(2, 9)
  ) {}
}
