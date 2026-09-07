'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Props {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<Props> = ({
  activeSection,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'For Patients', id: 'for-patients' },
    { label: 'For Caretakers', id: 'for-caretakers' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.04)] border-b border-slate-200/70 transition-all">
      <div className="h-20 w-full px-6 max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Official Medikto Brand Logo */}
        <div className="flex items-center">
          <a
            id="brand-logo"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="flex items-center gap-2.5 group cursor-pointer select-none"
          >
            {/* Official Brand Icon Emblem */}
            <div className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/medikto_icon_trimmed.png"
                alt="Medikto Icon"
                width={36}
                height={36}
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                priority
              />
            </div>

            {/* Official Brand Wordmark */}
            <div className="flex items-center shrink-0">
              <Image
                src="/images/medikto_title_trimmed.png"
                alt="Medikto"
                width={130}
                height={24}
                className="h-5 sm:h-6 w-auto object-contain"
                priority
              />
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links with Smooth Animated Underline */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8" id="desktop-nav">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className="relative py-2.5 text-sm font-bold tracking-tight transition-colors duration-200 group cursor-pointer"
              >
                <span
                  className={`transition-colors duration-200 ${isActive
                    ? 'text-[#006591] font-extrabold'
                    : 'text-slate-600 group-hover:text-[#006591]'
                    }`}
                >
                  {item.label}
                </span>

                {/* Smooth Animated Color Underline on Hover */}
                <span
                  className={`absolute bottom-0 left-0 h-[2.5px] rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#006591] transition-all duration-300 ease-out ${isActive
                    ? 'w-full opacity-100 scale-x-100'
                    : 'w-full opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                    }`}
                  style={{ transformOrigin: 'left center' }}
                />
              </a>
            );
          })}
        </nav>

        {/* Action Controls: Direct Contact CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('contact')}
            className="hidden sm:inline-flex items-center justify-center h-10 px-5 rounded-full bg-sky-50 hover:bg-sky-100 text-[#006591] font-bold text-xs tracking-wide border border-sky-200/80 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            Get In Touch
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-2 shadow-xl animate-fadeIn">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-bold text-slate-700 hover:text-[#006591] py-2.5 border-b border-slate-100 flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
              </a>
            ))}
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-full bg-[#006591] text-white text-xs font-bold shadow text-center"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
