

import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
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

Future<ResponseData> checkIfPhoneRegistered(String phone) async {
  try {
    final response = await dioClient.tokenRef!.post(
      ApiUrls.checkPhone,
      data: {"phone": phone},
      options: Options(headers: {"Content-Type": "application/json"}),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      final bool exists = response.data['exists'] ?? false;
      final String msg = response.data['message'] ?? "";
      return ResponseData(msg, ResponseStatus.SUCCESS, data: exists);
    } else {
      return ResponseData(
        response.data['error'] ?? response.data['message'] ?? "Failed to check registration status",
        ResponseStatus.FAILED,
      );
    }
  } on DioException catch (e) {
    final message = e.response?.data?["error"] ?? e.response?.data?["message"] ?? "Server Connection Error";
    return ResponseData(message, ResponseStatus.FAILED);
  } catch (e) {
    return ResponseData("An unexpected error occurred: $e", ResponseStatus.FAILED);
  }
}

Future<void> sendFirebaseOTP({
  required String phone,
  required Function(String verificationId, int? resendToken) onCodeSent,
  required Function(FirebaseAuthException e) onVerificationFailed,
}) async {
  await FirebaseAuth.instance.verifyPhoneNumber(
    phoneNumber: phone,
    verificationCompleted: (PhoneAuthCredential credential) async {
      // Auto-verification where available
      try {
        final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
        final idToken = await userCredential.user?.getIdToken();
        if (idToken != null) {
          // If auto-verified, we can make the API call to backend to complete login
          final response = await dioClient.tokenRef!.post(
            ApiUrls.verifyOtp,
            data: {"token": idToken},
            options: Options(headers: {"Content-Type": "application/json"}),
          );
          if (response.statusCode == 200) {
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString(StorageKeys.token, response.data['token']);
          }
        }
      } catch (e) {
        debugPrint("Firebase Auto-verification failed: $e");
      }
    },
    verificationFailed: onVerificationFailed,
    codeSent: onCodeSent,
    codeAutoRetrievalTimeout: (String verificationId) {},
  );
}

