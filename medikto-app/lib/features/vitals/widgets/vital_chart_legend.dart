import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/vitals/models/vital_metric_type.dart';

/// Reusable legend for single and dual series vital trend charts.
class VitalChartLegend extends StatelessWidget {
  final VitalMetricConfig config;

  const VitalChartLegend({super.key, required this.config});

  @override
  Widget build(BuildContext context) {
    final theme = context.themeColors;

    if (config.isMultiSeries) {
      return Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 16,
        runSpacing: 6,
        children: [
          _buildLegendItem(
            color: config.primaryColor,
            label: config.seriesLabels.isNotEmpty
                ? "${config.seriesLabels[0]} (${config.unit})"
                : "Systolic (${config.unit})",
            textColor: theme.textSecondary,
          ),
          _buildLegendItem(
            color: config.secondaryColor ?? const Color(0xFFBA68C8),
            label: config.seriesLabels.length > 1
                ? "${config.seriesLabels[1]} (${config.unit})"
                : "Diastolic (${config.unit})",
            textColor: theme.textSecondary,
          ),
        ],
      );
    }

    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 16,
      runSpacing: 6,
      children: [
        _buildLegendItem(
          color: config.primaryColor,
          label: "${config.displayName} (${config.unit})",
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
          width: 12,
          height: 4,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            color: textColor,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
