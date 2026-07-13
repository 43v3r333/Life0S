'use client';

import { useState } from 'react';

export interface SalahLog {
  id: string;
  prayerName: string;
  status: string;
  isCongregation: boolean;
  location: string;
  timestamp: string;
}

export function useSalahTracker() {
  const [logs, setLogs] = useState<SalahLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const logPrayer = async (payload: Omit<SalahLog, 'id' | 'timestamp'>) => {
    setIsLogging(true);
    try {
      // Simulate real CQRS Command dispatching via Express/ASP.NET backend API
      const newLog: SalahLog = {
        ...payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };
      
      // Update local state cache mimicking TanStack React Query cache invalidation
      setLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error('Failed to dispatch LogSalahCommand telemetry:', err);
    } finally {
      setIsLogging(false);
    }
  };

  return {
    logs,
    isLoading,
    isLogging,
    logPrayer
  };
}
