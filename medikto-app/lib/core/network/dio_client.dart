
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:medikto/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DioClient {
  factory DioClient() {
    return _singleton;
  }

  DioClient._internal() {
    init();
  }

  static final DioClient _singleton = DioClient._internal();

  Dio? _dio;
  Dio? _tokenDio;

  static SharedPreferences? prefs;

  int authFailCount = 0;

  String token = "";

  Future<String> _getAuthorizationToken() async {
    prefs ??= await SharedPreferences.getInstance();
    token = prefs?.getString(StorageKeys.token) ?? "";
    print(token);
    return token;
  }

  String getAuthorizationToken() {
    return token;
  }


Future<void> logoutUser() async {
    final prefs = await SharedPreferences.getInstance();

    /// CLEAR STORED DATA
    await prefs.remove(StorageKeys.token);
    await prefs.remove(StorageKeys.refreshToken);
    await prefs.remove(StorageKeys.userId);

    /// OPTIONAL
    /// keep onboarding so user won't see onboarding again
    /// if you want full reset use prefs.clear()

    /// CLEAR IN-MEMORY TOKEN
    token = "";

    /// CLEAR DIO AUTH HEADER
    _dio?.options.headers.clear();

    /// NAVIGATE TO LOGIN
    navigatorKey.currentState?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );

    debugPrint("USER LOGGED OUT");
  }
  dynamic init() {
    _dio = Dio();
    _dio!.options = BaseOptions(
        validateStatus: (status) => status! < 500, baseUrl: ApiUrls.baseUrl);
    // Used to get token
    _tokenDio = Dio();
    _tokenDio!.options = BaseOptions(
      validateStatus: (status) => status! < 500,
      baseUrl: ApiUrls.baseUrl,
    );
    _tokenDio!.interceptors.add(
      InterceptorsWrapper(onRequest: (options, handler) async {
        return handler.next(options);
      }, onResponse: (response, handler) async {
        debugPrint(response.realUri.toString());
        debugPrint(response.statusCode.toString());
        return handler.next(response);
      }, onError: (error, handler) {
        debugPrint(error.response?.realUri.toString());
        debugPrint(error.response?.statusCode.toString());
        return handler.next(error);
      }),
    );

    _dio!.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {

      final token = await _getAuthorizationToken();
      if (token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }

      return handler.next(options);
    }, onResponse: (response, handler) async {
      // Do something with response data
      // TODO: Remove Print Statements
      debugPrint(response.realUri.toString());
      debugPrint(response.statusCode.toString());

          if (response.statusCode == 401) {

            await logoutUser();

            return handler.reject(
              DioException(
                requestOptions: response.requestOptions,
                response: response,
                error: "Session expired",
              ),
            );

      } else {
        return handler.resolve(response);
      }
    }, onError: (error, handler) async {
      // TODO: Remove Print Statements
      debugPrint('Error');
      debugPrint(error.response?.realUri.toString());
      debugPrint(error.response?.data.toString());
      debugPrint(error.response?.statusCode?.toString() ?? '');

          if (error.response?.statusCode == 401) {

            await logoutUser();

            return handler.reject(error);
      } else {
        return handler.reject(error);
      }
    }));
  }

  Dio? get ref => _dio;

  Dio? get tokenRef => _tokenDio;
}

final dioClient = DioClient();