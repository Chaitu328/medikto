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
  bool get isAppLocked => _isAppLocked;

  // In-memory cache for ultra-fast instant lookups
  String? _cachedUserId;
  final Map<String, String> _saltCache = {};
  final Map<String, String> _hashCache = {};

  void lockApp() {
    _isAppLocked = true;
  }

  void unlockApp() {
    _isAppLocked = false;
  }

  String _hashKey(String userId) => 'medikto_pin_hash_$userId';
  String _saltKey(String userId) => 'medikto_pin_salt_$userId';

  Future<String?> getActiveUserId() async {
    if (_cachedUserId != null && _cachedUserId!.isNotEmpty) {
      return _cachedUserId;
    }

    final prefs = await SharedPreferences.getInstance();
    final savedUserId = prefs.getString(StorageKeys.userId);
    if (savedUserId != null && savedUserId.isNotEmpty) {
      _cachedUserId = savedUserId;
      return savedUserId;
    }

    final token = prefs.getString(StorageKeys.token);
    if (token != null && token.isNotEmpty && !token.startsWith('mock_')) {
      try {
        final decoded = JwtDecoder.decode(token);
        final id = decoded['id'] ?? decoded['_id'] ?? decoded['userId'];
        if (id != null) {
          final idStr = id.toString();
          _cachedUserId = idStr;
          await prefs.setString(StorageKeys.userId, idStr);
          return idStr;
        }
      } catch (_) {}
    }
    return null;
  }

  Future<bool> hasPin(String userId) async {
    if (userId.isEmpty) return false;
    if (_hashCache.containsKey(userId)) {
      return _hashCache[userId]!.isNotEmpty;
    }
    final prefs = await SharedPreferences.getInstance();
    final hash = prefs.getString(_hashKey(userId));
    if (hash != null) {
      _hashCache[userId] = hash;
    }
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

    _saltCache[userId] = saltBase64;
    _hashCache[userId] = hashHex;

    await prefs.setString(_saltKey(userId), saltBase64);
    await prefs.setString(_hashKey(userId), hashHex);
    _isAppLocked = false;
  }

  Future<bool> verifyPin(String userId, String candidatePin) async {
    if (userId.isEmpty || candidatePin.length != 4) return false;

    String? storedSalt = _saltCache[userId];
    String? storedHash = _hashCache[userId];

    if (storedSalt == null || storedHash == null) {
      final prefs = await SharedPreferences.getInstance();
      storedSalt = prefs.getString(_saltKey(userId));
      storedHash = prefs.getString(_hashKey(userId));
      if (storedSalt != null) _saltCache[userId] = storedSalt;
      if (storedHash != null) _hashCache[userId] = storedHash;
    }

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
    _saltCache.remove(userId);
    _hashCache.remove(userId);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_saltKey(userId));
    await prefs.remove(_hashKey(userId));
  }

  /// Request PIN verification before sensitive actions (e.g. sharing medical reports or prescriptions)
  Future<bool> requestPinVerification(
    BuildContext context, {
    String? reason,
    Future<void> Function()? onVerified,
    String? loadingTitle,
    String? loadingSubtitle,
  }) async {
    final userId = await getActiveUserId();
    if (userId == null) return false;

    final pinConfigured = await hasPin(userId);
    if (!pinConfigured) {
      // If no PIN is configured on device, execute onVerified directly and allow action
      if (onVerified != null) {
        try {
          await onVerified();
        } catch (_) {
          return false;
        }
      }
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
        onVerified: onVerified,
        loadingTitle: loadingTitle,
        loadingSubtitle: loadingSubtitle,
      ),
    );

    return result == true;
  }
}
