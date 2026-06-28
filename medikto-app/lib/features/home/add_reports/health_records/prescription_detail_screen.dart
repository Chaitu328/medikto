import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';

class PrescriptionDetailScreen extends ConsumerWidget {
  final String prescriptionId;

  const PrescriptionDetailScreen({super.key, required this.prescriptionId});

  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prescriptionAsync = ref.watch(getPrescriptionByIdProvider(prescriptionId));

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Prescription Details",
        backgroundColor: darkBg,
        titleStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () => Navigator.pop(context),
      ),
      body: prescriptionAsync.when(
        data: (responseData) {
          final PrescriptionModel? prescription = responseData.data is PrescriptionModel
              ? responseData.data as PrescriptionModel
              : null;

          if (prescription == null) {
            return const Center(
              child: Text(
                "Prescription not found",
                style: TextStyle(color: Colors.white70, fontSize: 16),
              ),
            );
          }

          final hasFile = prescription.fileUrl != null && prescription.fileUrl!.isNotEmpty;
          final isImage = hasFile && _isImageFile(prescription.fileUrl!);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Medicine Icon & Name
                Row(
                  children: [
                    Container(
                      height: 56,
                      width: 56,
                      decoration: BoxDecoration(
                        color: accentCyan.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.medication,
                        color: accentCyan,
                        size: 32,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "MEDICINE NAME",
                            style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            prescription.medicineName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Dosage & Instructions Section
                const Text(
                  "DOSAGE & INSTRUCTIONS",
                  style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: surfaceColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Text(
                    prescription.dosageInstructions ?? "No dosage instructions provided.",
                    style: const TextStyle(color: Colors.white70, fontSize: 15, height: 1.5),
                  ),
                ),
                const SizedBox(height: 24),

                // Reminders Section
                if (prescription.reminders.isNotEmpty) ...[
                  const Text(
                    "DAILY REMINDERS",
                    style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: surfaceColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: prescription.reminders.length,
                      separatorBuilder: (context, index) => Container(height: 1, color: Colors.white10),
                      itemBuilder: (context, index) {
                        final reminder = prescription.reminders[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    Icons.alarm,
                                    color: reminder.enabled ? accentCyan : Colors.white24,
                                    size: 18,
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    reminder.time,
                                    style: TextStyle(
                                      color: reminder.enabled ? Colors.white : Colors.white38,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: reminder.enabled
                                      ? accentCyan.withOpacity(0.12)
                                      : Colors.white.withOpacity(0.04),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  reminder.enabled ? "ACTIVE" : "INACTIVE",
                                  style: TextStyle(
                                    color: reminder.enabled ? accentCyan : Colors.white24,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Attachment Section
                if (hasFile) ...[
                  const Text(
                    "PRESCRIPTION ATTACHMENT",
                    style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 10),
                  if (isImage)
                    Container(
                      decoration: BoxDecoration(
                        color: surfaceColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white10),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        children: [
                          InteractiveViewer(
                            maxScale: 4.0,
                            child: CachedNetworkImage(
                              imageUrl: prescription.fileUrl!,
                              placeholder: (context, url) => const SizedBox(
                                height: 250,
                                child: Center(child: CircularProgressIndicator(color: accentCyan)),
                              ),
                              errorWidget: (context, url, error) => const SizedBox(
                                height: 250,
                                child: Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.broken_image_outlined, color: Colors.white24, size: 48),
                                      SizedBox(height: 10),
                                      Text("Unable to load image", style: TextStyle(color: Colors.white38)),
                                    ],
                                  ),
                                ),
                              ),
                              fit: BoxFit.contain,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            color: Colors.black26,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  "Prescription Image",
                                  style: TextStyle(color: Colors.white54, fontSize: 13),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.share_outlined, color: accentCyan, size: 20),
                                  onPressed: () {
                                    Share.share(prescription.fileUrl!, subject: prescription.medicineName);
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: surfaceColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: accentCyan.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.insert_drive_file, color: accentCyan, size: 28),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Prescription File",
                                  style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  prescription.fileUrl!.split('/').last,
                                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.share_outlined, color: accentCyan),
                            onPressed: () {
                              Share.share(prescription.fileUrl!, subject: prescription.medicineName);
                            },
                          ),
                        ],
                      ),
                    ),
                ],
                const SizedBox(height: 40),
              ],
            ),
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: accentCyan),
        ),
        error: (err, st) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
              const SizedBox(height: 16),
              const Text(
                "Error loading prescription details",
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                err.toString(),
                style: const TextStyle(color: Colors.white38, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  bool _isImageFile(String url) {
    final cleanUrl = url.split('?').first.toLowerCase();
    return cleanUrl.endsWith('.jpg') ||
        cleanUrl.endsWith('.jpeg') ||
        cleanUrl.endsWith('.png') ||
        cleanUrl.endsWith('.webp') ||
        cleanUrl.endsWith('.gif') ||
        url.contains("cloudinary.com");
  }
}
