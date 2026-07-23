import { randomUUID } from "node:crypto";

export type BalanceSource="manual"|"balance-screenshot"|"statement"|"transaction-confirmation"|"migration";

export function recordBalanceChange(state:Record<string,any>,input:{accountId:string;accountKind:"debit"|"credit";accountName:string;previousBalance:number;balance:number;effectiveDate:string;sourceType:BalanceSource;sourceRecordId?:string;reconciliationStatus?:string}){
  const now=new Date().toISOString(),record={id:`balance_${randomUUID()}`,...input,previousBalance:Number(input.previousBalance.toFixed(2)),balance:Number(input.balance.toFixed(2)),recordedAt:now,createdAt:now,reconciliationStatus:input.reconciliationStatus||"confirmed",authoritative:true};
  state.accountBalanceHistory=[...(state.accountBalanceHistory||[]),record].slice(-5000);return record;
}

export function balanceHistoryFor(state:Record<string,any>,accountId:string){return (state.accountBalanceHistory||[]).filter((item:any)=>String(item.accountId)===accountId).sort((a:any,b:any)=>String(b.effectiveDate||b.recordedAt).localeCompare(String(a.effectiveDate||a.recordedAt)));}

export function seedMissingBalanceHistory(state:Record<string,any>){
  const before=Array.isArray(state.accountBalanceHistory)?state.accountBalanceHistory.length:0;
  state.accountBalanceHistory=Array.isArray(state.accountBalanceHistory)?state.accountBalanceHistory:[];const known=new Set(state.accountBalanceHistory.map((item:any)=>String(item.accountId)));
  for(const account of state.bankAccounts||[])if(!known.has(String(account.id)))recordBalanceChange(state,{accountId:String(account.id),accountKind:"debit",accountName:String(account.name),previousBalance:Number(account.balance||0),balance:Number(account.balance||0),effectiveDate:String(account.balanceAsOf||account.balanceUpdatedAt||account.updatedAt||account.createdAt||new Date().toISOString()).slice(0,10),sourceType:"migration"});
  for(const account of (state.debts||[]).filter((item:any)=>item.liabilityType==="Credit card"))if(!known.has(String(account.id)))recordBalanceChange(state,{accountId:String(account.id),accountKind:"credit",accountName:String(account.name),previousBalance:Number(account.balance||0),balance:Number(account.balance||0),effectiveDate:String(account.balanceAsOf||account.updatedAt||account.createdAt||new Date().toISOString()).slice(0,10),sourceType:"migration"});
  return state.accountBalanceHistory.length>before;
}
