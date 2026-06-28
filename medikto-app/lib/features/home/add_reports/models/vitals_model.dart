class VitalsModel {
  final String type;

  final int? systolic;
  final int? diastolic;
  final String? bloodPressureStatus;

  final int? heartRate;
  final String? heartRateStatus;

  final double? temperature;
  final String? temperatureStatus;

  final int? sugarLevel;
  final String? sugarStatus;

  final String? notes;
  final DateTime? recordedAt;

  VitalsModel({
    required this.type,
    this.systolic,
    this.diastolic,
    this.bloodPressureStatus,
    this.heartRate,
    this.heartRateStatus,
    this.temperature,
    this.temperatureStatus,
    this.sugarLevel,
    this.sugarStatus,
    this.notes,
    this.recordedAt,
  });

  factory VitalsModel.fromJson(Map<String, dynamic> json) {
    return VitalsModel(
      type: json["type"] ?? "",

      systolic: json["bloodPressure"]?["systolic"],
      diastolic: json["bloodPressure"]?["diastolic"],
      bloodPressureStatus: json["bloodPressure"]?["status"],

      heartRate: json["heartRate"],
      heartRateStatus: json["heartRateStatus"],

      temperature: json["temperature"]?.toDouble(),
      temperatureStatus: json["temperatureStatus"],

      sugarLevel: json["sugarLevel"],
      sugarStatus: json["sugarStatus"],

      notes: json["notes"],

      recordedAt: json["recordedAt"] != null
          ? DateTime.parse(json["recordedAt"])
          : null,
    );
  }
}
