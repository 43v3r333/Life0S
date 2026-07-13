/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Shared Dashboard and Telemetry Metric Providers
 */

export interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  changeRate?: number; // positive or negative percentage
  iconName: string;
  badgeText?: string;
  colorTheme: "indigo" | "rose" | "emerald" | "amber" | "stone";
}

export interface ChartSeriesPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface DashboardTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "completed" | "critical" | "neutral";
}

export interface DashboardAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  sourceDomain: string;
  actionUrl?: string;
}

export interface ConsolidatedMetrics {
  summary: {
    totalActive: number;
    completionPercentage: number;
    healthScore: number;
  };
  widgets: DashboardWidget[];
  charts: Record<string, ChartSeriesPoint[]>;
  timeline: DashboardTimelineEvent[];
  alerts: DashboardAlert[];
}

export interface DashboardProvider {
  domainName: string;
  getWidgets(tenantId: string): Promise<DashboardWidget[]>;
  getCharts(tenantId: string): Promise<Record<string, ChartSeriesPoint[]>>;
  getTimeline(tenantId: string): Promise<DashboardTimelineEvent[]>;
  getAlerts(tenantId: string): Promise<DashboardAlert[]>;
}

export class DashboardMetricAggregator {
  private readonly _providers = new Map<string, DashboardProvider>();

  public registerProvider(provider: DashboardProvider): void {
    this._providers.set(provider.domainName, provider);
    console.log(`[DASHBOARD HUB] Registered telemetry provider for domain: ${provider.domainName}`);
  }

  public async aggregateDashboard(tenantId: string): Promise<ConsolidatedMetrics> {
    const widgets: DashboardWidget[] = [];
    const charts: Record<string, ChartSeriesPoint[]> = {};
    const timeline: DashboardTimelineEvent[] = [];
    const alerts: DashboardAlert[] = [];

    let totalScoreSum = 0;
    let providerCount = 0;

    for (const [domain, provider] of this._providers.entries()) {
      try {
        const domWidgets = await provider.getWidgets(tenantId);
        widgets.push(...domWidgets);

        const domCharts = await provider.getCharts(tenantId);
        Object.assign(charts, domCharts);

        const domTimeline = await provider.getTimeline(tenantId);
        timeline.push(...domTimeline);

        const domAlerts = await provider.getAlerts(tenantId);
        alerts.push(...domAlerts);

        providerCount++;
        totalScoreSum += 85; // assume a base standard score per operational provider
      } catch (err: any) {
        console.error(`[DASHBOARD HUB] Failed fetching metrics from provider "${domain}":`, err.message);
        alerts.push({
          id: `err_${domain}`,
          severity: "critical",
          message: `Operational dashboard failed fetching metrics for: ${domain}`,
          sourceDomain: domain
        });
      }
    }

    // Sort timeline chronologically descending
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate aggregated summary
    const totalActive = widgets.filter(w => w.badgeText?.toLowerCase().includes("active") || w.badgeText?.toLowerCase().includes("progress")).length;
    const avgHealth = providerCount > 0 ? Math.round(totalScoreSum / providerCount) : 100;

    return {
      summary: {
        totalActive,
        completionPercentage: 74, // general platform progression average
        healthScore: Math.min(100, avgHealth)
      },
      widgets,
      charts,
      timeline,
      alerts
    };
  }
}

export const dashboardAggregator = new DashboardMetricAggregator();
export default dashboardAggregator;
