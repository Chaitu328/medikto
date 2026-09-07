"use client";

import React, { useState } from 'react';
import { playChime } from '../../lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'login';
}

export const GetStartedModal: React.FC<Props> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    playChime('success');
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="get-started-dialog"
        className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c9e6ff] text-[#006591] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">
                {mode === 'signup' ? 'app_registration' : 'lock_open'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {mode === 'signup' ? 'Welcome to Medikto' : 'Sign in to Medikto'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'signup' ? 'Start your 30-day free trial' : 'Access your patient & caretaker portal'}
              </p>
            </div>
          </div>
          <button 
            id="close-get-started"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {mode === 'signup' ? 'Welcome to the Medikto Family!' : 'Authenticated Successfully!'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Loading your clinical schedule and encrypted family portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Switcher */}
            <div className="p-1 rounded-xl bg-slate-100 flex items-center mb-4">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signup' ? 'bg-white text-[#006591] shadow-sm' : 'text-slate-600'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login' ? 'bg-white text-[#006591] shadow-sm' : 'text-slate-600'
                }`}
              >
                Sign In
              </button>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  I am signing up as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      role === 'patient'
                        ? 'border-[#0ea5e9] bg-[#e5eeff] text-[#006591]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">person</span> Patient
                    </span>
                    <span className="text-[11px] opacity-80">Managing my medications</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('caregiver')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      role === 'caregiver'
                        ? 'border-[#0ea5e9] bg-[#e5eeff] text-[#006591]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">diversity_3</span> Caregiver
                    </span>
                    <span className="text-[11px] opacity-80">Caring for parents / family</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Arthur Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="arthur.vance@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 mt-2 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{mode === 'signup' ? 'Create Free Account' : 'Sign In to Portal'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <p className="text-[11px] text-center text-slate-400 pt-2">
              Protected by HIPAA-grade AES-256 cloud encryption. Zero spam.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
