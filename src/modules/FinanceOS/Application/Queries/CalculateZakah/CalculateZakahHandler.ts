import { IRequestHandler } from "../../../../../sdk/cqrs.js";
import { Result } from "../../../../../sdk/result.js";
import { CalculateZakahQuery } from "./CalculateZakahQuery.js";
import { LedgerRepository } from "../../../Infrastructure/Persistence/FinanceRepositories.js";
import { auditLedger } from "../../../../../sdk/audit.js";
import { integrationEventBus } from "../../../../../sdk/events.js";
import { getDb, saveDb } from "../../../../../../server/db.js";

export interface ZakahBreakdown {
  calculationYear: number;
  nisabGoldThreshold: number;
  nisabSilverThreshold: number;
  totalLiquidCash: number;
  totalReceivables: number;
  totalShortTermLiabilities: number;
  netZakatablePool: number;
  isEligibleForZakah: boolean;
  zakahDue: number;
  goldPricePerGram: number;
  silverPricePerGram: number;
}

export class CalculateZakahHandler implements IRequestHandler<CalculateZakahQuery, Result<ZakahBreakdown>> {
  public async handle(request: CalculateZakahQuery): Promise<Result<ZakahBreakdown>> {
    try {
      console.log(`[APPLICATION] [QUERY] Calculating Zakah liability for ledger: ${request.ledgerId}`);

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

      // 1. Calculate Nisab thresholds
      const nisabGoldThreshold = 85 * request.goldPricePerGram; // 85g gold Nisab
      const nisabSilverThreshold = 595 * request.silverPricePerGram; // 595g silver Nisab

      // We use Gold Nisab as the standard for cash wealth in modern fiat conditions (safer, standard practice)
      const activeNisabThreshold = nisabGoldThreshold;

      // 2. Query Asset and Liability account balances
      let totalLiquidCash = 0;
      let totalReceivables = 0;
      let totalShortTermLiabilities = 0;

      for (const account of ledger.accounts) {
        if (account.type === "Asset") {
          const nameLower = account.name.toLowerCase();
          if (nameLower.includes("cash") || nameLower.includes("checking") || nameLower.includes("savings") || nameLower.includes("liquid") || nameLower.includes("operating")) {
            totalLiquidCash += account.balance;
          } else if (nameLower.includes("receivable") || nameLower.includes("invoice")) {
            totalReceivables += account.balance;
          }
        } else if (account.type === "Liability") {
          totalShortTermLiabilities += account.balance;
        }
      }

      // 3. Compute Net Zakatable Pool
      const netZakatablePool = (totalLiquidCash + totalReceivables) - totalShortTermLiabilities;
      const isEligibleForZakah = netZakatablePool >= activeNisabThreshold;
      const zakahDue = isEligibleForZakah ? netZakatablePool * 0.025 : 0; // 2.5% wealth tax

      const breakdown: ZakahBreakdown = {
        calculationYear: new Date().getFullYear(),
        nisabGoldThreshold,
        nisabSilverThreshold,
        totalLiquidCash,
        totalReceivables,
        totalShortTermLiabilities,
        netZakatablePool,
        isEligibleForZakah,
        zakahDue: parseFloat(zakahDue.toFixed(2)),
        goldPricePerGram: request.goldPricePerGram,
        silverPricePerGram: request.silverPricePerGram
      };

      // 4. Save to Zakah history table in our persistent database
      const db = getDb();
      db.zakahHistory = db.zakahHistory || [];
      
      const record = {
        id: "zk_" + Math.random().toString(36).substr(2, 9),
        ledgerId: request.ledgerId,
        tenantId: request.tenantId,
        timestamp: new Date().toISOString(),
        ...breakdown
      };
      db.zakahHistory.push(record);
      await saveDb();

      // 5. Audit log
      await auditLedger.logChange({
        tenantId: request.tenantId,
        correlationId: "zakah_" + Date.now().toString(36),
        oldValue: null,
        newValue: record,
        reason: `Zakah liability calculated and saved. Net Pool: £${netZakatablePool.toFixed(2)}, Zakah Due: £${zakahDue.toFixed(2)}`,
        domain: "Zakah",
        commandName: "CalculateZakahQuery",
        result: "SUCCESS"
      });

      // 6. Raise event
      await integrationEventBus.publish({
        id: "evt_zk_" + Math.random().toString(36).substr(2, 9),
        eventName: "ZakahCalculated",
        version: 1,
        timestamp: new Date().toISOString(),
        correlationId: "corr_zk_" + Date.now().toString(36),
        tenantId: request.tenantId,
        payload: record
      });

      return Result.success(breakdown);
    } catch (err: any) {
      console.error(`[APPLICATION] [QUERY FAILURE] CalculateZakah failed:`, err);
      return Result.failure({
        type: "https://projectjannah.io/errors/query-failed",
        title: "Zakah Calculation Denied",
        status: 500,
        detail: err.message || "An unexpected error occurred during tax calculation."
      });
    }
  }
}
