import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
import 'package:medikto/features/vitals/models/vital_metric_type.dart';

/// Supported time periods for vitals trend visualization.
enum VitalPeriod {
  sevenDays("7D", "7 Days", Duration(days: 7)),
  thirtyDays("30D", "30 Days", Duration(days: 30)),
  threeMonths("3M", "3 Months", Duration(days: 90)),
  sixMonths("6M", "6 Months", Duration(days: 180)),
  oneYear("1Y", "1 Year", Duration(days: 365));

  final String label;
  final String fullLabel;
  final Duration duration;

  const VitalPeriod(this.label, this.fullLabel, this.duration);

  /// Calculates the cutoff start date for this period.
  DateTime get startDate => DateTime.now().subtract(duration);
}

/// A parsed, chronological point for chart plotting.
class VitalChartPoint {
  final int index;
  final DateTime timestamp;
  final double primaryValue;
  final double? secondaryValue; // e.g. diastolic for blood pressure
  final String? notes;
  final VitalsModel rawRecord;

  const VitalChartPoint({
    required this.index,
    required this.timestamp,
    required this.primaryValue,
    this.secondaryValue,
    this.notes,
    required this.rawRecord,
  });

  FlSpot get primarySpot => FlSpot(index.toDouble(), primaryValue);
  FlSpot? get secondarySpot =>
      secondaryValue != null ? FlSpot(index.toDouble(), secondaryValue!) : null;
}

/// Results of processing raw vitals data for chart presentation.
class ProcessedVitalChartData {
  final VitalMetricConfig config;
  final VitalPeriod period;
  final List<VitalChartPoint> points;
  final List<FlSpot> primarySpots;
  final List<FlSpot> secondarySpots;
  final double minY;
  final double maxY;
  final double yInterval;
  final VitalsModel? latestRecord;
  final String latestValueFormatted;
  final String lastUpdatedFormatted;

  const ProcessedVitalChartData({
    required this.config,
    required this.period,
    required this.points,
    required this.primarySpots,
    required this.secondarySpots,
    required this.minY,
    required this.maxY,
    required this.yInterval,
    this.latestRecord,
    required this.latestValueFormatted,
    required this.lastUpdatedFormatted,
  });

  bool get isEmpty => points.isEmpty;
  bool get hasData => points.isNotEmpty;
}

