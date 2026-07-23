/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Core Result pattern, Problem Details RFC-7807, and Pagination Primitives
 */

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
  extensions?: Record<string, any>;
}

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly value?: T;
  public readonly error?: ProblemDetails;

  private constructor(isSuccess: boolean, value?: T, error?: ProblemDetails) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.value = value;
    this.error = error;
  }

  public static success<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }

  public static failure<T>(error: ProblemDetails): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  public static ok(): Result<void> {
    return new Result<void>(true, undefined);
  }

  public getValueOrThrow(): T {
    if (this.isFailure) {
      throw new Error(`Cannot retrieve value from a failed Result: ${this.error?.detail}`);
    }
    return this.value!;
  }
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function createPagedResult<T>(
  items: T[],
  totalCount: number,
  pageNumber: number,
  pageSize: number
): PagedResult<T> {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    items,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
  };
}

/**
 * Core Correlation ID and Date Utility Helpers
 */
export const Guid = {
  newGuid(): string {
    return `id_${crypto.randomUUID()}`;
  }
};

export const DateTimeHelpers = {
  nowUtc(): string {
    return new Date().toISOString();
  },
  addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }
};
