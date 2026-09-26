import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/medical_report_model.dart';
import 'package:medikto/features/home/add_reports/health_records/add_medicine_reports.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:medikto/core/utils/file_share_helper.dart';
import 'package:medikto/core/utils/widgets/pdf_viewer_screen.dart';

class MedicalReportDetailScreen extends ConsumerWidget {
  final String reportId;

  const MedicalReportDetailScreen({super.key, required this.reportId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeColors = context.themeColors;
    final reportAsync = ref.watch(getReportByIdProvider(reportId));
    final profileAsync = ref.watch(getProfileProvider);
    final isGuardian = profileAsync.value?.data is ProfileModel && (profileAsync.value!.data as ProfileModel).role == 'guardian';

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: CustomAppBar(
        title: "Report Details",
        backgroundColor: themeColors.bg,
        titleStyle: TextStyle(
          color: themeColors.textPrimary,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () => Navigator.pop(context),
        actions: [
          if (!isGuardian && reportAsync.value?.data is MedicalReportModel)
            IconButton(
              icon: Icon(Icons.edit_outlined, color: themeColors.accentPrimary),
              onPressed: () => _editReport(context, ref, reportAsync.value!.data as MedicalReportModel),
            ),
          if (!isGuardian)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: AppColors.missedRed),
              onPressed: () => _deleteReport(context, ref),
            ),
        ],
      ),
      body: reportAsync.when(
        data: (responseData) {
          final MedicalReportModel? report = responseData.data is MedicalReportModel
              ? responseData.data as MedicalReportModel
              : null;

          if (report == null) {
            return Center(
              child: Text(
                "Report not found",
                style: TextStyle(color: themeColors.textSecondary, fontSize: 16),
              ),
            );
          }

          final dateStr = DateFormat("dd MMM yyyy, hh:mm a").format(report.date.toLocal());
          final isImage = _isImageFile(report.fileUrl);

          Color conditionColor;
          switch (report.condition.toLowerCase()) {
            case "critical":
              conditionColor = AppColors.missedRed;
              break;
            case "moderate":
              conditionColor = AppColors.pendingAmber;
              break;
            default:
              conditionColor = AppColors.takenGreen;
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and Condition Row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        report.title,
                        style: TextStyle(
                          color: themeColors.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: conditionColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: conditionColor.withOpacity(0.3), width: 1.0),
                      ),
                      child: Text(
                        report.condition.toUpperCase(),
                        style: TextStyle(
                          color: conditionColor,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Info Grid (Date and Type)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: themeColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: themeColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "RECORDED DATE",
                              style: TextStyle(color: themeColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              dateStr,
                              style: TextStyle(color: themeColors.textSecondary, fontSize: 14, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      Container(width: 1, height: 40, color: themeColors.border),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "REPORT TYPE",
                              style: TextStyle(color: themeColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              report.type.toUpperCase(),
                              style: TextStyle(color: themeColors.accentMedium, fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 25),

                // Description section
                if (report.description != null && report.description!.isNotEmpty) ...[
                  Text(
                    "DESCRIPTION / NOTES",
                    style: TextStyle(color: themeColors.textMuted, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    report.description!,
                    style: TextStyle(color: themeColors.textSecondary, fontSize: 15, height: 1.5),
                  ),
                  const SizedBox(height: 25),
                ],

                // Attachment Section Header
                Text(
                  "ATTACHMENT",
                  style: TextStyle(color: themeColors.textMuted, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                const SizedBox(height: 10),

                // Attachment Display Card
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
                            imageUrl: report.fileUrl,
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
                                "Image Attachment",
                                style: TextStyle(color: themeColors.textSecondary, fontSize: 13),
                              ),
                              IconButton(
                                icon: Icon(Icons.share_outlined, color: themeColors.accentMedium, size: 20),
                                onPressed: () {
                                  FileShareHelper.shareFile(
                                    context: context,
                                    fileUrl: report.fileUrl,
                                    fallbackTitle: report.title,
                                    customFileName: "medical_report_${report.id}.jpg",
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
                              title: report.title,
                              pdfUrl: report.fileUrl,
                              fileName: "medical_report_${report.id}.pdf",
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
                                        "Document Attachment",
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
                                    report.fileUrl.split('/').last,
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
                                  fileUrl: report.fileUrl,
                                  fallbackTitle: report.title,
                                  customFileName: "medical_report_${report.id}.pdf",
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
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
                "Error loading report details",
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
        url.contains("cloudinary.com"); // Cloudinary urls are auto/image by default
  }

  Future<void> _deleteReport(BuildContext context, WidgetRef ref) async {
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
                "Delete Report?",
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
          "Are you sure you want to delete this report?",
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

    final res = await ref.read(deleteReportProvider(reportId).future);

    if (context.mounted) {
      Navigator.of(context, rootNavigator: true).pop();
    }

    if (!context.mounted) return;

    if (res.status == ResponseStatus.SUCCESS) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Report deleted successfully")),
      );
      ref.invalidate(getReportsProvider);
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.message.isNotEmpty ? res.message : "Failed to delete report")),
      );
    }
  }

  Future<void> _editReport(BuildContext context, WidgetRef ref, MedicalReportModel report) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddMedicalMedicationsScreen(reportToEdit: report),
      ),
    );

    if (result == true) {
      ref.invalidate(getReportByIdProvider(report.id));
      ref.invalidate(getReportsProvider);
    }
  }
}
