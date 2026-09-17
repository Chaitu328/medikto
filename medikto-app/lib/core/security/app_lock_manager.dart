import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/features/auth/pin/pin_lock_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppLockManager {
  factory AppLockManager() => _instance;
  AppLockManager._internal();
  static final AppLockManager _instance = AppLockManager._internal();

  bool _isAppLocked = true;
  DateTime? _lastBackgroundedAt;

  bool get isAppLocked => _isAppLocked;

  void lockApp() {
    _isAppLocked = true;
  }

  void unlockApp() {
    _isAppLocked = false;
  }

  void recordBackgrounded() {
    _lastBackgroundedAt = DateTime.now();
  }

  bool shouldLockOnResume({int timeoutSeconds = 0}) {
    if (_isAppLocked) return true;
    if (_lastBackgroundedAt == null) return false;
    final diff = DateTime.now().difference(_lastBackgroundedAt!).inSeconds;
    return diff >= timeoutSeconds;
  }

  void clearBackgroundedTimestamp() {
    _lastBackgroundedAt = null;
  }

  String _hashKey(String userId) => 'medikto_pin_hash_$userId';
  String _saltKey(String userId) => 'medikto_pin_salt_$userId';

  Future<String?> getActiveUserId() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUserId = prefs.getString(StorageKeys.userId);
    if (savedUserId != null && savedUserId.isNotEmpty) {
      return savedUserId;
    }

    final token = prefs.getString(StorageKeys.token);
    if (token != null && token.isNotEmpty && !token.startsWith('mock_')) {
      try {
        final decoded = JwtDecoder.decode(token);
        final id = decoded['id'] ?? decoded['_id'] ?? decoded['userId'];
        if (id != null) {
          await prefs.setString(StorageKeys.userId, id.toString());
          return id.toString();
        }
      } catch (_) {}
    }
    return null;
  }

  Future<bool> hasPin(String userId) async {
    if (userId.isEmpty) return false;
    final prefs = await SharedPreferences.getInstance();
    final hash = prefs.getString(_hashKey(userId));
    return hash != null && hash.isNotEmpty;
  }

  Future<void> setPin(String userId, String pin) async {
    if (userId.isEmpty || pin.length != 4) return;
    final prefs = await SharedPreferences.getInstance();

    final random = Random.secure();
    final saltBytes = List<int>.generate(16, (_) => random.nextInt(256));
    final saltBase64 = base64Encode(saltBytes);

    final digest = sha256.convert(utf8.encode('$saltBase64$pin'));
    final hashHex = digest.toString();

    await prefs.setString(_saltKey(userId), saltBase64);
    await prefs.setString(_hashKey(userId), hashHex);
    _isAppLocked = false;
  }

  Future<bool> verifyPin(String userId, String candidatePin) async {
    if (userId.isEmpty || candidatePin.length != 4) return false;
    final prefs = await SharedPreferences.getInstance();
    final storedSalt = prefs.getString(_saltKey(userId));
    final storedHash = prefs.getString(_hashKey(userId));

    if (storedSalt == null || storedHash == null) return false;

    final digest = sha256.convert(utf8.encode('$storedSalt$candidatePin'));
    final candidateHash = digest.toString();

    final isCorrect = (candidateHash == storedHash);
    if (isCorrect) {
      _isAppLocked = false;
    }
    return isCorrect;
  }

  Future<void> removePin(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_saltKey(userId));
    await prefs.remove(_hashKey(userId));
  }

  /// Request PIN verification before sensitive actions (e.g. sharing medical reports or prescriptions)
  Future<bool> requestPinVerification(BuildContext context, {String? reason}) async {
    final userId = await getActiveUserId();
    if (userId == null) return false;

    final pinConfigured = await hasPin(userId);
    if (!pinConfigured) {
      // If no PIN is configured on device, allow action
      return true;
    }

    if (!context.mounted) return false;

    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => PinVerificationModal(
        userId: userId,
        reason: reason ?? "Enter your 4-digit PIN to continue",
      ),
    );

    return result == true;
  }
}
