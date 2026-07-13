import { EventEmitter } from "events";

export interface DomainEvent {
  eventName: string;
  timestamp: string;
  payload: Record<string, any>;
}

export type EventHandler = (event: DomainEvent) => Promise<void> | void;

class InProcessEventBus {
  private emitter = new EventEmitter();

  constructor() {
    // Set a high limit on the number of event listeners
    this.emitter.setMaxListeners(50);
  }

  public publish(eventName: string, payload: Record<string, any>): void {
    const event: DomainEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      payload,
    };

    console.log(`[EVENT BUS] Published event "${eventName}" at ${event.timestamp}`);
    
    // Safely emit inside a microtask so publication is non-blocking to the main request flow
    process.nextTick(() => {
      this.emitter.emit(eventName, event);
    });
  }

  public subscribe(eventName: string, handler: EventHandler): void {
    this.emitter.on(eventName, async (event: DomainEvent) => {
      try {
        console.log(`[EVENT BUS] Subscriber executing handler for "${eventName}"...`);
        await handler(event);
        console.log(`[EVENT BUS] Handler completed for "${eventName}" successfully.`);
      } catch (err: any) {
        console.error(`[EVENT BUS] [DEAD LETTER QUEUE / RETRY] Handler failed for "${eventName}":`, err.message);
        // Here we could publish a FailureEvent or append to a Dead-Letter-Queue table
      }
    });
    console.log(`[EVENT BUS] Registered new subscription for event: "${eventName}"`);
  }
}

export const eventBus = new InProcessEventBus();
export default eventBus;
