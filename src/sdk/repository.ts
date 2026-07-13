/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Base, Cache-Decorated, Vector-Augmented, and Audit-Tracked Repositories
 */

import { Entity } from "./domain.js";
import { getDb, saveDb, DbState } from "../../server/db.js";

export interface IRepository<T extends Entity> {
  getById(id: string): Promise<T | null>;
  getAll(tenantId: string): Promise<T[]>;
  add(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export class Repository<T extends Entity> implements IRepository<T> {
  constructor(
    protected readonly _collectionKey: keyof DbState,
    protected readonly _tenantId: string = "system-default"
  ) {}

  protected getCollection(): T[] {
    const db = getDb();
    return (db[this._collectionKey] as T[]) || [];
  }

  protected setCollection(items: T[]): void {
    const db = getDb() as any;
    db[this._collectionKey] = items;
  }

  public async getById(id: string): Promise<T | null> {
    const items = this.getCollection();
    const found = items.find(item => item.id === id && !item.isDeleted);
    return found || null;
  }

  public async getAll(tenantId: string): Promise<T[]> {
    const items = this.getCollection();
    return items.filter(item => item.tenantId === tenantId && !item.isDeleted);
  }

  public async add(entity: T): Promise<void> {
    const items = this.getCollection();
    items.push(entity);
    this.setCollection(items);
    console.log(`[REPOSITORY] [ADD] Added record with ID: ${entity.id} in collection: ${String(this._collectionKey)}`);
  }

  public async update(entity: T): Promise<void> {
    const items = this.getCollection();
    const idx = items.findIndex(item => item.id === entity.id);
    if (idx !== -1) {
      items[idx] = entity;
      this.setCollection(items);
      console.log(`[REPOSITORY] [UPDATE] Updated record with ID: ${entity.id} in collection: ${String(this._collectionKey)}`);
    } else {
      throw new Error(`[REPOSITORY] Record not found to update. ID: ${entity.id}`);
    }
  }

  public async delete(id: string): Promise<void> {
    const items = this.getCollection();
    const idx = items.findIndex(item => item.id === id);
    if (idx !== -1) {
      // Hard delete or soft-delete depending on entity settings
      const entity = items[idx];
      (entity as any).isDeleted = true;
      (entity as any).modifiedUtc = new Date().toISOString();
      items[idx] = entity;
      this.setCollection(items);
      console.log(`[REPOSITORY] [DELETE] Soft-deleted record with ID: ${id} from collection: ${String(this._collectionKey)}`);
    }
  }
}

/**
 * Cached Repository Decorator (Redis Cache Invalidation Strategy)
 */
export interface ICacheService {
  get(key: string): any;
  set(key: string, value: any, ttlSeconds?: number): void;
  delete(key: string): void;
}

export class CachedRepository<T extends Entity> extends Repository<T> {
  constructor(
    collectionKey: keyof DbState,
    private readonly cache: ICacheService,
    private readonly cachePrefix: string,
    tenantId?: string
  ) {
    super(collectionKey, tenantId);
  }

  private getCacheKey(id: string): string {
    return `${this.cachePrefix}:${id}`;
  }

  private getListCacheKey(tenantId: string): string {
    return `${this.cachePrefix}:list:${tenantId}`;
  }

  public override async getById(id: string): Promise<T | null> {
    const key = this.getCacheKey(id);
    const cached = this.cache.get(key);
    if (cached) {
      console.log(`[CACHED REPOSITORY] [HIT] GET ID: ${id}`);
      return cached as T;
    }

    const item = await super.getById(id);
    if (item) {
      this.cache.set(key, item, 300); // cache for 5 minutes
    }
    return item;
  }

  public override async getAll(tenantId: string): Promise<T[]> {
    const key = this.getListCacheKey(tenantId);
    const cached = this.cache.get(key);
    if (cached) {
      console.log(`[CACHED REPOSITORY] [HIT] GET LIST for tenant: ${tenantId}`);
      return cached as T[];
    }

    const items = await super.getAll(tenantId);
    this.cache.set(key, items, 120); // list cached for 2 mins
    return items;
  }

  public override async add(entity: T): Promise<void> {
    await super.add(entity);
    this.cache.delete(this.getListCacheKey(entity.tenantId));
  }

  public override async update(entity: T): Promise<void> {
    await super.update(entity);
    this.cache.delete(this.getCacheKey(entity.id));
    this.cache.delete(this.getListCacheKey(entity.tenantId));
  }

  public override async delete(id: string): Promise<void> {
    const entity = await this.getById(id);
    await super.delete(id);
    this.cache.delete(this.getCacheKey(id));
    if (entity) {
      this.cache.delete(this.getListCacheKey(entity.tenantId));
    }
  }
}

/**
 * Vector Repository (Qdrant semantic index sync)
 */
export interface IVectorSearchService {
  getEmbeddings(text: string): Promise<number[]>;
  upsertPoint(id: string, vector: number[], payload: Record<string, any>): Promise<void>;
}

export class VectorRepository<T extends Entity> extends Repository<T> {
  constructor(
    collectionKey: keyof DbState,
    private readonly vectorStore: IVectorSearchService,
    private readonly textExtractor: (entity: T) => string,
    tenantId?: string
  ) {
    super(collectionKey, tenantId);
  }

  public override async add(entity: T): Promise<void> {
    await super.add(entity);
    await this.syncVectorIndex(entity);
  }

  public override async update(entity: T): Promise<void> {
    await super.update(entity);
    await this.syncVectorIndex(entity);
  }

  private async syncVectorIndex(entity: T): Promise<void> {
    try {
      const text = this.textExtractor(entity);
      if (!text) return;
      const embedding = await this.vectorStore.getEmbeddings(text);
      await this.vectorStore.upsertPoint(entity.id, embedding, {
        id: entity.id,
        tenantId: entity.tenantId,
        collection: String(this._collectionKey),
        textSummary: text,
        timestamp: new Date().toISOString()
      });
      console.log(`[VECTOR REPOSITORY] Synchronized neural vector point index for entity ID: ${entity.id}`);
    } catch (err: any) {
      console.error(`[VECTOR REPOSITORY] Neural synchronization failed for ${entity.id}:`, err.message);
    }
  }
}

/**
 * Audited Repository Layer (Automatic Ledger Records)
 */
export interface IAuditLogger {
  logChange(params: {
    entityId: string;
    domain: string;
    oldValue: any;
    newValue: any;
    correlationId: string;
    reason?: string;
  }): Promise<void>;
}

export class AuditRepository<T extends Entity> extends Repository<T> {
  constructor(
    collectionKey: keyof DbState,
    private readonly auditor: IAuditLogger,
    private readonly correlationId: string,
    tenantId?: string
  ) {
    super(collectionKey, tenantId);
  }

  public override async add(entity: T): Promise<void> {
    await super.add(entity);
    await this.auditor.logChange({
      entityId: entity.id,
      domain: String(this._collectionKey),
      oldValue: null,
      newValue: entity,
      correlationId: this.correlationId,
      reason: "Initial entity creation provisioning"
    });
  }

  public override async update(entity: T): Promise<void> {
    const original = await this.getById(entity.id);
    await super.update(entity);
    await this.auditor.logChange({
      entityId: entity.id,
      domain: String(this._collectionKey),
      oldValue: original,
      newValue: entity,
      correlationId: this.correlationId,
      reason: "Entity modification sync"
    });
  }

  public override async delete(id: string): Promise<void> {
    const original = await this.getById(id);
    await super.delete(id);
    await this.auditor.logChange({
      entityId: id,
      domain: String(this._collectionKey),
      oldValue: original,
      newValue: { ...original, isDeleted: true },
      correlationId: this.correlationId,
      reason: "Entity soft-delete event"
    });
  }
}
