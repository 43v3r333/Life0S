/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Centralized Shared Validation and Concurrency Protection Engine
 */

import { ProblemDetails } from "./result.js";
import { BusinessRule, DomainException, Entity } from "./domain.js";

export type ValidationRule<T> = (value: T) => string | null;

export class FluentValidator<T> {
  private readonly _rules: ValidationRule<T>[] = [];

  public ruleFor(rule: ValidationRule<T>): this {
    this._rules.push(rule);
    return this;
  }

  public validate(instance: T): string[] {
    const errors: string[] = [];
    for (const rule of this._rules) {
      const error = rule(instance);
      if (error) {
        errors.push(error);
      }
    }
    return errors;
  }

  public validateAndGetProblemDetails(instance: T, title: string = "Validation Failure"): ProblemDetails | null {
    const errors = this.validate(instance);
    if (errors.length === 0) return null;

    return {
      type: "https://projectjannah.io/errors/validation-failed",
      title,
      status: 400,
      detail: `There were ${errors.length} validation errors on this model request payload.`,
      errors: {
        payload: errors
      }
    };
  }
}

/**
 * Enterprise Guard Utilities
 */
export class Guard {
  public static againstNullOrEmpty(value: string | null | undefined, parameterName: string): void {
    if (!value || value.trim() === "") {
      throw new DomainException(`Validation failed: Parameter '${parameterName}' cannot be null or empty.`);
    }
  }

  public static againstOutOfRange(value: number, min: number, max: number, parameterName: string): void {
    if (value < min || value > max) {
      throw new DomainException(`Validation failed: Parameter '${parameterName}' of ${value} falls outside strict range of [${min}, ${max}].`);
    }
  }

  /**
   * Optimistic Concurrency Invariant Assertion
   */
  public static verifyConcurrencyVersion(
    incomingVersion: number,
    storedEntity: Entity
  ): void {
    if (incomingVersion !== storedEntity.version) {
      console.error(`[CONCURRENCY BLOCK] Optimistic lock violation for ID: ${storedEntity.id}. Stored Version: ${storedEntity.version}, Request Version: ${incomingVersion}`);
      throw new DomainException(
        `Optimistic concurrency violation: The aggregate was modified or deleted by another transaction. Please reload and retry.`
      );
    }
  }

  /**
   * Duplicate Detection across lists
   */
  public static assertNoDuplicateKey<T>(
    items: T[],
    keySelector: (item: T) => string,
    newValue: string,
    errorMessage: string
  ): void {
    const exists = items.some(item => keySelector(item).toLowerCase() === newValue.toLowerCase());
    if (exists) {
      throw new DomainException(errorMessage);
    }
  }
}
