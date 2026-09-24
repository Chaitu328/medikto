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
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

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

      // Verify Vitals Measurements are displayed
      expect(find.text('120/80 mmHg'), findsWidgets);
      expect(find.text('75 BPM'), findsWidgets);
      expect(find.text('100 mg/dL'), findsWidgets);
      expect(find.text('98.4 °F'), findsWidgets);

      // Verify Medical Interpretation Labels are NOT displayed on UI
      expect(find.text('Normal'), findsNothing);
      expect(find.text('Elevated'), findsNothing);
      expect(find.text('Hypertension Stage 1'), findsNothing);
      expect(find.text('Hypertension Stage 2'), findsNothing);
    });

    testWidgets('Renders Reports tab with delete icon on report cards', (tester) async {
      final dummyReports = [
        MedicalReportModel(
          id: 'rep-123',
          title: 'Blood Test Lab Report',
          date: DateTime.parse('2026-09-04T10:00:00.000Z'),
          fileUrl: 'https://s3.amazonaws.com/test/report.pdf',
          condition: 'normal',
          type: 'medical',
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getProfileProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: null))),
            getVitalsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: <VitalsModel>[]))),
            getReportsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: dummyReports))),
            getPrescriptionsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: <PrescriptionModel>[]))),
          ],
          child: const MaterialApp(
            home: HealthRecordsHubScreen(initialTabIndex: 1),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Blood Test Lab Report'), findsOneWidget);
      expect(find.byIcon(Icons.delete_outline), findsOneWidget);
    });

    testWidgets('Renders Prescriptions tab with delete icon on prescription cards', (tester) async {
      final dummyPrescriptions = [
        PrescriptionModel(
          id: 'pres-123',
          medicineName: 'Amoxicillin 500mg',
          dosageInstructions: 'Take 1 capsule twice daily',
          reminders: [],
          fileUrl: 'https://s3.amazonaws.com/test/prescription.jpg',
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getProfileProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: null))),
            getVitalsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: <VitalsModel>[]))),
            getReportsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: <MedicalReportModel>[]))),
            getPrescriptionsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: dummyPrescriptions))),
          ],
          child: const MaterialApp(
            home: HealthRecordsHubScreen(initialTabIndex: 2),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Amoxicillin 500mg'), findsOneWidget);
      expect(find.byIcon(Icons.delete_outline), findsOneWidget);
    });

    testWidgets('Medical Documents Hub Vitals single source of truth and deterministic All Vitals', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final now = DateTime.now();
      final dummyVitals = [
        VitalsModel(
          type: 'bloodPressure',
          systolic: 130,
          diastolic: 70,
          recordedAt: now.subtract(const Duration(days: 1)), // Most recent
        ),
        VitalsModel(
          type: 'heartRate',
          heartRate: 76,
          recordedAt: now.subtract(const Duration(days: 2)),
        ),
        VitalsModel(
          type: 'sugar',
          sugarLevel: 105,
          recordedAt: now.subtract(const Duration(days: 3)),
        ),
        VitalsModel(
          type: 'temperature',
          temperature: 98.4,
          recordedAt: now.subtract(const Duration(days: 4)),
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
            home: HealthRecordsHubScreen(initialTabIndex: 0),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // CASE 1: All Vitals (Default)
      // Graph deterministically picks Blood Pressure (most recent) and provides Dropdown selector
      expect(find.text('Vitals Trends'), findsOneWidget);
      expect(find.text('Blood Pressure'), findsWidgets);
      // Verify Dropdown selector exists on All Vitals
      expect(find.byIcon(Icons.keyboard_arrow_down_rounded), findsOneWidget);
      // History shows all
      expect(find.text('ALL PREVIOUS READINGS'), findsOneWidget);
      expect(find.text('130/70 mmHg'), findsWidgets);
      expect(find.text('76 BPM'), findsWidgets);
      expect(find.text('105 mg/dL'), findsWidgets);
      expect(find.text('98.4 °F'), findsWidgets);

      // CASE 2: Select Blood Pressure top chip
      await tester.ensureVisible(find.widgetWithText(ChoiceChip, 'Blood Pressure'));
      await tester.tap(find.widgetWithText(ChoiceChip, 'Blood Pressure'));
      await tester.pumpAndSettle();

      expect(find.text('BLOOD PRESSURE HISTORY'), findsOneWidget);
      expect(find.text('130/70 mmHg'), findsWidgets);
      expect(find.text('76 BPM'), findsNothing);
      expect(find.byIcon(Icons.keyboard_arrow_down_rounded), findsNothing);

      // CASE 3: Select Heart Rate top chip
      await tester.ensureVisible(find.widgetWithText(ChoiceChip, 'Heart Rate'));
      await tester.tap(find.widgetWithText(ChoiceChip, 'Heart Rate'));
      await tester.pumpAndSettle();

      expect(find.text('HEART RATE HISTORY'), findsOneWidget);
      expect(find.text('76 BPM'), findsWidgets);
      expect(find.text('130/70 mmHg'), findsNothing);
      expect(find.byIcon(Icons.keyboard_arrow_down_rounded), findsNothing);

      // CASE 4: Select Blood Sugar top chip
      await tester.ensureVisible(find.widgetWithText(ChoiceChip, 'Blood Sugar'));
      await tester.tap(find.widgetWithText(ChoiceChip, 'Blood Sugar'));
      await tester.pumpAndSettle();

      expect(find.text('BLOOD SUGAR HISTORY'), findsOneWidget);
      expect(find.text('105 mg/dL'), findsWidgets);
      expect(find.text('76 BPM'), findsNothing);
      expect(find.byIcon(Icons.keyboard_arrow_down_rounded), findsNothing);

      // CASE 5: Select Body Temperature top chip
      await tester.ensureVisible(find.widgetWithText(ChoiceChip, 'Body Temperature'));
      await tester.tap(find.widgetWithText(ChoiceChip, 'Body Temperature'));
      await tester.pumpAndSettle();

      expect(find.text('BODY TEMPERATURE HISTORY'), findsOneWidget);
      expect(find.text('98.4 °F'), findsWidgets);
      expect(find.text('105 mg/dL'), findsNothing);
      expect(find.byIcon(Icons.keyboard_arrow_down_rounded), findsNothing);

      // CASE 6: Change Period from 7D to 30D inside card
      await tester.tap(find.text('30D'));
      await tester.pumpAndSettle();

      // Vital remains Body Temperature
      expect(find.text('BODY TEMPERATURE HISTORY'), findsOneWidget);
      expect(find.text('98.4 °F'), findsWidgets);
    });

    testWidgets('Medical Documents Hub renders on narrow 320px viewport without overflow', (tester) async {
      tester.view.physicalSize = const Size(320, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final dummyVitals = [
        VitalsModel(
          type: 'bloodPressure',
          systolic: 130,
          diastolic: 70,
          recordedAt: DateTime.now().subtract(const Duration(days: 1)),
        ),
      ];

      FlutterErrorDetails? caughtDetails;
      final originalOnError = FlutterError.onError;
      FlutterError.onError = (details) {
        caughtDetails = details;
      };

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getProfileProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: null))),
            getVitalsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: dummyVitals))),
            getReportsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: <MedicalReportModel>[]))),
            getPrescriptionsProvider.overrideWith((ref) => Future.value(ResponseData('Success', ResponseStatus.SUCCESS, data: <PrescriptionModel>[]))),
          ],
          child: const MaterialApp(
            home: HealthRecordsHubScreen(initialTabIndex: 0),
          ),
        ),
      );

      await tester.pumpAndSettle();
      FlutterError.onError = originalOnError;

      if (caughtDetails != null) {
        debugPrint("FULL CAUGHT FLUTTER ERROR:\n${caughtDetails.toString()}");
        for (final info in caughtDetails!.informationCollector!()) {
          debugPrint("INFO NODE: ${info.toStringDeep()}");
        }
      }

      final exc = tester.takeException();
      expect(exc, isNull);
      expect(find.text('Medical Documents Hub'), findsOneWidget);
      expect(find.text('Vitals Trends'), findsOneWidget);
    });
  });
}
