import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { CreateAccountCommand } from "./CreateAccountCommand.js";
import { LedgerRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";
import { auditLedger } from "../../../../../sdk/audit.js";
import { integrationEventBus } from "../../../../../sdk/events.js";

export class CreateAccountHandler implements IRequestHandler<CreateAccountCommand, Result<string>> {
  public async handle(request: CreateAccountCommand): Promise<Result<string>> {
    try {
      console.log(`[APPLICATION] [COMMAND] Creating account '${request.name}' [${request.code}] inside ledger '${request.ledgerId}'`);

      const repo = new LedgerRepository(request.tenantId);
      const ledger = await repo.getLedgerById(request.ledgerId);
      
      if (!ledger) {
        return Result.failure({
          type: "https://projectjannah.io/errors/not-found",
          title: "Ledger Not Found",
          status: 404,
          detail: `Ledger with ID '${request.ledgerId}' was not found in the current tenant.`
        });
      }

      const accountId = "acc_" + Math.random().toString(36).substr(2, 9);
      
      // Perform rich domain operation on aggregate
      const account = ledger.createAccount(
        accountId,
        request.code,
        request.name,
        request.type,
        request.parentId,
        request.isHalal
      );

      // Save aggregate state back
      await repo.saveLedger(ledger);

      // Audit tracking
      await auditLedger.logChange({
        tenantId: request.tenantId,
        correlationId: request.correlationId,
        oldValue: null,
        newValue: { id: accountId, ledgerId: request.ledgerId, code: request.code, name: request.name, type: request.type, isHalal: request.isHalal },
        reason: `Account '${request.name}' registered inside general ledger`,
        domain: "Account",
        commandName: "CreateAccountCommand",
        result: "SUCCESS"
      });

      // Dispatch domain events
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
            accountId: event.aggregateId, 
            ledgerId: request.ledgerId, 
            code: request.code, 
            name: request.name, 
            type: request.type 
          }
        });
      }
      ledger.clearDomainEvents();

      return Result.success(accountId);
    } catch (err: any) {
      console.error(`[APPLICATION] [COMMAND FAILURE] CreateAccount failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/command-failed",
        title: "Create Account Failed",
        status: 500,
        detail: err.message || "An unexpected error occurred during account creation."
      });
    }
  }
}
