"use client";

import React from 'react';
import Image from 'next/image';

interface Props {
  onNavigate?: (sectionId: string) => void;
}

export const CtaSection: React.FC<Props> = ({ onNavigate }) => {
  return (
    <section className="py-24 bg-[#0b1c30] text-[#eaf1ff] relative overflow-hidden" id="get-started">
      {/* Neon cyan gradient aura */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#006591]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-6 max-w-7xl mx-auto relative z-10 text-center">
        {/* Official Medikto Brand Emblem */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl mb-8 p-3 border border-white/20 ring-4 ring-sky-500/20 hover:scale-105 transition-transform duration-300">
          <Image
            src="/images/medikto_icon_trimmed.png"
            alt="Medikto Logo"
            width={56}
            height={56}
            className="w-full h-full object-contain drop-shadow-md"
            priority
          />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
          Take Control of Your Health with Medikto.
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join thousands of families, seniors, and caregivers experiencing effortless medication management, accurate vitals recording, and permanent peace of mind.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            id="cta-contact-team"
            onClick={() => onNavigate && onNavigate('contact')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#006591] hover:from-[#006591] hover:to-[#004c6e] text-white font-extrabold text-base shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>Contact Healthcare Team</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Medikto iOS app will be downloaded from Apple App Store.')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>App Store</span>
            </button>
            <button
              onClick={() => alert('Medikto Android app will be downloaded from Google Play Store.')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Google Play</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          HIPAA Compliant • Encrypted Health Cloud • 24/7 Caregiver Reassurance
        </p>
      </div>
    </section>
  );
};
