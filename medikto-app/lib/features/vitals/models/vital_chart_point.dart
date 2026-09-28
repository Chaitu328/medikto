import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/app_themes.dart';
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

/// Represents a single line series in a chart (e.g. Systolic BP, Heart Rate, Glucose).
class VitalChartSeries {
  final String id;
  final String name;
  final String unit;
  final Color color;
  final List<FlSpot> spots;
  final VitalMetricConfig? config;
  final bool isSecondary;

  const VitalChartSeries({
    required this.id,
    required this.name,
    required this.unit,
    required this.color,
    required this.spots,
    this.config,
    this.isSecondary = false,
  });
}

/// Results of processing raw vitals data for chart presentation.
class ProcessedVitalChartData {
  final VitalMetricConfig? config;
  final bool isAllVitals;
  final VitalPeriod period;
  final List<VitalChartPoint> points;
  final List<DateTime> timestamps;
  final List<VitalChartSeries> seriesList;
  final List<FlSpot> primarySpots;
  final List<FlSpot> secondarySpots;
  final double minY;
  final double maxY;
  final double yInterval;
  final VitalsModel? latestRecord;
  final String latestValueFormatted;
  final String lastUpdatedFormatted;

  const ProcessedVitalChartData({
    this.config,
    this.isAllVitals = false,
    required this.period,
    required this.points,
    this.timestamps = const [],
    this.seriesList = const [],
    required this.primarySpots,
    required this.secondarySpots,
    required this.minY,
    required this.maxY,
    required this.yInterval,
    this.latestRecord,
    required this.latestValueFormatted,
    required this.lastUpdatedFormatted,
  });

  bool get isEmpty =>
      isAllVitals ? seriesList.every((s) => s.spots.isEmpty) : points.isEmpty;
  bool get hasData =>
      isAllVitals ? seriesList.any((s) => s.spots.isNotEmpty) : points.isNotEmpty;
}

/// Clinical processor to parse, filter, and calculate chart bounds without inventing data.
class VitalChartDataProcessor {
  /// Processes records for a single vital metric config.
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
    final List<DateTime> timestamps = [];

    int pointIndex = 0;
    for (final record in inPeriodRecords) {
      final primary = config.primaryValueExtractor(record);
      if (primary == null) continue;

      final secondary = config.secondaryValueExtractor != null
          ? config.secondaryValueExtractor!(record)
          : null;

      final recordTime = record.recordedAt ?? DateTime.now();
      final point = VitalChartPoint(
        index: pointIndex,
        timestamp: recordTime,
        primaryValue: primary,
        secondaryValue: secondary,
        notes: record.notes,
        rawRecord: record,
      );

      points.add(point);
      timestamps.add(recordTime);
      primarySpots.add(point.primarySpot);
      if (point.secondarySpot != null) {
        secondarySpots.add(point.secondarySpot!);
      }
      pointIndex++;
    }

