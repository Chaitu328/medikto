import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';

/// Supported vital metric types.
enum VitalMetricType {
  bloodSugar,
  heartRate,
  temperature,
  bloodPressure,
  spo2,
  weight,
  respiratoryRate,
}

/// Comprehensive configuration for a vital metric in the trend chart system.
class VitalMetricConfig {
  final VitalMetricType type;
  final String typeKey; // Maps to VitalsModel.type (e.g. "sugar", "heartRate")
  final String displayName;
  final String shortName;
  final String unit;
  final IconData iconData;
  final Color primaryColor;
  final Color? secondaryColor;
  final bool isMultiSeries;
  final int decimalPrecision;
  final List<String> seriesLabels;
  final double? Function(VitalsModel) primaryValueExtractor;
  final double? Function(VitalsModel)? secondaryValueExtractor;

  const VitalMetricConfig({
    required this.type,
    required this.typeKey,
    required this.displayName,
    required this.shortName,
    required this.unit,
    required this.iconData,
    required this.primaryColor,
    this.secondaryColor,
    this.isMultiSeries = false,
    this.decimalPrecision = 0,
    required this.seriesLabels,
    required this.primaryValueExtractor,
    this.secondaryValueExtractor,
  });

  /// Formats a single reading or dual reading for presentation.
  String formatValue(double primary, [double? secondary]) {
    if (isMultiSeries && secondary != null) {
      return "${primary.toInt()}/${secondary.toInt()} $unit";
    }
    if (decimalPrecision > 0) {
      return "${primary.toStringAsFixed(decimalPrecision)} $unit";
    }
    return "${primary.toInt()} $unit";
  }

  /// Formats the latest reading directly from a [VitalsModel] instance.
  String formatLatestReading(VitalsModel record) {
    if (isMultiSeries) {
      final sys = record.systolic;
      final dia = record.diastolic;
      if (sys != null && dia != null) {
        return "$sys / $dia $unit";
      } else if (sys != null) {
        return "$sys $unit";
      }
      return "--";
    }

    final val = primaryValueExtractor(record);
    if (val == null) return "--";

    if (decimalPrecision > 0) {
      return "${val.toStringAsFixed(decimalPrecision)} $unit";
    }
    return "${val.toInt()} $unit";
  }
}

/// Central registry of all vital metric configurations.
class VitalMetricRegistry {
  static final VitalMetricConfig bloodSugar = VitalMetricConfig(
    type: VitalMetricType.bloodSugar,
    typeKey: "sugar",
    displayName: "Blood Sugar",
    shortName: "Blood Sugar",
    unit: "mg/dL",
    iconData: Icons.water_drop_outlined,
    primaryColor: AppColors.bloodSugar,
    decimalPrecision: 0,
    seriesLabels: const ["Glucose Level"],
    primaryValueExtractor: (v) => v.sugarLevel?.toDouble(),
  );

  static final VitalMetricConfig heartRate = VitalMetricConfig(
    type: VitalMetricType.heartRate,
    typeKey: "heartRate",
    displayName: "Heart Rate",
    shortName: "Heart Rate",
    unit: "BPM",
    iconData: Icons.favorite_outline,
    primaryColor: AppColors.heartRate,
    decimalPrecision: 0,
    seriesLabels: const ["Pulse Rate"],
    primaryValueExtractor: (v) => v.heartRate?.toDouble(),
  );

  static final VitalMetricConfig temperature = VitalMetricConfig(
    type: VitalMetricType.temperature,
    typeKey: "temperature",
    displayName: "Body Temperature",
    shortName: "Temperature",
    unit: "°F",
    iconData: Icons.thermostat_outlined,
    primaryColor: AppColors.temperature,
    decimalPrecision: 1,
    seriesLabels: const ["Body Temp"],
    primaryValueExtractor: (v) => v.temperature,
  );

  static final VitalMetricConfig bloodPressure = VitalMetricConfig(
    type: VitalMetricType.bloodPressure,
    typeKey: "bloodPressure",
    displayName: "Blood Pressure",
    shortName: "Blood Pressure",
    unit: "mmHg",
    iconData: Icons.speed_outlined,
    primaryColor: AppColors.bloodPressure,
    secondaryColor: AppColors.caretakerPurple,
    isMultiSeries: true,
    decimalPrecision: 0,
    seriesLabels: const ["Systolic", "Diastolic"],
    primaryValueExtractor: (v) => v.systolic?.toDouble(),
    secondaryValueExtractor: (v) => v.diastolic?.toDouble(),
  );

  // Future metric configurations ready for seamless extension:
  static final VitalMetricConfig spo2 = VitalMetricConfig(
    type: VitalMetricType.spo2,
    typeKey: "spo2",
    displayName: "Oxygen Saturation",
    shortName: "SpO₂",
    unit: "%",
    iconData: Icons.air_outlined,
    primaryColor: const Color(0xFF00E676),
    decimalPrecision: 0,
    seriesLabels: const ["SpO₂"],
    primaryValueExtractor: (v) => null, // Placeholder for future data model expansion
  );

  static final VitalMetricConfig weight = VitalMetricConfig(
    type: VitalMetricType.weight,
    typeKey: "weight",
    displayName: "Body Weight",
    shortName: "Weight",
    unit: "kg",
    iconData: Icons.monitor_weight_outlined,
    primaryColor: const Color(0xFFAB47BC),
    decimalPrecision: 1,
    seriesLabels: const ["Weight"],
    primaryValueExtractor: (v) => null,
  );

  static final VitalMetricConfig respiratoryRate = VitalMetricConfig(
    type: VitalMetricType.respiratoryRate,
    typeKey: "respiratoryRate",
    displayName: "Respiratory Rate",
    shortName: "Resp. Rate",
    unit: "breaths/min",
    iconData: Icons.air_outlined,
    primaryColor: const Color(0xFF26C6DA),
    decimalPrecision: 0,
    seriesLabels: const ["Resp Rate"],
    primaryValueExtractor: (v) => null,
  );

  /// Primary active vital metrics rendered in the trend chart
  static final List<VitalMetricConfig> activeMetrics = [
    bloodSugar,
    heartRate,
    temperature,
    bloodPressure,
  ];

  /// All supported vital configurations
  static final List<VitalMetricConfig> allMetrics = [
    bloodSugar,
    heartRate,
    temperature,
    bloodPressure,
    spo2,
    weight,
    respiratoryRate,
  ];

  /// Resolves configuration by [VitalMetricType]
  static VitalMetricConfig getConfig(VitalMetricType type) {
    switch (type) {
      case VitalMetricType.bloodSugar:
        return bloodSugar;
      case VitalMetricType.heartRate:
        return heartRate;
      case VitalMetricType.temperature:
        return temperature;
      case VitalMetricType.bloodPressure:
        return bloodPressure;
      case VitalMetricType.spo2:
        return spo2;
      case VitalMetricType.weight:
        return weight;
      case VitalMetricType.respiratoryRate:
        return respiratoryRate;
    }
  }

  /// Resolves configuration by backend type string (e.g. "sugar", "bloodPressure")
  static VitalMetricConfig? getConfigByKey(String key) {
    final lowerKey = key.toLowerCase();
    for (final config in allMetrics) {
      if (config.typeKey.toLowerCase() == lowerKey ||
          config.displayName.toLowerCase() == lowerKey ||
          config.shortName.toLowerCase() == lowerKey) {
        return config;
      }
    }
    return null;
  }
}