Future<ResponseData> verifyFirebaseOTP({
  required String verificationId,
  required String smsCode,
}) async {
  try {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
    final idToken = await userCredential.user?.getIdToken();

    if (idToken == null) {
      return ResponseData("Failed to retrieve Firebase ID Token", ResponseStatus.FAILED);
    }

    // Send ID Token to backend for JWT session creation
    final response = await dioClient.tokenRef!.post(
      ApiUrls.verifyOtp,
      data: {"token": idToken},
      options: Options(headers: {"Content-Type": "application/json"}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(StorageKeys.token, response.data['token']);

      return ResponseData(
        response.data['message'] ?? "Login successful",
        ResponseStatus.SUCCESS,
        data: response.data,
      );
    } else {
      return ResponseData(
        response.data['error'] ?? response.data['message'] ?? "Verification Failed",
        ResponseStatus.FAILED,
      );
    }
  } on FirebaseAuthException catch (e) {
    return ResponseData(e.message ?? "Invalid OTP code", ResponseStatus.FAILED);
  } catch (e) {
    return ResponseData("Verification failed: $e", ResponseStatus.FAILED);
  }
}

// ================= GOOGLE SIGN IN =================
Future<ResponseData> signInWithGoogle() async {
  try {
    final GoogleSignIn googleSignIn = GoogleSignIn();
    
    // Trigger native Google Sign-In prompt
    final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
    if (googleUser == null) {
      return ResponseData("Google sign-in was cancelled.", ResponseStatus.FAILED, data: {"cancelled": true});
    }

    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
    final OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final UserCredential userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
    final String? firebaseIdToken = await userCredential.user?.getIdToken();

    if (firebaseIdToken == null) {
      return ResponseData("Unable to retrieve Firebase ID token. Please try again.", ResponseStatus.FAILED);
    }

    // Send Firebase ID Token to Medikto Backend
    final response = await dioClient.tokenRef!.post(
      ApiUrls.googleAuth,
      data: {"token": firebaseIdToken},
      options: Options(headers: {"Content-Type": "application/json"}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final isNewUser = response.data['isNewUser'] == true;

      if (isNewUser) {
        // Return payload for GoogleConsentScreen
        return ResponseData(
          "New Google user. Consent required.",
          ResponseStatus.SUCCESS,
          data: {
            "isNewUser": true,
            "idToken": firebaseIdToken,
            "email": response.data['email'],
            "name": response.data['name'],
            "picture": response.data['picture'],
          },
        );
      } else {
        // Existing user: Store JWT session token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(StorageKeys.token, response.data['token']);

        return ResponseData(
          response.data['message'] ?? "Login successful",
          ResponseStatus.SUCCESS,
          data: {
            "isNewUser": false,
            "user": response.data['user'],
            "token": response.data['token'],
          },
        );
      }
    } else {
      final msg = response.data?["message"] ?? "Unable to sign in with Google. Please try again.";
      return ResponseData(msg, ResponseStatus.FAILED);
    }
  } on FirebaseAuthException catch (e) {
    return ResponseData(e.message ?? "Unable to sign in with Google. Please try again.", ResponseStatus.FAILED);
  } on DioException catch (e) {
    final msg = e.response?.data?["message"] ?? e.response?.data?["error"] ?? "Unable to connect to server. Please try again.";
    return ResponseData(msg, ResponseStatus.FAILED);
  } catch (e) {
    return ResponseData("Unable to sign in with Google. Please try again.", ResponseStatus.FAILED);
  }
}

// ================= COMPLETE GOOGLE REGISTRATION =================
Future<ResponseData> completeGoogleRegistration({
  required String idToken,
  required String fullName,
  String? phone,
  required bool termsAccepted,
  required bool privacyPolicyAccepted,
  String? termsVersion,
  String? privacyPolicyVersion,
}) async {
  try {
    final response = await dioClient.tokenRef!.post(
      ApiUrls.googleCompleteRegistration,
      data: {
        "token": idToken,
        "fullName": fullName,
        "phone": phone,
        "termsAccepted": termsAccepted,
        "privacyPolicyAccepted": privacyPolicyAccepted,
        "termsVersion": termsVersion ?? "1.0",
        "privacyPolicyVersion": privacyPolicyVersion ?? "1.0",
      },
      options: Options(headers: {"Content-Type": "application/json"}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(StorageKeys.token, response.data['token']);
      return ResponseData(
        response.data['message'] ?? "Registration successful",
        ResponseStatus.SUCCESS,
        data: response.data,
      );
    } else {
      final msg = response.data?["message"] ?? "Unable to create your account. Please try again.";
      return ResponseData(msg, ResponseStatus.FAILED);
    }
  } on DioException catch (e) {
    final msg = e.response?.data?["message"] ?? e.response?.data?["error"] ?? "Unable to create your account. Please try again.";
    return ResponseData(msg, ResponseStatus.FAILED);
  } catch (e) {
    return ResponseData("Unable to create your account. Please try again.", ResponseStatus.FAILED);
  }
}

Future<ResponseData> registerProfile(Map<String, dynamic> registrationData) async {
  try {
    final response = await dioClient.ref!.post(
      ApiUrls.register,
      data: registrationData,
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(StorageKeys.token, response.data['token']);
      return ResponseData("Account created successfully", ResponseStatus.SUCCESS, data: response.data);
    } else {
      final message = response.data?["error"] ?? response.data?["message"] ?? "Registration failed";
      return ResponseData(message, ResponseStatus.FAILED);
    }
  } on DioException catch (e) {
    final message = e.response?.data?["error"] ?? e.response?.data?["message"] ?? "Server Error";
    return ResponseData(message, ResponseStatus.FAILED);
  } catch (e) {
    return ResponseData("An unexpected error occurred", ResponseStatus.FAILED);
  }
}

  Future<ResponseData> loginGuardian({
    required String email,
    required String password,
  }) async {
    try {
      final response = await dioClient.tokenRef!.post(
        ApiUrls.guardianLogin,
        data: {
          "email": email.trim().toLowerCase(),
          "password": password,
        },
        options: Options(headers: {"Content-Type": "application/json"}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(StorageKeys.token, response.data['token']);
        return ResponseData(
          response.data['message'] ?? "Login successful",
          ResponseStatus.SUCCESS,
          data: response.data,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Login Failed",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      return ResponseData(e.response?.data?["message"] ?? "Server Error", ResponseStatus.FAILED);
    } catch (e) {
      return ResponseData("An unexpected error occurred", ResponseStatus.FAILED);
    }
  }

Future<void> logout(BuildContext context) async {
  try {
    await GoogleSignIn().signOut();
  } catch (_) {}
  try {
    await FirebaseAuth.instance.signOut();
  } catch (_) {}
  await (await SharedPreferences.getInstance()).clear();
  if (context.mounted) {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }
}
}

AuthManager authManager = AuthManager();