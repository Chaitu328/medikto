import 'dart:io';

import 'package:dio/dio.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileManager {
  factory ProfileManager() {
    return _singleton;
  }

  ProfileManager._internal();

  static final ProfileManager _singleton = ProfileManager._internal();

  Future<ResponseData> getProfile() async {
    Response response;

    try {
      response = await dioClient.ref!.get(ApiUrls.profile);

      print("PROFILE RESPONSE => ${response.data}");

      if (response.statusCode == 200) {
        final profile = ProfileModel.fromJson(response.data);

        /// SAVE USER ID
        final prefs = await SharedPreferences.getInstance();

        await prefs.setString(StorageKeys.userId, profile.id ?? "");

        print("SAVED USER ID => ${profile.id}");

        return ResponseData(
          "Profile fetched successfully",
          ResponseStatus.SUCCESS,
          data: profile,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Failed to fetch profile",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("PROFILE ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> updateProfile({
    required String firstName,
    required String phone,
    required String bloodGroup,
    required String gender,
    required String age,
    required String height,
    required String weight,
    File? image,
  }) async {
    try {
      FormData formData = FormData.fromMap({
        "firstName": firstName.trim(),
        "phone": phone.trim(),
        "bloodGroup": bloodGroup.trim().toUpperCase(),
        "gender": gender.trim().toLowerCase(),
        "age": age.trim(),
        "height": height.trim(),
        "weight": weight.trim(),

        if (image != null)
          "image": await MultipartFile.fromFile(
            image.path,
            filename: image.path.split('/').last,
          ),
      });

      final response = await dioClient.ref!.put(
        ApiUrls.profile,
        data: formData,
      );

      if (response.statusCode == 200) {
        final profile = ProfileModel.fromJson(response.data);

        return ResponseData(
          "Profile updated successfully",
          ResponseStatus.SUCCESS,
          data: profile,
        );
      }

      return ResponseData("Failed to update profile", ResponseStatus.FAILED);
    } on DioException catch (e) {
      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  /// UPDATE SUBSCRIPTION
  Future<ResponseData> updateSubscription({required String plan}) async {
    Response response;

    try {
      response = await dioClient.ref!.put(
        ApiUrls.subscription,
        data: {"plan": plan},
      );

      print("SUBSCRIPTION RESPONSE => ${response.data}");

      if (response.statusCode == 200) {
        return ResponseData(
          response.data['message'] ?? "Subscription updated",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Failed to update subscription",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("SUBSCRIPTION ERROR => ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }
}
