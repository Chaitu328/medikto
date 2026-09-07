"use client";

import React, { useState } from 'react';
import { VitalMetric, DayVitals } from '../lib/types';

interface Props {
  vitals: VitalMetric[];
  weeklyHistory: DayVitals[];
  onOpenDoctorReport: () => void;
}

export const VitalsSection: React.FC<Props> = ({
  vitals,
  weeklyHistory,
  onOpenDoctorReport,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayVitals | null>(weeklyHistory[weeklyHistory.length - 1]);

  return (
    <section className="py-24 bg-gradient-to-b from-white via-sky-50/30 to-white" id="vitals">
      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-[#006591] font-bold text-xs shadow-sm border border-sky-200/80 mb-4 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" />
              Unified Health Records
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
              Your Health History,{' '}
              <span className="bg-gradient-to-r from-[#006591] via-[#0284c7] to-[#0ea5e9] bg-clip-text text-transparent">
                All in One Place
              </span>
            </h2>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {vitals.map((v) => {
            let icon = 'favorite';
            let iconColor = 'bg-emerald-100 text-emerald-700';
            let sparklineColor = 'text-[#006591]';

            if (v.category === 'bp') {
              icon = 'favorite';
              iconColor = 'bg-emerald-100 text-emerald-700';
              sparklineColor = 'text-[#006591]';
            } else if (v.category === 'sugar') {
              icon = 'water_drop';
              iconColor = 'bg-cyan-100 text-cyan-800';
              sparklineColor = 'text-cyan-500';
            } else if (v.category === 'heart') {
              icon = 'monitor_heart';
              iconColor = 'bg-rose-100 text-rose-700';
              sparklineColor = 'text-rose-500';
            } else {
              icon = 'thermostat';
              iconColor = 'bg-amber-100 text-amber-800';
              sparklineColor = 'text-amber-500';
            }

            return (
              <div
                key={v.id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[11px] font-bold text-[#3e4850] uppercase tracking-wider">
                      {v.title}
                    </span>
                    <span className={`w-8 h-8 rounded-full ${iconColor} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                      {v.value}
                    </span>
                    <span className="text-xs text-[#3e4850] ml-1.5 font-semibold">{v.unit}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-3 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {v.statusLabel}
                  </span>
                </div>

                <div>
                  {/* Inline Sparkline SVG */}
                  <div className="h-10 w-full mt-2">
                    {v.category === 'heart' ? (
                      <svg className={`w-full h-full ${sparklineColor}`} viewBox="0 0 100 25" preserveAspectRatio="none">
                        <path
                          d="M0 15 L 20 15 L 25 5 L 32 24 L 38 12 L 44 15 L 100 15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : v.category === 'sugar' ? (
                      <svg className={`w-full h-full ${sparklineColor}`} viewBox="0 0 100 25" preserveAspectRatio="none">
                        <path
                          d="M0 12 Q 20 6, 40 10 T 70 16 T 90 9 T 100 8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : v.category === 'temp' ? (
                      <svg className={`w-full h-full ${sparklineColor}`} viewBox="0 0 100 25" preserveAspectRatio="none">
                        <path
                          d="M0 12 Q 25 12, 50 11 T 100 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg className={`w-full h-full ${sparklineColor}`} viewBox="0 0 100 25" preserveAspectRatio="none">
                        <path
                          d="M0 18 Q 15 10, 30 14 T 60 8 T 85 12 T 100 10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-[11px] text-[#3e4850] block mt-1">{v.note}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Trend Chart Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 gap-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30]">
                7-Day Systolic & Diastolic Pressure Trend
              </h3>
              <p className="text-sm text-[#3e4850]">
                Daily morning readings consistently inside the physician-approved healthy corridor.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#006591]" />
                <span className="text-xs font-semibold text-[#3e4850]">Systolic (&lt;120)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#dae2fd] border border-slate-300" />
                <span className="text-xs font-semibold text-[#3e4850]">Diastolic (&lt;80)</span>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-52 items-end pt-4 px-2">
            {weeklyHistory.map((item) => {
              const isSelected = selectedDay?.day === item.day;
              // Map systolic 110-130 to 45%-85% height
              const sysHeight = Math.min(85, Math.max(40, ((item.systolic - 100) / 40) * 100));
              const diaHeight = Math.min(60, Math.max(30, ((item.diastolic - 60) / 40) * 100));

              return (
                <div
                  key={item.day}
                  onClick={() => setSelectedDay(item)}
                  className={`flex flex-col items-center gap-2 h-full justify-end cursor-pointer group p-1 rounded-xl transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                    }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.systolic}/{item.diastolic}
                  </div>
                  <div
                    className={`w-full max-w-[32px] rounded-t-lg transition-all ${isSelected ? 'bg-[#0ea5e9]' : 'bg-[#006591] group-hover:bg-[#004c6e]'
                      }`}
                    style={{ height: `${sysHeight}%` }}
                  />
                  <div
                    className="w-full max-w-[32px] bg-[#dae2fd] rounded-t-lg -mt-1"
                    style={{ height: `${diaHeight}%` }}
                  />
                  <span className={`text-xs ${isSelected ? 'font-bold text-[#006591]' : 'text-[#3e4850]'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {selectedDay && (
            <div className="mt-4 p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between text-xs text-[#006591] border border-blue-100">
              <span className="font-bold">
                Selected: {selectedDay.day} — Blood Pressure: {selectedDay.systolic}/{selectedDay.diastolic} mmHg (Optimal)
              </span>
              <span className="text-[#3e4850]">Glucose: {selectedDay.glucose} mg/dL • Pulse: {selectedDay.heartRate} BPM</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
