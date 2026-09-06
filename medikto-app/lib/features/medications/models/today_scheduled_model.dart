import 'package:medikto/features/medications/models/medication_model.dart';

class TodayScheduleModel {
  final String? id;
  final String? name;
  final String? dosage;
  final String? date;
  final String? time;
  final String? status;
  final String? takenAt;
  final bool? verified;
  final String? proofImage;
  final String? medicationId;
  final MedicationModel? medication;

  TodayScheduleModel({
    this.id,
    this.name,
    this.dosage,
    this.date,
    this.time,
    this.status,
    this.takenAt,
    this.verified,
    this.proofImage,
    this.medicationId,
    this.medication,
  });

  factory TodayScheduleModel.fromJson(Map<String, dynamic> json) {
    String? medId;
    MedicationModel? medObj;

    if (json["medication"] != null) {
      if (json["medication"] is Map<String, dynamic>) {
        medObj = MedicationModel.fromJson(json["medication"]);
        medId = medObj.id ?? json["medication"]["_id"];
      } else if (json["medication"] is String) {
        medId = json["medication"];
      }
    }

    return TodayScheduleModel(
      id: json["_id"],
      name: json["name"],
      dosage: json["dosage"],
      date: json["date"],
      time: json["time"],
      status: json["status"],
      takenAt: json["takenAt"],
      verified: json["verified"],
      proofImage: json["proofImage"],
      medicationId: medId,
      medication: medObj,
    );
  }
}
