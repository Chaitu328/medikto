"use client";

import React, { useState } from 'react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setErrorMessage('Please fill in your Name, Contact Number, and Email.');
      return;
    }

    try {
      setStatus('loading');
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit the form. Please try again.');
      }

      setStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        description: '',
      });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again later.');
    }
  };

  return (
    <section className="py-24 relative bg-gradient-to-b from-[#f8f9ff] via-[#eff6ff] to-[#f8f9ff]" id="contact">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Direct Info & Value Proposition */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#006591] font-bold text-xs shadow-sm border border-slate-200/80 mb-4 tracking-wide uppercase self-start">
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" />
              Direct Support & Inquiries
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.18] mb-5">
              Get in Touch with{' '}
              <span className="bg-gradient-to-r from-[#006591] via-[#0284c7] to-[#0ea5e9] bg-clip-text text-transparent">
                Medikto
              </span>
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Have questions about family care plans, physician summaries, hospital integrations, or need personalized onboarding assistance? Send us a message and our healthcare support specialists will respond promptly.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#006591] flex items-center justify-center border border-sky-100 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">mail</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Email</p>
                  <a href="mailto:shahmedikto@gmail.com" className="text-base font-bold text-slate-900 hover:text-[#006591] transition-colors">
                    shahmedikto@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Privacy & Security</p>
                  <p className="text-sm font-bold text-slate-800">HIPAA & Encrypted Telemetry Standards</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">headset_mic</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response Window</p>
                  <p className="text-sm font-bold text-slate-800">Within 24 Hours • Dedicated Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Contrast Premium Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-200/90 relative overflow-hidden">

              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Send Us a Message</h3>
                <p className="text-sm text-slate-500">
                  Fill in your contact details below and our team will get back to you directly.
                </p>
              </div>

              {/* Success Notification */}
              {status === 'success' && (
                <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Message Dispatched Successfully!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                      Thank you for reaching out. An automated confirmation has been sent to our support desk via Nodemailer. We will contact you shortly.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-3 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {errorMessage && status === 'error' && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 animate-fadeIn">
                  <span className="material-symbols-outlined text-[22px] text-rose-600">error</span>
                  <p className="text-xs font-bold text-rose-800">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                      person
                    </span>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Enter your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50/80 border border-slate-200 focus:border-[#0ea5e9] focus:bg-white focus:ring-4 focus:ring-sky-500/10 text-slate-900 text-sm font-semibold transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Contact Number & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Contact Number */}
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Contact Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                        call
                      </span>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        placeholder="e.g. 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50/80 border border-slate-200 focus:border-[#0ea5e9] focus:bg-white focus:ring-4 focus:ring-sky-500/10 text-slate-900 text-sm font-semibold transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                        mail
                      </span>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="Enter your Email ID"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50/80 border border-slate-200 focus:border-[#0ea5e9] focus:bg-white focus:ring-4 focus:ring-sky-500/10 text-slate-900 text-sm font-semibold transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Description (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="contact-desc" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Description / Message
                    </label>
                    <span className="text-[11px] font-bold text-slate-400">Optional</span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="contact-desc"
                      rows={4}
                      placeholder="Tell us how we can help or describe any inquiries regarding our platform..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-slate-50/80 border border-slate-200 focus:border-[#0ea5e9] focus:bg-white focus:ring-4 focus:ring-sky-500/10 text-slate-900 text-sm font-semibold transition-all outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-13 py-3.5 px-8 rounded-full bg-gradient-to-r from-[#006591] via-[#0284c7] to-[#0ea5e9] hover:from-[#004c6e] hover:to-[#0284c7] text-white font-extrabold text-base shadow-[0_8px_25px_rgba(14,165,233,0.35)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
