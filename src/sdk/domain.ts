/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Domain-Driven Design Abstractions
 */

export interface DomainEvent {
  eventId: string;
  timestamp: string;
  aggregateId: string;
  eventName: string;
  version: number;
}

export abstract class Entity<TId = string> {
  public readonly id: TId;
  public readonly tenantId: string;
  public readonly createdBy: string;
  public readonly modifiedBy: string;
  public readonly createdUtc: string;
  public readonly modifiedUtc: string;
  public readonly version: number;
  public readonly isDeleted: boolean;

  protected constructor(
    id: TId,
    tenantId: string,
    createdBy: string,
    modifiedBy: string,
    createdUtc: string,
    modifiedUtc: string,
    version: number = 1,
    isDeleted: boolean = false
  ) {
    this.id = id;
    this.tenantId = tenantId;
    this.createdBy = createdBy;
    this.modifiedBy = modifiedBy;
    this.createdUtc = createdUtc;
    this.modifiedUtc = modifiedUtc;
    this.version = version;
    this.isDeleted = isDeleted;
  }

  public equals(other?: Entity<TId>): boolean {
    if (other === null || other === undefined) return false;
    if (Object.is(this, other)) return true;
    return this.id === other.id;
  }
}

export abstract class AggregateRoot<TId = string> extends Entity<TId> {
  private readonly _domainEvents: DomainEvent[] = [];

  protected constructor(
    id: TId,
    tenantId: string,
    createdBy: string,
    modifiedBy: string,
    createdUtc: string,
    modifiedUtc: string,
    version: number = 1,
    isDeleted: boolean = false
  ) {
    super(id, tenantId, createdBy, modifiedBy, createdUtc, modifiedUtc, version, isDeleted);
  }

  public getDomainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  protected raiseDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }
}

export abstract class ValueObject {
  protected abstract getEqualityComponents(): Iterable<any>;

  public equals(other?: ValueObject): boolean {
    if (other === null || other === undefined) return false;
    if (this.constructor !== other.constructor) return false;

    const thisComponents = Array.from(this.getEqualityComponents());
    const otherComponents = Array.from(other.getEqualityComponents());

    if (thisComponents.length !== otherComponents.length) return false;

    for (let i = 0; i < thisComponents.length; i++) {
      if (thisComponents[i] !== otherComponents[i]) return false;
    }

    return true;
  }
}

export interface BusinessRule {
  message: string;
  isBroken(): boolean;
}

export class DomainException extends Error {
  public readonly rule?: BusinessRule;

  constructor(message: string, rule?: BusinessRule) {
    super(message);
    this.name = "DomainException";
    this.rule = rule;
    Object.setPrototypeOf(this, DomainException.prototype);
  }

  public static checkRule(rule: BusinessRule): void {
    if (rule.isBroken()) {
      throw new DomainException(rule.message, rule);
    }
  }
}

/**
 * Specification Pattern
 */
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

export abstract class BaseSpecification<T> implements Specification<T> {
  public abstract isSatisfiedBy(candidate: T): boolean;

  public and(other: Specification<T>): Specification<T> {
    return new AndSpecification<T>(this, other);
  }

  public or(other: Specification<T>): Specification<T> {
    return new OrSpecification<T>(this, other);
  }

  public not(): Specification<T> {
    return new NotSpecification<T>(this);
  }
}

class AndSpecification<T> extends BaseSpecification<T> {
  constructor(private readonly left: Specification<T>, private readonly right: Specification<T>) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends BaseSpecification<T> {
  constructor(private readonly left: Specification<T>, private readonly right: Specification<T>) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
