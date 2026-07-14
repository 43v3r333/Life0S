import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { auditLedger } from "../../../../../sdk/audit.js";
import { integrationEventBus } from "../../../../../sdk/events.js";
import { getDb, saveDb } from "../../../../../../server/db.js";
import { LedgerRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";
import { calculateZakahBreakdown } from "../../Queries/CalculateZakah/ZakahCalculator.js";
import { RecordZakahCalculationCommand, RecordedZakahCalculationResult } from "./RecordZakahCalculationCommand.js";

interface StoredZakahRecord extends Record<string, unknown> {
  id: string;
  ledgerId: string;
  tenantId: string;
  idempotencyKey: string;
  correlationId: string;
  auditId?: string;
}

export class RecordZakahCalculationHandler implements IRequestHandler<RecordZakahCalculationCommand, Result<RecordedZakahCalculationResult>> {
  public async handle(request: RecordZakahCalculationCommand): Promise<Result<RecordedZakahCalculationResult>> {
    try {
      if (!request.idempotencyKey || request.idempotencyKey.trim() === "") {
        return Result.failure({
          type: "https://projectjannah.io/errors/validation-failed",
          title: "Idempotency Key Required",
          status: 400,
          detail: "A non-empty idempotencyKey is required when recording a Zakah calculation."
        });
      }

      const repo = new LedgerRepository(request.tenantId);
      const ledger = await repo.getLedgerById(request.ledgerId);
      if (!ledger) {
        return Result.failure({
          type: "https://projectjannah.io/errors/not-found",
          title: "Ledger Not Found",
          status: 404,
          detail: `Ledger with ID '${request.ledgerId}' was not found for Zakah calculation.`
        });
      }

      const db = getDb();
      db.zakahHistory = db.zakahHistory || [];
      const existing = (db.zakahHistory as StoredZakahRecord[]).find(record =>
        record.tenantId === request.tenantId &&
        record.ledgerId === request.ledgerId &&
        record.idempotencyKey === request.idempotencyKey
      );
      if (existing) {
        const breakdown = calculateZakahBreakdown(ledger, Number(existing.goldPricePerGram), Number(existing.silverPricePerGram));
        return Result.success({
          id: existing.id,
          auditId: existing.auditId || "",
          correlationId: existing.correlationId,
          breakdown,
          idempotentReplay: true
        });
      }

      const breakdown = calculateZakahBreakdown(ledger, request.goldPricePerGram, request.silverPricePerGram);
      const record: StoredZakahRecord = {
        id: "zk_" + Math.random().toString(36).substr(2, 9),
        ledgerId: request.ledgerId,
        tenantId: request.tenantId,
        idempotencyKey: request.idempotencyKey,
        correlationId: request.correlationId,
        timestamp: new Date().toISOString(),
        ...breakdown
      };
      db.zakahHistory.push(record);
      await saveDb();

      const audit = await auditLedger.logChange({
        tenantId: request.tenantId,
        correlationId: request.correlationId,
        oldValue: null,
        newValue: record,
        reason: `Zakah liability recorded. Net Pool: £${breakdown.netZakatablePool.toFixed(2)}, Zakah Due: £${breakdown.zakahDue.toFixed(2)}`,
        domain: "Zakah",
        commandName: "RecordZakahCalculationCommand",
        result: "SUCCESS"
      });
      record.auditId = audit.id;
      await saveDb();

      await integrationEventBus.publish({
        id: "evt_zk_" + Math.random().toString(36).substr(2, 9),
        eventName: "ZakahCalculated",
        version: 1,
        timestamp: new Date().toISOString(),
        correlationId: request.correlationId,
        tenantId: request.tenantId,
        payload: record
      });

      return Result.success({
        id: record.id,
        auditId: audit.id,
        correlationId: request.correlationId,
        breakdown,
        idempotentReplay: false
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during Zakah recording.";
      console.error(`[APPLICATION] [COMMAND FAILURE] RecordZakahCalculation failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/command-failed",
        title: "Zakah Recording Denied",
        status: 500,
        detail: message
      });
    }
  }
}
