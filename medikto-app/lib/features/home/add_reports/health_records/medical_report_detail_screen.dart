import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/medical_report_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';

class MedicalReportDetailScreen extends ConsumerWidget {
  final String reportId;

  const MedicalReportDetailScreen({super.key, required this.reportId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeColors = context.themeColors;
    final reportAsync = ref.watch(getReportByIdProvider(reportId));

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
                                  Share.share(report.fileUrl, subject: report.title);
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
                              Text(
                                "Document Attachment",
                                style: TextStyle(color: themeColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600),
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
                            Share.share(report.fileUrl, subject: report.title);
                          },
                        ),
                      ],
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
}
