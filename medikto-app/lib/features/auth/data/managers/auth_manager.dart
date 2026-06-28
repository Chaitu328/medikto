

import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';


class AuthManager {
factory AuthManager() {
  return _singleton;
}

AuthManager._internal();

static final AuthManager _singleton = AuthManager._internal();

Future<String> get token async {
  final prefs = await SharedPreferences.getInstance();
  final t = prefs.getString(StorageKeys.token);
  if (t == null || t.isEmpty) {
    throw Exception("Not authenticated – no token in storage");
  }
  return t;
}

Future<ResponseData> performLogin(String phone) async {
  Response response;

  try {
      response = await dioClient.tokenRef!.post(
        ApiUrls.login,
        data: {"phone": phone},
        options: Options(headers: {"Content-Type": "application/json"}),
      );

      print("URL: ${ApiUrls.login}");
      print("STATUS CODE: ${response.statusCode}");
      print("RESPONSE: ${response.data}");

      if (response.statusCode == 200) {
        return ResponseData(
          response.data['message'],
          ResponseStatus.SUCCESS,
          data: response.data,
        );

        
    } else {
      var message = "Unknown error";

        if (response.data != null &&
            response.data is Map &&
            response.data.containsKey("message")) {
        message = response.data['message'];
      }

        return ResponseData(message, ResponseStatus.FAILED);
    }
    } on DioException catch (e) {
      print("DIO ERROR: ${e.response?.data}");
      print("DIO STATUS: ${e.response?.statusCode}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR: $e");

      return ResponseData('Please check your internet', ResponseStatus.FAILED);
    }
  }


/// VERIFY OTP
  Future<ResponseData> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    Response response;

    try {
      response = await dioClient.tokenRef!.post(
        ApiUrls.verifyOtp,
        data: {"phone": phone, "otp": otp},
        options: Options(headers: {"Content-Type": "application/json"}),
      );

      print("VERIFY OTP RESPONSE: ${response.data}");

      if (response.statusCode == 200) {
        /// SAVE TOKEN
        final prefs = await SharedPreferences.getInstance();

        await prefs.setString(StorageKeys.token, response.data['token']);

        return ResponseData(
          "OTP Verified Successfully",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "OTP Verification Failed",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("VERIFY OTP ERROR: ${e.response?.data}");

      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR: $e");

      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }
// Inside lib/features/auth/data/managers/auth_manager.dart

Future<ResponseData> registerProfile(Map<String, dynamic> registrationData) async {
  try {
    // We use .ref! because registration usually requires the Auth Token 
    // from the OTP verification step
    final response = await dioClient.ref!.post(
      ApiUrls.register,
      data: registrationData,
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return ResponseData("Account created successfully", ResponseStatus.SUCCESS);
    } else {
      final message = response.data?["message"] ?? "Registration failed";
      return ResponseData(message, ResponseStatus.FAILED);
    }
  } on DioException catch (e) {
    return ResponseData(e.response?.data?["message"] ?? "Server Error", ResponseStatus.FAILED);
  } catch (e) {
    return ResponseData("An unexpected error occurred", ResponseStatus.FAILED);
  }
}

Future<void> logout(BuildContext context) async {
  await (await SharedPreferences.getInstance()).clear();
  Navigator.pushAndRemoveUntil(
    context,
    MaterialPageRoute(builder: (_) => const LoginScreen()),
    (route) => false,
  );
}
}

AuthManager authManager = AuthManager();