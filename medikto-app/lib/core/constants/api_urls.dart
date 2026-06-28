class ApiUrls {
  // Base URL
  static const String baseUrl = "https://medikto.onrender.com/api";

  // Endpoints
  static const String register = "/api/auth/sendOTP";
  static const String login = "/auth/sendOTP";
  static const String verifyOtp = "/auth/verifyOTP";
  static const String profile = "/profile";
  static const String subscription = "/subscription";

  static const String medications = "/medications";
  static String markAstaken(String doseId) => "/dose/$doseId/taken";

  static String todaySchedule = "/today";
  static const String addBloodPressure = "/vitals/blood-pressure";
  static const String addHeartRate = "/vitals/heart-rate";
  static const String addTemperature = "/vitals/temperature";
  static const String addSugar = "/vitals/sugar";
  static const String getVitals = "/vitals";
  static String updateMedication(String id) => "/medications/$id";
  static String verifyDoseSelfie(String doseId) => "/dose/$doseId/verify";

  static const String uploadMedicalReport = "/reports";
  static const String addPrescription = "/prescriptions";
  static const String adherence = "/adherence";

}
