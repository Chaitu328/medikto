"use client";

import React from 'react';

interface Props {
  onOpenDoctorReport: () => void;
  onOpenPreview: () => void;
}

export const FeaturesGrid: React.FC<Props> = ({
  onOpenDoctorReport,
  onOpenPreview,
}) => {
  const features = [
    {
      id: 'feat-1',
      title: 'Daily Medication Timeline',
      badge: 'Smart Reminders',
      desc: 'Set up custom dose schedules with meal relation (before/after food) and timing slots (morning, afternoon, evening, night).',
      icon: 'medication',
      gradient: 'from-[#0ea5e9] to-[#006591]',
      badgeColor: 'bg-sky-50 text-[#006591] border-sky-200/80',
      action: onOpenPreview,
      actionText: 'View Timeline Flow',
      metricPill: 'Meal-Timed Schedule',
    },
    {
      id: 'feat-2',
      title: 'Selfie Dose Verification',
      badge: 'Photo Proof',
      desc: 'Take a quick selfie proof when confirming doses. Features timestamp watermarking for hospital & family assurance.',
      icon: 'photo_camera',
      gradient: 'from-[#06b6d4] to-[#0891b2]',
      badgeColor: 'bg-cyan-50 text-[#0891b2] border-cyan-200/80',
      action: onOpenPreview,
      actionText: 'See Verification Flow',
      metricPill: 'Timestamped Proof',
    },
    {
      id: 'feat-3',
      title: 'Vital Health Logging',
      badge: 'Vitals Suite',
      desc: 'Record Blood Pressure, Blood Sugar, Heart Rate, and Temperature to monitor personal health progress over time.',
      icon: 'ecg_heart',
      gradient: 'from-[#10b981] to-[#059669]',
      badgeColor: 'bg-emerald-50 text-[#059669] border-emerald-200/80',
      action: onOpenPreview,
      actionText: 'Explore Vitals Suite',
      metricPill: '4 Vital Metrics',
    },
    {
      id: 'feat-4',
      title: 'Prescription & Report Vault',
      badge: 'Medical Storage',
      desc: 'Upload doctor prescriptions and medical lab reports (blood tests, scans) safely in your personal health locker.',
      icon: 'folder_managed',
      gradient: 'from-[#3b82f6] to-[#1d4ed8]',
      badgeColor: 'bg-blue-50 text-[#1d4ed8] border-blue-200/80',
      action: onOpenPreview,
      actionText: 'View Locker Storage',
      metricPill: 'Organized Storage',
    },
    {
      id: 'feat-5',
      title: 'Hospital Admin Linking',
      badge: '5-Min OTP Link',
      desc: 'Hospitals search patient phone numbers and send a 5-minute OTP to securely link patient records to the hospital portal.',
      icon: 'local_hospital',
      gradient: 'from-[#8b5cf6] to-[#6d28d9]',
      badgeColor: 'bg-purple-50 text-[#6d28d9] border-purple-200/80',
      action: onOpenPreview,
      actionText: 'How Linking Works',
      metricPill: 'Secure Hospital OTP',
    },
    {
      id: 'feat-6',
      title: 'Caretaker Live Monitoring',
      badge: 'Read-Only View',
      desc: 'Family guardians log in with email to remotely view live dose schedule adherence, taken status, and vital readings.',
      icon: 'diversity_3',
      gradient: 'from-[#64748b] to-[#334155]',
      badgeColor: 'bg-slate-100 text-[#334155] border-slate-300',
      action: onOpenDoctorReport,
      actionText: 'Caregiver Portal Info',
      metricPill: 'Read-Only Access',
    },
  ];

  return (
    <section className="py-24 relative bg-gradient-to-b from-[#f8f9ff] via-[#f0f4ff] to-[#f8f9ff]" id="features">
      {/* Soft Background Accent Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full px-6 max-w-7xl mx-auto">
        {/* Centered, Visually Balanced Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#006591] font-bold text-xs shadow-sm border border-slate-200/80 mb-4 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" />
            Core Platform Capabilities
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.18] mb-5">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-[#006591] via-[#0284c7] to-[#0ea5e9] bg-clip-text text-transparent">
              Complete Peace of Mind
            </span>
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Built according to clinical medication adherence standards while preserving warmth, tactile simplicity, and accessible clarity.
          </p>
        </div>

        {/* 6-Card High-Contrast Premium Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(14,165,233,0.12)] border border-slate-200/80 hover:border-sky-300 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon + Badge */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-[28px]">{f.icon}</span>
                  </div>

                  <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-extrabold tracking-wide uppercase ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#006591] transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {f.desc}
                </p>
              </div>

              {/* Card Footer: Micro-tag & Showcase Action */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-lg">
                  {f.metricPill}
                </span>

                <button
                  onClick={f.action}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#006591] group-hover:text-[#0ea5e9] transition-colors"
                >
                  <span>{f.actionText}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
