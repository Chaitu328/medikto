import 'dart:io';
import 'package:flutter/services.dart' show rootBundle;
import 'package:intl/intl.dart';
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

  /// Generates and shares a professional Medikto-branded PDF containing vital records.
  static Future<void> generateAndShareVitalsPdf({
    required List<VitalsModel> records,
    String? patientName,
  }) async {
    if (records.isEmpty) return;

    final pdf = pw.Document();

    // Load Medikto Logo
    pw.MemoryImage? logoImage;
    try {
      final logoBytes = await rootBundle.load('assets/images/medikto_logo.png');
      logoImage = pw.MemoryImage(logoBytes.buffer.asUint8List());
    } catch (e) {
      print("Could not load logo for PDF: $e");
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
              style: const pw.TextStyle(
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
    final fileName = "Medikto_Health_Records_${sanitizedPatient}$fileDateSuffix.pdf";
    final file = File("${output.path}/$fileName");
    await file.writeAsBytes(await pdf.save());

    // Share via native share sheet
    await Share.shareXFiles(
      [XFile(file.path)],
      subject: "Medikto Health Records Summary",
      text: "Please find attached the Medikto Health Records PDF summary.",
    );
  }
}
