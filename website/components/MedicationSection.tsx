"use client";

import React, { useState } from 'react';
import { Medication } from '../lib/types';

interface Props {
  medications: Medication[];
  onMarkTaken: (id: string) => void;
  onSnooze: (id: string) => void;
  streakDays: number;
}

export const MedicationSection: React.FC<Props> = ({
  medications,
  onMarkTaken,
  onSnooze,
  streakDays,
}) => {
  const [snoozeNotif, setSnoozeNotif] = useState<string | null>(null);

  const handleSnoozeWithNotice = (id: string, name: string) => {
    onSnooze(id);
    setSnoozeNotif(`Snoozed ${name} for 15 minutes.`);
    setTimeout(() => setSnoozeNotif(null), 4000);
  };

  const takenCount = medications.filter((m) => m.status === 'taken').length;
  const totalCount = medications.length;

  return (
    <section className="py-20 bg-[#eff4ff]" id="for-patients">
      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Adherence Intelligence */}
          <div className="lg:col-span-6 flex flex-col">
            <span className="text-xs font-bold text-[#006591] uppercase tracking-wider">
              Zero Daily Overhead
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] mt-2 mb-4">
              Intelligent Pill Scheduling Without Repetitive Setup
            </h2>
            <p className="text-lg text-[#3e4850] mb-8 leading-relaxed">
              Most reminder apps force patients to re-enter their medications day after day. With Medikto, configure your prescription details once — frequency, specific meals, intervals — and the platform handles recurring daily schedules automatically.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#006591] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">update</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0b1c30]">Set Once, Recur Forever</h4>
                  <p className="text-sm text-[#3e4850]">
                    Define morning, afternoon, evening times or precise interval hours. Timetables generate effortlessly each midnight.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#006591] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0b1c30]">Food & Meal Context Warnings</h4>
                  <p className="text-sm text-[#3e4850]">
                    Clear instructions displayed on screen (e.g. "Take 30 mins before breakfast with full glass of water").
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#006591] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0b1c30]">Selfie & Photo Verification</h4>
                  <p className="text-sm text-[#3e4850]">
                    Optional photo upload when taking dose builds undeniable clinical history for doctors and peace of mind for family.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#006591] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">celebration</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0b1c30]">Streak & Encouragement Rewards</h4>
                  <p className="text-sm text-[#3e4850]">
                    Affirming feedback celebrates daily compliance, inspiring positive long-term habits.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#e5eeff] rounded-2xl border-l-4 border-[#006591] mb-6">
              <p className="text-sm text-[#0b1c30] font-semibold italic">
                "Never manually add pills every day — set once, and Medikto handles recurring schedules automatically."
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#006591] text-white font-bold text-xs shadow-sm self-start">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Automated Daily Pill Scheduling Active</span>
            </div>
          </div>

          {/* Right Column: Interactive Dark UI Schedule View */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[460px] bg-[#0c1524] rounded-3xl p-6 md:p-7 text-white shadow-2xl border border-slate-800">
              {/* Top bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-cyan-400 text-[10px] font-bold tracking-wider uppercase">
                    MONDAY TIMETABLE
                  </span>
                  <h3 className="text-xl font-extrabold text-white">Today's Schedule</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-bold border border-cyan-800/60">
                  {takenCount} of {totalCount} Doses Taken
                </span>
              </div>

              {snoozeNotif && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-[16px]">notifications_paused</span>
                  <span>{snoozeNotif}</span>
                </div>
              )}

              {/* Doses Timeline */}
              <div className="space-y-3.5 mt-4">
                {medications.map((m) => {
                  const isTaken = m.status === 'taken';
                  const isSnoozed = m.status === 'snoozed';

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl transition-all border ${
                        isTaken
                          ? 'bg-slate-900/60 border-slate-800'
                          : isSnoozed
                          ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                          : 'bg-slate-900 ring-2 ring-cyan-500/60 shadow-lg shadow-cyan-500/10 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isTaken
                                ? 'bg-emerald-400'
                                : isSnoozed
                                ? 'bg-amber-400'
                                : 'bg-cyan-400 animate-ping'
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-300">
                            {m.scheduledTime} • {m.period.toUpperCase()}
                          </span>
                        </div>

                        {isTaken ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 flex items-center gap-1 border border-emerald-900">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Taken at {m.takenTime || '8:05 AM'}
                          </span>
                        ) : isSnoozed ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 flex items-center gap-1 border border-amber-900">
                            <span className="material-symbols-outlined text-[13px]">snooze</span>
                            Snoozed
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Due Now
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <h4 className="text-base font-bold text-white">{m.name} {m.dosage}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{m.instructions}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                          <span>Refill in {m.refillDaysLeft} days ({m.remainingPills}/{m.totalPills} left)</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {!isTaken ? (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                          <button
                            id={`mark-taken-${m.id}`}
                            onClick={() => onMarkTaken(m.id)}
                            className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                            Mark as Taken
                          </button>
                          <button
                            id={`snooze-${m.id}`}
                            onClick={() => handleSnoozeWithNotice(m.id, m.name)}
                            title="Snooze reminder for 15 minutes"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">snooze</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs text-slate-400">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">done_all</span>
                            Affirmed by Patient
                          </span>
                          <span className="text-slate-500 text-[11px]">Synced to Family</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Adherence Banner */}
              <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">local_fire_department</span>
                  <span className="text-xs font-bold text-slate-200">{streakDays}-Day Perfect Streak</span>
                </div>
                <span className="text-cyan-400 text-xs font-bold">100% On-Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
