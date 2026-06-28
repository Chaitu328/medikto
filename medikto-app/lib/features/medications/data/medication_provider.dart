import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/medications/data/medications_manager.dart';
import 'package:medikto/features/medications/models/medication_model.dart';

final medicationProvider = Provider<MedicationManager>(
  (ref) => MedicationManager(),
);

final addMedicationProvider =
    FutureProvider.family<ResponseData, MedicationModel>((
      ref,
      medication,
    ) async {
      return ref
          .watch(medicationProvider)
          .addMedication(medication: medication);
    });

final getMedicationsProvider = FutureProvider.autoDispose<ResponseData>((
  ref,
) async {
  return ref.watch(medicationProvider).getMedications();
});

final markDoseTakenProvider = FutureProvider.family<ResponseData, String>((
  ref,
  doseId,
) async {
  return ref.read(medicationProvider).markDoseAsTaken(doseId: doseId);
});

final getTodayScheduleProvider = FutureProvider.autoDispose<ResponseData>((
  ref,
) async {
  return ref.watch(medicationProvider).getTodaySchedule();
});

final updateMedicationProvider =
    FutureProvider.family<ResponseData, Map<String, dynamic>>((
      ref,
      data,
    ) async {
      return ref
          .read(medicationProvider)
          .updateMedication(id: data['id'], medication: data['medication']);
    });

final verifyDoseSelfieProvider =
    FutureProvider.family<ResponseData, Map<String, dynamic>>((
      ref,
      data,
    ) async {
      return ref
          .read(medicationProvider)
          .verifyDoseSelfie(
            doseId: data['doseId'],
            imageFile: data['imageFile'],
          );
    });

final getAdherenceProvider = FutureProvider.autoDispose<ResponseData>((
  ref,
) async {
  return ref.watch(medicationProvider).getAdherence();
});
