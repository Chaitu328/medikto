class ApiUrls {
  // Base URL
  // static const String baseUrl = "https://medikto.onrender.com/api"; // Production Render
  // static const String baseUrl = "http://10.0.2.2:4000/api"; // Local Android Emulator
  // static const String baseUrl = "http://192.168.29.210:4000/api"; // Local Wi-Fi Connection (Old)
  // static const String baseUrl = "http://192.168.1.8:4000/api"; // Local Wi-Fi (Host Computer)
  static const String baseUrl = "http://161.248.223.165:3028/api"; // VPS Server


  // Endpoints
  static const String register = "/auth/register";
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
