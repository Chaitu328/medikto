"use client";

import React from 'react';

export const SeniorsPillars: React.FC = () => {
  const pillars = [
    {
      title: 'Senior-Friendly High Contrast',
      desc: 'High-contrast typography (18px+ base), crisp readable borders, and zero confusing nested menus by default.',
      badge: 'Active by Default',
    },
    {
      title: 'Zero Everyday Hassle',
      desc: 'Set pill frequency once. Medikto handles recurring schedules without manual daily re-entry.',
    },
    {
      title: 'Unified Health Timeline',
      desc: 'Doctor appointments, pill intake confirmations, and daily vitals in one clean chronological stream.',
    },
    {
      title: 'Fail-Safe Audio Reminders',
      desc: 'Distinct audible chimes, verbal medicine names, and automated phone backup alerts when needed.',
    },
    {
      title: 'Clinical Security & Privacy',
      desc: 'HIPAA-compliant encrypted cloud infrastructure. Your personal medical telemetry is never shared.',
    },
    {
      title: 'Multi-Patient Family Care',
      desc: 'Manage both Mom and Dad on a single dashboard, switching profiles in a single seamless tap.',
    },
  ];

  return (
    <section className="py-20 bg-[#eff4ff]" id="about">
      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#006591] uppercase tracking-wider">
            Engineered With Compassion
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] mt-2 mb-3">
            Built for Seniors. Loved by Families.
          </h2>
          <p className="text-base text-[#3e4850] leading-relaxed">
            Every screen, color contrast ratio, and font scale has been validated with elderly users to guarantee supreme independence and ease of use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex items-start gap-4"
            >
              <span
                className="material-symbols-outlined text-[#006591] text-[28px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                check_circle
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#0b1c30]">{p.title}</h3>
                  {p.badge && (
                    <span className="text-[10px] font-bold bg-[#e0f2fe] text-[#006591] px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#3e4850] leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

