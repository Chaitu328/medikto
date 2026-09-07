"use client";

import React, { useState } from 'react';
import { VitalMetric } from '../../lib/types';
import { playChime } from '../../lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddVital: (vital: Partial<VitalMetric>) => void;
}

export const AddVitalModal: React.FC<Props> = ({ isOpen, onClose, onAddVital }) => {
  const [category, setCategory] = useState<'bp' | 'sugar' | 'heart' | 'temp'>('bp');
  const [systolic, setSystolic] = useState('118');
  const [diastolic, setDiastolic] = useState('76');
  const [glucose, setGlucose] = useState('96');
  const [heartRate, setHeartRate] = useState('72');
  const [temp, setTemp] = useState('98.4');
  const [note, setNote] = useState('Resting morning check');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let value = '';
    let unit = '';
    let title = '';
    let statusLabel = 'Optimal • Normal';

    if (category === 'bp') {
      value = `${systolic}/${diastolic}`;
      unit = 'mmHg';
      title = 'Blood Pressure';
      statusLabel = parseInt(systolic) > 130 ? 'Prehypertension Warning' : 'Optimal • Normal';
    } else if (category === 'sugar') {
      value = glucose;
      unit = 'mg/dL';
      title = 'Blood Glucose';
      statusLabel = parseInt(glucose) > 125 ? 'Elevated Glucose' : 'Normal Fasting';
    } else if (category === 'heart') {
      value = heartRate;
      unit = 'BPM';
      title = 'Resting Heart Rate';
      statusLabel = 'Normal Rhythm';
    } else {
      value = temp;
      unit = '°F';
      title = 'Body Temperature';
      statusLabel = 'Afebril';
    }

    onAddVital({
      category,
      title,
      value,
      unit,
      statusLabel,
      note,
      timestamp: 'Just now',
    });

    playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="add-vital-dialog"
        className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">vital_signs</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Log Health Metric</h3>
              <p className="text-xs text-slate-500">Record clinical readings for your health history</p>
            </div>
          </div>
          <button 
            id="close-add-vital-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Vital Parameter
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCategory('bp')}
                className={`py-2 px-1 text-center rounded-xl font-semibold text-xs transition-all flex flex-col items-center gap-1 ${
                  category === 'bp'
                    ? 'bg-[#0ea5e9] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                BP (mmHg)
              </button>
              <button
                type="button"
                onClick={() => setCategory('sugar')}
                className={`py-2 px-1 text-center rounded-xl font-semibold text-xs transition-all flex flex-col items-center gap-1 ${
                  category === 'sugar'
                    ? 'bg-[#0ea5e9] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">water_drop</span>
                Sugar
              </button>
              <button
                type="button"
                onClick={() => setCategory('heart')}
                className={`py-2 px-1 text-center rounded-xl font-semibold text-xs transition-all flex flex-col items-center gap-1 ${
                  category === 'heart'
                    ? 'bg-[#0ea5e9] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
                Pulse
              </button>
              <button
                type="button"
                onClick={() => setCategory('temp')}
                className={`py-2 px-1 text-center rounded-xl font-semibold text-xs transition-all flex flex-col items-center gap-1 ${
                  category === 'temp'
                    ? 'bg-[#0ea5e9] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">thermostat</span>
                Temp
              </button>
            </div>
          </div>

          {category === 'bp' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Systolic (Upper)
                </label>
                <input
                  id="systolic-input"
                  type="number"
                  required
                  min="70"
                  max="220"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Optimal: &lt; 120 mmHg</span>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Diastolic (Lower)
                </label>
                <input
                  id="diastolic-input"
                  type="number"
                  required
                  min="40"
                  max="140"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Optimal: &lt; 80 mmHg</span>
              </div>
            </div>
          )}

          {category === 'sugar' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Blood Glucose (mg/dL)
              </label>
              <input
                id="glucose-input"
                type="number"
                required
                min="40"
                max="400"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Fasting target: 70 - 99 mg/dL</span>
            </div>
          )}

          {category === 'heart' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Heart Rate (BPM)
              </label>
              <input
                id="heart-rate-input"
                type="number"
                required
                min="40"
                max="180"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Normal resting: 60 - 100 BPM</span>
            </div>
          )}

          {category === 'temp' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Body Temperature (°F)
              </label>
              <input
                id="temp-input"
                type="number"
                step="0.1"
                required
                min="95"
                max="106"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Normal range: 97.8 - 99.1 °F</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Context / Notes
            </label>
            <input
              id="vital-note-input"
              type="text"
              placeholder="e.g. Fasting morning reading, after 10 min rest"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
            />
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
              id="submit-add-vital"
              type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">done</span>
              Save Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
