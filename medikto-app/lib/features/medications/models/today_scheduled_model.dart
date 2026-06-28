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
  });

  factory TodayScheduleModel.fromJson(Map<String, dynamic> json) {
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
    );
  }
}
