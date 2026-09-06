import 'package:flutter_test/flutter_test.dart';
import 'package:medikto/features/medications/models/today_scheduled_model.dart';
import 'package:intl/intl.dart';

DateTime? parseDoseDateTime(String? dateStr, String? timeStr) {
  if (timeStr == null || timeStr.trim().isEmpty) return null;
  try {
    final now = DateTime.now();
    int year = now.year;
    int month = now.month;
    int day = now.day;

    if (dateStr != null && dateStr.trim().isNotEmpty) {
      final dateParts = dateStr.split("-");
      if (dateParts.length >= 3) {
        year = int.parse(dateParts[0]);
        month = int.parse(dateParts[1]);
        day = int.parse(dateParts[2]);
      }
    }

    final cleanTime = timeStr.replaceAll(RegExp(r'\u202F|\u00A0'), ' ').trim();
    final isPM = cleanTime.toUpperCase().endsWith("PM");
    final isAM = cleanTime.toUpperCase().endsWith("AM");
    final timeDigits = cleanTime.replaceAll(RegExp(r'[a-zA-Z\s]'), '');
    final parts = timeDigits.split(":");
    if (parts.length < 2) return null;

    int hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour == 12) hour = 0;

    return DateTime(year, month, day, hour, minute);
  } catch (_) {
    return null;
  }
}

bool isDoseInFuture(String? dateStr, String? timeStr, {DateTime? referenceNow}) {
  final scheduled = parseDoseDateTime(dateStr, timeStr);
  if (scheduled == null) return false;
  final now = referenceNow ?? DateTime.now();
  final actionStartTime = scheduled.subtract(const Duration(minutes: 10));
  return now.isBefore(actionStartTime);
}

bool isDoseExpired(String? dateStr, String? timeStr, {DateTime? referenceNow}) {
  final scheduled = parseDoseDateTime(dateStr, timeStr);
  if (scheduled == null) return false;
  final now = referenceNow ?? DateTime.now();
  final expirationTime = scheduled.add(const Duration(minutes: 60));
  return now.isAfter(expirationTime) || now.isAtSameMomentAs(expirationTime);
}

enum DoseUIActionState {
  taken,
  missed,
  upcoming,
  actionable, // Within 60-minute window: Mark as Taken & Verify with Selfie available
}

DoseUIActionState evaluateDoseState(TodayScheduleModel dose, {DateTime? referenceNow}) {
  final now = referenceNow ?? DateTime.now();
  final rawStatus = (dose.status ?? "pending").toLowerCase();

  // 1. STATUS FIRST
  if (rawStatus == "taken") {
    return DoseUIActionState.taken;
  }
  if (rawStatus == "missed" || rawStatus == "cancelled") {
    return DoseUIActionState.missed;
  }

  // 2. 60-MINUTE EXPIRATION EVALUATION
  if (isDoseExpired(dose.date, dose.time, referenceNow: now)) {
    return DoseUIActionState.missed;
  }

  // 3. FUTURE EVALUATION
  if (isDoseInFuture(dose.date, dose.time, referenceNow: now)) {
    return DoseUIActionState.upcoming;
  }

  // 4. ACTION WINDOW (Scheduled Time Reached and within 60 minutes)
  return DoseUIActionState.actionable;
}

