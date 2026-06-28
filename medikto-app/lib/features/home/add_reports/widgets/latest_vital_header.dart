import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';

class LatestVitalHeader extends ConsumerWidget {
  final String vitalType; // "bloodPressure", "heartRate", "temperature", "sugar"

  const LatestVitalHeader({super.key, required this.vitalType});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vitalsAsync = ref.watch(getVitalsProvider);

    return vitalsAsync.when(
      data: (responseData) {
        final List<VitalsModel> vitals =
            (responseData.data as List?)?.cast<VitalsModel>() ?? [];
        VitalsModel? latest;
        try {
          latest = vitals.firstWhere((e) => e.type == vitalType);
        } catch (_) {
          latest = null;
        }

        if (latest == null) {
          return Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E1E),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white10),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: Colors.white54, size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    "No existing records found. Enter a new record below.",
                    style: TextStyle(color: Colors.white54, fontSize: 13),
                  ),
                ),
              ],
            ),
          );
        }

        String title = "";
        String value = "";
        String unit = "";
        IconData icon = Icons.favorite;
        Color color = Colors.redAccent;

        switch (vitalType) {
          case "bloodPressure":
            title = "Latest Blood Pressure";
            value = latest.systolic != null && latest.diastolic != null
                ? "${latest.systolic}/${latest.diastolic}"
                : "--/--";
            unit = "mmHg";
            icon = Icons.bloodtype;
            color = const Color(0xFF00E5FF); // Premium accent Cyan
            break;
          case "heartRate":
            title = "Latest Pulse / Heart Rate";
            value = latest.heartRate?.toString() ?? "--";
            unit = "BPM";
            icon = Icons.favorite;
            color = const Color(0xFFEC407A); // Premium Rose/Pink
            break;
          case "temperature":
            title = "Latest Body Temperature";
            value = latest.temperature?.toString() ?? "--";
            unit = "°F";
            icon = Icons.thermostat;
            color = const Color(0xFFFFB74D); // Orange
            break;
          case "sugar":
            title = "Latest Sugar Levels";
            value = latest.sugarLevel?.toString() ?? "--";
            unit = "mg/dL";
            icon = Icons.local_drink;
            color = const Color(0xFF81C784); // Green
            break;
        }

        String dateStr = "";
        if (latest.recordedAt != null) {
          dateStr = DateFormat("MMM d, hh:mm a").format(latest.recordedAt!.toLocal());
        }

        return Container(
          margin: const EdgeInsets.symmetric(vertical: 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color.withOpacity(0.12), Colors.white.withOpacity(0.02)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            color: const Color(0xFF1E1E1E),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withOpacity(0.25)),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          value,
                          style: TextStyle(
                            color: color,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          unit,
                          style: const TextStyle(
                            color: Colors.white38,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (dateStr.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      "Recorded on",
                      style: TextStyle(color: Colors.white38, fontSize: 10),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dateStr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        );
      },
      loading: () => Container(
        margin: const EdgeInsets.symmetric(vertical: 10),
        height: 75,
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white10),
        ),
        child: const Center(
          child: SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.0,
              color: Color(0xFF81DEEA),
            ),
          ),
        ),
      ),
      error: (err, st) => Container(
        margin: const EdgeInsets.symmetric(vertical: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
        ),
        child: const Row(
          children: [
            Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                "Unable to retrieve latest vital record.",
                style: TextStyle(color: Colors.white54, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
