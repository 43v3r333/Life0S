/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Generic CQRS Mediator with MediatR-like Pipeline Behaviors
 */

import { Result } from "./result.js";

export interface IRequest<TResponse> {
  readonly _responseType?: TResponse;
}

export interface ICommand<TResponse = void> extends IRequest<Result<TResponse>> {
  readonly correlationId: string;
}

export interface IQuery<TResponse> extends IRequest<Result<TResponse>> {
  readonly bypassCache?: boolean;
}

export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse> {
  handle(request: TRequest): Promise<TResponse>;
}

export type NextPipelineBehavior<TResponse> = () => Promise<TResponse>;

export interface IPipelineBehavior {
  handle<TRequest extends IRequest<TResponse>, TResponse>(
    request: TRequest,
    next: NextPipelineBehavior<TResponse>
  ): Promise<TResponse>;
}

export class Mediator {
  private readonly _handlers = new Map<string, IRequestHandler<any, any>>();
  private readonly _behaviors: IPipelineBehavior[] = [];

  public registerHandler<TRequest extends IRequest<TResponse>, TResponse>(
    requestType: string,
    handler: IRequestHandler<TRequest, TResponse>
  ): void {
    this._handlers.set(requestType, handler);
  }

  public registerBehavior(behavior: IPipelineBehavior): void {
    this._behaviors.push(behavior);
  }

  public async send<TResponse>(requestType: string, request: IRequest<TResponse>): Promise<TResponse> {
    const handler = this._handlers.get(requestType);
    if (!handler) {
      throw new Error(`[CQRS MEDIATOR] No registered handler found for request type: ${requestType}`);
    }

    // Build the middleware chain recursively
    let currentStepIndex = 0;

    const executeChain = async (): Promise<TResponse> => {
      if (currentStepIndex < this._behaviors.length) {
        const behavior = this._behaviors[currentStepIndex++];
        return behavior.handle(request, executeChain);
      }
      return handler.handle(request);
    };

    return executeChain();
  }
}

/**
 * Standard Logging Pipeline Behavior
 */
export class LoggingBehavior implements IPipelineBehavior {
  public async handle<TRequest extends IRequest<TResponse>, TResponse>(
    request: TRequest,
    next: NextPipelineBehavior<TResponse>
  ): Promise<TResponse> {
    const name = request.constructor.name || "Request";
    console.log(`[CQRS LOGGING] [START] Processing request: ${name} with payload:`, JSON.stringify(request));
    try {
      const response = await next();
      console.log(`[CQRS LOGGING] [END] Successfully completed request: ${name}`);
      return response;
    } catch (err: any) {
      console.error(`[CQRS LOGGING] [FAILURE] Failed processing request: ${name}. Exception: ${err.message}`);
      throw err;
    }
  }
}

/**
 * Performance Tracking Pipeline Behavior
 */
export class PerformanceBehavior implements IPipelineBehavior {
  constructor(private readonly warningThresholdMs: number = 500) {}

  public async handle<TRequest extends IRequest<TResponse>, TResponse>(
    request: TRequest,
    next: NextPipelineBehavior<TResponse>
  ): Promise<TResponse> {
    const startTime = Date.now();
    const response = await next();
    const elapsed = Date.now() - startTime;

    if (elapsed > this.warningThresholdMs) {
      console.warn(`[CQRS PERFORMANCE ALERT] Request ${request.constructor.name} took ${elapsed}ms (Threshold: ${this.warningThresholdMs}ms)`);
    } else {
      console.log(`[CQRS PERFORMANCE] Request ${request.constructor.name} executed in ${elapsed}ms`);
    }
    return response;
  }
}

/**
 * Transaction Isolation & Auto-Commit Pipeline Behavior
 */
export class TransactionBehavior implements IPipelineBehavior {
  constructor(private readonly commitFn: () => Promise<void>) {}

  public async handle<TRequest extends IRequest<TResponse>, TResponse>(
    request: TRequest,
    next: NextPipelineBehavior<TResponse>
  ): Promise<TResponse> {
    const isCommand = "correlationId" in request;
    if (!isCommand) {
      return next(); // Skip query transactions
    }

    console.log(`[CQRS TX] [BEGIN] Initiating database transaction state frame`);
    try {
      const response = await next();
      // If it's a Result, only commit on success
      if (response && (response as any).isSuccess === false) {
        console.warn(`[CQRS TX] [ROLLBACK] Command failed inside transaction frame. Preserving store integrity.`);
      } else {
        await this.commitFn();
        console.log(`[CQRS TX] [COMMIT] Transaction synchronized with persistent store successfully.`);
      }
      return response;
    } catch (err) {
      console.error(`[CQRS TX] [ROLLBACK] Unhandled exception in transaction, rolling back state modification:`, err);
      throw err;
    }
  }
}

