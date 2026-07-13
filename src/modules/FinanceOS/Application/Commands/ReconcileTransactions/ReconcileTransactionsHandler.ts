import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { ReconcileTransactionsCommand } from "./ReconcileTransactionsCommand.js";
import { auditLedger } from "../../../../../sdk/audit.js";
import { integrationEventBus } from "../../../../../sdk/events.js";
import { getDb, saveDb } from "../../../../../../server/db.js";
import { JournalEntryRepository, LedgerRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";

interface StatementImportRecord extends Record<string, unknown> {
  id: string;
  statementLineId?: string;
  tenantId?: string;
  ledgerId?: string;
  reconciled?: boolean;
  matchedJournalEntryId?: string;
}

export class ReconcileTransactionsHandler implements IRequestHandler<ReconcileTransactionsCommand, Result<void>> {
  public async handle(request: ReconcileTransactionsCommand): Promise<Result<void>> {
    try {
      console.log(`[APPLICATION] [COMMAND] Reconciling statement line '${request.statementLineId}' with journal entry '${request.journalEntryId}'`);

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

      const journalRepo = new JournalEntryRepository(request.tenantId);
      const journal = await journalRepo.getJournalById(request.journalEntryId);
      if (!journal || journal.ledgerId !== request.ledgerId) {
        return Result.failure({
          type: "https://projectjannah.io/errors/not-found",
          title: "Journal Entry Not Found",
          status: 404,
          detail: `Journal entry with ID '${request.journalEntryId}' was not found in the current ledger context.`
        });
      }

      const db = getDb();
      const list = (db.statementImports || []) as StatementImportRecord[];
      const item = list.find(i =>
        (i.statementLineId === request.statementLineId || i.id === request.statementLineId) &&
        i.tenantId === request.tenantId &&
        i.ledgerId === request.ledgerId
      );

      if (!item) {
        return Result.failure({
          type: "https://projectjannah.io/errors/not-found",
          title: "Statement Transaction Not Found",
          status: 404,
          detail: `Classified statement line with ID '${request.statementLineId}' was not found.`
        });
      }

      if (item.reconciled) {
        return Result.failure({
          type: "https://projectjannah.io/errors/conflict",
          title: "Already Reconciled",
          status: 409,
          detail: "This statement transaction has already been reconciled with a posted journal entry."
        });
      }

      item.reconciled = true;
      item.matchedJournalEntryId = request.journalEntryId;
      await saveDb();

      await auditLedger.logChange({
        tenantId: request.tenantId,
        correlationId: request.correlationId,
        oldValue: { id: request.statementLineId, reconciled: false },
        newValue: { id: request.statementLineId, reconciled: true, matchedJournalEntryId: request.journalEntryId },
        reason: "Bank statement transaction successfully reconciled with posted general ledger voucher",
        domain: "Reconciliation",
        commandName: "ReconcileTransactionsCommand",
        result: "SUCCESS"
      });

      await integrationEventBus.publish({
        id: "evt_rec_" + Math.random().toString(36).substr(2, 9),
        eventName: "TransactionReconciled",
        version: 1,
        timestamp: new Date().toISOString(),
        correlationId: request.correlationId,
        tenantId: request.tenantId,
        payload: { 
          statementLineId: request.statementLineId, 
          journalEntryId: request.journalEntryId, 
          ledgerId: request.ledgerId 
        }
      });

      return Result.ok();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during reconciliation matching.";
      console.error(`[APPLICATION] [COMMAND FAILURE] ReconcileTransactions failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/command-failed",
        title: "Reconciliation Failed",
        status: 500,
        detail: message
      });
    }
  }
}
