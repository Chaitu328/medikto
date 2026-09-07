"use client";

import React, { useState } from 'react';
import {
  initialPatient,
  initialMedications,
  initialVitals,
  weeklyHistoryVitals,
  initialCaregiverAlerts,
} from '../lib/mockData';
import {
  Medication,
  VitalMetric,
  CaregiverAlert,
  PatientProfile,
} from '../lib/types';

import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { MedicationSection } from '../components/MedicationSection';
import { VitalsSection } from '../components/VitalsSection';
import { CaregiverSection } from '../components/CaregiverSection';
import { HospitalSection } from '../components/HospitalSection';
import { SeniorsPillars } from '../components/SeniorsPillars';
import { MobileShowcase } from '../components/MobileShowcase';
import { ContactSection } from '../components/ContactSection';
import { CtaSection } from '../components/CtaSection';
import { Footer } from '../components/Footer';

// Modals
import { DoctorReportModal } from '../components/modals/DoctorReportModal';
import { MonthlyCalendarModal } from '../components/modals/MonthlyCalendarModal';
import { InteractivePreviewModal } from '../components/modals/InteractivePreviewModal';

export default function HomePage() {
  const [patient] = useState<PatientProfile>(initialPatient);
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [vitals] = useState<VitalMetric[]>(initialVitals);
  const [weeklyHistory] = useState(weeklyHistoryVitals);
  const [alerts, setAlerts] = useState<CaregiverAlert[]>(initialCaregiverAlerts);

  // App UI States
  const [activeSection, setActiveSection] = useState('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Showcase Modal States
  const [isDoctorReportOpen, setIsDoctorReportOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dose status actions
  const handleMarkTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newRemaining = Math.max(0, m.remainingPills - 1);
          return {
            ...m,
            status: 'taken',
            takenTime: nowTime,
            remainingPills: newRemaining,
          };
        }
        return m;
      })
    );

    const targetMed = medications.find((m) => m.id === id);
    const medName = targetMed ? targetMed.name : 'Medication';

    // Generate automatic caregiver notification alert
    const newAlert: CaregiverAlert = {
      id: `alert-${Date.now()}`,
      title: `SMS Sent to Sarah: ${patient.name} took ${medName}`,
      description: `Confirmed intake logged at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Safe adherence status updated.`,
      type: 'dose_taken',
      timestamp: 'Just now',
      status: 'confirmed',
    };
    setAlerts((prev) => [newAlert, ...prev]);

    showToast(`Great job! ${medName} dose confirmed and synced to Caregiver feed.`);
  };

  const handleSnooze = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, status: 'snoozed' };
        }
        return m;
      })
    );
  };

  // Navigation scroll helper
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 font-sans antialiased selection:bg-[#0ea5e9]/20 selection:text-[#006591]">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-[#0b1320] text-white shadow-2xl border border-cyan-500/40 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs sm:text-sm font-semibold text-slate-100">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header with Sharp Brand Logo and Animated Gradient Hover Underlines */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Content Sections */}
      <main className="w-full pt-20 min-h-screen">
        {/* 1. Hero */}
        <HeroSection
          medications={medications}
          vitals={vitals}
          onAffirmTaken={handleMarkTaken}
          onOpenGetStarted={() => handleNavigate('contact')}
          onOpenPreview={() => setIsPreviewOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          streakDays={patient.streakDays}
        />

        {/* 2. How Medikto Works */}
        <HowItWorks
          onOpenPreview={() => setIsPreviewOpen(true)}
        />

        {/* 3. Core Capabilities Grid */}
        <FeaturesGrid
          onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
          onOpenPreview={() => setIsPreviewOpen(true)}
        />

        {/* 4. Deep Dive: Medication Management */}
        <MedicationSection
          medications={medications}
          onMarkTaken={handleMarkTaken}
          onSnooze={handleSnooze}
          streakDays={patient.streakDays}
        />

        {/* 5. Unified Health Records & Vital Analytics */}
        <VitalsSection
          vitals={vitals}
          weeklyHistory={weeklyHistory}
          onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
        />

        {/* 6. Family & Caregiver Sync */}
        <CaregiverSection
          alerts={alerts}
          onAddAlert={(alert) => setAlerts((prev) => [alert, ...prev])}
          onOpenProfile={() => handleNavigate('contact')}
        />

        {/* 7. Connected Hospitals & Doctor Admin Portal */}
        <HospitalSection />

        {/* 8. Built for Seniors. Loved by Families. */}
        <SeniorsPillars />

        {/* 8. Smartphone Mockup Showcase */}
        <MobileShowcase
          vitals={vitals}
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />

        {/* 9. Public Contact Us Inquiry Form (Direct Nodemailer Integration) */}
        <ContactSection />

        {/* 10. Final Take Control Call to Action */}
        <CtaSection
          onNavigate={handleNavigate}
        />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
      />

      {/* Interactive Showcase Modals */}
      <DoctorReportModal
        isOpen={isDoctorReportOpen}
        onClose={() => setIsDoctorReportOpen(false)}
        patient={patient}
        medications={medications}
        vitals={vitals}
      />

      <MonthlyCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        streakDays={patient.streakDays}
      />

      <InteractivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
