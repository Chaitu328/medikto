import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
import 'package:medikto/features/vitals/models/vital_chart_point.dart';
import 'package:medikto/features/vitals/models/vital_metric_type.dart';
import 'package:medikto/features/vitals/widgets/vital_chart_empty_view.dart';
import 'package:medikto/features/vitals/widgets/vital_chart_legend.dart';
import 'package:medikto/features/vitals/widgets/vital_chart_view.dart';
import 'package:medikto/features/vitals/widgets/vital_metric_selector.dart';
import 'package:medikto/features/vitals/widgets/vital_period_filter.dart';

/// Master reusable Vitals Trend Card supporting multiple vitals, dual-series Blood Pressure,
/// period filtering, interactive tooltips, and state management.
class VitalsTrendCard extends ConsumerStatefulWidget {
  final VitalMetricConfig? initialConfig;
  final VitalPeriod initialPeriod;
  final bool lockMetric; // If true, metric selector is disabled
  final List<VitalsModel>? customRecords; // If provided, uses these records instead of fetching

  const VitalsTrendCard({
    super.key,
    this.initialConfig,
    this.initialPeriod = VitalPeriod.sevenDays,
    this.lockMetric = false,
    this.customRecords,
  });

  @override
  ConsumerState<VitalsTrendCard> createState() => _VitalsTrendCardState();
}

class _VitalsTrendCardState extends ConsumerState<VitalsTrendCard> {
  late VitalMetricConfig _selectedConfig;
  late VitalPeriod _selectedPeriod;

  @override
  void initState() {
    super.initState();
    _selectedConfig =
        widget.initialConfig ?? VitalMetricRegistry.bloodSugar;
    _selectedPeriod = widget.initialPeriod;
  }

  @override
  void didUpdateWidget(covariant VitalsTrendCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialConfig != null &&
        widget.initialConfig != oldWidget.initialConfig) {
      _selectedConfig = widget.initialConfig!;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.customRecords != null) {
      return _buildCardContent(context, widget.customRecords!);
    }

    final vitalsAsync = ref.watch(getVitalsProvider);

    return vitalsAsync.when(
      data: (responseData) {
        final List<VitalsModel> records =
            (responseData.data as List?)?.cast<VitalsModel>() ?? [];
        return _buildCardContent(context, records);
      },
      loading: () => _buildLoadingCard(context),
      error: (err, _) => _buildErrorCard(context, err.toString()),
    );
  }

  Widget _buildCardContent(BuildContext context, List<VitalsModel> records) {
    final theme = context.themeColors;

    // Process data for the selected metric and period
    final chartData = VitalChartDataProcessor.process(
      allRecords: records,
      config: _selectedConfig,
      period: _selectedPeriod,
    );

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: theme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.borderSubtle),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 🔹 1. Header: Title + Metric Selector
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: _selectedConfig.primaryColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _selectedConfig.iconData,
                  color: _selectedConfig.primaryColor,
                  size: 15,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  "Vitals Trends",
                  style: TextStyle(
                    color: theme.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              Flexible(
                child: VitalMetricSelector(
                  selectedConfig: _selectedConfig,
                  availableConfigs: VitalMetricRegistry.activeMetrics,
                  isReadOnly: widget.lockMetric,
                  onMetricChanged: (newConfig) {
                    setState(() => _selectedConfig = newConfig);
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // 🔹 2. Period Filter Pills (7D, 30D, 3M, 6M, 1Y)
          VitalPeriodFilter(
            selectedPeriod: _selectedPeriod,
            activeColor: _selectedConfig.primaryColor,
            onPeriodChanged: (newPeriod) {
              setState(() => _selectedPeriod = newPeriod);
            },
          ),

          const SizedBox(height: 16),

          // 🔹 3. Latest Reading Banner
          _buildLatestStatsRow(context, chartData),

          const SizedBox(height: 16),

          // 🔹 4. Chart Visualization or Empty State
          if (chartData.hasData) ...[
            VitalChartView(
              chartData: chartData,
              height: 190,
            ),
            const SizedBox(height: 12),
            // 🔹 5. Legend
            VitalChartLegend(config: _selectedConfig),
          ] else ...[
            VitalChartEmptyView(
              config: _selectedConfig,
              periodLabel: _selectedPeriod.fullLabel,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLatestStatsRow(
    BuildContext context,
    ProcessedVitalChartData chartData,
  ) {
    final theme = context.themeColors;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: theme.cardSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: theme.borderSubtle.withValues(alpha: 0.8)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "LATEST READING",
                  style: TextStyle(
                    color: theme.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  chartData.latestValueFormatted,
                  style: TextStyle(
                    color: _selectedConfig.primaryColor,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "LAST RECORDED",
                  style: TextStyle(
                    color: theme.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  chartData.lastUpdatedFormatted,
                  style: TextStyle(
                    color: theme.textSecondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingCard(BuildContext context) {
    final theme = context.themeColors;

    return Container(
      padding: const EdgeInsets.all(20),
      height: 320,
      decoration: BoxDecoration(
        color: theme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.borderSubtle),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                color: theme.accentPrimary,
                strokeWidth: 2.5,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              "Loading vital trends...",
              style: TextStyle(
                color: theme.textSecondary,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorCard(BuildContext context, String error) {
    final theme = context.themeColors;

    return Container(
      padding: const EdgeInsets.all(20),
      height: 240,
      decoration: BoxDecoration(
        color: theme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.borderSubtle),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 36),
            const SizedBox(height: 10),
            Text(
              "Unable to load vital trends",
              style: TextStyle(
                color: theme.textPrimary,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.cardSecondary,
                foregroundColor: theme.textPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: theme.borderSubtle),
                ),
              ),
              onPressed: () => ref.invalidate(getVitalsProvider),
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text("Retry", style: TextStyle(fontSize: 13)),
            ),
          ],
        ),
      ),
    );
  }
}
