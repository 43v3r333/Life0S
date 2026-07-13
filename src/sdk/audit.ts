/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Unified Audit Ledger System
 */

import { getDb, saveDb } from "../../server/db.js";
import { Guid } from "./result.js";

export interface AuditRecord {
  id: string;
  timestamp: string;
  user: string;
  tenantId: string;
  correlationId: string;
  oldValue: any | null;
  newValue: any | null;
  reason: string;
  domain: string;
  commandName: string;
  result: "SUCCESS" | "FAILED" | "PENDING";
}

export class AuditLedgerService {
  /**
   * Commits a structured audit trace node to the persistent canonical ledger
   */
  public async logChange(params: {
    user?: string;
    tenantId?: string;
    correlationId: string;
    oldValue: any | null;
    newValue: any | null;
    reason: string;
    domain: string;
    commandName?: string;
    result?: "SUCCESS" | "FAILED" | "PENDING";
  }): Promise<AuditRecord> {
    const db = getDb();
    
    const record: AuditRecord = {
      id: "audit_" + Guid.newGuid().substring(3, 10),
      timestamp: new Date().toISOString(),
      user: params.user || db.currentUser || "Ethan",
      tenantId: params.tenantId || "tenant-default-01",
      correlationId: params.correlationId,
      oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : null,
      newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
      reason: params.reason || "Administrative state mutation update",
      domain: params.domain,
      commandName: params.commandName || "MutateStateCommand",
      result: params.result || "SUCCESS"
    };

    db.systemEvents = db.systemEvents || [];
    db.systemEvents.push(record);
    
    // Retain only the last 1000 records to prevent file bloat
    if (db.systemEvents.length > 1000) {
      db.systemEvents = db.systemEvents.slice(-1000);
    }

    await saveDb();
    console.log(`[AUDIT LEDGER] Committed audit log ID: ${record.id} for domain: ${record.domain} (Correlation: ${record.correlationId})`);
    return record;
  }

  /**
   * Query the audit logs
   */
  public getLogsByCorrelation(correlationId: string): AuditRecord[] {
    const db = getDb();
    const list = (db.systemEvents as AuditRecord[]) || [];
    return list.filter(log => log.correlationId === correlationId);
  }

  public getLogsByDomain(domain: string): AuditRecord[] {
    const db = getDb();
    const list = (db.systemEvents as AuditRecord[]) || [];
    return list.filter(log => log.domain === domain);
  }
}

export const auditLedger = new AuditLedgerService();
export default auditLedger;
