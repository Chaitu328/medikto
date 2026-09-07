"use client";

import React from 'react';

interface Props {
  onOpenPreview?: () => void;
}

export const HowItWorks: React.FC<Props> = ({
  onOpenPreview,
}) => {
  const steps = [
    {
      num: '01',
      title: 'Create Your Profile',
      desc: 'Set up basic health info, emergency contacts, and linked family members in under 2 minutes with high-contrast text and guided audio prompts.',
      icon: 'account_circle',
      badge: 'Quick 2-Min Setup',
    },
    {
      num: '02',
      title: 'Add Medications',
      desc: 'Input prescriptions, dosage frequencies, and smart audio-visual alarms once. Medikto eliminates manual daily entries forever.',
      icon: 'medication',
      badge: 'Automated Recurrence',
    },
    {
      num: '03',
      title: 'Track Health & Records',
      desc: 'Quickly log blood pressure, glucose, and pulse. Snap quick camera scans to store doctor notes and lab reports securely in one vault.',
      icon: 'vital_signs',
      badge: 'Unified Locker & Vitals',
    },
    {
      num: '04',
      title: 'Stay Connected',
      desc: 'Caregivers receive instant dose affirmations and missed-intake fallback alerts, ensuring multi-generational reassurance anywhere in the world.',
      icon: 'supervised_user_circle',
      badge: 'Real-Time Family Sync',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white via-sky-50/40 to-white" id="how-it-works">
      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#006591] font-bold text-xs shadow-sm border border-slate-200/80 mb-4 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" />
            Streamlined Journey
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.18] mb-4">
            Simple & Effortless by Design
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Designed with utmost care so parents, grandparents, and caregivers can navigate daily health routines with zero cognitive friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col justify-between bg-white p-7 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.1)] transition-all duration-300 border border-slate-200/80 hover:border-sky-300 hover:-translate-y-1.5 group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-black text-slate-200 group-hover:text-sky-400/60 transition-colors">
                    {step.num}
                  </span>
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100/80 border border-sky-200/60 flex items-center justify-center text-[#006591] group-hover:scale-110 transition-transform p-3">
                    <span className="material-symbols-outlined text-[26px]">{step.icon}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#006591] transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-extrabold text-[#006591]">
                <span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span>
                <span>{step.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
