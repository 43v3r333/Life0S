import { mediator } from "../../sdk/cqrs.js";
import { CreateLedgerCommand } from "./Application/Commands/CreateLedger/CreateLedgerCommand.js";
import { CreateLedgerHandler } from "./Application/Commands/CreateLedger/CreateLedgerHandler.js";
import { CreateAccountCommand } from "./Application/Commands/CreateAccount/CreateAccountCommand.js";
import { CreateAccountHandler } from "./Application/Commands/CreateAccount/CreateAccountHandler.js";
import { PostJournalEntryCommand } from "./Application/Commands/PostJournalEntry/PostJournalEntryCommand.js";
import { PostJournalEntryHandler } from "./Application/Commands/PostJournalEntry/PostJournalEntryHandler.js";
import { ImportBankStatementCommand } from "./Application/Commands/ImportBankStatement/ImportBankStatementCommand.js";
import { ImportBankStatementHandler } from "./Application/Commands/ImportBankStatement/ImportBankStatementHandler.js";
import { ReconcileTransactionsCommand } from "./Application/Commands/ReconcileTransactions/ReconcileTransactionsCommand.js";
import { ReconcileTransactionsHandler } from "./Application/Commands/ReconcileTransactions/ReconcileTransactionsHandler.js";
import { CalculateZakahQuery } from "./Application/Queries/CalculateZakah/CalculateZakahQuery.js";
import { CalculateZakahHandler } from "./Application/Queries/CalculateZakah/CalculateZakahHandler.js";
import { GetPortfolioValuationQuery } from "./Application/Queries/GetPortfolioValuation/GetPortfolioValuationQuery.js";
import { GetPortfolioValuationHandler } from "./Application/Queries/GetPortfolioValuation/GetPortfolioValuationHandler.js";
import { GetLedgerSummaryQuery } from "./Application/Queries/GetLedgerSummary/GetLedgerSummaryQuery.js";
import { GetLedgerSummaryHandler } from "./Application/Queries/GetLedgerSummary/GetLedgerSummaryHandler.js";

export function initFinanceOSModule(): void {
  console.log("[FINANCE OS] Initializing Enterprise Financial Bounded Context...");

  // Register Commands
  mediator.registerHandler<any, any>("CreateLedgerCommand", new CreateLedgerHandler());
  mediator.registerHandler<any, any>("CreateAccountCommand", new CreateAccountHandler());
  mediator.registerHandler<any, any>("PostJournalEntryCommand", new PostJournalEntryHandler());
  mediator.registerHandler<any, any>("ImportBankStatementCommand", new ImportBankStatementHandler());
  mediator.registerHandler<any, any>("ReconcileTransactionsCommand", new ReconcileTransactionsHandler());

  // Register Queries
  mediator.registerHandler<any, any>("CalculateZakahQuery", new CalculateZakahHandler());
  mediator.registerHandler<any, any>("GetPortfolioValuationQuery", new GetPortfolioValuationHandler());
  mediator.registerHandler<any, any>("GetLedgerSummaryQuery", new GetLedgerSummaryHandler());

  console.log("[FINANCE OS] Bounded Context successfully registered with Mediator.");
}
