import assert from "node:assert/strict";
import test from "node:test";
import { balanceHistoryFor, recordBalanceChange, seedMissingBalanceHistory } from "../server/balanceHistory";

test("balance changes retain source, effective date, previous value and account ordering",()=>{const state:any={accountBalanceHistory:[]};recordBalanceChange(state,{accountId:"a",accountKind:"debit",accountName:"Premier",previousBalance:-100,balance:250,effectiveDate:"2026-07-20",sourceType:"manual"});recordBalanceChange(state,{accountId:"a",accountKind:"debit",accountName:"Premier",previousBalance:250,balance:200,effectiveDate:"2026-07-21",sourceType:"transaction-confirmation",sourceRecordId:"tx-1"});const history=balanceHistoryFor(state,"a");assert.equal(history[0].balance,200);assert.equal(history[0].sourceRecordId,"tx-1");assert.equal(history[1].previousBalance,-100);});

test("migration seeds one opening balance per saved debit and credit account",()=>{const state:any={bankAccounts:[{id:"a",name:"Easy Debit",balance:100,balanceAsOf:"2026-07-21"}],debts:[{id:"c",name:"Credit",liabilityType:"Credit card",balance:5611,balanceAsOf:"2026-07-21"}],accountBalanceHistory:[]};assert.equal(seedMissingBalanceHistory(state),true);assert.equal(state.accountBalanceHistory.length,2);assert.equal(seedMissingBalanceHistory(state),false);assert.equal(state.accountBalanceHistory.length,2);});
