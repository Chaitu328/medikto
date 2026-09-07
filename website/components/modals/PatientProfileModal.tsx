"use client";

import React from 'react';
import { PatientProfile } from '../../lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  currentRole: 'patient' | 'caregiver';
  onSwitchRole: (role: 'patient' | 'caregiver') => void;
}

export const PatientProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patient,
  currentRole,
  onSwitchRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="patient-profile-dialog"
        className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#006591] text-white flex items-center justify-center font-bold text-lg shadow-md">
              AV
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{patient.name}</h3>
              <p className="text-xs text-slate-500">Age: {patient.age} • Patient ID: {patient.idNumber}</p>
            </div>
          </div>
          <button 
            id="close-patient-profile"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Role Switcher Pill */}
        <div className="mb-6 p-1.5 rounded-2xl bg-slate-100 flex items-center">
          <button
            onClick={() => onSwitchRole('patient')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              currentRole === 'patient'
                ? 'bg-white text-[#006591] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            Patient Mode (Arthur)
          </button>
          <button
            onClick={() => onSwitchRole('caregiver')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              currentRole === 'caregiver'
                ? 'bg-white text-[#006591] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">diversity_3</span>
            Caregiver Mode (Sarah)
          </button>
        </div>



        {/* Profile Details List */}
        <div className="space-y-4 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Primary Care Physician
            </span>
            <p className="font-bold text-slate-800">{patient.primaryDoctor.name}</p>
            <p className="text-xs text-slate-500">{patient.primaryDoctor.specialty} • {patient.primaryDoctor.clinic}</p>
            <p className="text-xs text-[#0ea5e9] font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">phone</span> {patient.primaryDoctor.phone}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Designated Emergency Caregiver
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{patient.emergencyContact.name}</p>
                <p className="text-xs text-slate-500">{patient.emergencyContact.relationship}</p>
                <p className="text-xs text-[#0ea5e9] font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">phone</span> {patient.emergencyContact.phone}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                Synced Active
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Recorded Allergies
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.allergies.map((a, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Diagnosed Conditions
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.conditions.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-800 text-xs font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
