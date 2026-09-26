import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'package:medikto/features/home/add_reports/health_records/add_prescription_file.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:medikto/core/utils/file_share_helper.dart';
import 'package:medikto/core/utils/widgets/pdf_viewer_screen.dart';

class PrescriptionDetailScreen extends ConsumerWidget {
  final String prescriptionId;

  const PrescriptionDetailScreen({super.key, required this.prescriptionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeColors = context.themeColors;
    final prescriptionAsync = ref.watch(getPrescriptionByIdProvider(prescriptionId));
    final profileAsync = ref.watch(getProfileProvider);
    final isGuardian = profileAsync.value?.data is ProfileModel && (profileAsync.value!.data as ProfileModel).role == 'guardian';

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: CustomAppBar(
        title: "Prescription Details",
        backgroundColor: themeColors.bg,
        titleStyle: TextStyle(
          color: themeColors.textPrimary,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () => Navigator.pop(context),
        actions: [
          if (!isGuardian && prescriptionAsync.value?.data is PrescriptionModel)
            IconButton(
              icon: Icon(Icons.edit_outlined, color: themeColors.accentPrimary),
              onPressed: () => _editPrescription(context, ref, prescriptionAsync.value!.data as PrescriptionModel),
            ),
          if (!isGuardian)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: AppColors.missedRed),
              onPressed: () => _deletePrescription(context, ref),
            ),
        ],
      ),
      body: prescriptionAsync.when(
        data: (responseData) {
          final PrescriptionModel? prescription = responseData.data is PrescriptionModel
              ? responseData.data as PrescriptionModel
              : null;

          if (prescription == null) {
            return Center(
              child: Text(
                "Prescription not found",
                style: TextStyle(color: themeColors.textSecondary, fontSize: 16),
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
                        color: themeColors.accentSubtle,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        Icons.medication,
                        color: themeColors.accentMedium,
                        size: 32,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "MEDICINE NAME",
                            style: TextStyle(color: themeColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            prescription.medicineName,
                            style: TextStyle(
                              color: themeColors.textPrimary,
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
                Text(
                  "DOSAGE & INSTRUCTIONS",
                  style: TextStyle(color: themeColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: themeColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: themeColors.border),
                  ),
                  child: Text(
                    prescription.dosageInstructions ?? "No dosage instructions provided.",
                    style: TextStyle(color: themeColors.textSecondary, fontSize: 15, height: 1.5),
                  ),
                ),
                const SizedBox(height: 24),

                // Reminders Section
                if (prescription.reminders.isNotEmpty) ...[
                  Text(
                    "DAILY REMINDERS",
                    style: TextStyle(color: themeColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: themeColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: themeColors.border),
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: prescription.reminders.length,
                      separatorBuilder: (context, index) => Container(height: 1, color: themeColors.border),
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
                                    color: reminder.enabled ? themeColors.accentMedium : themeColors.textMuted,
                                    size: 18,
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    reminder.time,
                                    style: TextStyle(
                                      color: reminder.enabled ? themeColors.textPrimary : themeColors.textMuted,
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
                                      ? themeColors.accentSubtle
                                      : (context.isDarkMode ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.04)),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  reminder.enabled ? "ACTIVE" : "INACTIVE",
                                  style: TextStyle(
                                    color: reminder.enabled ? themeColors.accentMedium : themeColors.textMuted,
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
                  Text(
                    "PRESCRIPTION ATTACHMENT",
                    style: TextStyle(color: themeColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 10),
                  if (isImage)
                    Container(
                      decoration: BoxDecoration(
                        color: themeColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: themeColors.border),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        children: [
                          InteractiveViewer(
                            maxScale: 4.0,
                            child: CachedNetworkImage(
                              imageUrl: prescription.fileUrl!,
                              placeholder: (context, url) => SizedBox(
                                height: 250,
                                child: Center(child: CircularProgressIndicator(color: themeColors.accentPrimary)),
                              ),
                              errorWidget: (context, url, error) => SizedBox(
                                height: 250,
                                child: Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.broken_image_outlined, color: themeColors.textMuted, size: 48),
                                      const SizedBox(height: 10),
                                      Text("Unable to load image", style: TextStyle(color: themeColors.textMuted)),
                                    ],
                                  ),
                                ),
                              ),
                              fit: BoxFit.contain,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            color: context.isDarkMode ? Colors.black26 : Colors.grey.withOpacity(0.1),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "Prescription Image",
                                  style: TextStyle(color: themeColors.textSecondary, fontSize: 13),
                                ),
                                IconButton(
                                  icon: Icon(Icons.share_outlined, color: themeColors.accentMedium, size: 20),
                                  onPressed: () {
                                    FileShareHelper.shareFile(
                                      context: context,
                                      fileUrl: prescription.fileUrl!,
                                      fallbackTitle: prescription.medicineName,
                                      customFileName: "prescription_${prescription.id}.jpg",
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PdfViewerScreen(
                                title: prescription.medicineName,
                                pdfUrl: prescription.fileUrl!,
                                fileName: "prescription_${prescription.id}.pdf",
                              ),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: themeColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: themeColors.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.missedRed.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.picture_as_pdf, color: AppColors.missedRed, size: 28),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          "Prescription Document",
                                          style: TextStyle(color: themeColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: themeColors.accentSubtle,
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            "TAP TO VIEW",
                                            style: TextStyle(color: themeColors.accentMedium, fontSize: 9, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      prescription.fileUrl!.split('/').last,
                                      style: TextStyle(color: themeColors.textMuted, fontSize: 12),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: Icon(Icons.share_outlined, color: themeColors.accentMedium),
                                onPressed: () {
                                  FileShareHelper.shareFile(
                                    context: context,
                                    fileUrl: prescription.fileUrl!,
                                    fallbackTitle: prescription.medicineName,
                                    customFileName: "prescription_${prescription.id}.pdf",
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
                const SizedBox(height: 40),
              ],
            ),
          );
        },
        loading: () => Center(
          child: CircularProgressIndicator(color: themeColors.accentPrimary),
        ),
        error: (err, st) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: AppColors.missedRed, size: 48),
              const SizedBox(height: 16),
              Text(
                "Error loading prescription details",
                style: TextStyle(color: themeColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                err.toString(),
                style: TextStyle(color: themeColors.textMuted, fontSize: 12),
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

  Future<void> _deletePrescription(BuildContext context, WidgetRef ref) async {
    final colors = context.themeColors;
    final shouldDelete = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: colors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.delete_outline, color: AppColors.missedRed, size: 26),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                "Delete Prescription?",
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          "Are you sure you want to delete this prescription?",
          style: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              "Cancel",
              style: TextStyle(color: colors.accentPrimary, fontWeight: FontWeight.bold),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.missedRed,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Delete"),
          ),
        ],
      ),
    );

    if (shouldDelete != true || !context.mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    final res = await ref.read(deletePrescriptionProvider(prescriptionId).future);

    if (context.mounted) {
      Navigator.of(context, rootNavigator: true).pop();
    }

    if (!context.mounted) return;

    if (res.status == ResponseStatus.SUCCESS) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Prescription deleted successfully")),
      );
      ref.invalidate(getPrescriptionsProvider);
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.message.isNotEmpty ? res.message : "Failed to delete prescription")),
      );
    }
  }

  Future<void> _editPrescription(BuildContext context, WidgetRef ref, PrescriptionModel prescription) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddPrescriptionFileScreen(prescriptionToEdit: prescription),
      ),
    );

    if (result == true) {
      ref.invalidate(getPrescriptionByIdProvider(prescription.id));
      ref.invalidate(getPrescriptionsProvider);
    }
  }
}
