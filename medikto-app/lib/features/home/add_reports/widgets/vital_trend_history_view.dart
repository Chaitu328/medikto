import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
import 'package:medikto/features/home/add_reports/utils/vitals_pdf_helper.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:medikto/features/vitals/models/vital_metric_type.dart';
import 'package:medikto/features/vitals/widgets/vitals_trend_card.dart';
import 'package:share_plus/share_plus.dart';

class VitalTrendHistoryView extends ConsumerWidget {
  final String vitalType;
  final String title;
  final String unit;
  final Color accentColor;
  final VoidCallback onAddTap;

  const VitalTrendHistoryView({
    super.key,
    required this.vitalType,
    required this.title,
    required this.unit,
    required this.accentColor,
    required this.onAddTap,
  });

  Future<void> _shareVitals(WidgetRef ref, BuildContext context, List<VitalsModel> records) async {
    if (records.isEmpty) {
      Share.share("No $title records recorded yet in Medikto.");
      return;
    }

    final profileAsync = ref.read(getProfileProvider);
    String? patientName;
    if (profileAsync.value?.data is ProfileModel) {
      final p = profileAsync.value!.data as ProfileModel;
      patientName = p.firstName;
    }

    await VitalsPdfHelper.generateAndShareVitalsPdf(
      records: records,
      patientName: patientName,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = context.themeColors;
    final vitalsAsync = ref.watch(getVitalsProvider);

    return vitalsAsync.when(
      data: (responseData) {
        final List<VitalsModel> allVitals =
            (responseData.data as List?)?.cast<VitalsModel>() ?? [];

        final records = allVitals.where((e) => e.type == vitalType).toList();
        records.sort((a, b) {
          final aDate = a.recordedAt ?? DateTime(1970);
          final bDate = b.recordedAt ?? DateTime(1970);
          return bDate.compareTo(aDate); // Newest first
        });

        if (records.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: theme.card,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.show_chart, color: accentColor, size: 48),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "No $title History",
                    style: TextStyle(
                      color: theme.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "You haven't recorded any readings yet.\nTap below to add your first reading.",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: theme.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentColor,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    onPressed: onAddTap,
                    icon: const Icon(Icons.add, size: 20),
                    label: const Text("Add New Reading", style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          );
        }

        final latest = records.first;

        return RefreshIndicator(
          color: accentColor,
          backgroundColor: theme.card,
          onRefresh: () async {
            ref.invalidate(getVitalsProvider);
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            children: [
              // 1. Current / Latest Reading Card
              _buildLatestReadingCard(context, latest),
              const SizedBox(height: 16),

              // 2. Trend Graph Card
              VitalsTrendCard(
                initialConfig: VitalMetricRegistry.getConfigByKey(vitalType),
                lockMetric: true,
                customRecords: records,
              ),
              const SizedBox(height: 20),

              // 3. Historical Log Header & Share
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "PREVIOUS READINGS",
                    style: TextStyle(
                      color: theme.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  InkWell(
                    onTap: () => _shareVitals(ref, context, records),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: accentColor.withAlpha(25),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: accentColor.withAlpha(60)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.share, color: accentColor, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            "Share",
                            style: TextStyle(
                              color: accentColor,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 🔹 READINGS LIST
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: records.length,
                itemBuilder: (context, index) {
                  return _buildReadingItem(context, records[index]);
                },
              ),
            ],
          ),
        );
      },
      loading: () => Center(
        child: CircularProgressIndicator(color: accentColor),
      ),
      error: (err, st) => Center(
        child: Text(
          "Failed to load vital readings: $err",
          style: const TextStyle(color: Colors.redAccent),
        ),
      ),
    );
  }

  Widget _buildLatestReadingCard(BuildContext context, VitalsModel latest) {
    final theme = context.themeColors;
    String valueStr = "";

    switch (vitalType) {
      case "bloodPressure":
        valueStr = "${latest.systolic ?? '--'}/${latest.diastolic ?? '--'}";
        break;
      case "heartRate":
        valueStr = "${latest.heartRate ?? '--'}";
        break;
      case "temperature":
        valueStr = "${latest.temperature ?? '--'}";
        break;
      case "sugar":
        valueStr = "${latest.sugarLevel ?? '--'}";
        break;
    }

    final dateStr = latest.recordedAt != null
        ? DateFormat("dd MMM yyyy, hh:mm a").format(latest.recordedAt!.toLocal())
        : "Recent";

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: theme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: accentColor.withAlpha(40)),
        gradient: LinearGradient(
          colors: [accentColor.withAlpha(20), theme.card],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "CURRENT / LATEST READING",
                style: TextStyle(color: theme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    valueStr,
                    style: TextStyle(
                      color: accentColor,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    unit,
                    style: TextStyle(color: theme.textSecondary, fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                "Recorded on $dateStr",
                style: TextStyle(color: theme.textMuted, fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTrendChartCard(BuildContext context, List<VitalsModel> records) {
    return VitalsTrendCard(
      initialConfig: VitalMetricRegistry.getConfigByKey(vitalType),
      lockMetric: true,
      customRecords: records,
    );
  }

  Widget _buildReadingItem(BuildContext context, VitalsModel record) {
    final theme = context.themeColors;
    String valStr = "";

    switch (vitalType) {
      case "bloodPressure":
        valStr = "${record.systolic ?? '--'}/${record.diastolic ?? '--'} $unit";
        break;
      case "heartRate":
        valStr = "${record.heartRate ?? '--'} $unit";
        break;
      case "temperature":
        valStr = "${record.temperature ?? '--'} $unit";
        break;
      case "sugar":
        valStr = "${record.sugarLevel ?? '--'} $unit";
        break;
    }

    final dateStr = record.recordedAt != null
        ? DateFormat("dd MMM yyyy • hh:mm a").format(record.recordedAt!.toLocal())
        : "Recent";

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: theme.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: theme.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            valStr,
            style: TextStyle(
              color: theme.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            dateStr,
            style: TextStyle(color: theme.textMuted, fontSize: 12),
          ),
          if (record.notes != null && record.notes!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              "Note: ${record.notes}",
              style: TextStyle(color: theme.textSecondary, fontSize: 12, fontStyle: FontStyle.italic),
            ),
          ],
        ],
      ),
    );
  }
}
