"use client";

import React from 'react';

export const HospitalSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Search Patient Phone Number',
      desc: 'Hospital staff search for the patient using their registered +91 phone number in the Medikto Admin Panel.',
      icon: 'manage_search',
    },
    {
      step: '02',
      title: 'Instant 5-Minute OTP Request',
      desc: 'System sends a secure push notification with a 5-minute OTP directly to the patient\'s mobile app.',
      icon: 'pin',
    },
    {
      step: '03',
      title: 'Verify & Link Patient',
      desc: 'Patient shares the 5-minute OTP with hospital staff. Once verified, patient is securely linked to the hospital.',
      icon: 'verified_user',
    },
    {
      step: '04',
      title: 'Remote Adherence Monitoring',
      desc: 'Hospital admins track dose adherence rates, review timestamped selfie proofs, and view patient health vitals.',
      icon: 'monitoring',
    },
  ];

  return (
    <section id="for-hospitals" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#006591]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-6 max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-[#0ea5e9] font-bold text-xs shadow-sm border border-slate-700 mb-4 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" />
            Hospital & Clinic Portal
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.18] mb-5">
            Connected Care for{' '}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent">
              Hospitals & Clinics
            </span>
          </h2>

          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Empower hospital teams, supervisors, and clinical staff to remotely monitor patient medication adherence, verify selfie proofs, and access vital records through <code className="text-sky-300 font-mono text-sm bg-slate-800 px-2 py-0.5 rounded">admin.medikto.com</code>.
          </p>
        </div>

        {/* 4-Step Linking Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 hover:border-sky-500/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
                  </div>
                  <span className="text-2xl font-black text-slate-600 font-mono">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Portal Banner CTA */}
        <div className="bg-gradient-to-r from-slate-800 via-sky-950/60 to-slate-800 rounded-3xl p-8 sm:p-10 border border-sky-900/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">Are you a Hospital Administrator?</h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Access the Medikto Admin Panel to manage patient connections, review daily dose schedules, and verify timestamped selfie proofs.
            </p>
          </div>

          <a
            href="https://admin.medikto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#006591] text-white font-extrabold text-sm shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <span>Launch Hospital Portal</span>
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </a>
        </div>
      </div>
    </section>
  );
};
