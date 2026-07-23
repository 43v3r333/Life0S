/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Multi-Tenant Context Propagation & Logical Partitioning
 */

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  tier: "Standard" | "Enterprise" | "Ultimate_Waqf";
}

import { personalProfile } from "../config/personalization.js";

export class TenantContext {
  private static _currentTenantId: string = "tenant-default-01";
  private static _currentOperator: string = personalProfile.name;

  public static getCurrentTenantId(): string {
    return this._currentTenantId;
  }

  public static setCurrentTenantId(tenantId: string): void {
    if (!tenantId || tenantId.trim() === "") {
      throw new Error("[TENANT CONTEXT] Tenant ID cannot be set to empty or undefined.");
    }
    this._currentTenantId = tenantId;
    console.log(`[TENANT CONTEXT] Context swapped to tenant: "${tenantId}"`);
  }

  public static getCurrentOperator(): string {
    return this._currentOperator;
  }

  public static setCurrentOperator(operator: string): void {
    this._currentOperator = operator;
  }

  /**
   * Evaluates security permissions and scopes records dynamically during reads
   */
  public static applyTenantQueryFilter<T extends { tenantId: string; isDeleted?: boolean }>(
    records: T[],
    options: { includeSoftDeleted?: boolean } = {}
  ): T[] {
    const tenantId = this.getCurrentTenantId();
    return records.filter(rec => {
      const matchTenant = rec.tenantId === tenantId;
      const matchDelete = options.includeSoftDeleted ? true : !rec.isDeleted;
      return matchTenant && matchDelete;
    });
  }
}
