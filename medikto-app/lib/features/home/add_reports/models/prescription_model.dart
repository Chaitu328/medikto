class PrescriptionReminder {
  final String? id;
  final String time;
  final bool enabled;

  PrescriptionReminder({
    this.id,
    required this.time,
    required this.enabled,
  });

  factory PrescriptionReminder.fromJson(Map<String, dynamic> json) {
    return PrescriptionReminder(
      id: json["_id"],
      time: json["time"] ?? "",
      enabled: json["enabled"] ?? true,
    );
  }
}

class PrescriptionModel {
  final String id;
  final String medicineName;
  final String? dosageInstructions;
  final List<PrescriptionReminder> reminders;
  final String? fileUrl;

  PrescriptionModel({
    required this.id,
    required this.medicineName,
    this.dosageInstructions,
    required this.reminders,
    this.fileUrl,
  });

  factory PrescriptionModel.fromJson(Map<String, dynamic> json) {
    var remindersList = json["reminders"] as List? ?? [];
    List<PrescriptionReminder> parsedReminders = remindersList
        .map((e) => PrescriptionReminder.fromJson(e))
        .toList();

    return PrescriptionModel(
      id: json["_id"] ?? "",
      medicineName: json["medicineName"] ?? "",
      dosageInstructions: json["dosageInstructions"],
      reminders: parsedReminders,
      fileUrl: json["fileUrl"],
    );
  }
}