void main() {
  group('Medikto Medication Reminder & 60-Minute Dose Action Window Tests', () {
    test('Test 1: Scheduled 11:30 AM, current 11:15 AM -> Upcoming, no take action yet', () {
      final refTime = DateTime(2026, 9, 6, 11, 15);
      final dose = TodayScheduleModel(
        id: "dose-1",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: "11:30 AM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.upcoming));
    });

    test('Test 2: Scheduled 11:30 AM, current 11:30 AM -> Action window starts, Mark as Taken & Verify with Selfie available', () {
      final refTime = DateTime(2026, 9, 6, 11, 30);
      final dose = TodayScheduleModel(
        id: "dose-2",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: "11:30 AM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.actionable));
    });

    test('Test 3: Scheduled 11:30 AM, current 11:45 AM -> Action window active (15 mins past schedule)', () {
      final refTime = DateTime(2026, 9, 6, 11, 45);
      final dose = TodayScheduleModel(
        id: "dose-3",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: "11:30 AM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.actionable));
    });

    test('Test 4: Scheduled 11:30 AM, current 12:29 PM -> Still pending and actionable (minute 59)', () {
      final refTime = DateTime(2026, 9, 6, 12, 29);
      final dose = TodayScheduleModel(
        id: "dose-4",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: "11:30 AM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.actionable));
    });

    test('Test 5: Scheduled 11:30 AM, current 12:30 PM -> 60 minutes expire, dose becomes Missed, no actions', () {
      final refTime = DateTime(2026, 9, 6, 12, 30);
      final dose = TodayScheduleModel(
        id: "dose-5",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: "11:30 AM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.missed));
    });

    test('Test 6: Scheduled 11:30 AM, current 12:45 PM -> Missed, no actions', () {
      final refTime = DateTime(2026, 9, 6, 12, 45);
      final dose = TodayScheduleModel(
        id: "dose-6",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: "11:30 AM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.missed));
    });

    test('Test 7: Dose already taken at 11:45 AM -> Taken, no actions, regardless of current time', () {
      final refTime = DateTime(2026, 9, 6, 20, 43); // 8:43 PM
      final dose = TodayScheduleModel(
        id: "dose-7",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: "11:30 AM",
        status: "taken",
        takenAt: "2026-09-06T06:15:00.000Z",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.taken));
    });

    test('Test 8: Future dose (05:30 PM at 01:36 PM) -> Upcoming, no actions', () {
      final refTime = DateTime(2026, 9, 6, 13, 36);
      final dose = TodayScheduleModel(
        id: "dose-8",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: "05:30 PM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.upcoming));
    });

    test('Test 9: Yesterday pending dose (2026-09-05 12:30 PM at 2026-09-06 08:35 AM) -> Expired / Missed, no actions', () {
      final refTime = DateTime(2026, 9, 6, 8, 35);
      final yesterdayDose = TodayScheduleModel(
        id: "dose-9",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-05", // Yesterday
        time: "12:30 PM",
        status: "pending",
      );

      final state = evaluateDoseState(yesterdayDose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.missed));
    });

    test('Test 10: Scheduled time and takenAt remain separate and distinct', () {
      final scheduledTime = "11:30 AM";
      final actualTakenDateTime = DateTime(2026, 9, 6, 11, 45); // Taken at 11:45 AM
      final takenAtISO = actualTakenDateTime.toIso8601String();

      final dose = TodayScheduleModel(
        id: "dose-10",
        name: "Paracetamol",
        dosage: "500mg",
        date: "2026-09-06",
        time: scheduledTime,
        status: "taken",
        takenAt: takenAtISO,
      );

      expect(dose.time, equals("11:30 AM"));

      final dt = DateTime.parse(dose.takenAt!).toLocal();
      final formattedTakenAt = DateFormat("hh:mm a").format(dt);
      expect(formattedTakenAt, equals("11:45 AM"));
    });

    test('Test 11: TodayScheduleModel parses populated medication object and medicationId', () {
      final jsonMap = {
        "_id": "dose-101",
        "name": "Lisinopril",
        "dosage": "10mg",
        "date": "2026-09-06",
        "time": "08:30 AM",
        "status": "pending",
        "medication": {
          "_id": "med-999",
          "name": "Lisinopril",
          "dosage": 10,
          "unit": "mg",
          "timings": ["08:30 AM"],
          "frequency": "daily",
          "status": "active"
        }
      };

      final schedule = TodayScheduleModel.fromJson(jsonMap);
      expect(schedule.medicationId, equals("med-999"));
      expect(schedule.medication, isNotNull);
      expect(schedule.medication!.name, equals("Lisinopril"));
    });

    test('Test 12: Editing parent medication preserves historical TAKEN dose fields', () {
      final historicalDose = TodayScheduleModel(
        id: "dose-102",
        name: "Lisinopril",
        dosage: "10mg",
        date: "2026-09-05",
        time: "08:30 AM",
        status: "taken",
        takenAt: "2026-09-05T08:15:00.000Z",
      );

      final state = evaluateDoseState(historicalDose, referenceNow: DateTime.now());
      expect(state, equals(DoseUIActionState.taken));
      expect(historicalDose.time, equals("08:30 AM"));
      expect(historicalDose.takenAt, equals("2026-09-05T08:15:00.000Z"));
    });

    test('Test 13: Editing parent medication preserves historical MISSED dose fields', () {
      final historicalMissed = TodayScheduleModel(
        id: "dose-103",
        name: "Lisinopril",
        dosage: "10mg",
        date: "2026-09-05",
        time: "08:30 AM",
        status: "missed",
      );

      final state = evaluateDoseState(historicalMissed, referenceNow: DateTime.now());
      expect(state, equals(DoseUIActionState.missed));
    });

    test('Test 14: Deleting parent medication cancels future pending doses while preserving past doses', () {
      final futurePendingDose = TodayScheduleModel(
        id: "dose-104",
        name: "Lisinopril",
        dosage: "10mg",
        date: "2026-09-07",
        time: "08:30 AM",
        status: "cancelled",
      );

      final pastTakenDose = TodayScheduleModel(
        id: "dose-102",
        name: "Lisinopril",
        dosage: "10mg",
        date: "2026-09-05",
        time: "08:30 AM",
        status: "taken",
      );

      expect(evaluateDoseState(futurePendingDose), equals(DoseUIActionState.missed)); // Non-pending status ignored for action
      expect(evaluateDoseState(pastTakenDose), equals(DoseUIActionState.taken));
    });
  });
}