    // Build series list for uniform rendering
    final List<VitalChartSeries> seriesList = [];
    if (primarySpots.isNotEmpty) {
      seriesList.add(
        VitalChartSeries(
          id: "${config.typeKey}_primary",
          name: config.isMultiSeries && config.seriesLabels.isNotEmpty
              ? config.seriesLabels[0]
              : config.displayName,
          unit: config.unit,
          color: config.primaryColor,
          spots: primarySpots,
          config: config,
        ),
      );
    }
    if (config.isMultiSeries && secondarySpots.isNotEmpty) {
      seriesList.add(
        VitalChartSeries(
          id: "${config.typeKey}_secondary",
          name: config.seriesLabels.length > 1
              ? config.seriesLabels[1]
              : "Diastolic",
          unit: config.unit,
          color: config.secondaryColor ?? const Color(0xFFBA68C8),
          spots: secondarySpots,
          config: config,
          isSecondary: true,
        ),
      );
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
      final padding =
          math.max(diff * 0.15, config.decimalPrecision > 0 ? 1.0 : 5.0);

      computedMinY = (minVal - padding);
      computedMaxY = (maxVal + padding);

      // Enforce sensible clinical lower bounds
      if (config.type == VitalMetricType.temperature) {
        computedMinY = math.max(85.0, (computedMinY * 10).floor() / 10);
        computedMaxY = math.min(110.0, (computedMaxY * 10).ceil() / 10);
        interval = 2.0;
      } else if (config.type == VitalMetricType.bloodPressure) {
        computedMinY = math.max(30.0, (computedMinY / 10).floor() * 10);
        computedMaxY = (computedMaxY / 10).ceil() * 10;
        interval =
            math.max(20.0, ((computedMaxY - computedMinY) / 5).roundToDouble());
      } else if (config.type == VitalMetricType.heartRate) {
        computedMinY = math.max(30.0, (computedMinY / 10).floor() * 10);
        computedMaxY = (computedMaxY / 10).ceil() * 10;
        interval =
            math.max(20.0, ((computedMaxY - computedMinY) / 4).roundToDouble());
      } else if (config.type == VitalMetricType.bloodSugar) {
        computedMinY = math.max(40.0, (computedMinY / 20).floor() * 20);
        computedMaxY = (computedMaxY / 20).ceil() * 20;
        interval =
            math.max(20.0, ((computedMaxY - computedMinY) / 4).roundToDouble());
      } else {
        computedMinY = math.max(0.0, (computedMinY / 10).floor() * 10);
        computedMaxY = (computedMaxY / 10).ceil() * 10;
        interval =
            math.max(10.0, ((computedMaxY - computedMinY) / 4).roundToDouble());
      }
    }

    // 7. Format latest reading string
    String latestFormatted = "--";
    String updatedFormatted = "No readings";
    if (latestRecord != null) {
      latestFormatted = config.formatLatestReading(latestRecord);
      if (latestRecord.recordedAt != null) {
        updatedFormatted =
            formatRelativeDate(latestRecord.recordedAt!.toLocal());
      }
    }

