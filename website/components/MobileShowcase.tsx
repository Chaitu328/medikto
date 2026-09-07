"use client";

import React from 'react';
import { VitalMetric } from '../lib/types';

interface Props {
  vitals: VitalMetric[];
  onOpenCalendar?: () => void;
}

export const MobileShowcase: React.FC<Props> = ({
  vitals,
  onOpenCalendar,
}) => {
  const bp = vitals.find((v) => v.category === 'bp')?.value || '118/76';
  const sugar = vitals.find((v) => v.category === 'sugar')?.value || '96';
  const heart = vitals.find((v) => v.category === 'heart')?.value || '72';

  return (
    <section className="py-20 overflow-hidden" id="mobile-showcase">
      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#006591] uppercase tracking-wider">
            Experience Medikto
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] mt-2 mb-3">
            Built for Everyday Life on iOS & Android
          </h2>
          <p className="text-base text-[#3e4850] leading-relaxed">
            Thoughtfully crafted screens engineered for fast recognition, touch targets, and high contrast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Screen 1: Daily Schedule & Log */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[320px] rounded-[38px] bg-[#09111e] p-5 text-white shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="text-cyan-400 font-bold tracking-wider uppercase">MEDICATION LOG</span>
                <span className="text-slate-400">Oct 2024</span>
              </div>

              <div className="py-4 space-y-3">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">Morning Regimen</span>
                    <span className="text-emerald-400 text-xs font-bold">100% Taken</span>
                  </div>
                  <p className="text-xs text-slate-400">Metformin 500mg, Atorvastatin 20mg</p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">Afternoon Regimen</span>
                    <span className="text-cyan-400 text-xs font-bold">Pending 1:00 PM</span>
                  </div>
                  <p className="text-xs text-slate-400">Lisinopril 10mg</p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">Evening Regimen</span>
                    <span className="text-slate-500 text-xs">Scheduled 8:00 PM</span>
                  </div>
                  <p className="text-xs text-slate-400">Amlodipine 5mg, Omega-3</p>
                </div>
              </div>

              <div className="w-full py-2 rounded-full bg-cyan-950/80 text-cyan-300 font-bold text-xs text-center border border-cyan-800/60 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Active 30-Day Adherence Log</span>
              </div>
            </div>
            <h4 className="text-lg font-bold text-[#0b1c30] mt-4">Daily Schedule & Log</h4>
            <p className="text-sm text-[#3e4850] text-center">Never miss or double-dose with visual validation</p>
          </div>

          {/* Screen 2: Health Vitals & BP Analytics */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[320px] rounded-[38px] bg-[#09111e] p-5 text-white shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="text-cyan-400 font-bold tracking-wider uppercase">VITALS DASHBOARD</span>
                <span className="text-emerald-400 text-[11px] font-semibold">Synced Just Now</span>
              </div>

              <div className="py-4 space-y-3">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Blood Pressure (BP)</span>
                  <span className="text-2xl font-extrabold text-white">
                    {bp} <span className="text-xs text-emerald-400 font-normal ml-1">Optimal</span>
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Fasting Glucose</span>
                  <span className="text-2xl font-extrabold text-white">
                    {sugar} <span className="text-xs text-cyan-400 font-normal ml-1">mg/dL Normal</span>
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Pulse Waveform</span>
                  <span className="text-2xl font-extrabold text-white">
                    {heart} <span className="text-xs text-emerald-400 font-normal ml-1">BPM Steady</span>
                  </span>
                </div>
              </div>

              <div className="w-full py-2 rounded-full bg-emerald-950/80 text-emerald-300 font-bold text-xs text-center border border-emerald-800/60 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">monitor_heart</span>
                <span>Real-Time Clinical Telemetry</span>
              </div>
            </div>
            <h4 className="text-lg font-bold text-[#0b1c30] mt-4">Health Vitals & Analytics</h4>
            <p className="text-sm text-[#3e4850] text-center">Real-time health trends with clinical indicators</p>
          </div>

          {/* Screen 3: Digital Prescription & Vault */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[320px] rounded-[38px] bg-[#09111e] p-5 text-white shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="text-cyan-400 font-bold tracking-wider uppercase">DOCUMENT LOCKER</span>
                <span className="text-slate-400">4 Stored</span>
              </div>

              <div className="py-4 space-y-3">
                <div className="bg-slate-900/90 p-3 rounded-xl flex items-center gap-3 border border-slate-800">
                  <span className="w-8 h-8 rounded-lg bg-red-950 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </span>
                  <div className="truncate">
                    <h5 className="text-xs font-bold text-white truncate">Cardiology Consult</h5>
                    <p className="text-[11px] text-slate-400">Oct 2024 • Dr. Thorne</p>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl flex items-center gap-3 border border-slate-800">
                  <span className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                    LAB
                  </span>
                  <div className="truncate">
                    <h5 className="text-xs font-bold text-white truncate">Lipid & CBC Panel</h5>
                    <p className="text-[11px] text-slate-400">Sept 2024 • Verified</p>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl flex items-center gap-3 border border-slate-800">
                  <span className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    RX
                  </span>
                  <div className="truncate">
                    <h5 className="text-xs font-bold text-white truncate">Prescription Slip</h5>
                    <p className="text-[11px] text-slate-400">Refills remaining: 3</p>
                  </div>
                </div>
              </div>

              <div className="w-full py-2 rounded-full bg-slate-900 text-slate-300 font-bold text-xs text-center border border-slate-700 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span>Encrypted Cloud Locker</span>
              </div>
            </div>
            <h4 className="text-lg font-bold text-[#0b1c30] mt-4">Digital Document Locker</h4>
            <p className="text-sm text-[#3e4850] text-center">Cloud-backed medical paperwork on demand</p>
          </div>
        </div>
      </div>
    </section>
  );
};
