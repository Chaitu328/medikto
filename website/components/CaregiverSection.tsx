"use client";

import React, { useState } from 'react';
import { CaregiverAlert } from '../lib/types';

interface Props {
  alerts: CaregiverAlert[];
  onAddAlert: (alert: CaregiverAlert) => void;
  onOpenProfile: () => void;
}

export const CaregiverSection: React.FC<Props> = ({ alerts, onAddAlert, onOpenProfile }) => {
  const [testSent, setTestSent] = useState(false);

  const handleTestAlert = () => {
    const newAlert: CaregiverAlert = {
      id: `alert-${Date.now()}`,
      title: 'Dose Logged: Afternoon Metformin marked as taken',
      description: 'Timestamped selfie proof uploaded & verified on today\'s schedule feed.',
      type: 'dose_taken',
      timestamp: 'Just now',
      status: 'confirmed',
    };
    onAddAlert(newAlert);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <section className="py-20" id="for-caretakers">
      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#213145] via-[#132238] to-[#0a1424] rounded-3xl p-8 lg:p-14 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          {/* Ambient Decorative Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#0ea5e9]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left */}
            <div className="lg:col-span-6 flex flex-col">
              <span className="text-cyan-400 text-xs font-bold tracking-wider uppercase">
                CROSS-GENERATIONAL CARING
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
                Giving Caretakers Peace of Mind with Live Read-Only Access
              </h2>
              <p className="text-base sm:text-lg text-slate-300 mb-6 leading-relaxed">
                Managing a parent's healthcare shouldn't feel like a constant state of worry. Caregivers log in with dedicated credentials to monitor today's dose timeline, view confirmed doses with timestamped selfie proofs, and check logged vitals in real time.
              </p>

              {/* Testimonial Quote */}
              <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md mb-6 border border-white/10">
                <p className="text-sm text-slate-200 italic mb-3 leading-relaxed">
                  "Living three states away from my 74-year-old father used to mean calling three times a day to ask if he took his heart medicine. Medikto gave our whole family collective breathing room."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    SK
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-tight">Sarah Kendrick</span>
                    <span className="text-xs text-slate-400">Daughter & Primary Caregiver, Chicago</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="test-caregiver-alert-btn"
                  onClick={handleTestAlert}
                  className="px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">sms</span>
                  <span>{testSent ? 'Notification Triggered!' : 'Test Live Caregiver Alert'}</span>
                </button>
                <button
                  onClick={onOpenProfile}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                >
                  Manage Caregiver Access
                </button>
              </div>
            </div>

            {/* Right: Caregiver Dashboard Notification Simulation */}
            <div className="lg:col-span-6 flex flex-col gap-3.5">
              <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
                <span className="font-bold text-cyan-400 uppercase tracking-wider">Live Family Feed</span>
                <span>Real-time SMS & Push Engine</span>
              </div>

              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex items-center justify-between gap-3 animate-fadeIn"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      alert.type === 'dose_taken'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : alert.type === 'vital_logged'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {alert.type === 'dose_taken'
                          ? 'task_alt'
                          : alert.type === 'vital_logged'
                          ? 'monitor_heart'
                          : 'phone_in_talk'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-white font-bold block leading-snug">
                        {alert.title}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {alert.description}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                    alert.status === 'confirmed'
                      ? 'text-emerald-400 bg-emerald-950 border border-emerald-800'
                      : alert.status === 'normal'
                      ? 'text-cyan-400 bg-cyan-950 border border-cyan-800'
                      : 'text-amber-400 bg-amber-950 border border-amber-800'
                  }`}>
                    {alert.status === 'confirmed' ? 'CONFIRMED' : alert.status === 'normal' ? 'NORMAL' : 'FAIL-SAFE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
