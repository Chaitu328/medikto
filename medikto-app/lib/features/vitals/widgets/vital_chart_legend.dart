import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/vitals/models/vital_chart_point.dart';
import 'package:medikto/features/vitals/models/vital_metric_type.dart';

/// Reusable legend for single, dual, and multi-vital series trend charts.
class VitalChartLegend extends StatelessWidget {
  final VitalMetricConfig? config;
  final ProcessedVitalChartData? chartData;

  const VitalChartLegend({
    super.key,
    this.config,
    this.chartData,
  });

  @override
  Widget build(BuildContext context) {
    final theme = context.themeColors;

    // 1. Multi-vital / Combined view legend
    if (chartData != null && chartData!.isAllVitals) {
      if (chartData!.seriesList.isEmpty) return const SizedBox.shrink();

      return Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 14,
        runSpacing: 8,
        children: chartData!.seriesList.map((series) {
          return _buildLegendItem(
            color: series.color,
            label: "${series.name} (${series.unit})",
            textColor: theme.textSecondary,
          );
        }).toList(),
      );
    }

    final activeConfig = config ?? chartData?.config;
    if (activeConfig == null) return const SizedBox.shrink();

    // 2. Dual series (e.g. Blood Pressure Systolic + Diastolic)
    if (activeConfig.isMultiSeries) {
      return Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 16,
        runSpacing: 6,
        children: [
          _buildLegendItem(
            color: activeConfig.primaryColor,
            label: activeConfig.seriesLabels.isNotEmpty
                ? "${activeConfig.seriesLabels[0]} (${activeConfig.unit})"
                : "Systolic (${activeConfig.unit})",
            textColor: theme.textSecondary,
          ),
          _buildLegendItem(
            color: activeConfig.secondaryColor ?? const Color(0xFFBA68C8),
            label: activeConfig.seriesLabels.length > 1
                ? "${activeConfig.seriesLabels[1]} (${activeConfig.unit})"
                : "Diastolic (${activeConfig.unit})",
            textColor: theme.textSecondary,
          ),
        ],
      );
    }

    // 3. Single series
    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 16,
      runSpacing: 6,
      children: [
        _buildLegendItem(
          color: activeConfig.primaryColor,
          label: "${activeConfig.displayName} (${activeConfig.unit})",
          textColor: theme.textSecondary,
        ),
      ],
    );
  }

  Widget _buildLegendItem({
    required Color color,
    required String label,
    required Color textColor,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            color: textColor,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
