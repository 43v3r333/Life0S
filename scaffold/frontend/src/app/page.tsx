'use client';

import React, { useState } from 'react';
import { useSalahTracker } from '@/hooks/useSalahTracker';
import { Activity, Shield, Calendar, BookOpen, BrainCircuit } from 'lucide-react';

export default function DashboardPage() {
  const { logs, isLoading, logPrayer, isLogging } = useSalahTracker();
  const [selectedPrayer, setSelectedPrayer] = useState('Fajr');
  const [status, setStatus] = useState('PrayedOnTime');
  const [inCongregation, setInCongregation] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logPrayer({
      prayerName: selectedPrayer,
      status: status,
      isCongregation: inCongregation,
      location: inCongregation ? 'Masjid' : 'Home'
    });
  };

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans antialiased">
      {/* Upper Navigation Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-stone-900 rounded-lg text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight">Project Jannah</h1>
              <p className="text-xs text-stone-500 font-mono">Stage: Foundation v0.1.0</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-100 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI Chief of Staff Online</span>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Telemetry Tracker */}
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-stone-100 pb-4 mb-6">
              <Calendar className="h-5 w-5 text-stone-500" />
              <h2 className="text-lg font-medium">Salah Telemetry</h2>
            </div>

            {/* Prayer Logging Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5 font-mono">PRAYER</label>
                  <select 
                    value={selectedPrayer} 
                    onChange={(e) => setSelectedPrayer(e.target.value)}
                    className="w-full bg-[#f5f5f4] border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    <option value="Fajr">Fajr</option>
                    <option value="Dhuhr">Dhuhr</option>
                    <option value="Asr">Asr</option>
                    <option value="Maghrib">Maghrib</option>
                    <option value="Isha">Isha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5 font-mono">STATUS</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#f5f5f4] border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    <option value="PrayedOnTime">Prayed On Time</option>
                    <option value="PrayedLate">Prayed Late</option>
                    <option value="Missed">Missed</option>
                    <option value="Excused">Excused</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium">
                    <input 
                      type="checkbox" 
                      checked={inCongregation} 
                      onChange={(e) => setInCongregation(e.target.checked)}
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-500 h-4 w-4"
                    />
                    <span>Prayed in Congregation (Jama'ah)</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLogging}
                className="w-full bg-stone-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-stone-800 transition duration-150 disabled:opacity-50"
              >
                {isLogging ? 'Logging Telemetry...' : 'Log Salah Command'}
              </button>
            </form>

            {/* Display logged history */}
            <div className="mt-8">
              <h3 className="text-xs font-medium text-stone-500 mb-4 font-mono">LOG HISTORY</h3>
              {isLoading ? (
                <p className="text-sm text-stone-400">Loading daily telemetry...</p>
              ) : (
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-sm text-stone-400 italic">No prayers logged today. Begin logging above.</p>
                  ) : (
                    logs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-[#f5f5f4] rounded-lg border border-stone-100 text-sm">
                        <span className="font-semibold">{log.prayerName}</span>
                        <div className="flex items-center space-x-3 text-stone-500 text-xs">
                          <span className="bg-white px-2 py-0.5 rounded border border-stone-200">{log.status}</span>
                          <span>{log.isCongregation ? '🕌 Masjid' : '🏠 Home'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column - Gabriel AI Chief of Staff Widget */}
        <section className="space-y-8">
          <div className="bg-stone-900 text-[#fafaf9] rounded-2xl p-6 shadow-xl border border-stone-800">
            <div className="flex items-center space-x-2 border-b border-stone-800 pb-4 mb-6">
              <BrainCircuit className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-medium">Gabriel (Chief of Staff)</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-800 text-sm">
                <p className="text-stone-300 italic">"As your AI Chief of Staff, my current priority is validating the Jannah Foundation scaffold. All domain pipeline schemas are standing up. Begin checking Salah and Ledger commands to index long-term personal context."</p>
              </div>

              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg bg-stone-800 hover:bg-stone-700/80 transition flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <span>Generate Halal Budget Strategy</span>
                  </div>
                  <span className="text-[10px] bg-stone-700 px-2 py-0.5 rounded text-stone-400 font-mono">AI Command</span>
                </button>

                <button className="w-full text-left p-3 rounded-lg bg-stone-800 hover:bg-stone-700/80 transition flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>Audit Marital Goal Consistency</span>
                  </div>
                  <span className="text-[10px] bg-stone-700 px-2 py-0.5 rounded text-stone-400 font-mono">AI Query</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
