class MedicationModel {
  final String? id;
  final String? name;
  final int? dosage;
  final String? unit;
  final List<String>? timings;
  final bool? notifications;
  final String? instructions;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? time;
  final String? status;

  MedicationModel({
    this.id,
    this.name,
    this.dosage,
    this.unit,
    this.timings,
    this.notifications,
    this.instructions,
    this.createdAt,
    this.updatedAt,
    this.time,
    this.status,
  });

  factory MedicationModel.fromJson(Map<String, dynamic> json) {
    return MedicationModel(
      id: json['_id'],
      name: json['name'],
      dosage: json['dosage'] is double
          ? (json['dosage'] as double).toInt()
          : json['dosage'],
      unit: json['unit'],
      timings: json['timings'] != null
          ? List<String>.from(json['timings'])
          : [],
      notifications: json['notifications'],
      instructions: json['instructions'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,

      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
      time: json['time'], // ✅ THIS FIXES YOUR ERROR
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "name": name,
      "dosage": dosage,
      "unit": unit,
      "timings": timings,
      "notifications": notifications,
      "instructions": instructions,
      "createdAt": createdAt?.toIso8601String(),
      "updatedAt": updatedAt?.toIso8601String(),
      'time': time,
      'status': status,
    };
  }
}
