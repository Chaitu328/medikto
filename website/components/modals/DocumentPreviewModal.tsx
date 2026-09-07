"use client";

import React from 'react';
import { ClinicalDocument } from '../../lib/types';

interface Props {
  document: ClinicalDocument | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<Props> = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="document-preview-dialog"
        className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
              document.type === 'PDF' ? 'bg-red-100 text-red-700' :
              document.type === 'LAB' ? 'bg-cyan-100 text-cyan-700' :
              document.type === 'RX' ? 'bg-emerald-100 text-emerald-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {document.type}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-slate-900">{document.title}</h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                  {document.type}
                </span>
              </div>
              <p className="text-xs text-slate-500">{document.doctorOrLab} • {document.size}</p>
            </div>
          </div>
          <button 
            id="close-doc-preview"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Security & HIPAA watermark bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
            <span>AES-256 Cloud Encrypted • Validated by Metropolitan Health Record Exchange</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">ID: {document.id.toUpperCase()}</span>
        </div>

        {/* Document Content Simulation */}
        <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 font-sans mb-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#006591] uppercase">CLINICAL TRANSCRIPT</span>
              <h4 className="text-base font-bold text-slate-800">{document.title}</h4>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="block font-semibold">Date of Service</span>
              <span>{document.date}</span>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Clinical Findings & Summary
              </span>
              <p className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-slate-800">
                {document.summary}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Verified Medical Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full bg-[#e5eeff] text-[#006591] text-xs font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>Electronic Signature: Authenticated by Dr. Aris Thorne (NPI #194820392)</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Active
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('Document link copied securely to clipboard for sharing with authorized physician.');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">share</span> Share Secure Link
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">print</span> Print Record
            </button>
          </div>
          <button
            onClick={() => {
              const blob = new Blob([document.summary], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = window.document.createElement('a');
              a.href = url;
              a.download = `${document.title.replace(/\s+/g, '_')}.txt`;
              a.click();
            }}
            className="px-6 py-2.5 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Download File ({document.size})
          </button>
        </div>
      </div>
    </div>
  );
};
