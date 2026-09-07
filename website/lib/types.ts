export type DoseStatus = 'taken' | 'upcoming' | 'snoozed' | 'missed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  scheduledTime: string;
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  status: DoseStatus;
  takenTime?: string;
  refillDaysLeft: number;
  totalPills: number;
  remainingPills: number;
  color: string;
  audioReminder: string;
}

export interface VitalMetric {
  id: string;
  title: string;
  category: 'bp' | 'sugar' | 'heart' | 'temp';
  value: string;
  unit: string;
  statusLabel: string;
  statusType: 'optimal' | 'normal' | 'caution' | 'alert';
  note: string;
  sparkline: number[];
  timestamp: string;
}

export interface DayVitals {
  day: string;
  systolic: number;
  diastolic: number;
  glucose: number;
  heartRate: number;
}

export interface ClinicalDocument {
  id: string;
  title: string;
  type: 'PDF' | 'LAB' | 'RX' | 'SCAN';
  doctorOrLab: string;
  date: string;
  size: string;
  summary: string;
  tags: string[];
}

export interface CaregiverAlert {
  id: string;
  title: string;
  description: string;
  type: 'dose_taken' | 'vital_logged' | 'fallback_alert' | 'refill_alert';
  timestamp: string;
  status: 'confirmed' | 'normal' | 'active' | 'pending';
}

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  idNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryDoctor: {
    name: string;
    specialty: string;
    clinic: string;
    phone: string;
  };
  allergies: string[];
  conditions: string[];
  adherenceRate: number;
  streakDays: number;
}
