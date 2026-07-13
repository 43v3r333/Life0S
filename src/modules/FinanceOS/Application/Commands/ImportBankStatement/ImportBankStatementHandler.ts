import { createHash } from "crypto";
import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { ImportBankStatementCommand } from "./ImportBankStatementCommand.js";
import { aiGateway } from "../../../../../sdk/ai.js";
import { auditLedger } from "../../../../../sdk/audit.js";
import { getDb, saveDb } from "../../../../../../server/db.js";
import { LedgerRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";

interface ClassifiedTransaction {
  id: string;
  statementLineId: string;
  tenantId: string;
  ledgerId: string;
  sourceFingerprint: string;
  date: string;
  description: string;
  amount: number;
  isHalal: boolean;
  purifiedAmount: number;
  category: string;
  reconciled: boolean;
  importedAt: string;
  correlationId: string;
}

interface ClassificationOutput {
  isHalal?: boolean;
  category?: string;
  purificationAmount?: number;
}

function createStatementLineIdentity(tenantId: string, ledgerId: string, row: string): string {
  return createHash("sha256").update(`${tenantId}|${ledgerId}|${row}`).digest("hex");
}

export class ImportBankStatementHandler implements IRequestHandler<ImportBankStatementCommand, Result<string[]>> {
  public async handle(request: ImportBankStatementCommand): Promise<Result<string[]>> {
    try {
      console.log(`[APPLICATION] [COMMAND] Importing bank statement for ledger: ${request.ledgerId}`);

      const ledgerRepo = new LedgerRepository(request.tenantId);
      const ledger = await ledgerRepo.getLedgerById(request.ledgerId);
      if (!ledger) {
        return Result.failure({
          type: "https://projectjannah.io/errors/not-found",
          title: "Ledger Not Found",
          status: 404,
          detail: `Ledger with ID '${request.ledgerId}' was not found in the current tenant context.`
        });
      }
      
      const lines = request.csvContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) {
        return Result.failure({
          type: "https://projectjannah.io/errors/invalid-argument",
          title: "Bank Statement Empty",
          status: 400,
          detail: "The uploaded CSV bank statement contains no transaction rows."
        });
      }

      const firstLine = lines[0].toLowerCase();
      const hasHeader = firstLine.includes("date") || firstLine.includes("desc") || firstLine.includes("amount");
      const transactionRows = hasHeader ? lines.slice(1) : lines;

      const importedIds: string[] = [];
      const db = getDb();
      db.statementImports = db.statementImports || [];
      const existingImports = db.statementImports as ClassifiedTransaction[];

      for (const row of transactionRows) {
        const parts = row.split(",").map(p => p.trim());
        if (parts.length < 3) continue;

        const date = parts[0];
        const description = parts[1];
        const amount = parseFloat(parts[2]);
        if (isNaN(amount)) continue;

        const sourceFingerprint = createStatementLineIdentity(request.tenantId, request.ledgerId, row);
        const duplicate = existingImports.find(existing =>
          existing.tenantId === request.tenantId &&
          existing.ledgerId === request.ledgerId &&
          existing.sourceFingerprint === sourceFingerprint
        );
        if (duplicate) {
          importedIds.push(duplicate.statementLineId || duplicate.id);
          continue;
        }

        const txId = "st_" + sourceFingerprint.substring(0, 16);

        let isHalal = true;
        let purifiedAmount = 0;
        let category = "Operating Expense";

        try {
          const schema = {
            type: "object",
            properties: {
              isHalal: { type: "boolean" },
              category: { type: "string" },
              purificationAmount: { type: "number" }
            },
            required: ["isHalal", "category", "purificationAmount"]
          };

          const classificationPrompt = `Classify this business bank transaction for Shariah compliance and corporate accounting. Date: ${date}, Description: ${description}, Amount: ${amount}. Evaluate if there is conventional interest (Riba) requiring purification.`;
          
          const aiResult = await aiGateway.executePipeline<ClassificationOutput>(classificationPrompt, {
            systemInstruction: "You are an expert Islamic Fintech auditor. Analyze transaction descriptions and classify them into standard accounts: 'Business Income', 'Software Expense', 'Interest Income', 'Travel Expense', 'Hardware Expense'. If it is Interest Income, set 'isHalal' to false, 'category' to 'Interest Income', and 'purificationAmount' to the exact transaction amount.",
            jsonSchema: schema
          });

          if (aiResult.validationSuccess && aiResult.structuredOutput) {
            isHalal = aiResult.structuredOutput.isHalal !== false;
            purifiedAmount = aiResult.structuredOutput.purificationAmount || 0;
            category = aiResult.structuredOutput.category || "Operating Expense";
          } else {
            const lowerDesc = description.toLowerCase();
            if (lowerDesc.includes("interest") || lowerDesc.includes("yield") || lowerDesc.includes("riba")) {
              isHalal = false;
              purifiedAmount = amount;
              category = "Interest Income";
            } else if (lowerDesc.includes("retainer") || lowerDesc.includes("invoice") || lowerDesc.includes("consult")) {
              category = "Business Income";
            }
          }
        } catch (err: unknown) {
          console.warn("[IMPORT STATEMENT] AI evaluation failed, falling back to heuristic parsing:", err);
          const lowerDesc = description.toLowerCase();
          if (lowerDesc.includes("interest") || lowerDesc.includes("yield") || lowerDesc.includes("riba")) {
            isHalal = false;
            purifiedAmount = amount;
            category = "Interest Income";
          }
        }

        const txRecord: ClassifiedTransaction = {
          id: txId,
          statementLineId: txId,
          tenantId: request.tenantId,
          ledgerId: request.ledgerId,
          sourceFingerprint,
          date,
          description,
          amount,
          isHalal,
          purifiedAmount,
          category,
          reconciled: false,
          importedAt: new Date().toISOString(),
          correlationId: request.correlationId
        };

        existingImports.push(txRecord);
        importedIds.push(txId);
      }

      await saveDb();

      await auditLedger.logChange({
        tenantId: request.tenantId,
        correlationId: request.correlationId,
        oldValue: null,
        newValue: { ledgerId: request.ledgerId, rowCount: importedIds.length },
        reason: `Imported bank statement with ${importedIds.length} transaction entries classified by AI.`,
        domain: "StatementImport",
        commandName: "ImportBankStatementCommand",
        result: "SUCCESS"
      });

      return Result.success(importedIds);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during CSV parsing.";
      console.error(`[APPLICATION] [COMMAND FAILURE] ImportBankStatement failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/command-failed",
        title: "CSV Import Failed",
        status: 500,
        detail: message
      });
    }
  }
}
