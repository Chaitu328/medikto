import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
import 'package:medikto/features/vitals/models/vital_chart_point.dart';
import 'package:medikto/features/vitals/models/vital_metric_type.dart';
import 'package:medikto/features/vitals/widgets/vital_chart_empty_view.dart';
import 'package:medikto/features/vitals/widgets/vital_chart_legend.dart';
import 'package:medikto/features/vitals/widgets/vital_chart_view.dart';
import 'package:medikto/features/vitals/widgets/vital_period_filter.dart';
import 'package:medikto/features/vitals/widgets/vitals_trend_card.dart';

void main() {
  group('VitalMetricConfig & Registry Unit Tests', () {
    test('Blood Sugar config extracts sugarLevel and formats correctly', () {
      final config = VitalMetricRegistry.bloodSugar;
      final record = VitalsModel(
        type: 'sugar',
        sugarLevel: 118,
        recordedAt: DateTime(2026, 9, 22, 10, 30),
      );

      expect(config.primaryValueExtractor(record), 118.0);
      expect(config.secondaryValueExtractor, isNull);
      expect(config.formatValue(118), '118 mg/dL');
      expect(config.formatLatestReading(record), '118 mg/dL');
      expect(config.isMultiSeries, isFalse);
    });

    test('Heart Rate config extracts heartRate and formats in BPM', () {
      final config = VitalMetricRegistry.heartRate;
      final record = VitalsModel(
        type: 'heartRate',
        heartRate: 76,
        recordedAt: DateTime(2026, 9, 22, 10, 30),
      );

      expect(config.primaryValueExtractor(record), 76.0);
      expect(config.formatValue(76), '76 BPM');
      expect(config.formatLatestReading(record), '76 BPM');
    });

    test('Body Temperature config preserves decimal precision', () {
      final config = VitalMetricRegistry.temperature;
      final record = VitalsModel(
        type: 'temperature',
        temperature: 98.4,
        recordedAt: DateTime(2026, 9, 22, 10, 30),
      );

      expect(config.primaryValueExtractor(record), 98.4);
      expect(config.decimalPrecision, 1);
      expect(config.formatValue(98.4), '98.4 °F');
      expect(config.formatLatestReading(record), '98.4 °F');
    });

    test('Blood Pressure config supports dual-series (systolic + diastolic)', () {
      final config = VitalMetricRegistry.bloodPressure;
      final record = VitalsModel(
        type: 'bloodPressure',
        systolic: 128,
        diastolic: 82,
        recordedAt: DateTime(2026, 9, 22, 10, 30),
      );

      expect(config.isMultiSeries, isTrue);
      expect(config.primaryValueExtractor(record), 128.0);
      expect(config.secondaryValueExtractor!(record), 82.0);
      expect(config.formatValue(128, 82), '128/82 mmHg');
      expect(config.formatLatestReading(record), '128 / 82 mmHg');
    });

    test('getConfigByKey resolves metric types accurately', () {
      expect(VitalMetricRegistry.getConfigByKey('sugar')?.type, VitalMetricType.bloodSugar);
      expect(VitalMetricRegistry.getConfigByKey('bloodPressure')?.type, VitalMetricType.bloodPressure);
      expect(VitalMetricRegistry.getConfigByKey('heartRate')?.type, VitalMetricType.heartRate);
      expect(VitalMetricRegistry.getConfigByKey('temperature')?.type, VitalMetricType.temperature);
      expect(VitalMetricRegistry.getConfigByKey('unknown'), isNull);
    });
  });

  group('VitalChartDataProcessor Unit Tests', () {
    final now = DateTime.now();
    final testRecords = [
      // 2 days ago
      VitalsModel(
        type: 'bloodPressure',
        systolic: 120,
        diastolic: 80,
        recordedAt: now.subtract(const Duration(days: 2)),
      ),
      // 10 days ago (outside 7D, inside 30D)
      VitalsModel(
        type: 'bloodPressure',
        systolic: 130,
        diastolic: 85,
        recordedAt: now.subtract(const Duration(days: 10)),
      ),
      // 40 days ago (outside 30D, inside 3M)
      VitalsModel(
        type: 'bloodPressure',
        systolic: 125,
        diastolic: 82,
        recordedAt: now.subtract(const Duration(days: 40)),
      ),
      // Sugar record
      VitalsModel(
        type: 'sugar',
        sugarLevel: 105,
        recordedAt: now.subtract(const Duration(days: 1)),
      ),
      // Heart Rate record
      VitalsModel(
        type: 'heartRate',
        heartRate: 74,
        recordedAt: now.subtract(const Duration(days: 1)),
      ),
    ];

    test('Filters single metric records by 7D period properly', () {
      final processed7D = VitalChartDataProcessor.process(
        allRecords: testRecords,
        config: VitalMetricRegistry.bloodPressure,
        period: VitalPeriod.sevenDays,
      );

      expect(processed7D.points.length, 1);
      expect(processed7D.primarySpots.length, 1);
      expect(processed7D.secondarySpots.length, 1);
      expect(processed7D.primarySpots.first.y, 120.0);
      expect(processed7D.secondarySpots.first.y, 80.0);
    });

    test('Filters single metric records by 30D period properly', () {
      final processed30D = VitalChartDataProcessor.process(
        allRecords: testRecords,
        config: VitalMetricRegistry.bloodPressure,
        period: VitalPeriod.thirtyDays,
      );

      expect(processed30D.points.length, 2);
      expect(processed30D.primarySpots[0].y, 130.0);
      expect(processed30D.primarySpots[1].y, 120.0);
    });

    test('processAll combines multiple vital metrics into distinct series', () {
      final processedAll = VitalChartDataProcessor.processAll(
        allRecords: testRecords,
        period: VitalPeriod.sevenDays,
      );

      expect(processedAll.isAllVitals, isTrue);
      expect(processedAll.hasData, isTrue);
      // BP Systolic, BP Diastolic, Sugar, Heart Rate
      expect(processedAll.seriesList.length, 4);
      expect(processedAll.seriesList.any((s) => s.name == 'BP Systolic'), isTrue);
      expect(processedAll.seriesList.any((s) => s.name == 'BP Diastolic'), isTrue);
      expect(processedAll.seriesList.any((s) => s.name == 'Blood Sugar'), isTrue);
      expect(processedAll.seriesList.any((s) => s.name == 'Heart Rate'), isTrue);
    });

    test('Does not fabricate zero-points for missing days', () {
      final processed = VitalChartDataProcessor.process(
        allRecords: testRecords,
        config: VitalMetricRegistry.bloodSugar,
        period: VitalPeriod.thirtyDays,
      );

      expect(processed.points.length, 1);
      expect(processed.primarySpots.length, 1);
      expect(processed.primarySpots.first.y, 105.0);
      expect(processed.secondarySpots, isEmpty);
    });
  });

  group('VitalsTrendCard Widget Tests', () {
    final now = DateTime.now();
    final dummyVitals = [
      VitalsModel(
        type: 'sugar',
        sugarLevel: 110,
        recordedAt: now.subtract(const Duration(days: 3)),
      ),
      VitalsModel(
        type: 'sugar',
        sugarLevel: 125,
        recordedAt: now.subtract(const Duration(days: 1)),
      ),
      VitalsModel(
        type: 'bloodPressure',
        systolic: 124,
        diastolic: 82,
        recordedAt: now.subtract(const Duration(days: 2)),
      ),
      VitalsModel(
        type: 'heartRate',
        heartRate: 72,
        recordedAt: now.subtract(const Duration(days: 1)),
      ),
      VitalsModel(
        type: 'temperature',
        temperature: 98.6,
        recordedAt: now.subtract(const Duration(days: 1)),
      ),
    ];

    testWidgets('Renders combined multi-vital graph without dropdown for All Vitals',
        (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getVitalsProvider.overrideWith(
              (ref) => Future.value(
                ResponseData('Success', ResponseStatus.SUCCESS, data: dummyVitals),
              ),
            ),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: VitalsTrendCard(isAllVitals: true),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Card Title
      expect(find.text('Vitals Trends'), findsOneWidget);

      // Verify NO Dropdown Arrow icon exists
      expect(find.byIcon(Icons.keyboard_arrow_down_rounded), findsNothing);
      expect(find.text('All Vitals'), findsOneWidget);

      // Period Filter
      expect(find.byType(VitalPeriodFilter), findsOneWidget);
      expect(find.text('7D'), findsOneWidget);
      expect(find.text('30D'), findsOneWidget);
      expect(find.text('3M'), findsOneWidget);
      expect(find.text('6M'), findsOneWidget);
      expect(find.text('1Y'), findsOneWidget);

      // Latest Reading row
      expect(find.text('LATEST READING'), findsOneWidget);

      // Chart view and Legend showing all series
      expect(find.byType(VitalChartView), findsOneWidget);
      expect(find.byType(VitalChartLegend), findsOneWidget);
      expect(find.text('Blood Sugar (mg/dL)'), findsOneWidget);
      expect(find.text('Heart Rate (BPM)'), findsOneWidget);
    });

    testWidgets('Renders single vital view with static badge and dual-series legend for Blood Pressure',
        (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getVitalsProvider.overrideWith(
              (ref) => Future.value(
                ResponseData('Success', ResponseStatus.SUCCESS, data: dummyVitals),
              ),
            ),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: VitalsTrendCard(
                  isAllVitals: false,
                  initialConfig: VitalMetricRegistry.bloodPressure,
                ),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify Dropdown Selector does NOT exist
      expect(find.byIcon(Icons.keyboard_arrow_down_rounded), findsNothing);
      expect(find.text('Blood Pressure'), findsWidgets);
      expect(find.text('124 / 82 mmHg'), findsOneWidget);
      expect(find.text('Systolic (mmHg)'), findsOneWidget);
      expect(find.text('Diastolic (mmHg)'), findsOneWidget);
    });

    testWidgets('Tapping period filter updates period selection', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getVitalsProvider.overrideWith(
              (ref) => Future.value(
                ResponseData('Success', ResponseStatus.SUCCESS, data: dummyVitals),
              ),
            ),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: VitalsTrendCard(),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Tap 30D
      await tester.tap(find.text('30D'));
      await tester.pumpAndSettle();

      // Still renders properly
      expect(find.byType(VitalChartView), findsOneWidget);
    });

    testWidgets('Renders Empty View when no readings exist for period', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getVitalsProvider.overrideWith(
              (ref) => Future.value(
                ResponseData('Success', ResponseStatus.SUCCESS, data: <VitalsModel>[]),
              ),
            ),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: VitalsTrendCard(),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.byType(VitalChartEmptyView), findsOneWidget);
      expect(find.text('No Vitals Data'), findsOneWidget);
    });

    testWidgets('Renders cleanly on 320px width without layout overflow', (tester) async {
      tester.view.physicalSize = const Size(320, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getVitalsProvider.overrideWith(
              (ref) => Future.value(
                ResponseData('Success', ResponseStatus.SUCCESS, data: dummyVitals),
              ),
            ),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: VitalsTrendCard(
                  initialConfig: VitalMetricRegistry.bloodPressure,
                ),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('Vitals Trends'), findsOneWidget);
      expect(find.text('Blood Pressure'), findsWidgets);
    });
  });
}
