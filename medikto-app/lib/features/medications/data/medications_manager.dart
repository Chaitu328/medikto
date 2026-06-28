import 'dart:io';

import 'package:dio/dio.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:medikto/features/medications/models/adherence_model.dart';
import 'package:medikto/features/medications/models/medication_model.dart';
import 'package:medikto/features/medications/models/today_scheduled_model.dart';

class MedicationManager {
  factory MedicationManager() {
    return _singleton;
  }

  MedicationManager._internal();

  static final MedicationManager _singleton = MedicationManager._internal();

  Future<ResponseData> addMedication({
    required MedicationModel medication,
  }) async {
    Response response;

    try {
      response = await dioClient.ref!.post(
        ApiUrls.medications,
        data: medication.toJson(),
      );

      print("ADD MEDICATION RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        final medicationData = MedicationModel.fromJson(response.data);

        return ResponseData(
          response.data['message'] ?? "Medication added successfully",
          ResponseStatus.SUCCESS,
          data: medicationData,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Failed to add medication",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("ADD MEDICATION ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> getMedications() async {
    Response response;

    try {
      response = await dioClient.ref!.get(ApiUrls.medications);

      print("GET MEDICATIONS RESPONSE => ${response.data}");

      if (response.statusCode == 200) {
        final List medications = response.data;

        final medicationList = medications
            .map((e) => MedicationModel.fromJson(e))
            .toList();

        return ResponseData(
          "Medications fetched successfully",
          ResponseStatus.SUCCESS,
          data: medicationList,
        );
      } else {
        return ResponseData(
          "Failed to fetch medications",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("GET MEDICATIONS ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> markDoseAsTaken({required String doseId}) async {
    try {
      final response = await dioClient.ref!.put(ApiUrls.markAstaken(doseId));

      print("MARK DOSE RESPONSE => ${response.data}");

      if (response.statusCode == 200) {
        return ResponseData(
          "Dose marked as taken",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData("Failed to mark dose", ResponseStatus.FAILED);
      }
    } on DioException catch (e) {
      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Network error", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> getTodaySchedule() async {
    try {
      final response = await dioClient.ref!.get(ApiUrls.todaySchedule);

      print("TODAY SCHEDULE RESPONSE => ${response.data}");

      if (response.statusCode == 200) {
        final List data = response.data;

        final todayList = data
            .map((e) => TodayScheduleModel.fromJson(e))
            .toList();

        return ResponseData(
          "Today schedule fetched successfully",
          ResponseStatus.SUCCESS,
          data: todayList,
        );
      } else {
        return ResponseData(
          "Failed to fetch today schedule",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("TODAY SCHEDULE ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Network error", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> updateMedication({
    required String id,
    required MedicationModel medication,
  }) async {
    Response response;

    try {
      response = await dioClient.ref!.put(
        ApiUrls.updateMedication(id),
        data: medication.toJson(),
      );

      print("UPDATE MEDICATION RESPONSE => ${response.data}");

      if (response.statusCode == 200) {
        final medicationData = MedicationModel.fromJson(response.data);

        return ResponseData(
          response.data['message'] ?? "Medication updated successfully",
          ResponseStatus.SUCCESS,
          data: medicationData,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Failed to update medication",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("UPDATE MEDICATION ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> verifyDoseSelfie({
    required String doseId,
    required File imageFile,
  }) async {
    try {
      FormData formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.path.split('/').last,
        ),
      });

      final response = await dioClient.ref!.post(
        ApiUrls.verifyDoseSelfie(doseId),
        data: formData,
      );

      print("VERIFY DOSE SELFIE RESPONSE => ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ResponseData(
          response.data['message'] ?? "Verification successful",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Verification failed",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("VERIFY DOSE SELFIE ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("VERIFY DOSE SELFIE ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> getAdherence() async {
    try {
      final response = await dioClient.ref!.get(ApiUrls.adherence);

      print("ADHERENCE RESPONSE => ${response.data}");

      if (response.statusCode == 200) {
        final adherence = AdherenceModel.fromJson(response.data);

        return ResponseData(
          "Adherence fetched successfully",
          ResponseStatus.SUCCESS,
          data: adherence,
        );
      } else {
        return ResponseData("Failed to fetch adherence", ResponseStatus.FAILED);
      }
    } on DioException catch (e) {
      print("ADHERENCE ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ADHERENCE ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }
}
