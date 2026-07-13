import { DomainEvent } from "../../../../sdk/domain.js";

export class LedgerCreatedEvent implements DomainEvent {
  public readonly eventId = "evt_" + Math.random().toString(36).substr(2, 9);
  public readonly timestamp = new Date().toISOString();
  public readonly eventName = "LedgerCreated";

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly currency: string,
    public readonly version: number = 1
  ) {}
}

export class AccountCreatedEvent implements DomainEvent {
  public readonly eventId = "evt_" + Math.random().toString(36).substr(2, 9);
  public readonly timestamp = new Date().toISOString();
  public readonly eventName = "AccountCreated";

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly type: string,
    public readonly parentId?: string,
    public readonly version: number = 1
  ) {}
}

export class JournalEntryPostedEvent implements DomainEvent {
  public readonly eventId = "evt_" + Math.random().toString(36).substr(2, 9);
  public readonly timestamp = new Date().toISOString();
  public readonly eventName = "JournalEntryPosted";

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly description: string,
    public readonly lines: { accountId: string; type: "Debit" | "Credit"; amount: number }[],
    public readonly version: number = 1
  ) {}
}

export class TransactionReconciledEvent implements DomainEvent {
  public readonly eventId = "evt_" + Math.random().toString(36).substr(2, 9);
  public readonly timestamp = new Date().toISOString();
  public readonly eventName = "TransactionReconciled";

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly statementLineId: string,
    public readonly journalEntryId: string,
    public readonly version: number = 1
  ) {}
}

export class ZakahCalculatedEvent implements DomainEvent {
  public readonly eventId = "evt_" + Math.random().toString(36).substr(2, 9);
  public readonly timestamp = new Date().toISOString();
  public readonly eventName = "ZakahCalculated";

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly calculationYear: number,
    public readonly netNisabValue: number,
    public readonly zakahDue: number,
    public readonly version: number = 1
  ) {}
}

export class WaqfRegisteredEvent implements DomainEvent {
  public readonly eventId = "evt_" + Math.random().toString(36).substr(2, 9);
  public readonly timestamp = new Date().toISOString();
  public readonly eventName = "WaqfRegistered";

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly capitalAmount: number,
    public readonly purpose: string,
    public readonly version: number = 1
  ) {}
}