    return ProcessedVitalChartData(
      config: config,
      isAllVitals: false,
      period: period,
      points: points,
      timestamps: timestamps,
      seriesList: seriesList,
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

  /// Processes all records across all vital metric types for a combined multi-vital graph.
  static ProcessedVitalChartData processAll({
    required List<VitalsModel> allRecords,
    required VitalPeriod period,
  }) {
    // 1. Find absolute latest recorded vital across all types
    final allSorted = List<VitalsModel>.from(allRecords)
      ..sort((a, b) {
        final aDate = a.recordedAt ?? DateTime(1970);
        final bDate = b.recordedAt ?? DateTime(1970);
        return bDate.compareTo(aDate); // Newest first
      });
    final VitalsModel? latestRecord =
        allSorted.isNotEmpty ? allSorted.first : null;

    // 2. Filter records within period
    final cutoffDate = period.startDate;
    final inPeriodRecords = allRecords.where((r) {
      if (r.recordedAt == null) return false;
      return r.recordedAt!.isAfter(cutoffDate);
    }).toList();

    // 3. Collect unique chronological timestamps
    final Set<int> timeSet = {};
    for (final r in inPeriodRecords) {
      if (r.recordedAt != null) {
        // Round to nearest minute to group concurrent readings together
        final dt = r.recordedAt!;
        final rounded = DateTime(dt.year, dt.month, dt.day, dt.hour, dt.minute);
        timeSet.add(rounded.millisecondsSinceEpoch);
      }
    }

    final List<DateTime> sortedTimestamps =
        timeSet.map((ms) => DateTime.fromMillisecondsSinceEpoch(ms)).toList()
          ..sort();

    // Helper to find closest timestamp index
    int findTimeIndex(DateTime dt) {
      final rounded = DateTime(dt.year, dt.month, dt.day, dt.hour, dt.minute);
      final idx = sortedTimestamps.indexOf(rounded);
      if (idx != -1) return idx;

      int closestIdx = 0;
      int minDiff = double.maxFinite.toInt();
      for (int i = 0; i < sortedTimestamps.length; i++) {
        final diff =
            (sortedTimestamps[i].difference(dt).inSeconds).abs();
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      return closestIdx;
    }

    // 4. Build series for each supported vital config
    final List<VitalChartSeries> seriesList = [];
    final List<VitalChartPoint> allPoints = [];

    double minVal = double.infinity;
    double maxVal = -double.infinity;

    for (final config in VitalMetricRegistry.activeMetrics) {
      final typeRecords = inPeriodRecords.where((r) {
        return r.type.toLowerCase() == config.typeKey.toLowerCase();
      }).toList();

      if (typeRecords.isEmpty) continue;

      final List<FlSpot> primarySpots = [];
      final List<FlSpot> secondarySpots = [];

      for (final r in typeRecords) {
        final primary = config.primaryValueExtractor(r);
        if (primary == null) continue;

        final secondary = config.secondaryValueExtractor != null
            ? config.secondaryValueExtractor!(r)
            : null;

        final timeIdx = findTimeIndex(r.recordedAt ?? DateTime.now());
        primarySpots.add(FlSpot(timeIdx.toDouble(), primary));
        minVal = math.min(minVal, primary);
        maxVal = math.max(maxVal, primary);

        if (secondary != null) {
          secondarySpots.add(FlSpot(timeIdx.toDouble(), secondary));
          minVal = math.min(minVal, secondary);
          maxVal = math.max(maxVal, secondary);
        }

        allPoints.add(
          VitalChartPoint(
            index: timeIdx,
            timestamp: r.recordedAt ?? DateTime.now(),
            primaryValue: primary,
            secondaryValue: secondary,
            notes: r.notes,
            rawRecord: r,
          ),
        );
      }

      // Sort spots by x
      primarySpots.sort((a, b) => a.x.compareTo(b.x));
      secondarySpots.sort((a, b) => a.x.compareTo(b.x));

      if (config.isMultiSeries) {
        if (primarySpots.isNotEmpty) {
          seriesList.add(
            VitalChartSeries(
              id: "${config.typeKey}_systolic",
              name: "BP Systolic",
              unit: config.unit,
              color: config.primaryColor,
              spots: primarySpots,
              config: config,
            ),
          );
        }
        if (secondarySpots.isNotEmpty) {
          seriesList.add(
            VitalChartSeries(
              id: "${config.typeKey}_diastolic",
              name: "BP Diastolic",
              unit: config.unit,
              color: config.secondaryColor ?? const Color(0xFFBA68C8),
              spots: secondarySpots,
              config: config,
              isSecondary: true,
            ),
          );
        }
      } else {
        if (primarySpots.isNotEmpty) {
          seriesList.add(
            VitalChartSeries(
              id: config.typeKey,
              name: config.displayName,
              unit: config.unit,
              color: config.primaryColor,
              spots: primarySpots,
              config: config,
            ),
          );
        }
      }
    }

    // 5. Dynamic Y bounds
    double computedMinY = 30;
    double computedMaxY = 180;
    double interval = 30;

    if (minVal != double.infinity && maxVal != -double.infinity) {
      if (minVal == maxVal) {
        minVal -= 15;
        maxVal += 15;
      }
      final diff = maxVal - minVal;
      final padding = math.max(diff * 0.15, 10.0);

      computedMinY = math.max(0.0, ((minVal - padding) / 10).floor() * 10);
      computedMaxY = ((maxVal + padding) / 10).ceil() * 10;
      interval = math.max(20.0, ((computedMaxY - computedMinY) / 5).roundToDouble());
    }

    // 6. Latest reading formatting
    String latestFormatted = "--";
    String updatedFormatted = "No readings";
    if (latestRecord != null) {
      final latestConfig =
          VitalMetricRegistry.getConfigByKey(latestRecord.type);
      if (latestConfig != null) {
        latestFormatted =
            "${latestConfig.displayName}: ${latestConfig.formatLatestReading(latestRecord)}";
      } else {
        latestFormatted = "Recorded";
      }
      if (latestRecord.recordedAt != null) {
        updatedFormatted =
            formatRelativeDate(latestRecord.recordedAt!.toLocal());
      }
    }

    return ProcessedVitalChartData(
      config: null,
      isAllVitals: true,
      period: period,
      points: allPoints,
      timestamps: sortedTimestamps,
      seriesList: seriesList,
      primarySpots: const [],
      secondarySpots: const [],
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
