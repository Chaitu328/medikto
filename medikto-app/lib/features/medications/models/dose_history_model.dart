import 'package:flutter/foundation.dart';
import 'package:medikto/features/medications/models/today_scheduled_model.dart';

@immutable
class DoseHistoryQuery {
  final String? startDate;
  final String? endDate;
  final String? timeframe; // 'day', 'week', 'month', 'year', 'custom'
  final String? patientId;

  const DoseHistoryQuery({
    this.startDate,
    this.endDate,
    this.timeframe,
    this.patientId,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DoseHistoryQuery &&
          runtimeType == other.runtimeType &&
          startDate == other.startDate &&
          endDate == other.endDate &&
          timeframe == other.timeframe &&
          patientId == other.patientId;

  @override
  int get hashCode =>
      (startDate?.hashCode ?? 0) ^
      (endDate?.hashCode ?? 0) ^
      (timeframe?.hashCode ?? 0) ^
      (patientId?.hashCode ?? 0);

  String get cacheKey =>
      '${patientId ?? "self"}:${startDate ?? ""}:${endDate ?? ""}:${timeframe ?? "custom"}';
}

class DoseHistorySummary {
  final int total;
  final int taken;
  final int missed;
  final int pending;
  final int adherencePercentage;

  DoseHistorySummary({
    this.total = 0,
    this.taken = 0,
    this.missed = 0,
    this.pending = 0,
    this.adherencePercentage = 0,
  });

  factory DoseHistorySummary.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DoseHistorySummary();
    return DoseHistorySummary(
      total: json['total'] as int? ?? 0,
      taken: json['taken'] as int? ?? 0,
      missed: json['missed'] as int? ?? 0,
      pending: json['pending'] as int? ?? 0,
      adherencePercentage: json['adherencePercentage'] as int? ?? 0,
    );
  }
}

class TimelinePoint {
  final String date;
  final String label;
  final int taken;
  final int missed;
  final int pending;
  final int total;

  TimelinePoint({
    required this.date,
    required this.label,
    this.taken = 0,
    this.missed = 0,
    this.pending = 0,
    this.total = 0,
  });

  factory TimelinePoint.fromJson(Map<String, dynamic> json) {
    return TimelinePoint(
      date: json['date'] as String? ?? '',
      label: json['label'] as String? ?? '',
      taken: json['taken'] as int? ?? 0,
      missed: json['missed'] as int? ?? 0,
      pending: json['pending'] as int? ?? 0,
      total: json['total'] as int? ?? 0,
    );
  }
}

class DoseHistoryResponse {
  final bool success;
  final String timeframe;
  final String? startDate;
  final String? endDate;
  final DoseHistorySummary summary;
  final List<TimelinePoint> timeline;
  final List<TodayScheduleModel> schedules;

  DoseHistoryResponse({
    this.success = true,
    this.timeframe = 'custom',
    this.startDate,
    this.endDate,
    required this.summary,
    this.timeline = const [],
    this.schedules = const [],
  });

  factory DoseHistoryResponse.fromJson(Map<String, dynamic> json) {
    final rawSchedules = json['schedules'] as List? ?? [];
    final schedulesList = rawSchedules
        .map((e) => TodayScheduleModel.fromJson(e is Map<String, dynamic> ? e : {}))
        .toList();

    final rawTimeline = json['timeline'] as List? ?? [];
    final timelineList = rawTimeline
        .map((e) => TimelinePoint.fromJson(e is Map<String, dynamic> ? e : {}))
        .toList();

    return DoseHistoryResponse(
      success: json['success'] as bool? ?? true,
      timeframe: json['timeframe'] as String? ?? 'custom',
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
      summary: DoseHistorySummary.fromJson(json['summary'] as Map<String, dynamic>?),
      timeline: timelineList,
      schedules: schedulesList,
    );
  }
}