/// Clinical processor to parse, filter, and calculate chart bounds without inventing data.
class VitalChartDataProcessor {
  static ProcessedVitalChartData process({
    required List<VitalsModel> allRecords,
    required VitalMetricConfig config,
    required VitalPeriod period,
  }) {
    // 1. Filter by metric type
    final typeRecords = allRecords.where((r) {
      return r.type.toLowerCase() == config.typeKey.toLowerCase();
    }).toList();

    // 2. Find absolute latest record before period filtering for the summary badge
    typeRecords.sort((a, b) {
      final aDate = a.recordedAt ?? DateTime(1970);
      final bDate = b.recordedAt ?? DateTime(1970);
      return bDate.compareTo(aDate); // Newest first
    });
    final VitalsModel? latestRecord =
        typeRecords.isNotEmpty ? typeRecords.first : null;

    // 3. Filter by selected time period
    final cutoffDate = period.startDate;
    final inPeriodRecords = typeRecords.where((r) {
      if (r.recordedAt == null) return false;
      return r.recordedAt!.isAfter(cutoffDate);
    }).toList();

    // 4. Sort chronologically (Oldest first) for left-to-right chart rendering
    inPeriodRecords.sort((a, b) {
      final aDate = a.recordedAt ?? DateTime(1970);
      final bDate = b.recordedAt ?? DateTime(1970);
      return aDate.compareTo(bDate);
    });

    // 5. Build parsed chart points
    final List<VitalChartPoint> points = [];
    final List<FlSpot> primarySpots = [];
    final List<FlSpot> secondarySpots = [];

    int pointIndex = 0;
    for (final record in inPeriodRecords) {
      final primary = config.primaryValueExtractor(record);
      if (primary == null) continue;

      final secondary = config.secondaryValueExtractor != null
          ? config.secondaryValueExtractor!(record)
          : null;

      final point = VitalChartPoint(
        index: pointIndex,
        timestamp: record.recordedAt ?? DateTime.now(),
        primaryValue: primary,
        secondaryValue: secondary,
        notes: record.notes,
        rawRecord: record,
      );

      points.add(point);
      primarySpots.add(point.primarySpot);
      if (point.secondarySpot != null) {
        secondarySpots.add(point.secondarySpot!);
      }
      pointIndex++;
    }

    // 6. Calculate dynamic Y bounds with padding so curves don't clip
    double computedMinY = 0;
    double computedMaxY = 100;
    double interval = 20;

    if (points.isNotEmpty) {
      double minVal = double.infinity;
      double maxVal = -double.infinity;

      for (final p in points) {
        minVal = math.min(minVal, p.primaryValue);
        maxVal = math.max(maxVal, p.primaryValue);
        if (p.secondaryValue != null) {
          minVal = math.min(minVal, p.secondaryValue!);
          maxVal = math.max(maxVal, p.secondaryValue!);
        }
      }

      if (minVal == maxVal) {
        // Flat line padding
        minVal -= 10;
        maxVal += 10;
      }

      final diff = maxVal - minVal;
      final padding = math.max(diff * 0.15, config.decimalPrecision > 0 ? 1.0 : 5.0);

      computedMinY = (minVal - padding);
      computedMaxY = (maxVal + padding);

      // Enforce sensible clinical lower bounds (e.g. temperature won't go below 80, BP won't go below 30)
      if (config.type == VitalMetricType.temperature) {
        computedMinY = math.max(85.0, (computedMinY * 10).floor() / 10);
        computedMaxY = math.min(110.0, (computedMaxY * 10).ceil() / 10);
        interval = 2.0;
      } else if (config.type == VitalMetricType.bloodPressure) {
        computedMinY = math.max(30.0, (computedMinY / 10).floor() * 10);
        computedMaxY = (computedMaxY / 10).ceil() * 10;
        interval = math.max(20.0, ((computedMaxY - computedMinY) / 5).roundToDouble());
      } else if (config.type == VitalMetricType.heartRate) {
        computedMinY = math.max(30.0, (computedMinY / 10).floor() * 10);
        computedMaxY = (computedMaxY / 10).ceil() * 10;
        interval = math.max(20.0, ((computedMaxY - computedMinY) / 4).roundToDouble());
      } else if (config.type == VitalMetricType.bloodSugar) {
        computedMinY = math.max(40.0, (computedMinY / 20).floor() * 20);
        computedMaxY = (computedMaxY / 20).ceil() * 20;
        interval = math.max(20.0, ((computedMaxY - computedMinY) / 4).roundToDouble());
      } else {
        computedMinY = math.max(0.0, (computedMinY / 10).floor() * 10);
        computedMaxY = (computedMaxY / 10).ceil() * 10;
        interval = math.max(10.0, ((computedMaxY - computedMinY) / 4).roundToDouble());
      }
    }

    // 7. Format latest reading string
    String latestFormatted = "--";
    String updatedFormatted = "No readings";
    if (latestRecord != null) {
      latestFormatted = config.formatLatestReading(latestRecord);
      if (latestRecord.recordedAt != null) {
        updatedFormatted = formatRelativeDate(latestRecord.recordedAt!.toLocal());
      }
    }

    return ProcessedVitalChartData(
      config: config,
      period: period,
      points: points,
      primarySpots: primarySpots,
      secondarySpots: secondarySpots,
      minY: computedMinY,
      maxY: computedMaxY,
      yInterval: interval,
      latestRecord: latestRecord,
      latestValueFormatted: latestFormatted,
      lastUpdatedFormatted: updatedFormatted,
    );
  }

  /// Formats relative date/time cleanly without unnecessary verbosity
  static String formatRelativeDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final recordDate = DateTime(date.year, date.month, date.day);
    final timeStr = DateFormat("hh:mm a").format(date);

    if (recordDate == today) {
      return "Today, $timeStr";
    } else if (recordDate == today.subtract(const Duration(days: 1))) {
      return "Yesterday, $timeStr";
    } else if (now.year == date.year) {
      return "${DateFormat('dd MMM').format(date)}, $timeStr";
    } else {
      return "${DateFormat('dd MMM yyyy').format(date)}, $timeStr";
    }
  }

  /// Formats bottom X-axis title for a point index
  static String formatXAxisLabel(DateTime date, VitalPeriod period) {
    switch (period) {
      case VitalPeriod.sevenDays:
        return DateFormat("E").format(date); // e.g. Mon, Tue
      case VitalPeriod.thirtyDays:
        return DateFormat("dd/MM").format(date); // e.g. 14/09
      case VitalPeriod.threeMonths:
      case VitalPeriod.sixMonths:
        return DateFormat("dd MMM").format(date); // e.g. 12 Sep
      case VitalPeriod.oneYear:
        return DateFormat("MMM").format(date); // e.g. Sep
    }
  }
}
