import 'dart:io';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

/// Helper to handle rear (back) and front (selfie) camera captures on Android
/// via explicit Native MethodChannel intents to avoid OS camera caching issues,
/// and [ImagePicker] on iOS.
class AppCameraHelper {
  static const _channel = MethodChannel('com.example.medikto/camera');
  static final _picker = ImagePicker();

  /// Opens the rear (back) camera for reports and prescriptions.
  static Future<File?> captureRear({
    int quality = 70,
    double maxWidth = 1600,
    double maxHeight = 1600,
  }) async {
    if (Platform.isAndroid) {
      try {
        final String? path =
            await _channel.invokeMethod<String>('captureRearCamera');
        if (path != null && path.isNotEmpty) {
          final file = File(path);
          return (await file.exists()) ? file : null;
        }
        // User cancelled or pressed back - return null directly
        return null;
      } on PlatformException catch (_) {
        // Only fallback if the MethodChannel failed/unsupported
      }
    }

    // iOS or platform fallback
    final XFile? image = await _picker.pickImage(
      source: ImageSource.camera,
      preferredCameraDevice: CameraDevice.rear,
      imageQuality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
    );
    if (image == null) return null;
    final file = File(image.path);
    return (await file.exists()) ? file : null;
  }

  /// Opens the front (selfie) camera for medication verification.
  static Future<File?> captureFront({
    int quality = 70,
    double maxWidth = 1600,
    double maxHeight = 1600,
  }) async {
    if (Platform.isAndroid) {
      try {
        final String? path =
            await _channel.invokeMethod<String>('captureFrontCamera');
        if (path != null && path.isNotEmpty) {
          final file = File(path);
          return (await file.exists()) ? file : null;
        }
        // User cancelled or pressed back - return null directly
        return null;
      } on PlatformException catch (_) {
        // Only fallback if the MethodChannel failed/unsupported
      }
    }

    // iOS or platform fallback
    final XFile? image = await _picker.pickImage(
      source: ImageSource.camera,
      preferredCameraDevice: CameraDevice.front,
      imageQuality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
    );
    if (image == null) return null;
    final file = File(image.path);
    return (await file.exists()) ? file : null;
  }
}

/// Backwards-compatibility alias for existing code
class RearCameraHelper {
  static Future<File?> capture({
    int quality = 70,
    double maxWidth = 1600,
    double maxHeight = 1600,
  }) =>
      AppCameraHelper.captureRear(
        quality: quality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      );
}
