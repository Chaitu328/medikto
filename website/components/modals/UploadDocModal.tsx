"use client";

import React, { useState } from 'react';
import { ClinicalDocument } from '../../lib/types';
import { playChime } from '../../lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: ClinicalDocument) => void;
}

export const UploadDocModal: React.FC<Props> = ({ isOpen, onClose, onAddDocument }) => {
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'PDF' | 'LAB' | 'RX' | 'SCAN'>('RX');
  const [doctorOrLab, setDoctorOrLab] = useState('Dr. Aris Thorne • Cardiology');
  const [summary, setSummary] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  if (!isOpen) return null;

  const simulateCameraScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      setDocTitle('Metformin & Lisinopril Refill Order');
      setDocType('RX');
      setDoctorOrLab('Dr. Aris Thorne • Medical Center');
      setSummary('OCR Extracted: Rx #948201. Dispense 90 tablets of Metformin 500mg, 1 tablet twice daily with meals. 3 refills remaining.');
      playChime('success');
    }, 1500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    const newDoc: ClinicalDocument = {
      id: `doc-${Date.now()}`,
      title: docTitle,
      type: docType,
      doctorOrLab: doctorOrLab || 'Uploaded by Patient',
      date: 'Today, Oct 24, 2024',
      size: '1.2 MB',
      summary: summary || 'Scanned clinical document stored in patient vault.',
      tags: [docType, 'Encrypted', 'OCR Scanned'],
    };

    onAddDocument(newDoc);
    playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="upload-doc-dialog"
        className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c9e6ff] text-[#006591] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">document_scanner</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Scan or Upload Medical Document</h3>
              <p className="text-xs text-slate-500">Auto-crop & OCR detection for prescriptions & labs</p>
            </div>
          </div>
          <button 
            id="close-upload-doc"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Camera simulation zone */}
        <div className="mb-6">
          <div 
            onClick={simulateCameraScan}
            className="border-2 border-dashed border-slate-300 hover:border-[#0ea5e9] bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
          >
            {isScanning ? (
              <div className="py-4 flex flex-col items-center gap-3">
                <span className="w-8 h-8 border-3 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></span>
                <span className="text-sm font-bold text-[#006591]">Detecting Prescription Borders & OCR...</span>
              </div>
            ) : scanComplete ? (
              <div className="py-2 flex flex-col items-center gap-2 text-emerald-700">
                <span className="material-symbols-outlined text-[36px] text-emerald-600">check_circle</span>
                <span className="text-sm font-bold">Document Successfully Scanned & Extracted!</span>
                <span className="text-xs text-slate-500">Tap below to review details</span>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-blue-100/60 text-[#006591] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  Tap to Simulate Camera Scan or Drag File
                </div>
                <p className="text-xs text-slate-500 max-w-xs">
                  Supports paper prescriptions, lab reports, discharge summaries (PDF, JPG, PNG)
                </p>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Document Name / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Prescription Order"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Record Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as 'PDF' | 'LAB' | 'RX' | 'SCAN')}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm text-slate-900 bg-white"
              >
                <option value="RX">Prescription (RX)</option>
                <option value="LAB">Lab Diagnostics (LAB)</option>
                <option value="PDF">Doctor Consult (PDF)</option>
                <option value="SCAN">Imaging / Other (SCAN)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Physician / Clinic
              </label>
              <input
                type="text"
                placeholder="Dr. Aris Thorne"
                value={doctorOrLab}
                onChange={(e) => setDoctorOrLab(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes or Extracted Details
            </label>
            <textarea
              rows={3}
              placeholder="Describe medications, refills remaining, or doctor notes..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] text-sm text-slate-900"
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
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              Save to Encrypted Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
