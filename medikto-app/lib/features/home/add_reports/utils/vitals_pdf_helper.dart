import 'dart:io';
import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';

class VitalsPdfHelper {
  static String _getVitalTitle(String type) {
    switch (type) {
      case "bloodPressure":
        return "Blood Pressure";
      case "heartRate":
        return "Heart Rate";
      case "temperature":
        return "Body Temperature";
      case "sugar":
        return "Blood Sugar";
      default:
        return "Vital Reading";
    }
  }

  static String _getVitalValueWithUnit(VitalsModel record) {
    switch (record.type) {
      case "bloodPressure":
        if (record.systolic != null && record.diastolic != null) {
          return "${record.systolic}/${record.diastolic} mmHg";
        }
        return "N/A";
      case "heartRate":
        return record.heartRate != null ? "${record.heartRate} BPM" : "N/A";
      case "temperature":
        return record.temperature != null ? "${record.temperature} °F" : "N/A";
      case "sugar":
        return record.sugarLevel != null ? "${record.sugarLevel} mg/dL" : "N/A";
      default:
        return "N/A";
    }
  }

  static Uint8List? _cachedLogoBytes;

  /// Builds the local PDF file for vital records without direct UI interactions.
  static Future<File> _buildPdfFile({
    required List<VitalsModel> records,
    String? patientName,
  }) async {
    final pdf = pw.Document();

    // Load Medikto Logo (cached in memory)
    pw.MemoryImage? logoImage;
    try {
      if (_cachedLogoBytes == null) {
        final logoBytes = await rootBundle.load('assets/images/medikto_logo.png');
        _cachedLogoBytes = logoBytes.buffer.asUint8List();
      }
      if (_cachedLogoBytes != null) {
        logoImage = pw.MemoryImage(_cachedLogoBytes!);
      }
    } catch (e) {
      debugPrint("Could not load logo for PDF: $e");
    }

    final now = DateTime.now();
    final formattedGeneratedDate = DateFormat('dd MMM yyyy, hh:mm a').format(now);
    final fileDateSuffix = DateFormat('yyyy-MM-dd').format(now);

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(36),
        header: (pw.Context context) {
          return pw.Container(
            margin: const pw.EdgeInsets.only(bottom: 20),
            padding: const pw.EdgeInsets.only(bottom: 12),
            decoration: const pw.BoxDecoration(
              border: pw.Border(
                bottom: pw.BorderSide(color: PdfColors.teal700, width: 1.5),
              ),
            ),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              crossAxisAlignment: pw.CrossAxisAlignment.center,
              children: [
                if (logoImage != null)
                  pw.Image(logoImage, height: 40)
                else
                  pw.Text(
                    "MEDIKTO",
                    style: pw.TextStyle(
                      fontSize: 22,
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColors.teal800,
                    ),
                  ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Text(
                      "HEALTH RECORDS SUMMARY",
                      style: pw.TextStyle(
                        fontSize: 14,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.teal900,
                      ),
                    ),
                    pw.SizedBox(height: 3),
                    pw.Text(
                      "Generated: $formattedGeneratedDate",
                      style: const pw.TextStyle(
                        fontSize: 9,
                        color: PdfColors.grey700,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
        footer: (pw.Context context) {
          return pw.Container(
            margin: const pw.EdgeInsets.only(top: 15),
            padding: const pw.EdgeInsets.only(top: 10),
            decoration: const pw.BoxDecoration(
              border: pw.Border(
                top: pw.BorderSide(color: PdfColors.grey300, width: 0.8),
              ),
            ),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text(
                  "Generated via Medikto Health App",
                  style: const pw.TextStyle(
                    fontSize: 8,
                    color: PdfColors.grey600,
                  ),
                ),
                pw.Text(
                  "Page ${context.pageNumber} of ${context.pagesCount}",
                  style: const pw.TextStyle(
                    fontSize: 8,
                    color: PdfColors.grey600,
                  ),
                ),
              ],
            ),
          );
        },
        build: (pw.Context context) {
          return [
            // Patient & Report Metadata Box
            pw.Container(
              padding: const pw.EdgeInsets.all(12),
              decoration: pw.BoxDecoration(
                color: PdfColors.grey100,
                borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
                border: pw.Border.all(color: PdfColors.grey300),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        "Patient Name",
                        style: const pw.TextStyle(
                          fontSize: 9,
                          color: PdfColors.grey700,
                        ),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text(
                        (patientName != null && patientName.isNotEmpty)
                            ? patientName
                            : "Patient Record",
                        style: pw.TextStyle(
                          fontSize: 12,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.black,
                        ),
                      ),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        "Total Recorded Readings",
                        style: const pw.TextStyle(
                          fontSize: 9,
                          color: PdfColors.grey700,
                        ),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text(
                        "${records.length}",
                        style: pw.TextStyle(
                          fontSize: 12,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.teal900,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            pw.SizedBox(height: 18),

            // Section Title
            pw.Text(
              "VITAL MEASUREMENTS",
              style: pw.TextStyle(
                fontSize: 11,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.teal900,
                letterSpacing: 0.5,
              ),
            ),
            pw.SizedBox(height: 8),

            // Table of Readings
            pw.TableHelper.fromTextArray(
              border: pw.TableBorder.all(
                color: PdfColors.grey300,
                width: 0.5,
              ),
              headerStyle: pw.TextStyle(
                fontSize: 9,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.white,
              ),
              headerDecoration: const pw.BoxDecoration(
                color: PdfColors.teal700,
              ),
              cellHeight: 28,
              cellAlignments: {
                0: pw.Alignment.centerLeft,
                1: pw.Alignment.centerLeft,
                2: pw.Alignment.centerLeft,
                3: pw.Alignment.centerLeft,
              },
              cellStyle: const pw.TextStyle(
                fontSize: 9,
                color: PdfColors.black,
              ),
              headers: [
                'Vital Sign',
                'Recorded Measurement',
                'Date & Time',
                'Notes',
              ],
              data: records.map((r) {
                final vitalTitle = _getVitalTitle(r.type);
                final measurement = _getVitalValueWithUnit(r);
                final dateStr = r.recordedAt != null
                    ? DateFormat('dd MMM yyyy, hh:mm a').format(r.recordedAt!)
                    : "N/A";
                final notes = (r.notes != null && r.notes!.isNotEmpty)
                    ? r.notes!
                    : "-";
                return [vitalTitle, measurement, dateStr, notes];
              }).toList(),
            ),

            pw.SizedBox(height: 16),
            pw.Text(
              "Notice: This document contains strictly factual vital measurements recorded in the Medikto Health Application and contains no automatic medical diagnosis or interpretation.",
              style: pw.TextStyle(
                fontSize: 8,
                color: PdfColors.grey600,
                fontStyle: pw.FontStyle.italic,
              ),
            ),
          ];
        },
      ),
    );

    // Save to temp file
    final output = await getTemporaryDirectory();
    final sanitizedPatient = (patientName != null && patientName.isNotEmpty)
        ? "${patientName.replaceAll(RegExp(r'[^\w\s]+'), '').replaceAll(' ', '_')}_"
        : "";
    final fileName = "Medikto_Health_Records_$sanitizedPatient$fileDateSuffix.pdf";
    final file = File("${output.path}/$fileName");
    await file.writeAsBytes(await pdf.save());
    return file;
  }

  /// Builds the local PDF file directly for PIN-gated or custom export flows
  static Future<File> buildFile({
    required List<VitalsModel> records,
    String? patientName,
  }) => _buildPdfFile(records: records, patientName: patientName);

  /// Downloads pre-rendered PDF stream from backend for ultra-fast, scalable export.
  /// Automatically and seamlessly falls back to local generation if device is offline.
  static Future<File> getOrBuildPdf({
    required List<VitalsModel> records,
    String? patientName,
    String? vitalType,
    String? patientId,
  }) async {
    try {
      final dio = dioClient.ref ?? Dio();
      final dateSuffix = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final sanitizedPatient = (patientName != null && patientName.isNotEmpty)
          ? "${patientName.replaceAll(RegExp(r'[^\w\s]+'), '').replaceAll(' ', '_')}_"
          : "";
      final fileName = "Medikto_Health_Records_$sanitizedPatient$dateSuffix.pdf";
      final tempDir = await getTemporaryDirectory();
      final filePath = "${tempDir.path}/$fileName";

      final queryParams = <String, dynamic>{};
      if (vitalType != null && vitalType.isNotEmpty && vitalType != "All") {
        queryParams['type'] = vitalType;
      }
      if (patientId != null && patientId.isNotEmpty) {
        queryParams['patientId'] = patientId;
      }

      final response = await dio.get<List<int>>(
        ApiUrls.exportVitalsPdf,
        queryParameters: queryParams,
        options: Options(
          responseType: ResponseType.bytes,
          validateStatus: (status) => status != null && status < 400,
        ),
      );

      if (response.data != null && response.data!.isNotEmpty) {
        final file = File(filePath);
        await file.writeAsBytes(response.data!);
        return file;
      }
    } catch (e) {
      debugPrint("Backend PDF stream unavailable, fallback to local engine: $e");
    }

    // Fallback: Generate locally on mobile device
    return await buildFile(records: records, patientName: patientName);
  }

  /// Generates and shares a professional Medikto-branded PDF containing vital records
  /// with a dedicated preparation state, frame-safe progress modal, and error recovery.
  static Future<void> generateAndShareVitalsPdf({
    required BuildContext context,
    required List<VitalsModel> records,
    String? patientName,
  }) async {
    if (records.isEmpty) return;

    bool shouldTryAgain = true;

    while (shouldTryAgain && context.mounted) {
      shouldTryAgain = false;

      // 1. Show Professional Preparation Dialog
      BuildContext? dialogCtx;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (dCtx) {
          dialogCtx = dCtx;
          final colors = dCtx.themeColors;
          return PopScope(
            canPop: false,
            child: Dialog(
              backgroundColor: colors.surface,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: colors.accentPrimary.withAlpha(25),
                        shape: BoxShape.circle,
                      ),
                      child: SizedBox(
                        width: 32,
                        height: 32,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          color: colors.accentPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      "Preparing your health records",
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: colors.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Creating your secure PDF summary...\nPlease wait a moment.",
                      style: TextStyle(
                        fontSize: 13,
                        color: colors.textSecondary,
                        height: 1.4,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      );

      // Yield 1 frame to let Flutter render the loading dialog immediately
      await Future.delayed(const Duration(milliseconds: 50));

      File? file;
      try {
        file = await _buildPdfFile(
          records: records,
          patientName: patientName,
        );
      } catch (e) {
        debugPrint("Error creating health records PDF: $e");
      } finally {
        if (dialogCtx != null && dialogCtx!.mounted) {
          Navigator.pop(dialogCtx!);
        }
      }

      if (file != null && await file.exists() && (await file.length()) > 0) {
        // Success: Open native share sheet directly
        await Share.shareXFiles(
          [XFile(file.path)],
          subject: "Medikto Health Records Summary",
          text: "Please find attached the Medikto Health Records PDF summary.",
        );
        return;
      } else {
        // Failure: Show clear Try Again / Cancel dialog
        if (!context.mounted) return;
        final colors = context.themeColors;
        final retry = await showDialog<bool>(
          context: context,
          barrierDismissible: false,
          builder: (errCtx) => AlertDialog(
            backgroundColor: colors.surface,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                const Icon(Icons.error_outline, color: AppColors.statusMissed, size: 24),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    "Unable to prepare health records",
                    style: TextStyle(
                      color: colors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            content: Text(
              "Something went wrong while creating the PDF summary.",
              style: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.4),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(errCtx, false),
                child: Text(
                  "Cancel",
                  style: TextStyle(color: colors.textMuted, fontWeight: FontWeight.bold),
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.accentPrimary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => Navigator.pop(errCtx, true),
                child: const Text("Try Again"),
              ),
            ],
          ),
        );

        if (retry == true) {
          shouldTryAgain = true;
        }
      }
    }
  }
}

