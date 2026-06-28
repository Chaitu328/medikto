import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'package:medikto/features/home/add_reports/health_records/add_prescription_file.dart';
import 'package:medikto/features/home/add_reports/health_records/prescription_detail_screen.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';

class PrescriptionsListScreen extends ConsumerWidget {
  const PrescriptionsListScreen({super.key});

  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prescriptionsAsync = ref.watch(getPrescriptionsProvider);
    final profileAsync = ref.watch(getProfileProvider);
    final isGuardian = profileAsync.value?.data is ProfileModel && (profileAsync.value!.data as ProfileModel).role == 'guardian';

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Prescriptions",
        backgroundColor: darkBg,
        titleStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () => Navigator.pop(context),
      ),
      floatingActionButton: isGuardian
          ? null
          : FloatingActionButton(
              backgroundColor: accentCyan,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const AddPrescriptionFileScreen(),
                  ),
                );
              },
              child: const Icon(Icons.add, size: 28),
            ),
      body: RefreshIndicator(
        color: accentCyan,
        backgroundColor: surfaceColor,
        onRefresh: () async {
          ref.invalidate(getPrescriptionsProvider);
        },
        child: prescriptionsAsync.when(
          data: (responseData) {
            final List<PrescriptionModel> prescriptions =
                (responseData.data as List?)?.cast<PrescriptionModel>() ?? [];

            if (prescriptions.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: surfaceColor,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.receipt_long_outlined,
                            size: 64,
                            color: Colors.white24,
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          "No Prescriptions Found",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          "Tap the '+' button to add a prescription.",
                          style: TextStyle(
                            color: Colors.white30,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }

            return ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              itemCount: prescriptions.length,
              itemBuilder: (context, index) {
                final prescription = prescriptions[index];
                return _buildPrescriptionCard(context, prescription);
              },
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(color: accentCyan),
          ),
          error: (error, stack) => ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              SizedBox(height: MediaQuery.of(context).size.height * 0.25),
              Center(
                child: Column(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
                    const SizedBox(height: 16),
                    const Text(
                      "Failed to load prescriptions",
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Please pull to refresh and try again.",
                      style: TextStyle(color: Colors.white30, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPrescriptionCard(BuildContext context, PrescriptionModel prescription) {
    final activeReminders = prescription.reminders.where((r) => r.enabled).toList();
    final timesStr = activeReminders.map((r) => r.time).join(", ");

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PrescriptionDetailScreen(prescriptionId: prescription.id),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  height: 48,
                  width: 48,
                  decoration: BoxDecoration(
                    color: accentCyan.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.medication_outlined,
                    color: accentCyan,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        prescription.medicineName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        prescription.dosageInstructions ?? "No instructions provided",
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 12,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (timesStr.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.alarm, color: Colors.white24, size: 12),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                timesStr,
                                style: const TextStyle(
                                  color: accentCyan,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                if (prescription.fileUrl != null && prescription.fileUrl!.isNotEmpty)
                  const Padding(
                    padding: EdgeInsets.only(left: 8.0),
                    child: Icon(
                      Icons.attach_file,
                      color: Colors.white24,
                      size: 20,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
