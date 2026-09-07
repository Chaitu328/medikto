"use client";

import React from 'react';
import { Medication, VitalMetric } from '../lib/types';
import { playChime } from '../lib/audio';

interface Props {
  medications: Medication[];
  vitals: VitalMetric[];
  onAffirmTaken: (id: string) => void;
  onOpenGetStarted: () => void;
  onOpenPreview: () => void;
  onOpenCalendar: () => void;
  streakDays: number;
}

export const HeroSection: React.FC<Props> = ({
  medications,
  vitals,
  onAffirmTaken,
  onOpenGetStarted,
  onOpenPreview,
  onOpenCalendar,
}) => {
  const bpVital = vitals.find((v) => v.category === 'bp') || { value: '118/76' };
  const sugarVital = vitals.find((v) => v.category === 'sugar') || { value: '98' };
  const heartVital = vitals.find((v) => v.category === 'heart') || { value: '72' };

  return (
    <section id="home" className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Ambient Light Glow behind Hero */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-[#6ffbbe]/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Copy & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white text-[#006591] font-bold text-xs mb-6 shadow-sm border border-slate-200/80 tracking-wide uppercase">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0ea5e9] animate-pulse ring-4 ring-sky-100" />
              Patient-Centric Health & Medication Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.12]">
              Manage Medicines.<br />
              <span className="bg-gradient-to-r from-[#006591] via-[#0284c7] to-[#0ea5e9] bg-clip-text text-transparent">
                Track Health.
              </span><br />
              Stay Connected.
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              Medikto empowers patients, seniors, and family caretakers to effortlessly organize daily medications, track vital health readings, store clinical documents, and stay on top of schedules in one unified, reassuring place.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
              <button
                id="hero-get-started-btn"
                onClick={onOpenGetStarted}
                className="inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#006591] text-white font-extrabold text-base shadow-[0_8px_25px_rgba(14,165,233,0.35)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Get Started Free</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <button
                id="hero-preview-btn"
                onClick={onOpenPreview}
                className="inline-flex items-center justify-center gap-2.5 h-14 px-7 rounded-full bg-white text-slate-800 font-bold text-base shadow-sm border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/50 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[24px] text-[#006591]">play_circle</span>
                <span>Watch Interactive Preview</span>
              </button>
            </div>

            {/* Quick Proof Metric Cards */}
            <div className="w-full grid grid-cols-3 gap-3.5 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm">
              <div className="text-center sm:text-left px-2">
                <p className="text-2xl sm:text-3xl font-black text-slate-900">60m</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Flex Window</p>
              </div>
              <div className="text-center sm:text-left px-2 border-x border-slate-200/80">
                <p className="text-2xl sm:text-3xl font-black text-[#0ea5e9]">100%</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Adherence</p>
              </div>
              <div className="text-center sm:text-left px-2">
                <p className="text-2xl sm:text-3xl font-black text-[#006591]">Live</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Family Sync</p>
              </div>
            </div>
          </div>

          {/* Right: Dual Mobile Mockups */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] lg:max-w-none flex justify-center">
              {/* Mobile Mockup 1: Dose Schedule */}
              <div className="relative z-20 w-[290px] sm:w-[320px] rounded-[40px] bg-[#0b1320] p-4 shadow-2xl ring-1 ring-white/10">
                {/* Notch */}
                <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                </div>

                {/* Mobile Header */}
                <div className="flex justify-between items-center mb-4 px-1">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">TODAY'S SCHEDULE</span>
                    <h3 className="text-white font-bold text-sm">Sunday, Sep 7</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-[11px] font-bold border border-emerald-800/50 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span> 100% Adherence
                  </span>
                </div>

                {/* Pill Schedule Card 1 */}
                <div className="bg-slate-900/90 rounded-2xl p-3.5 mb-3 shadow-md border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span> TAKEN 08:05 AM
                    </span>
                    <span className="text-slate-400 text-[11px] font-semibold">08:00 AM</span>
                  </div>
                  <h4 className="text-white text-sm font-bold">Metformin HCl</h4>
                  <p className="text-slate-400 text-[12px] mb-2">500mg • 1 tablet with food</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => playChime('gentle')}
                      className="text-slate-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[13px] text-cyan-400">volume_up</span> Gentle chime
                    </button>
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">done</span>
                    </span>
                  </div>
                </div>

                {/* Pill Schedule Card 2 (Upcoming with interactive Affirm button) */}
                {medications.length > 1 && (
                  <div className="bg-slate-900/90 rounded-2xl p-3.5 mb-3 shadow-md ring-1 ring-cyan-500/30 border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1 ${
                        medications[1].status === 'taken'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-cyan-950 text-cyan-400'
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">
                          {medications[1].status === 'taken' ? 'check_circle' : 'schedule'}
                        </span>
                        {medications[1].status === 'taken' ? 'TAKEN' : 'UPCOMING'}
                      </span>
                      <span className="text-cyan-300 text-[11px] font-bold">{medications[1].scheduledTime}</span>
                    </div>
                    <h4 className="text-white text-sm font-bold">{medications[1].name}</h4>
                    <p className="text-slate-400 text-[12px] mb-2">{medications[1].dosage} • {medications[1].instructions}</p>
                    
                    {medications[1].status === 'taken' ? (
                      <div className="w-full py-1.5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold text-center border border-emerald-800 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">task_alt</span> Confirmed Taken
                      </div>
                    ) : (
                      <button
                        id="affirm-hero-dose"
                        onClick={() => onAffirmTaken(medications[1].id)}
                        className="w-full py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#0b1320] text-xs font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        Affirm Taken
                      </button>
                    )}
                  </div>
                )}

                {/* Pill Schedule Card 3 */}
                <div className="bg-slate-900/40 rounded-2xl p-3 shadow-sm border border-slate-800/60">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[12px] font-medium">Atorvastatin 20mg</span>
                    <span className="text-[11px]">08:00 PM</span>
                  </div>
                </div>

                {/* Monthly calendar button */}
                <button
                  onClick={onOpenCalendar}
                  className="w-full mt-3 py-1.5 text-center text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span> View Full Adherence Log
                </button>
              </div>

              {/* Mobile Mockup 2: Live Vitals */}
              <div className="hidden sm:block absolute -right-6 -bottom-6 z-30 w-[230px] rounded-[36px] bg-[#0d1829] p-3.5 shadow-2xl shadow-black/50 border border-slate-800">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-cyan-400 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    LIVE VITALS
                  </span>
                  <span className="text-slate-400 text-[10px]">Synced 2m ago</span>
                </div>

                {/* Blood Pressure */}
                <div className="bg-slate-900/80 rounded-xl p-2.5 mb-2 flex items-center justify-between border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Blood Pressure</span>
                    <span className="text-white text-base font-extrabold tracking-tight">{bpVital.value}</span>
                    <span className="text-emerald-400 text-[10px] block font-semibold">Optimal • Normal</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">speed</span>
                  </div>
                </div>

                {/* Glucose */}
                <div className="bg-slate-900/80 rounded-xl p-2.5 mb-2 flex items-center justify-between border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Blood Glucose</span>
                    <span className="text-white text-base font-extrabold tracking-tight">
                      {sugarVital.value} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                    </span>
                    <span className="text-cyan-400 text-[10px] block font-semibold">Fasting Target</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-cyan-950/60 text-cyan-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">water_drop</span>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="bg-slate-900/80 rounded-xl p-2.5 flex items-center justify-between border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Resting Pulse</span>
                    <span className="text-white text-base font-extrabold tracking-tight">
                      {heartVital.value} <span className="text-[10px] font-normal text-slate-400">BPM</span>
                    </span>
                    <span className="text-emerald-400 text-[10px] block font-semibold">Steady Rhythm</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">favorite</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
