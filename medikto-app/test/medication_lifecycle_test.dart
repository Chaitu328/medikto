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

enum DoseUIActionState {
  taken,
  missed,
  upcoming,
  actionable, // Mark as Taken & Verify with Selfie available
}

DoseUIActionState evaluateDoseState(TodayScheduleModel dose, {DateTime? referenceNow}) {
  final now = referenceNow ?? DateTime.now();
  final rawStatus = (dose.status ?? "pending").toLowerCase();

  // 1. STATUS FIRST
  if (rawStatus == "taken") {
    return DoseUIActionState.taken;
  }
  if (rawStatus == "missed") {
    return DoseUIActionState.missed;
  }

  // 2. FOR PENDING DOSES: COMPARE DATE + TIME WITH REFERENCE TIME
  final scheduled = parseDoseDateTime(dose.date, dose.time);
  if (scheduled == null) {
    return DoseUIActionState.actionable;
  }

  if (scheduled.isAfter(now)) {
    return DoseUIActionState.upcoming;
  }

  return DoseUIActionState.actionable;
}

void main() {
  group('Medikto Medication Action State Machine Tests', () {
    test('TEST A: Future dose (05:30 PM at 01:36 PM) -> Upcoming, no action buttons', () {
      final refTime = DateTime(2026, 9, 6, 13, 36); // 01:36 PM
      final dose = TodayScheduleModel(
        id: "dose-1",
        name: "Pill",
        dosage: "500mg",
        date: "2026-09-06",
        time: "05:30 PM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.upcoming));
    });

    test('TEST B: Scheduled time reached (08:30 AM at 08:35 AM) -> Mark as Taken & Verify with Selfie available', () {
      final refTime = DateTime(2026, 9, 6, 8, 35); // 08:35 AM
      final dose = TodayScheduleModel(
        id: "dose-2",
        name: "Pill",
        dosage: "500mg",
        date: "2026-09-06",
        time: "08:30 AM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.actionable));
    });

    test('TEST C: Past pending dose (12:30 PM at 08:43 PM same date) -> Mark as Taken available', () {
      final refTime = DateTime(2026, 9, 6, 20, 43); // 08:43 PM
      final dose = TodayScheduleModel(
        id: "dose-3",
        name: "Pill",
        dosage: "500mg",
        date: "2026-09-06",
        time: "12:30 PM",
        status: "pending",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.actionable));
    });

    test('TEST D: Already taken dose (status: taken) -> Taken, no actions, regardless of time', () {
      final refTime = DateTime(2026, 9, 6, 20, 43);
      final dose = TodayScheduleModel(
        id: "dose-4",
        name: "Pill",
        dosage: "500mg",
        date: "2026-09-06",
        time: "12:30 PM",
        status: "taken",
        takenAt: "2026-09-06T13:30:00.000Z",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.taken));
    });

    test('TEST E: Missed dose (status: missed) -> Missed, no actions', () {
      final refTime = DateTime(2026, 9, 6, 13, 31);
      final dose = TodayScheduleModel(
        id: "dose-5",
        name: "Pill",
        dosage: "500mg",
        date: "2026-09-06",
        time: "12:30 PM",
        status: "missed",
      );

      final state = evaluateDoseState(dose, referenceNow: refTime);
      expect(state, equals(DoseUIActionState.missed));
    });

    test('TEST F: Yesterday dose (2026-09-05 12:30 PM at 2026-09-06 08:35 AM) is NOT future', () {
      final refTime = DateTime(2026, 9, 6, 8, 35); // Today 08:35 AM
      final yesterdayDose = TodayScheduleModel(
        id: "dose-6",
        name: "Pill",
        dosage: "500mg",
        date: "2026-09-05", // Yesterday
        time: "12:30 PM", // 12:30 PM > 08:35 AM if compared by time only
        status: "pending",
      );

      final state = evaluateDoseState(yesterdayDose, referenceNow: refTime);
      // Because full date+time is compared, yesterday 12:30 PM is BEFORE today 08:35 AM
      expect(state, equals(DoseUIActionState.actionable));
      expect(state, isNot(equals(DoseUIActionState.upcoming)));
    });

    test('TEST G: Scheduled time and takenAt remain separate and distinct', () {
      final scheduledTime = "08:30 AM";
      final actualTakenDateTime = DateTime(2026, 9, 6, 13, 30); // 01:30 PM
      final takenAtISO = actualTakenDateTime.toIso8601String();

      final dose = TodayScheduleModel(
        id: "dose-7",
        name: "Pill",
        dosage: "500mg",
        date: "2026-09-06",
        time: scheduledTime,
        status: "taken",
        takenAt: takenAtISO,
      );

      // Scheduled time is intact
      expect(dose.time, equals("08:30 AM"));

      // TakenAt is formatted separately
      final dt = DateTime.parse(dose.takenAt!).toLocal();
      final formattedTakenAt = DateFormat("hh:mm a").format(dt);
      expect(formattedTakenAt, equals("01:30 PM"));
    });
  });
}