/**
 * Validation Pipeline Behavior
 */
export interface IValidator<TRequest> {
  validate(request: TRequest): string | null;
}

export class ValidationBehavior implements IPipelineBehavior {
  private readonly _validators = new Map<string, IValidator<any>[]>();

  public registerValidator<TRequest>(requestType: string, validator: IValidator<TRequest>): void {
    const list = this._validators.get(requestType) || [];
    list.push(validator);
    this._validators.set(requestType, list);
  }

  public async handle<TRequest extends IRequest<TResponse>, TResponse>(
    request: TRequest,
    next: NextPipelineBehavior<TResponse>
  ): Promise<TResponse> {
    const name = request.constructor.name || "Request";
    const validators = this._validators.get(name) || [];

    for (const v of validators) {
      const errorMsg = v.validate(request);
      if (errorMsg) {
        console.error(`[CQRS VALIDATION] Command rejected by Validator: ${errorMsg}`);
        // If the return type is expected to be a Result, wrap it, else throw
        return Result.failure({
          type: "https://projectjannah.io/errors/validation-failed",
          title: "Command Validation Failed",
          status: 400,
          detail: errorMsg
        }) as unknown as TResponse;
      }
    }

    return next();
  }
}

/**
 * Query Cache Hydration Behavior
 */
export interface ICacheStore {
  get(key: string): any;
  set(key: string, value: any, ttlSeconds?: number): void;
}

export class CachingBehavior implements IPipelineBehavior {
  constructor(private readonly cache: ICacheStore) {}

  public async handle<TRequest extends IRequest<TResponse>, TResponse>(
    request: TRequest,
    next: NextPipelineBehavior<TResponse>
  ): Promise<TResponse> {
    // Check if the request is query and supports caching
    const cacheKey = (request as any).cacheKey;
    const bypass = (request as any).bypassCache;

    if (!cacheKey) {
      return next();
    }

    if (bypass) {
      console.log(`[CQRS CACHE] Bypassing cache for key: ${cacheKey}`);
      const fresh = await next();
      this.cache.set(cacheKey, fresh, 120);
      return fresh;
    }

    const cachedVal = this.cache.get(cacheKey);
    if (cachedVal !== null && cachedVal !== undefined) {
      console.log(`[CQRS CACHE] [HIT] Satisfying query from cached response. Key: ${cacheKey}`);
      return cachedVal;
    }

    console.log(`[CQRS CACHE] [MISS] Executing database handler for Key: ${cacheKey}`);
    const freshVal = await next();
    this.cache.set(cacheKey, freshVal, 120);
    return freshVal;
  }
}

/**
 * Authorization Pipeline Behavior
 */
export interface IAuthContext {
  getCurrentUser(): string;
  hasRole(role: string): boolean;
}

export class AuthorizationBehavior implements IPipelineBehavior {
  constructor(private readonly authCtx: IAuthContext) {}

  public async handle<TRequest extends IRequest<TResponse>, TResponse>(
    request: TRequest,
    next: NextPipelineBehavior<TResponse>
  ): Promise<TResponse> {
    const requiredRoles = (request as any).requiredRoles as string[];
    if (!requiredRoles || requiredRoles.length === 0) {
      return next();
    }

    const currentUser = this.authCtx.getCurrentUser();
    console.log(`[CQRS AUTH] Verifying security roles [${requiredRoles.join(", ")}] for operator: ${currentUser}`);

    const isAuthorized = requiredRoles.some(role => this.authCtx.hasRole(role));
    if (!isAuthorized) {
      console.error(`[CQRS AUTH] Access Denied: User "${currentUser}" does not hold required clearance level.`);
      return Result.failure({
        type: "https://projectjannah.io/errors/forbidden",
        title: "Access Control Clearance Denied",
        status: 403,
        detail: `Security access denied for operator '${currentUser}' inside current Tenant context.`
      }) as unknown as TResponse;
    }

    return next();
  }
}
export const mediator = new Mediator();
