import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ScreenSecurityService {
  factory ScreenSecurityService() => _instance;
  ScreenSecurityService._internal();
  static final ScreenSecurityService _instance = ScreenSecurityService._internal();

  static const MethodChannel _channel = MethodChannel('com.example.medikto/screen_security');

  /// Canonical client-mandated security notice message
  static const String securityNotice = "Due to security, you cannot share your screen.";

  /// Enable native screen protection (e.g. FLAG_SECURE on Android)
  Future<bool> enableSecurity() async {
    try {
      final result = await _channel.invokeMethod<bool>('enableSecureMode');
      return result ?? true;
    } catch (e) {
      if (kDebugMode) {
        print("ScreenSecurityService enableSecurity error: $e");
      }
      return false;
    }
  }

  /// Disable native screen protection if explicitly needed
  Future<bool> disableSecurity() async {
    try {
      final result = await _channel.invokeMethod<bool>('disableSecureMode');
      return result ?? true;
    } catch (e) {
      if (kDebugMode) {
        print("ScreenSecurityService disableSecurity error: $e");
      }
      return false;
    }
  }

  /// Query whether secure mode is actively applied
  Future<bool> isSecureModeEnabled() async {
    try {
      final result = await _channel.invokeMethod<bool>('isSecureModeEnabled');
      return result ?? false;
    } catch (e) {
      return false;
    }
  }

  /// Displays the required security notice toast/snackbar
  void showSecurityNotice(BuildContext context) {
    if (!context.mounted) return;
    ScaffoldMessenger.maybeOf(context)?.showSnackBar(
      const SnackBar(
        content: Text(
          securityNotice,
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Color(0xFFC62828),
        duration: Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
