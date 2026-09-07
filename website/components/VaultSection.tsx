"use client";

import React, { useState } from 'react';
import { ClinicalDocument } from '../lib/types';

interface Props {
  documents: ClinicalDocument[];
  onSelectDoc: (doc: ClinicalDocument) => void;
}

export const VaultSection: React.FC<Props> = ({
  documents,
  onSelectDoc,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PDF' | 'LAB' | 'RX'>('ALL');

  const filteredDocs = documents.filter((d) => {
    if (filter === 'ALL') return true;
    return d.type === filter;
  });

  return (
    <section className="py-20 bg-[#eff4ff]" id="vault">
      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Realistic Vault UI Mockup */}
          <div className="lg:col-span-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md border border-slate-100">
              {/* Header Bar with Filter Pills & Sync Badge */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  {(['ALL', 'RX', 'LAB', 'PDF'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        filter === f
                          ? 'bg-[#006591] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Cloud Synced</span>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-[#f8f9ff] hover:bg-[#e5eeff] flex items-center justify-between transition-colors border border-slate-100 group"
                  >
                    <div
                      onClick={() => onSelectDoc(doc)}
                      className="flex items-center gap-3 cursor-pointer flex-1 mr-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          doc.type === 'PDF'
                            ? 'bg-red-100 text-red-700'
                            : doc.type === 'LAB'
                            ? 'bg-cyan-100 text-cyan-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {doc.type}
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-[#0b1c30] group-hover:text-[#006591] transition-colors truncate">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-[#3e4850] truncate">{doc.doctorOrLab}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          alert(`Secure link for ${doc.title} copied to clipboard!`);
                        }}
                        title="Share document link"
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 hover:text-[#006591] hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                      </button>
                      <button
                        onClick={() => onSelectDoc(doc)}
                        title="View clinical document details"
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 hover:text-[#006591] hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Vault Description */}
          <div className="lg:col-span-6 flex flex-col">
            <span className="text-xs font-bold text-[#006591] uppercase tracking-wider">
              No More Lost Paperwork
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] mt-2 mb-6">
              Your Complete Medical Paper Trail at Your Fingertips
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#c9e6ff] text-[#006591] flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                </div>
                <h4 className="text-base font-bold text-[#0b1c30]">Instant Camera Scan</h4>
                <p className="text-xs text-[#3e4850] mt-1">
                  Snap prescriptions right on your kitchen counter with automatic boundary detection.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#c9e6ff] text-[#006591] flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                </div>
                <h4 className="text-base font-bold text-[#0b1c30]">Encrypted Cloud Sync</h4>
                <p className="text-xs text-[#3e4850] mt-1">
                  Safely access and print your files even if your primary phone is replaced or lost.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e5eeff] text-[#006591] text-xs font-bold border border-blue-100">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>HIPAA Compliant & End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
