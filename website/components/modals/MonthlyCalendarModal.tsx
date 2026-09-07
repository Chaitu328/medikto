"use client";

import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
}

export const MonthlyCalendarModal: React.FC<Props> = ({ isOpen, onClose, streakDays }) => {
  if (!isOpen) return null;

  // Generate 31 days for October
  const days = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    // Current day is 24
    let status: 'perfect' | 'partial' | 'today' | 'upcoming' = 'perfect';
    if (dayNum < 24) {
      status = dayNum === 11 ? 'partial' : 'perfect';
    } else if (dayNum === 24) {
      status = 'today';
    } else {
      status = 'upcoming';
    }
    return { day: dayNum, status };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="calendar-dialog"
        className="w-full max-w-lg rounded-3xl bg-[#0b1320] text-white p-6 md:p-8 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 text-cyan-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Monthly Adherence Log</h3>
              <p className="text-xs text-slate-400">October 2024 • 98.4% On-Time Record</p>
            </div>
          </div>
          <button 
            id="close-calendar"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Streak highlight */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/20 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-[28px]">local_fire_department</span>
            <div>
              <span className="text-xs font-bold text-cyan-300 uppercase block">Active Adherence Streak</span>
              <p className="text-base font-extrabold text-white">{streakDays} Consecutive Days Without A Missed Dose</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold">
            Gold Tier
          </span>
        </div>

        {/* Days Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          {/* Offset for October starts on Tuesday (2 blanks) */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            <span className="p-2 opacity-10">29</span>
            <span className="p-2 opacity-10">30</span>
            {days.map(({ day, status }) => {
              let bg = 'bg-slate-900/60 text-slate-300';
              let dot = '';
              if (status === 'perfect') {
                bg = 'bg-slate-900 border border-emerald-500/40 text-emerald-300';
                dot = 'bg-emerald-400';
              } else if (status === 'partial') {
                bg = 'bg-slate-900 border border-amber-500/40 text-amber-300';
                dot = 'bg-amber-400';
              } else if (status === 'today') {
                bg = 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30 ring-2 ring-white';
                dot = 'bg-slate-950';
              } else {
                bg = 'bg-slate-900/30 text-slate-500';
              }

              return (
                <div key={day} className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 min-h-[44px] ${bg}`}>
                  <span className="font-bold">{day}</span>
                  {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/60 text-xs text-slate-400 border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>All Doses Taken (100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Delayed (1 Doses)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Today (Active)</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
