class MedicalReportModel {
  final String id;
  final String title;
  final String? description;
  final String condition;
  final DateTime date;
  final String fileUrl;
  final String type;

  MedicalReportModel({
    required this.id,
    required this.title,
    this.description,
    required this.condition,
    required this.date,
    required this.fileUrl,
    required this.type,
  });

  factory MedicalReportModel.fromJson(Map<String, dynamic> json) {
    return MedicalReportModel(
      id: json["_id"] ?? "",
      title: json["title"] ?? "",
      description: json["description"],
      condition: json["condition"] ?? "normal",
      date: json["date"] != null ? DateTime.parse(json["date"]) : DateTime.now(),
      fileUrl: json["fileUrl"] ?? "",
      type: json["type"] ?? "medical",
    );
  }
}
