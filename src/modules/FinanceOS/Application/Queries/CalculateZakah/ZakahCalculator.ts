import { Ledger } from "../../../Domain/Entities/Ledger.js";

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

export function calculateZakahBreakdown(ledger: Ledger, goldPricePerGram: number, silverPricePerGram: number): ZakahBreakdown {
  const nisabGoldThreshold = 85 * goldPricePerGram;
  const nisabSilverThreshold = 595 * silverPricePerGram;
  const activeNisabThreshold = nisabGoldThreshold;

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

  const netZakatablePool = totalLiquidCash + totalReceivables - totalShortTermLiabilities;
  const isEligibleForZakah = netZakatablePool >= activeNisabThreshold;
  const zakahDue = isEligibleForZakah ? netZakatablePool * 0.025 : 0;

  return {
    calculationYear: new Date().getFullYear(),
    nisabGoldThreshold,
    nisabSilverThreshold,
    totalLiquidCash,
    totalReceivables,
    totalShortTermLiabilities,
    netZakatablePool,
    isEligibleForZakah,
    zakahDue: parseFloat(zakahDue.toFixed(2)),
    goldPricePerGram,
    silverPricePerGram
  };
}
