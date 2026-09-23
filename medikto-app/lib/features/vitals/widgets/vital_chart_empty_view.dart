import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/vitals/models/vital_metric_type.dart';

/// Professional empty state view for vital trend charts when no readings exist.
class VitalChartEmptyView extends StatelessWidget {
  final VitalMetricConfig config;
  final String periodLabel;

  const VitalChartEmptyView({
    super.key,
    required this.config,
    required this.periodLabel,
  });

  @override
  Widget build(BuildContext context) {
    final theme = context.themeColors;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 28),
      decoration: BoxDecoration(
        color: theme.cardSecondary.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.borderSubtle.withValues(alpha: 0.6)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: config.primaryColor.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(
              config.iconData,
              color: config.primaryColor,
              size: 24,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            "No ${config.displayName} Data",
            style: TextStyle(
              color: theme.textPrimary,
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "No readings recorded in the last $periodLabel.\nSelect another time period or log a new measurement.",
            textAlign: TextAlign.center,
            style: TextStyle(
              color: theme.textSecondary,
              fontSize: 12,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}
