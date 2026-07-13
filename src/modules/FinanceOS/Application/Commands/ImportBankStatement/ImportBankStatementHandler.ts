import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { ImportBankStatementCommand } from "./ImportBankStatementCommand.js";
import { aiGateway } from "../../../../../sdk/ai.js";
import { auditLedger } from "../../../../../sdk/audit.js";
import { getDb, saveDb } from "../../../../../../server/db.js";

interface ClassifiedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  isHalal: boolean;
  purifiedAmount: number;
  category: string;
  reconciled: boolean;
}

export class ImportBankStatementHandler implements IRequestHandler<ImportBankStatementCommand, Result<string[]>> {
  public async handle(request: ImportBankStatementCommand): Promise<Result<string[]>> {
    try {
      console.log(`[APPLICATION] [COMMAND] Importing bank statement for ledger: ${request.ledgerId}`);
      
      const lines = request.csvContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) {
        return Result.failure({
          type: "https://projectjannah.io/errors/invalid-argument",
          title: "Bank Statement Empty",
          status: 400,
          detail: "The uploaded CSV bank statement contains no transaction rows."
        });
      }

      // Skip CSV header if exists
      const firstLine = lines[0].toLowerCase();
      const hasHeader = firstLine.includes("date") || firstLine.includes("desc") || firstLine.includes("amount");
      const transactionRows = hasHeader ? lines.slice(1) : lines;

      const importedIds: string[] = [];
      const db = getDb();
      db.statementImports = db.statementImports || [];

      for (const row of transactionRows) {
        const parts = row.split(",").map(p => p.trim());
        if (parts.length < 3) continue;

        const date = parts[0];
        const description = parts[1];
        const amount = parseFloat(parts[2]);
        if (isNaN(amount)) continue;

        const txId = "st_" + Math.random().toString(36).substr(2, 9);

        // Stage 4 Model routing - classify description via Shared SDK AI Gateway
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
          
          const aiResult = await aiGateway.executePipeline<any>(classificationPrompt, {
            systemInstruction: "You are an expert Islamic Fintech auditor. Analyze transaction descriptions and classify them into standard accounts: 'Business Income', 'Software Expense', 'Interest Income', 'Travel Expense', 'Hardware Expense'. If it is Interest Income, set 'isHalal' to false, 'category' to 'Interest Income', and 'purificationAmount' to the exact transaction amount.",
            jsonSchema: schema
          });

          if (aiResult.validationSuccess && aiResult.structuredOutput) {
            isHalal = aiResult.structuredOutput.isHalal;
            purifiedAmount = aiResult.structuredOutput.purificationAmount || 0;
            category = aiResult.structuredOutput.category || "Operating Expense";
          } else {
            // Fallback heuristics
            const lowerDesc = description.toLowerCase();
            if (lowerDesc.includes("interest") || lowerDesc.includes("yield") || lowerDesc.includes("riba")) {
              isHalal = false;
              purifiedAmount = amount;
              category = "Interest Income";
            } else if (lowerDesc.includes("retainer") || lowerDesc.includes("invoice") || lowerDesc.includes("consult")) {
              category = "Business Income";
            }
          }
        } catch (err) {
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
          date,
          description,
          amount,
          isHalal,
          purifiedAmount,
          category,
          reconciled: false
        };

        db.statementImports.push(txRecord);
        importedIds.push(txId);
      }

      await saveDb();

      // Audit log the import activity
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
    } catch (err: any) {
      console.error(`[APPLICATION] [COMMAND FAILURE] ImportBankStatement failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/command-failed",
        title: "CSV Import Failed",
        status: 500,
        detail: err.message || "An unexpected error occurred during CSV parsing."
      });
    }
  }
}
