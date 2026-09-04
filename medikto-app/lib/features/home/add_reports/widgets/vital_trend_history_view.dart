import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
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

  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);

  void _shareVitals(List<VitalsModel> records) {
    if (records.isEmpty) {
      Share.share("No $title records recorded yet in Medikto.");
      return;
    }

    final buffer = StringBuffer();
    buffer.writeln("📋 Medikto Health Record — $title");
    buffer.writeln("--------------------------------------");

    for (int i = 0; i < records.length && i < 15; i++) {
      final r = records[i];
      final dateStr = r.recordedAt != null
          ? DateFormat("dd MMM yyyy, hh:mm a").format(r.recordedAt!.toLocal())
          : "N/A";

      String val = "";
      String status = "";

      switch (vitalType) {
        case "bloodPressure":
          val = "${r.systolic ?? '--'}/${r.diastolic ?? '--'} $unit";
          status = r.bloodPressureStatus ?? "";
          break;
        case "heartRate":
          val = "${r.heartRate ?? '--'} $unit";
          status = r.heartRateStatus ?? "";
          break;
        case "temperature":
          val = "${r.temperature ?? '--'} $unit";
          status = r.temperatureStatus ?? "";
          break;
        case "sugar":
          val = "${r.sugarLevel ?? '--'} $unit";
          status = r.sugarStatus ?? "";
          break;
      }

      buffer.writeln("• $dateStr: $val ${status.isNotEmpty ? '($status)' : ''}");
      if (r.notes != null && r.notes!.isNotEmpty) {
        buffer.writeln("  Notes: ${r.notes}");
      }
    }

    buffer.writeln("--------------------------------------");
    buffer.writeln("Generated via Medikto Health App");

    Share.share(buffer.toString(), subject: "$title History Report");
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
                      color: surfaceColor,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.show_chart, color: accentColor, size: 48),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "No $title History",
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "You haven't recorded any readings yet.\nTap below to add your first reading.",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white54, fontSize: 13),
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
          backgroundColor: surfaceColor,
          onRefresh: () async {
            ref.invalidate(getVitalsProvider);
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            children: [
              // 1. Current / Latest Reading Card
              _buildLatestReadingCard(latest),
              const SizedBox(height: 16),

              // 2. Trend Graph Card
              _buildTrendChartCard(records),
              const SizedBox(height: 20),

              // 3. Historical Log Header & Share
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "PREVIOUS READINGS",
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  InkWell(
                    onTap: () => _shareVitals(records),
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
                            "Share History",
                            style: TextStyle(
                              color: accentColor,
                              fontSize: 11,
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

              // 4. Readings List
              ...records.map((r) => _buildReadingItem(r)),
              const SizedBox(height: 30),
            ],
          ),
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(color: Color(0xFF81DEEA)),
      ),
      error: (err, _) => Center(
        child: Text(
          "Failed to load vital readings: $err",
          style: const TextStyle(color: Colors.redAccent),
        ),
      ),
    );
  }

  Widget _buildLatestReadingCard(VitalsModel latest) {
    String valueStr = "";
    String statusStr = "";

    switch (vitalType) {
      case "bloodPressure":
        valueStr = "${latest.systolic ?? '--'}/${latest.diastolic ?? '--'}";
        statusStr = latest.bloodPressureStatus ?? "Normal";
        break;
      case "heartRate":
        valueStr = "${latest.heartRate ?? '--'}";
        statusStr = latest.heartRateStatus ?? "Normal";
        break;
      case "temperature":
        valueStr = "${latest.temperature ?? '--'}";
        statusStr = latest.temperatureStatus ?? "Normal";
        break;
      case "sugar":
        valueStr = "${latest.sugarLevel ?? '--'}";
        statusStr = latest.sugarStatus ?? "Normal";
        break;
    }

    final dateStr = latest.recordedAt != null
        ? DateFormat("dd MMM yyyy, hh:mm a").format(latest.recordedAt!.toLocal())
        : "Recent";

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: accentColor.withAlpha(40)),
        gradient: LinearGradient(
          colors: [accentColor.withAlpha(20), surfaceColor],
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
              const Text(
                "CURRENT / LATEST READING",
                style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
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
                    style: const TextStyle(color: Colors.white60, fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                "Recorded on $dateStr",
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
            ],
          ),
          if (statusStr.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: accentColor.withAlpha(25),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: accentColor.withAlpha(80)),
              ),
              child: Text(
                statusStr.toUpperCase(),
                style: TextStyle(
                  color: accentColor,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTrendChartCard(List<VitalsModel> records) {
    // Take up to 10 latest readings and reverse so chronological left-to-right
    final chartRecords = records.take(10).toList().reversed.toList();

    List<FlSpot> mainSpots = [];
    List<FlSpot> secondarySpots = [];

    for (int i = 0; i < chartRecords.length; i++) {
      final r = chartRecords[i];
      switch (vitalType) {
        case "bloodPressure":
          if (r.systolic != null) mainSpots.add(FlSpot(i.toDouble(), r.systolic!.toDouble()));
          if (r.diastolic != null) secondarySpots.add(FlSpot(i.toDouble(), r.diastolic!.toDouble()));
          break;
        case "heartRate":
          if (r.heartRate != null) mainSpots.add(FlSpot(i.toDouble(), r.heartRate!.toDouble()));
          break;
        case "temperature":
          if (r.temperature != null) mainSpots.add(FlSpot(i.toDouble(), r.temperature!));
          break;
        case "sugar":
          if (r.sugarLevel != null) mainSpots.add(FlSpot(i.toDouble(), r.sugarLevel!.toDouble()));
          break;
      }
    }

    if (mainSpots.isEmpty) {
      return const SizedBox();
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "$title Trend",
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (vitalType == "bloodPressure")
                Row(
                  children: [
                    Container(width: 8, height: 8, decoration: BoxDecoration(color: accentColor, shape: BoxShape.circle)),
                    const SizedBox(width: 4),
                    const Text("Sys", style: TextStyle(color: Colors.white54, fontSize: 11)),
                    const SizedBox(width: 8),
                    Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFFBA68C8), shape: BoxShape.circle)),
                    const SizedBox(width: 4),
                    const Text("Dia", style: TextStyle(color: Colors.white54, fontSize: 11)),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 180,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (val) => FlLine(
                    color: Colors.white.withAlpha(15),
                    strokeWidth: 1,
                  ),
                ),
                titlesData: FlTitlesData(
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 34,
                      getTitlesWidget: (val, meta) => Text(
                        val.toInt().toString(),
                        style: const TextStyle(color: Colors.white30, fontSize: 10),
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 22,
                      getTitlesWidget: (val, meta) {
                        final idx = val.toInt();
                        if (idx >= 0 && idx < chartRecords.length) {
                          final date = chartRecords[idx].recordedAt;
                          if (date != null) {
                            return Text(
                              DateFormat("dd/MM").format(date.toLocal()),
                              style: const TextStyle(color: Colors.white38, fontSize: 9),
                            );
                          }
                        }
                        return const SizedBox();
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: mainSpots,
                    isCurved: true,
                    color: accentColor,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: FlDotData(
                      show: true,
                      getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
                        radius: 4,
                        color: accentColor,
                        strokeWidth: 2,
                        strokeColor: surfaceColor,
                      ),
                    ),
                    belowBarData: BarAreaData(
                      show: true,
                      color: accentColor.withAlpha(35),
                    ),
                  ),
                  if (secondarySpots.isNotEmpty)
                    LineChartBarData(
                      spots: secondarySpots,
                      isCurved: true,
                      color: const Color(0xFFBA68C8),
                      barWidth: 3,
                      isStrokeCapRound: true,
                      dotData: FlDotData(
                        show: true,
                        getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
                          radius: 4,
                          color: const Color(0xFFBA68C8),
                          strokeWidth: 2,
                          strokeColor: surfaceColor,
                        ),
                      ),
                      belowBarData: BarAreaData(
                        show: true,
                        color: const Color(0xFFBA68C8).withAlpha(20),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReadingItem(VitalsModel record) {
    String valStr = "";
    String statusStr = "";

    switch (vitalType) {
      case "bloodPressure":
        valStr = "${record.systolic ?? '--'}/${record.diastolic ?? '--'} $unit";
        statusStr = record.bloodPressureStatus ?? "";
        break;
      case "heartRate":
        valStr = "${record.heartRate ?? '--'} $unit";
        statusStr = record.heartRateStatus ?? "";
        break;
      case "temperature":
        valStr = "${record.temperature ?? '--'} $unit";
        statusStr = record.temperatureStatus ?? "";
        break;
      case "sugar":
        valStr = "${record.sugarLevel ?? '--'} $unit";
        statusStr = record.sugarStatus ?? "";
        break;
    }

    final dateStr = record.recordedAt != null
        ? DateFormat("dd MMM yyyy • hh:mm a").format(record.recordedAt!.toLocal())
        : "Recent";

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                valStr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (statusStr.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    statusStr,
                    style: TextStyle(
                      color: accentColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            dateStr,
            style: const TextStyle(color: Colors.white38, fontSize: 12),
          ),
          if (record.notes != null && record.notes!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              "Note: ${record.notes}",
              style: const TextStyle(color: Colors.white60, fontSize: 12, fontStyle: FontStyle.italic),
            ),
          ],
        ],
      ),
    );
  }
}
