"use client";

import React from 'react';
import Image from 'next/image';

interface Props {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#eff4ff] border-t border-slate-200/80">
      <div className="w-full px-6 max-w-7xl mx-auto pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12">
          {/* Brand Col */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center shrink-0">
                <Image
                  src="/images/medikto_icon_trimmed.png"
                  alt="Medikto Icon"
                  width={36}
                  height={36}
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                />
              </div>
              <div className="flex items-center shrink-0">
                <Image
                  src="/images/medikto_title_trimmed.png"
                  alt="Medikto"
                  width={130}
                  height={24}
                  className="h-5 sm:h-6 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-sm text-[#3e4850] max-w-sm leading-relaxed">
              Empowering patients, families, and caregivers with clinical-grade medication adherence, seamless cross-generational coordination, and peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2">
              <button
                onClick={() => alert('Opening Medikto on Apple App Store')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#213145] text-white hover:bg-[#0b1c30] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">file_download</span>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 leading-none">
                    DOWNLOAD ON
                  </span>
                  <span className="text-xs font-bold leading-tight">App Store</span>
                </div>
              </button>

              <button
                onClick={() => alert('Opening Medikto on Google Play')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#213145] text-white hover:bg-[#0b1c30] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">play_arrow</span>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 leading-none">
                    GET IT ON
                  </span>
                  <span className="text-xs font-bold leading-tight">Google Play</span>
                </div>
              </button>
            </div>
          </div>

          {/* Links 4-cols */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Col 1: Product */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[#006591] uppercase tracking-wider">
                Product
              </span>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('features');
                }}
                className="text-xs text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('how-it-works');
                }}
                className="text-xs text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                How It Works
              </a>
              <a
                href="#for-patients"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('for-patients');
                }}
                className="text-xs text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Pill Tracker
              </a>
              <a
                href="#vitals"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('vitals');
                }}
                className="text-xs text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Health Analytics
              </a>
            </div>

            {/* Col 2: Audience */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[#006591] uppercase tracking-wider">
                Audience
              </span>
              <a
                href="#for-patients"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('for-patients');
                }}
                className="text-xs text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                For Patients
              </a>
              <a
                href="#for-caretakers"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('for-caretakers');
                }}
                className="text-xs text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                For Families
              </a>
              <button
                onClick={() => onNavigate('contact')}
                className="text-xs text-left text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Care Teams
              </button>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('about');
                }}
                className="text-xs text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Senior Health
              </a>
            </div>

            {/* Col 3: Support */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[#006591] uppercase tracking-wider">
                Support
              </span>
              <button
                onClick={() => alert('Medikto Help Center: Support team available 24/7 at support@medikto.health')}
                className="text-xs text-left text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Help Center
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="text-xs text-left text-[#3e4850] hover:text-[#0b1c30] font-bold text-[#006591] transition-colors"
              >
                Contact Us
              </button>
              <button
                onClick={() => alert('Clinical Safety Guidelines conform to FDA and AMA adherence frameworks.')}
                className="text-xs text-left text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Safety Guidelines
              </button>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('how-it-works');
                }}
                className="text-xs text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Adherence FAQ
              </a>
            </div>

            {/* Col 4: Legal */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[#006591] uppercase tracking-wider">
                Legal
              </span>
              <button
                onClick={() => alert('Medikto complies with HIPAA, GDPR, and California CCPA regulations.')}
                className="text-xs text-left text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => alert('Terms of Service: Authorized for personal medical organization.')}
                className="text-xs text-left text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => alert('HIPAA Notice: End-to-end encrypted medical telemetry with zero third-party sales.')}
                className="text-xs text-left text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                HIPAA Notice
              </button>
              <button
                onClick={() => alert('Cookie Policy: Only strictly necessary security tokens used.')}
                className="text-xs text-left text-[#3e4850] hover:text-[#0b1c30] transition-colors"
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#e5eeff]/60 p-4 rounded-2xl border border-blue-100">
          <p className="text-xs text-[#3e4850] text-center md:text-left">
            © 2026 Medikto Health Technologies Inc. All clinical and pharmacological rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#006c49] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              HIPAA & SOC2 Type II Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
