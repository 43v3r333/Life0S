/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Production-Grade Event Infrastructure: Versioning, DLQ, Priority, and Backoff Retries
 */

import { DomainEvent } from "./domain.js";

export interface IIntegrationEvent {
  id: string;
  eventName: string;
  version: number;
  timestamp: string;
  correlationId: string;
  tenantId: string;
  payload: Record<string, any>;
}

export type IntegrationEventHandler = (event: IIntegrationEvent) => Promise<void> | void;

export interface HandlerRegistration {
  handler: IntegrationEventHandler;
  priority: number; // Higher numbers run first
  maxRetries: number;
}

export class IntegrationEventBus {
  private readonly _subscribers = new Map<string, HandlerRegistration[]>();
  private readonly _deadLetterQueue: { event: IIntegrationEvent; error: string; handlerName: string }[] = [];

  /**
   * Subscribe with optional priorities and automatic retries
   */
  public subscribe(
    eventName: string,
    handler: IntegrationEventHandler,
    priority: number = 0,
    maxRetries: number = 3
  ): void {
    const list = this._subscribers.get(eventName) || [];
    list.push({ handler, priority, maxRetries });
    
    // Sort subscribers so high priority runs first
    list.sort((a, b) => b.priority - a.priority);
    
    this._subscribers.set(eventName, list);
    console.log(`[EVENT BUS SDK] Registered subscriber for "${eventName}" (Priority: ${priority}, Retries: ${maxRetries})`);
  }

  /**
   * Publish an integration event with automatic error-handling retries and DLQ routing
   */
  public async publish(event: IIntegrationEvent): Promise<void> {
    console.log(`[EVENT BUS SDK] [PUBLISH] Event: "${event.eventName}" v${event.version} | ID: ${event.id}`);
    const subscribers = this._subscribers.get(event.eventName) || [];

    if (subscribers.length === 0) {
      console.log(`[EVENT BUS SDK] No active subscribers found for event: "${event.eventName}"`);
      return;
    }

    // Process subscribers in sequence based on sorted priorities
    for (const sub of subscribers) {
      await this.executeWithRetry(event, sub);
    }
  }

  private async executeWithRetry(event: IIntegrationEvent, reg: HandlerRegistration): Promise<void> {
    const handlerName = reg.handler.name || "anonymousHandler";
    let attempts = 0;
    const maxRetries = reg.maxRetries;

    while (attempts <= maxRetries) {
      try {
        attempts++;
        console.log(`[EVENT BUS SDK] [DISPATCH] Invoking "${handlerName}" | Attempt ${attempts}/${maxRetries + 1}`);
        await reg.handler(event);
        console.log(`[EVENT BUS SDK] [SUCCESS] Handler "${handlerName}" resolved successfully.`);
        return; // Success, break out of retry loop
      } catch (err: any) {
        console.error(`[EVENT BUS SDK] [WARNING] Handler "${handlerName}" failed on attempt ${attempts}: ${err.message}`);
        
        if (attempts > maxRetries) {
          console.error(`[EVENT BUS SDK] [DEAD LETTER QUEUE] Handler "${handlerName}" exceeded retry budget of ${maxRetries}. Routing to DLQ.`);
          this._deadLetterQueue.push({
            event,
            error: err.message || "Unknown Exception",
            handlerName
          });
          return;
        }

        // Exponential backoff wait (e.g. 50ms, 100ms, 200ms)
        const delay = Math.pow(2, attempts) * 25;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Inspect dead letter queue entries
   */
  public getDeadLetterQueue(): readonly { event: IIntegrationEvent; error: string; handlerName: string }[] {
    return this._deadLetterQueue;
  }

  public clearDLQ(): void {
    this._deadLetterQueue.length = 0;
  }
}

export const integrationEventBus = new IntegrationEventBus();
