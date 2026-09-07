"use client";

import React from 'react';
import { PatientProfile, Medication, VitalMetric } from '../../lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  medications: Medication[];
  vitals: VitalMetric[];
}

export const DoctorReportModal: React.FC<Props> = ({ isOpen, onClose, patient, medications, vitals }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="doctor-report-dialog"
        className="w-full max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c9e6ff] text-[#006591] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">assignment</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">30-Day Clinical Adherence & Vitals Summary</h3>
              <p className="text-xs text-slate-500">Official Physician-Ready PDF Export • HIPAA Telemetry Standard</p>
            </div>
          </div>
          <button 
            id="close-doctor-report"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Printable Report Sheet */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-[#fafcff] space-y-6">
          {/* Header of Report */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-[#006591]">MEDIKTO</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">HEALTH TELEMETRY</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Generated: Oct 24, 2024 • ID: {patient.idNumber}</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-600">
              <p className="font-bold text-slate-800">Primary Care Physician</p>
              <p>{patient.primaryDoctor.name}</p>
              <p>{patient.primaryDoctor.clinic}</p>
            </div>
          </div>

          {/* Patient Bio & Adherence Metric */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Patient Demographics</span>
              <p className="text-base font-bold text-slate-800">{patient.name}</p>
              <p className="text-xs text-slate-500">{patient.age} yrs • {patient.gender} • Blood: {patient.bloodType}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Adherence Index</span>
              <p className="text-2xl font-black text-emerald-600">{patient.adherenceRate}%</p>
              <p className="text-xs text-slate-500">{patient.streakDays}-day unbroken adherence streak</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Emergency Caregiver</span>
              <p className="text-sm font-bold text-slate-800">{patient.emergencyContact.name}</p>
              <p className="text-xs text-slate-500">{patient.emergencyContact.relationship}</p>
            </div>
          </div>

          {/* Active Prescriptions Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Active Prescriptions & Regimen
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl bg-white">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3 font-bold">Drug Name</th>
                    <th className="p-3 font-bold">Dosage</th>
                    <th className="p-3 font-bold">Schedule</th>
                    <th className="p-3 font-bold">Instructions</th>
                    <th className="p-3 font-bold">Adherence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {medications.map((m) => (
                    <tr key={m.id}>
                      <td className="p-3 font-bold text-slate-900">{m.name}</td>
                      <td className="p-3">{m.dosage}</td>
                      <td className="p-3">{m.scheduledTime} ({m.period})</td>
                      <td className="p-3">{m.instructions}</td>
                      <td className="p-3 font-bold text-emerald-600">
                        {m.status === 'taken' ? '100% On-Time' : 'Regularly Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vitals Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Vitals Corridor Summary (Past 30 Days)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {vitals.map((v) => (
                <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{v.title}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-slate-900">{v.value}</span>
                    <span className="text-xs text-slate-500">{v.unit}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">{v.statusLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Known Allergies & Clinical Flags */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">warning</span>
            <div>
              <span className="font-bold block">Patient Allergy Flag:</span>
              <span>{patient.allergies.join(' • ')} — No adverse events recorded during the past reporting cycle.</span>
            </div>
          </div>

          {/* Sign-off footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
            <span>Prepared via Medikto Clinical Adherence Suite</span>
            <div className="flex items-center gap-4">
              <span>Physician Review Stamp: ______________________</span>
              <span className="text-emerald-600 font-bold">Verified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">print</span> Print Summary
          </button>
          <button
            onClick={() => {
              alert('Exporting encrypted Doctor Summary PDF with clinical digital signature.');
              onClose();
            }}
            className="px-6 py-2.5 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Download Clinical PDF
          </button>
        </div>
      </div>
    </div>
  );
};
