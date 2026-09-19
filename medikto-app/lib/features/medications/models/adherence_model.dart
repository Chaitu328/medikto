class AdherenceModel {
  final bool? success;
  final String? period;
  final int? weeklyAdherence;
  final String? weeklyStatus;
  final int? totalDoses;
  final int? takenDoses;
  final int? missedDoses;
  final bool? hasActiveMedications;
  final int? activeMedications;

  AdherenceModel({
    this.success,
    this.period,
    this.weeklyAdherence,
    this.weeklyStatus,
    this.totalDoses,
    this.takenDoses,
    this.missedDoses,
    this.hasActiveMedications,
    this.activeMedications,
  });

  factory AdherenceModel.fromJson(Map<String, dynamic> json) {
    return AdherenceModel(
      success: json['success'],
      period: json['period'],
      weeklyAdherence: json['weeklyAdherence'],
      weeklyStatus: json['weeklyStatus'],
      totalDoses: json['totalDoses'],
      takenDoses: json['takenDoses'],
      missedDoses: json['missedDoses'],
      hasActiveMedications: json['hasActiveMedications'],
      activeMedications: json['activeMedications'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "success": success,
      "period": period,
      "weeklyAdherence": weeklyAdherence,
      "weeklyStatus": weeklyStatus,
      "totalDoses": totalDoses,
      "takenDoses": takenDoses,
      "missedDoses": missedDoses,
      "hasActiveMedications": hasActiveMedications,
      "activeMedications": activeMedications,
    };
  }
}
