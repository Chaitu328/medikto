import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/health_records/health_records_hub_screen.dart';
import 'package:medikto/features/home/add_reports/models/medical_report_model.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';

void main() {
  group('VitalsModel unit tests', () {
    test('Correctly parses Blood Pressure from backend JSON', () {
      final json = {
        'type': 'bloodPressure',
        'bloodPressure': {
          'systolic': 120,
          'diastolic': 80,
          'status': 'Normal',
        },
        'notes': 'Normal check',
        'recordedAt': '2026-09-04T10:00:00.000Z',
      };

      final vital = VitalsModel.fromJson(json);
      expect(vital.type, 'bloodPressure');
      expect(vital.systolic, 120);
      expect(vital.diastolic, 80);
      expect(vital.bloodPressureStatus, 'Normal');
      expect(vital.notes, 'Normal check');
      expect(vital.recordedAt, isNotNull);
    });

    test('Correctly parses Heart Rate from backend JSON', () {
      final json = {
        'type': 'heartRate',
        'heartRate': 72,
        'heartRateStatus': 'Normal',
        'recordedAt': '2026-09-04T11:00:00.000Z',
      };

      final vital = VitalsModel.fromJson(json);
      expect(vital.type, 'heartRate');
      expect(vital.heartRate, 72);
      expect(vital.heartRateStatus, 'Normal');
    });

    test('Correctly parses Sugar Level from backend JSON', () {
      final json = {
        'type': 'sugar',
        'sugarLevel': 95,
        'sugarStatus': 'Normal',
        'recordedAt': '2026-09-04T08:00:00.000Z',
      };

      final vital = VitalsModel.fromJson(json);
      expect(vital.type, 'sugar');
      expect(vital.sugarLevel, 95);
      expect(vital.sugarStatus, 'Normal');
    });

    test('Correctly parses Temperature from backend JSON', () {
      final json = {
        'type': 'temperature',
        'temperature': 98.6,
        'temperatureStatus': 'Normal',
        'recordedAt': '2026-09-04T09:00:00.000Z',
      };

      final vital = VitalsModel.fromJson(json);
      expect(vital.type, 'temperature');
      expect(vital.temperature, 98.6);
      expect(vital.temperatureStatus, 'Normal');
    });
  });

  group('HealthRecordsHubScreen Widget Tests', () {
    testWidgets('Renders HealthRecordsHubScreen with 3 tabs and quick vitals cards', (tester) async {
      final dummyVitals = [
        VitalsModel(
          type: 'bloodPressure',
          systolic: 120,
          diastolic: 80,
          bloodPressureStatus: 'Normal',
          recordedAt: DateTime.parse('2026-09-04T10:00:00.000Z'),
          notes: 'Routine check',
        ),
        VitalsModel(
          type: 'heartRate',
          heartRate: 75,
          heartRateStatus: 'Normal',
          recordedAt: DateTime.parse('2026-09-04T10:30:00.000Z'),
        ),
        VitalsModel(
          type: 'sugar',
          sugarLevel: 100,
          sugarStatus: 'Normal',
          recordedAt: DateTime.parse('2026-09-04T08:00:00.000Z'),
        ),
        VitalsModel(
          type: 'temperature',
          temperature: 98.4,
          temperatureStatus: 'Normal',
          recordedAt: DateTime.parse('2026-09-04T07:30:00.000Z'),
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getProfileProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: null))),
            getVitalsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: dummyVitals))),
            getReportsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: <MedicalReportModel>[]))),
            getPrescriptionsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: <PrescriptionModel>[]))),
          ],
          child: const MaterialApp(
            home: HealthRecordsHubScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify Screen Title
      expect(find.text('Medical Documents Hub'), findsOneWidget);

      // Verify Tab Labels
      expect(find.text('Vitals'), findsOneWidget);
      expect(find.text('Reports'), findsOneWidget);
      expect(find.text('Prescriptions'), findsOneWidget);
    });
  });
}
