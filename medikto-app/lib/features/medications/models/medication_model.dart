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
  final String? frequency;
  final DateTime? startDate;
  final int? duration;
  final DateTime? endDate;
  final bool? isContinue;

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
    this.frequency,
    this.startDate,
    this.duration,
    this.endDate,
    this.isContinue,
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
          ? DateTime.tryParse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
          : null,
      time: json['time'],
      status: json['status'] ?? "active",
      frequency: json['frequency'],
      startDate: json['startDate'] != null
          ? DateTime.tryParse(json['startDate'])
          : (json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null),
      duration: json['duration'],
      endDate: json['endDate'] != null
          ? DateTime.tryParse(json['endDate'])
          : null,
      isContinue: json['isContinue'] ?? false,
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
      "frequency": frequency,
      "startDate": startDate?.toIso8601String(),
      "duration": duration,
      "endDate": endDate?.toIso8601String(),
      "isContinue": isContinue,
    };
  }
}
