import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/home/add_reports/data/managers/add_reports_manager.dart';

final reportsProvider = Provider<AddReportsManager>(
  (ref) => AddReportsManager(),
);

final getVitalsProvider = FutureProvider<ResponseData>((ref) async {
  return ref.read(reportsProvider).getVitals();
});

final uploadMedicalReportProvider =
    FutureProvider.family<ResponseData, Map<String, dynamic>>((
      ref,
      data,
    ) async {
      return ref
          .read(reportsProvider)
          .uploadMedicalReport(
            title: data["title"],
            date: data["date"],
            file: data["file"] as File,
            description: data["description"],
            condition: data["condition"],
            type: data["type"],
          );
    });

final addPrescriptionProvider =
    FutureProvider.family<ResponseData, Map<String, dynamic>>((
      ref,
      data,
    ) async {
      return ref
          .read(reportsProvider)
          .addPrescription(
            medicineName: data["medicineName"],
            dosageInstructions: data["dosageInstructions"],
            reminders: List<Map<String, dynamic>>.from(data["reminders"]),
            file: data["file"],
          );
    });
