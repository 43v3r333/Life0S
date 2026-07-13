import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { PostJournalEntryCommand } from "./PostJournalEntryCommand.js";
import { LedgerRepository, JournalEntryRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";
import { JournalLine } from "../../../Domain/ValueObjects/JournalLine.js";
import { auditLedger } from "../../../../../sdk/audit.js";
import { integrationEventBus } from "../../../../../sdk/events.js";

export class PostJournalEntryHandler implements IRequestHandler<PostJournalEntryCommand, Result<string>> {
  public async handle(request: PostJournalEntryCommand): Promise<Result<string>> {
    try {
      console.log(`[APPLICATION] [COMMAND] Posting double entry to general ledger '${request.ledgerId}': ${request.description}`);

      const ledgerRepo = new LedgerRepository(request.tenantId);
      const journalRepo = new JournalEntryRepository(request.tenantId);

      const ledger = await ledgerRepo.getLedgerById(request.ledgerId);
      if (!ledger) {
        return Result.failure({
          type: "https://projectjannah.io/errors/not-found",
          title: "Ledger Not Found",
          status: 404,
          detail: `Ledger with ID '${request.ledgerId}' was not found in the current tenant context.`
        });
      }

      // Map request lines to rich Domain Value Objects
      const domainLines = request.lines.map(line => new JournalLine(line.accountId, line.type, line.amount));

      // Perform the transaction operation on aggregate root - this performs business rule evaluations
      const journalEntryId = "je_" + Math.random().toString(36).substr(2, 9);
      const journalEntry = ledger.postJournalEntry(
        journalEntryId,
        request.description,
        domainLines,
        request.isPurified
      );

      // Save journal entry entity and updated ledger/accounts aggregate
      await journalRepo.saveJournal(journalEntry);
      await ledgerRepo.saveLedger(ledger);

      // Audit logs
      await auditLedger.logChange({
        tenantId: request.tenantId,
        correlationId: request.correlationId,
        oldValue: null,
        newValue: { 
          id: journalEntryId, 
          ledgerId: request.ledgerId, 
          description: request.description, 
          isPurified: request.isPurified,
          lines: request.lines 
        },
        reason: `Double-entry transaction posted: "${request.description}"`,
        domain: "JournalEntry",
        commandName: "PostJournalEntryCommand",
        result: "SUCCESS"
      });

      // Dispatch integration notifications
      const domainEvents = ledger.getDomainEvents();
      for (const event of domainEvents) {
        await integrationEventBus.publish({
          id: event.eventId,
          eventName: event.eventName,
          version: event.version,
          timestamp: event.timestamp,
          correlationId: request.correlationId,
          tenantId: request.tenantId,
          payload: { 
            journalEntryId: event.aggregateId, 
            ledgerId: request.ledgerId, 
            description: request.description, 
            lines: request.lines 
          }
        });
      }
      ledger.clearDomainEvents();

      return Result.success(journalEntryId);
    } catch (err: any) {
      console.error(`[APPLICATION] [COMMAND FAILURE] PostJournalEntry failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/command-failed",
        title: "Transaction Posting Denied",
        status: 400,
        detail: err.message || "An error occurred while evaluating financial validation invariants."
      });
    }
  }
}
