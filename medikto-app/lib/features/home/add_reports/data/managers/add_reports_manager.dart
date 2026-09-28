import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:medikto/features/home/add_reports/models/medical_report_model.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';

class AddReportsManager {
  factory AddReportsManager() {
    return _singleton;
  }

  AddReportsManager._internal();

  static final AddReportsManager _singleton = AddReportsManager._internal();

  String _extractErrorMessage(dynamic data, [String defaultMsg = "Something went wrong"]) {
    if (data is Map) {
      return data["message"]?.toString() ?? data["error"]?.toString() ?? defaultMsg;
    } else if (data is String && data.isNotEmpty) {
      if (data.contains("413") || data.toLowerCase().contains("too large")) {
        return "File size is too large. Please select a smaller photo or document.";
      }
      if (!data.contains("<html")) {
        return data;
      }
    }
    return defaultMsg;
  }

  Future<ResponseData> addBloodPressure({
    required int systolic,
    required int diastolic,
    required String date,
    required String time,
    String? notes,
  }) async {
    Response response;

    try {
      response = await dioClient.ref!.post(
        ApiUrls.addBloodPressure,
        data: {
          "systolic": systolic,
          "diastolic": diastolic,
          "date": date,
          "time": time,
          "notes": notes ?? "",
        },
      );

      print("ADD BLOOD PRESSURE URL => ${ApiUrls.addBloodPressure}");
      print("STATUS CODE => ${response.statusCode}");
      print("RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          "Blood Pressure Added Successfully",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD BLOOD PRESSURE ERROR => ${e.response?.data}");

      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> addHeartRate({
    required int heartRate,
    required String date,
    required String time,
    String? notes,
  }) async {
    Response response;

    try {
      response = await dioClient.ref!.post(
        ApiUrls.addHeartRate,
        data: {
          "heartRate": heartRate,
          "date": date,
          "time": time,
          "notes": notes ?? "",
        },
      );

      print("ADD HEART RATE URL => ${ApiUrls.addHeartRate}");
      print("STATUS CODE => ${response.statusCode}");
      print("RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          "Heart Rate Added Successfully",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD HEART RATE ERROR => ${e.response?.data}");

      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> addTemperature({
    required double temperature,
    required String date,
    required String time,
    String? notes,
  }) async {
    Response response;

    try {
      response = await dioClient.ref!.post(
        ApiUrls.addTemperature,
        data: {
          "temperature": temperature,
          "date": date,
          "time": time,
          "notes": notes ?? "",
        },
      );

      print("ADD TEMPERATURE URL => ${ApiUrls.addTemperature}");
      print("STATUS CODE => ${response.statusCode}");
      print("RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          "Temperature Added Successfully",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD TEMPERATURE ERROR => ${e.response?.data}");

      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> addSugar({
    required int sugarLevel,
    required String date,
    required String time,
    String? notes,
  }) async {
    Response response;

    try {
      response = await dioClient.ref!.post(
        ApiUrls.addSugar,
        data: {
          "sugarLevel": sugarLevel,
          "date": date,
          "time": time,
          "notes": notes ?? "",
        },
      );

      print("ADD SUGAR URL => ${ApiUrls.addSugar}");
      print("STATUS CODE => ${response.statusCode}");
      print("RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          "Blood Sugar Added Successfully",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD SUGAR ERROR => ${e.response?.data}");

      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> getVitals() async {
    Response response;

    try {
      response = await dioClient.ref!.get(ApiUrls.getVitals);

      print("GET VITALS URL => ${ApiUrls.getVitals}");
      print("STATUS CODE => ${response.statusCode}");
      print("RESPONSE => ${response.data}");

      if (response.statusCode == 200) {
        final List<dynamic> rawList = response.data is List ? response.data : [response.data];
        final vitals = rawList
            .whereType<Map<String, dynamic>>()
            .map((e) => VitalsModel.fromJson(e))
            .toList();
        return ResponseData(
          "Vitals Fetched Successfully",
          ResponseStatus.SUCCESS,
          data: vitals,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data, "Failed to get vitals"),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("GET VITALS ERROR => ${e.response?.data}");

      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> uploadMedicalReport({
    required String title,
    required String date,
    required File file,
    String? description,
    String? condition,
    String? type,
  }) async {
    Response response;

    try {
      final pathStr = file.path;
      String fileName = pathStr.split(RegExp(r'[/\\]')).last;
      if (fileName.isEmpty) {
        fileName = "report_${DateTime.now().millisecondsSinceEpoch}.pdf";
      }
      if (!fileName.contains('.')) {
        fileName = "$fileName.jpg";
      }

      FormData formData = FormData.fromMap({
        "title": title,
        "date": date,
        "description": description ?? "",
        "condition": condition ?? "normal",
        "type": type ?? "medical",
        "file": await MultipartFile.fromFile(file.path, filename: fileName),
      });

      response = await dioClient.ref!.post(
        ApiUrls.uploadMedicalReport,
        data: formData,
      );

      print("UPLOAD REPORT URL => ${ApiUrls.uploadMedicalReport}");
      print("STATUS CODE => ${response.statusCode}");
      print("UPLOAD REPORT RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          _extractErrorMessage(response.data, "Medical Report Uploaded Successfully"),
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("UPLOAD REPORT ERROR => ${e.response?.data}");

      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> addPrescription({
    required String medicineName,
    required List<Map<String, dynamic>> reminders,
    String? dosageInstructions,
    File? file,
  }) async {
    Response response;

    try {
      MultipartFile? multipartFile;
      if (file != null) {
        final pathStr = file.path;
        String fileName = pathStr.split(RegExp(r'[/\\]')).last;
        if (fileName.isEmpty) {
          fileName = "prescription_${DateTime.now().millisecondsSinceEpoch}.jpg";
        }
        if (!fileName.contains('.')) {
          fileName = "$fileName.jpg";
        }
        multipartFile = await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        );
      }

      FormData formData = FormData.fromMap({
        "medicineName": medicineName,
        "dosageInstructions": dosageInstructions ?? "",
        "reminders": jsonEncode(reminders),
        if (multipartFile != null) "file": multipartFile,
      });

      response = await dioClient.ref!.post(
        ApiUrls.addPrescription,
        data: formData,
      );

      print("ADD PRESCRIPTION URL => ${ApiUrls.addPrescription}");
      print("STATUS CODE => ${response.statusCode}");
      print("ADD PRESCRIPTION RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          _extractErrorMessage(response.data, "Prescription Added Successfully"),
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD PRESCRIPTION ERROR => ${e.response?.data}");

      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> updateMedicalReport({
    required String id,
    required String title,
    required String date,
    File? file,
    String? description,
    String? condition,
    String? type,
  }) async {
    Response response;

    try {
      MultipartFile? multipartFile;
      if (file != null) {
        final pathStr = file.path;
        String fileName = pathStr.split(RegExp(r'[/\\]')).last;
        if (fileName.isEmpty) {
          fileName = "report_${DateTime.now().millisecondsSinceEpoch}.pdf";
        }
        if (!fileName.contains('.')) {
          fileName = "$fileName.jpg";
        }
        multipartFile = await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        );
      }

      FormData formData = FormData.fromMap({
        "title": title,
        "date": date,
        "description": description ?? "",
        "condition": condition ?? "normal",
        "type": type ?? "medical",
        if (multipartFile != null) "file": multipartFile,
      });

      response = await dioClient.ref!.put(
        "${ApiUrls.uploadMedicalReport}/$id",
        data: formData,
      );

      print("UPDATE REPORT URL => ${ApiUrls.uploadMedicalReport}/$id");
      print("STATUS CODE => ${response.statusCode}");
      print("UPDATE REPORT RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          _extractErrorMessage(response.data, "Medical Report Updated Successfully"),
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("UPDATE REPORT ERROR => ${e.response?.data}");
      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("UPDATE REPORT GENERIC ERROR => $e");
      return ResponseData("Update failed: ${e.toString()}", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> updatePrescription({
    required String id,
    required String medicineName,
    List<Map<String, dynamic>>? reminders,
    String? dosageInstructions,
    File? file,
  }) async {
    Response response;

    try {
      MultipartFile? multipartFile;
      if (file != null) {
        final pathStr = file.path;
        String fileName = pathStr.split(RegExp(r'[/\\]')).last;
        if (fileName.isEmpty) {
          fileName = "prescription_${DateTime.now().millisecondsSinceEpoch}.jpg";
        }
        if (!fileName.contains('.')) {
          fileName = "$fileName.jpg";
        }
        multipartFile = await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        );
      }

      FormData formData = FormData.fromMap({
        "medicineName": medicineName,
        "dosageInstructions": dosageInstructions ?? "",
        if (reminders != null) "reminders": jsonEncode(reminders),
        if (multipartFile != null) "file": multipartFile,
      });

      response = await dioClient.ref!.put(
        "${ApiUrls.addPrescription}/$id",
        data: formData,
      );

      print("UPDATE PRESCRIPTION URL => ${ApiUrls.addPrescription}/$id");
      print("STATUS CODE => ${response.statusCode}");
      print("UPDATE PRESCRIPTION RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          _extractErrorMessage(response.data, "Prescription Updated Successfully"),
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("UPDATE PRESCRIPTION ERROR => ${e.response?.data}");
      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("UPDATE PRESCRIPTION GENERIC ERROR => $e");
      return ResponseData("Update failed: ${e.toString()}", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> deleteReport(String id) async {
    Response response;
    try {
      response = await dioClient.ref!.delete("${ApiUrls.uploadMedicalReport}/$id");
      if (response.statusCode == 200 || response.statusCode == 204) {
        return ResponseData(
          _extractErrorMessage(response.data, "Report deleted successfully"),
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data, "Failed to delete report"),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> deletePrescription(String id) async {
    Response response;
    try {
      response = await dioClient.ref!.delete("${ApiUrls.addPrescription}/$id");
      if (response.statusCode == 200 || response.statusCode == 204) {
        return ResponseData(
          _extractErrorMessage(response.data, "Prescription deleted successfully"),
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          _extractErrorMessage(response.data, "Failed to delete prescription"),
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> getReports() async {
    Response response;
    try {
      response = await dioClient.ref!.get(ApiUrls.uploadMedicalReport);
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        final reports = data.map((e) => MedicalReportModel.fromJson(e)).toList();
        return ResponseData(
          "Reports fetched successfully",
          ResponseStatus.SUCCESS,
          data: reports,
        );
      } else {
        return ResponseData("Failed to fetch reports", ResponseStatus.FAILED);
      }
    } on DioException catch (e) {
      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> getReportById(String id) async {
    Response response;
    try {
      response = await dioClient.ref!.get("${ApiUrls.uploadMedicalReport}/$id");
      if (response.statusCode == 200) {
        final report = MedicalReportModel.fromJson(response.data);
        return ResponseData(
          "Report fetched successfully",
          ResponseStatus.SUCCESS,
          data: report,
        );
      } else {
        return ResponseData("Failed to fetch report", ResponseStatus.FAILED);
      }
    } on DioException catch (e) {
      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> getPrescriptions() async {
    Response response;
    try {
      response = await dioClient.ref!.get(ApiUrls.addPrescription);
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        final prescriptions = data.map((e) => PrescriptionModel.fromJson(e)).toList();
        return ResponseData(
          "Prescriptions fetched successfully",
          ResponseStatus.SUCCESS,
          data: prescriptions,
        );
      } else {
        return ResponseData("Failed to fetch prescriptions", ResponseStatus.FAILED);
      }
    } on DioException catch (e) {
      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> getPrescriptionById(String id) async {
    Response response;
    try {
      response = await dioClient.ref!.get("${ApiUrls.addPrescription}/$id");
      if (response.statusCode == 200) {
        final prescription = PrescriptionModel.fromJson(response.data);
        return ResponseData(
          "Prescription fetched successfully",
          ResponseStatus.SUCCESS,
          data: prescription,
        );
      } else {
        return ResponseData("Failed to fetch prescription", ResponseStatus.FAILED);
      }
    } on DioException catch (e) {
      return ResponseData(
        _extractErrorMessage(e.response?.data),
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }
}

AddReportsManager addReportsManager = AddReportsManager();
