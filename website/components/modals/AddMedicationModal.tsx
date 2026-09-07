"use client";

import React, { useState } from 'react';
import { Medication } from '../../lib/types';
import { playChime } from '../../lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (med: Medication) => void;
}

export const AddMedicationModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('1 Tablet • With Breakfast');
  const [period, setPeriod] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [totalPills, setTotalPills] = useState('30');
  const [audioReminder, setAudioReminder] = useState('Gentle morning chime');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    const count = parseInt(totalPills) || 30;
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name,
      dosage,
      instructions,
      period,
      scheduledTime,
      status: 'upcoming',
      totalPills: count,
      remainingPills: count,
      refillDaysLeft: Math.round(count / 1),
      color: 'bg-cyan-500',
      audioReminder,
    };

    onAdd(newMed);
    playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="add-medication-dialog"
        className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c9e6ff] text-[#006591] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">medication</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Add New Prescription</h3>
              <p className="text-xs text-slate-500">Configure once • Auto-recurs daily with gentle alerts</p>
            </div>
          </div>
          <button 
            id="close-add-med-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Medication Name *
            </label>
            <input
              id="med-name-input"
              type="text"
              required
              placeholder="e.g. Metformin, Lisinopril, Omega-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-base text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Dosage & Strength *
              </label>
              <input
                id="med-dosage-input"
                type="text"
                required
                placeholder="e.g. 500mg, 10mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-base text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Initial Bottle Count
              </label>
              <input
                id="med-count-input"
                type="number"
                min="1"
                max="360"
                value={totalPills}
                onChange={(e) => setTotalPills(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-base text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Time Interval
              </label>
              <select
                id="med-period-select"
                value={period}
                onChange={(e) => {
                  const val = e.target.value as 'Morning' | 'Afternoon' | 'Evening' | 'Night';
                  setPeriod(val);
                  if (val === 'Morning') setScheduledTime('08:00 AM');
                  else if (val === 'Afternoon') setScheduledTime('01:00 PM');
                  else if (val === 'Evening') setScheduledTime('06:30 PM');
                  else setScheduledTime('08:30 PM');
                }}
                className="w-full h-12 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm text-slate-900 bg-white"
              >
                <option value="Morning">Morning (8:00 AM)</option>
                <option value="Afternoon">Afternoon (1:00 PM)</option>
                <option value="Evening">Evening (6:30 PM)</option>
                <option value="Night">Bedtime (8:30 PM)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Scheduled Time
              </label>
              <input
                id="med-time-input"
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-base text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Specific Instructions / Meal Timing
            </label>
            <input
              id="med-instructions-input"
              type="text"
              placeholder="e.g. 1 Tablet • With food and full glass of water"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm text-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Audio Reminder Sound
              </label>
              <button
                type="button"
                onClick={() => playChime('gentle')}
                className="text-xs text-[#0ea5e9] font-bold flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">play_circle</span> Preview Audio Chime
              </button>
            </div>
            <select
              id="med-sound-select"
              value={audioReminder}
              onChange={(e) => setAudioReminder(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm text-slate-900 bg-white"
            >
              <option value="Gentle morning chime">Gentle morning chime (High-audibility sine)</option>
              <option value="Voice announcement: Time for Metformin">Spoken voice prompt ("Time for medication")</option>
              <option value="Soft evening harp">Soft evening harp</option>
              <option value="Audible double chime">Audible double chime (Senior-friendly frequency)</option>
            </select>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
            <span className="material-symbols-outlined text-[#006591] text-[18px] shrink-0 mt-0.5">verified</span>
            <span>Caregiver Fallback Sync: Sarah Kendrick will be notified automatically if this dose remains untaken 45 minutes past schedule.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-add-med"
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
