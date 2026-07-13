import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { CreateLedgerCommand } from "./CreateLedgerCommand.js";
import { LedgerRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";
import { Ledger } from "../../../Domain/Entities/Ledger.js";
import { auditLedger } from "../../../../../sdk/audit.js";
import { integrationEventBus } from "../../../../../sdk/events.js";

export class CreateLedgerHandler implements IRequestHandler<CreateLedgerCommand, Result<string>> {
  public async handle(request: CreateLedgerCommand): Promise<Result<string>> {
    try {
      console.log(`[APPLICATION] [COMMAND] Creating general ledger: ${request.name} in tenant ${request.tenantId}`);
      
      const repo = new LedgerRepository(request.tenantId);
      const ledgerId = "ledger_" + Math.random().toString(36).substr(2, 9);
      
      // Call domain-driven entity factory
      const ledger = Ledger.create(ledgerId, request.tenantId, request.name, request.currency);
      
      // Persist state change
      await repo.saveLedger(ledger);

      // Audit tracking
      await auditLedger.logChange({
        tenantId: request.tenantId,
        correlationId: request.correlationId,
        oldValue: null,
        newValue: { id: ledgerId, name: request.name, currency: request.currency, status: "Active" },
        reason: "General ledger created and initialized inside current Tenant context",
        domain: "Ledger",
        commandName: "CreateLedgerCommand",
        result: "SUCCESS"
      });

      // Distribute domain events on integration bus
      const domainEvents = ledger.getDomainEvents();
      for (const event of domainEvents) {
        await integrationEventBus.publish({
          id: event.eventId,
          eventName: event.eventName,
          version: event.version,
          timestamp: event.timestamp,
          correlationId: request.correlationId,
          tenantId: request.tenantId,
          payload: { ledgerId: event.aggregateId, name: request.name, currency: request.currency }
        });
      }
      ledger.clearDomainEvents();

      return Result.success(ledgerId);
    } catch (err: any) {
      console.error(`[APPLICATION] [COMMAND FAILURE] CreateLedger failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/command-failed",
        title: "Create Ledger Failed",
        status: 500,
        detail: err.message || "An unexpected error occurred during ledger initialization."
      });
    }
  }
}
