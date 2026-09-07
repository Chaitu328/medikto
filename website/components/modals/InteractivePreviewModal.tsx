"use client";

import React, { useState } from 'react';
import { playChime } from '../../lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractivePreviewModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Automated Daily Timetable',
      desc: 'Medikto generates your daily morning, afternoon, and evening medication schedule automatically at midnight. Never enter repetitive daily routines.',
      icon: 'schedule',
      badge: 'Zero Overhead',
    },
    {
      step: '02',
      title: 'High-Audibility Senior Chime',
      desc: 'When it is time for Lisinopril or Metformin, a gentle acoustic chime rings through your phone speaker, paired with large-button lockscreen alerts.',
      icon: 'volume_up',
      badge: 'Auditory Assist',
      actionSound: 'gentle' as const,
    },
    {
      step: '03',
      title: 'One-Tap Adherence Confirmation',
      desc: 'Tap "Affirm Taken" once. The pill container inventory deducts one count, your adherence streak updates, and positive feedback celebrates your habit.',
      icon: 'task_alt',
      badge: 'Positive Habit',
      actionSound: 'success' as const,
    },
    {
      step: '04',
      title: 'Real-Time Caregiver Reassurance',
      desc: 'Three states away, Sarah gets an instant silent confirmation: "Arthur took morning medication at 8:05 AM". Fail-safe phone alerts activate only if a dose is overdue.',
      icon: 'diversity_3',
      badge: 'Cross-Generational',
    },
  ];

  const current = steps[activeStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="preview-dialog"
        className="w-full max-w-xl rounded-3xl bg-[#0c1524] text-white p-6 md:p-8 shadow-2xl border border-slate-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 text-cyan-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">smart_display</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Interactive Experience Tour</h3>
              <p className="text-xs text-slate-400">See how Medikto removes stress for seniors & families</p>
            </div>
          </div>
          <button 
            id="close-preview-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Step progress pills */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveStep(i);
                if (s.actionSound) playChime(s.actionSound);
              }}
              className={`h-2 rounded-full transition-all ${
                i === activeStep ? 'bg-cyan-400' : i < activeStep ? 'bg-cyan-800' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Interactive Step Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300">
              {current.badge}
            </span>
            <span className="text-xs font-bold text-slate-500">Step {activeStep + 1} of 4</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">{current.icon}</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">{current.title}</h4>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">{current.desc}</p>
            </div>
          </div>

          {current.actionSound && (
            <div className="pt-2">
              <button
                onClick={() => playChime(current.actionSound)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span> Play Sound Demo
              </button>
            </div>
          )}
        </div>

        {/* Next / Prev Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => {
                  const next = activeStep + 1;
                  setActiveStep(next);
                  if (steps[next].actionSound) playChime(steps[next].actionSound);
                }}
                className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                Next Feature <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors"
              >
                Got It, Let's Begin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
