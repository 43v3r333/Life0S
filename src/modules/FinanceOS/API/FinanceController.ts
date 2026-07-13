import express, { Router, Request, Response } from "express";
import { mediator } from "../../../sdk/cqrs.js";
import { openApiGenerator } from "../../../sdk/openapi.js";
import { CreateLedgerCommand } from "../Application/Commands/CreateLedger/CreateLedgerCommand.js";
import { CreateAccountCommand } from "../Application/Commands/CreateAccount/CreateAccountCommand.js";
import { PostJournalEntryCommand } from "../Application/Commands/PostJournalEntry/PostJournalEntryCommand.js";
import { ImportBankStatementCommand } from "../Application/Commands/ImportBankStatement/ImportBankStatementCommand.js";
import { ReconcileTransactionsCommand } from "../Application/Commands/ReconcileTransactions/ReconcileTransactionsCommand.js";
import { CalculateZakahQuery } from "../Application/Queries/CalculateZakah/CalculateZakahQuery.js";
import { GetPortfolioValuationQuery } from "../Application/Queries/GetPortfolioValuation/GetPortfolioValuationQuery.js";
import { GetLedgerSummaryQuery } from "../Application/Queries/GetLedgerSummary/GetLedgerSummaryQuery.js";

export const financeRouter = Router();

// Middleware to parse body if not set globally
financeRouter.use(express.json());

// 1. Create General Ledger
financeRouter.post("/ledgers", async (req: Request, res: Response) => {
  const { name, currency, tenantId } = req.body;
  const command = new CreateLedgerCommand(name, currency, tenantId);
  const result = await mediator.send<any>("CreateLedgerCommand", command);
  
  if (result.isFailure) {
    return res.status(result.error?.status || 400).json(result.error);
  }
  res.status(201).json({ ledgerId: result.value });
});

// 2. Create Account
financeRouter.post("/accounts", async (req: Request, res: Response) => {
  const { ledgerId, code, name, type, parentId, isHalal, tenantId } = req.body;
  const command = new CreateAccountCommand(ledgerId, code, name, type, parentId, isHalal, tenantId);
  const result = await mediator.send<any>("CreateAccountCommand", command);

  if (result.isFailure) {
    return res.status(result.error?.status || 400).json(result.error);
  }
  res.status(201).json({ accountId: result.value });
});

// 3. Post Journal Entry
financeRouter.post("/journals", async (req: Request, res: Response) => {
  const { ledgerId, description, lines, isPurified, tenantId } = req.body;
  const command = new PostJournalEntryCommand(ledgerId, description, lines, isPurified, tenantId);
  const result = await mediator.send<any>("PostJournalEntryCommand", command);

  if (result.isFailure) {
    return res.status(result.error?.status || 400).json(result.error);
  }
  res.status(201).json({ journalEntryId: result.value });
});

// 4. Import Bank Statement
financeRouter.post("/statements/import", async (req: Request, res: Response) => {
  const { ledgerId, csvContent, tenantId } = req.body;
  const command = new ImportBankStatementCommand(ledgerId, csvContent, tenantId);
  const result = await mediator.send<any>("ImportBankStatementCommand", command);

  if (result.isFailure) {
    return res.status(result.error?.status || 400).json(result.error);
  }
  res.status(200).json({ importedIds: result.value });
});

// 5. Reconcile Bank Statement Row with Journal Entry
financeRouter.post("/statements/reconcile", async (req: Request, res: Response) => {
  const { ledgerId, statementLineId, journalEntryId, tenantId } = req.body;
  const command = new ReconcileTransactionsCommand(ledgerId, statementLineId, journalEntryId, tenantId);
  const result = await mediator.send<any>("ReconcileTransactionsCommand", command);

  if (result.isFailure) {
    return res.status(result.error?.status || 400).json(result.error);
  }
  res.status(200).json({ success: true });
});

// 6. Get Ledger Balance Summary
financeRouter.get("/ledgers/:ledgerId/summary", async (req: Request, res: Response) => {
  const { ledgerId } = req.params;
  const tenantId = (req.query.tenantId as string) || "system-default";
  const query = new GetLedgerSummaryQuery(ledgerId, true, tenantId);
  const result = await mediator.send<any>("GetLedgerSummaryQuery", query);

  if (result.isFailure) {
    return res.status(result.error?.status || 400).json(result.error);
  }
  res.json(result.value);
});

// 7. Calculate Zakah Liability
financeRouter.get("/ledgers/:ledgerId/zakah", async (req: Request, res: Response) => {
  const { ledgerId } = req.params;
  const goldPrice = req.query.goldPrice ? parseFloat(req.query.goldPrice as string) : 77.0;
  const silverPrice = req.query.silverPrice ? parseFloat(req.query.silverPrice as string) : 0.95;
  const tenantId = (req.query.tenantId as string) || "system-default";

  const query = new CalculateZakahQuery(ledgerId, goldPrice, silverPrice, true, tenantId);
  const result = await mediator.send<any>("CalculateZakahQuery", query);

  if (result.isFailure) {
    return res.status(result.error?.status || 400).json(result.error);
  }
  res.json(result.value);
});

// 8. Retrieve Portfolio Valuation Screen
financeRouter.get("/portfolio", async (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || "system-default";
  const query = new GetPortfolioValuationQuery(true, tenantId);
  const result = await mediator.send<any>("GetPortfolioValuationQuery", query);

  if (result.isFailure) {
    return res.status(result.error?.status || 400).json(result.error);
  }
  res.json(result.value);
});


// Register OpenAPI Schemas dynamically in Shared SDK
openApiGenerator.registerSchema("FinanceLedger", {
  type: "object",
  properties: {
    ledgerId: { type: "string", example: "ledger_x89a" },
    name: { type: "string", example: "Operating Cash Book" },
    currency: { type: "string", example: "GBP" },
    status: { type: "string", example: "Active" }
  }
});

openApiGenerator.registerSchema("ZakahBreakdown", {
  type: "object",
  properties: {
    calculationYear: { type: "integer", example: 2026 },
    nisabGoldThreshold: { type: "number", example: 6545.0 },
    totalLiquidCash: { type: "number", example: 65200.0 },
    totalShortTermLiabilities: { type: "number", example: 1450.0 },
    netZakatablePool: { type: "number", example: 63750.0 },
    zakahDue: { type: "number", example: 1593.75 }
  }
});

// Register OpenAPI Endpoint routes
openApiGenerator.registerEndpoint({
  path: "/finance/ledgers",
  method: "post",
  summary: "Create General Ledger",
  description: "Creates an isolated enterprise ledger aggregate under tenant scope.",
  tags: ["FinanceOS"],
  responseSchemaName: "FinanceLedger"
});

openApiGenerator.registerEndpoint({
  path: "/finance/ledgers/{ledgerId}/zakah",
  method: "get",
  summary: "Calculate Zakah Due",
  description: "Computes active wealth-tax liability using live metal Nisab parameters and account balances.",
  tags: ["FinanceOS"],
  responseSchemaName: "ZakahBreakdown"
});
