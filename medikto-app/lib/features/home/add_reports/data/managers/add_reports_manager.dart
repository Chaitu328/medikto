import 'dart:io';

import 'package:dio/dio.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
import 'package:medikto/features/home/add_reports/models/medical_report_model.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'dart:convert';

class AddReportsManager {
  factory AddReportsManager() {
    return _singleton;
  }

  AddReportsManager._internal();

  static final AddReportsManager _singleton = AddReportsManager._internal();

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
        options: Options(headers: {"Content-Type": "application/json"}),
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
          response.data['message'] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD BLOOD PRESSURE ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
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
        options: Options(headers: {"Content-Type": "application/json"}),
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
          response.data['message'] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD HEART RATE ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
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
        options: Options(headers: {"Content-Type": "application/json"}),
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
          response.data['message'] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD TEMPERATURE ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
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
        options: Options(headers: {"Content-Type": "application/json"}),
      );

      print("ADD SUGAR URL => ${ApiUrls.addSugar}");
      print("STATUS CODE => ${response.statusCode}");
      print("RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          "Sugar Level Added Successfully",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD SUGAR ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
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
        final List<dynamic> data = response.data;

        final vitals = data.map((e) => VitalsModel.fromJson(e)).toList();

        return ResponseData(
          "Vitals fetched successfully",
          ResponseStatus.SUCCESS,
          data: vitals,
        );
      } else {
        return ResponseData("Something went wrong", ResponseStatus.FAILED);
      }
    } on DioException catch (e) {
      print("GET VITALS ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
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
      final fileName = file.path.split('/').last;

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
        options: Options(headers: {"Content-Type": "multipart/form-data"}),
      );

      print("UPLOAD REPORT URL => ${ApiUrls.uploadMedicalReport}");
      print("STATUS CODE => ${response.statusCode}");
      print("UPLOAD REPORT RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          response.data["message"] ?? "Medical Report Uploaded Successfully",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          response.data["message"] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("UPLOAD REPORT ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?["message"] ?? "Something went wrong",
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
      FormData formData = FormData.fromMap({
        "medicineName": medicineName,
        "dosageInstructions": dosageInstructions ?? "",
        "reminders": jsonEncode(reminders),
        if (file != null)
          "file": await MultipartFile.fromFile(
            file.path,
            filename: file.path.split('/').last,
          ),
      });

      response = await dioClient.ref!.post(
        ApiUrls.addPrescription,
        data: formData,
        options: Options(headers: {"Content-Type": "multipart/form-data"}),
      );

      print("ADD PRESCRIPTION URL => ${ApiUrls.addPrescription}");
      print("STATUS CODE => ${response.statusCode}");
      print("ADD PRESCRIPTION RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          response.data["message"] ?? "Prescription Added Successfully",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          response.data["message"] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD PRESCRIPTION ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?["message"] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

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
        e.response?.data?['message'] ?? "Something went wrong",
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
        e.response?.data?['message'] ?? "Something went wrong",
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
        e.response?.data?['message'] ?? "Something went wrong",
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
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }
}

AddReportsManager addReportsManager = AddReportsManager();
