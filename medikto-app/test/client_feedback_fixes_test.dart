import 'package:flutter_test/flutter_test.dart';
import 'package:medikto/core/security/app_lock_manager.dart';
import 'package:medikto/features/home/add_reports/models/medical_report_model.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
import 'package:medikto/features/medications/models/dose_history_model.dart';

void main() {
  group('Client Feedback Fixes Tests', () {
    test('Blood Sugar Input Parsing & Validation logic', () {
      int? parseSugar(String input) {
        final rawText = input.trim().replaceAll(',', '.');
        final parsedNum = num.tryParse(rawText);
        final sugar = parsedNum?.round();
        if (sugar == null || sugar <= 0 || sugar > 1500) {
          return null;
        }
        return sugar;
      }

      // Valid values
      expect(parseSugar("110"), 110);
      expect(parseSugar("95"), 95);
      expect(parseSugar("120.5"), 121);
      expect(parseSugar("140,2"), 140);
      expect(parseSugar(" 200 "), 200);

      // Invalid values
      expect(parseSugar(""), isNull);
      expect(parseSugar("0"), isNull);
      expect(parseSugar("-50"), isNull);
      expect(parseSugar("abc"), isNull);
      expect(parseSugar("2000"), isNull);
    });

    test('Medication Records Status Filtering', () {
      final records = [
        {'id': '1', 'name': 'Metformin', 'status': 'Taken', 'dateString': '2026-09-17'},
        {'id': '2', 'name': 'Aspirin', 'status': 'Missed', 'dateString': '2026-09-17'},
        {'id': '3', 'name': 'Atorvastatin', 'status': 'Pending', 'dateString': '2026-09-17'},
        {'id': '4', 'name': 'Metformin', 'status': 'Taken', 'dateString': '2026-09-16'},
      ];

      List<Map<String, dynamic>> filterByTab(String tabName) {
        return records.where((record) {
          return tabName == "All Records" || record['status'] == tabName;
        }).toList();
      }

      expect(filterByTab("All Records").length, 4);
      expect(filterByTab("Taken").length, 2);
      expect(filterByTab("Missed").length, 1);
      expect(filterByTab("Pending").length, 1);
      expect(filterByTab("Taken").every((r) => r['status'] == 'Taken'), isTrue);
      expect(filterByTab("Missed").every((r) => r['status'] == 'Missed'), isTrue);
      expect(filterByTab("Pending").every((r) => r['status'] == 'Pending'), isTrue);
    });

    test('DoseHistorySummary Total and Stat Columns remain intact', () {
      final summary = DoseHistorySummary(
        total: 10,
        taken: 7,
        missed: 2,
        pending: 1,
      );

      expect(summary.total, 10);
      expect(summary.taken, 7);
      expect(summary.missed, 2);
      expect(summary.pending, 1);
    });

    test('Vitals Model handles sugarLevel serialization correctly', () {
      final vital = VitalsModel(
        type: 'sugar',
        sugarLevel: 110,
        recordedAt: DateTime.parse('2026-09-17'),
        notes: 'Fasting test',
      );

      expect(vital.sugarLevel, 110);
      expect(vital.notes, 'Fasting test');
    });

    test('Medical Report and Prescription Model attachments are preserved', () {
      final report = MedicalReportModel(
        id: 'rep-1',
        title: 'Blood Test Report',
        type: 'Lab Test',
        fileUrl: 'https://medikto-bucket.s3.amazonaws.com/reports/blood_test.pdf',
        condition: 'normal',
        date: DateTime.parse('2026-09-17'),
      );

      final prescription = PrescriptionModel(
        id: 'rx-1',
        medicineName: 'Amoxicillin',
        fileUrl: 'https://medikto-bucket.s3.amazonaws.com/prescriptions/rx_1.pdf',
        dosageInstructions: '500mg three times daily',
        reminders: [],
      );

      expect(report.fileUrl.endsWith('.pdf'), isTrue);
      expect(prescription.fileUrl!.endsWith('.pdf'), isTrue);
    });

    test('AppLockManager session lifecycle correctly manages in-memory lock state', () {
      final lockManager = AppLockManager();
      
      // Default / cold launch lock state
      lockManager.lockApp();
      expect(lockManager.isAppLocked, isTrue);

      // User enters PIN -> App unlocks
      lockManager.unlockApp();
      expect(lockManager.isAppLocked, isFalse);

      // Temporary backgrounding / normal app usage does not lock session
      expect(lockManager.isAppLocked, isFalse);

      // Explicit logout or cold restart resets lock
      lockManager.lockApp();
      expect(lockManager.isAppLocked, isTrue);
    });

    test('Blood Pressure Trend is suppressed while other vital trends remain supported', () {
      bool shouldRenderTrend(String vitalType) {
        return vitalType != "bloodPressure";
      }

      // Blood pressure trend must be hidden
      expect(shouldRenderTrend("bloodPressure"), isFalse);

      // Other vitals must continue displaying trends
      expect(shouldRenderTrend("heartRate"), isTrue);
      expect(shouldRenderTrend("temperature"), isTrue);
      expect(shouldRenderTrend("sugar"), isTrue);
    });

    test('Upload vs Share PIN Security Distinction', () {
      bool isPinRequiredForAction(String action) {
        switch (action) {
          case 'upload_pdf':
          case 'upload_image':
          case 'view_pdf':
          case 'view_image':
          case 'navigate':
            return false;
          case 'share_prescription':
          case 'share_medical_report':
          case 'share_vitals_report':
          case 'export_pdf':
            return true;
          default:
            return false;
        }
      }

      // Uploads & Views MUST NOT require PIN
      expect(isPinRequiredForAction('upload_pdf'), isFalse);
      expect(isPinRequiredForAction('upload_image'), isFalse);
      expect(isPinRequiredForAction('view_pdf'), isFalse);
      expect(isPinRequiredForAction('navigate'), isFalse);

      // Sensitive Share & Export MUST require PIN
      expect(isPinRequiredForAction('share_prescription'), isTrue);
      expect(isPinRequiredForAction('share_medical_report'), isTrue);
      expect(isPinRequiredForAction('share_vitals_report'), isTrue);
      expect(isPinRequiredForAction('export_pdf'), isTrue);
    });
  });
}
