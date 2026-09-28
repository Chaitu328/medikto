import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';

/// Helper to handle rear (back) and front (selfie) camera captures on Android
/// via explicit Native MethodChannel intents to avoid OS camera caching issues,
/// and [ImagePicker] on iOS.
///
/// Automatically optimizes and compresses camera output to reasonable dimensions
/// (max 1920x1920 @ 75% JPEG quality) ensuring document readability while keeping
/// file size well below the standardized 10 MB limit (normally 500 KB - 1.2 MB).
class AppCameraHelper {
  static const _channel = MethodChannel('com.example.medikto/camera');
  static final _picker = ImagePicker();

  /// Compresses a raw camera image to a standardized JPEG file.
  static Future<File?> _compressImageFile(
    File rawFile, {
    int quality = 75,
    int minWidth = 1920,
    int minHeight = 1920,
  }) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final targetPath =
          '${tempDir.path}/medikto_cam_${DateTime.now().millisecondsSinceEpoch}.jpg';

      final XFile? compressed = await FlutterImageCompress.compressAndGetFile(
        rawFile.absolute.path,
        targetPath,
        quality: quality,
        minWidth: minWidth,
        minHeight: minHeight,
        format: CompressFormat.jpeg,
      );

      if (compressed != null) {
        final compressedFile = File(compressed.path);
        if (await compressedFile.exists()) {
          // Clean up the raw file if different from compressed
          if (rawFile.path != compressedFile.path) {
            try {
              await rawFile.delete();
            } catch (_) {}
          }
          return compressedFile;
        }
      }
    } catch (e) {
      // If compression fails for any reason, return the raw file as fallback
    }
    return rawFile;
  }

  /// Opens the rear (back) camera for reports and prescriptions.
  static Future<File?> captureRear({
    int quality = 75,
    double maxWidth = 1920,
    double maxHeight = 1920,
  }) async {
    if (Platform.isAndroid) {
      try {
        final String? path =
            await _channel.invokeMethod<String>('captureRearCamera');
        if (path != null && path.isNotEmpty) {
          final file = File(path);
          if (await file.exists()) {
            return await _compressImageFile(
              file,
              quality: quality,
              minWidth: maxWidth.toInt(),
              minHeight: maxHeight.toInt(),
            );
          }
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
    int quality = 75,
    double maxWidth = 1920,
    double maxHeight = 1920,
  }) async {
    if (Platform.isAndroid) {
      try {
        final String? path =
            await _channel.invokeMethod<String>('captureFrontCamera');
        if (path != null && path.isNotEmpty) {
          final file = File(path);
          if (await file.exists()) {
            return await _compressImageFile(
              file,
              quality: quality,
              minWidth: maxWidth.toInt(),
              minHeight: maxHeight.toInt(),
            );
          }
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
    int quality = 75,
    double maxWidth = 1920,
    double maxHeight = 1920,
  }) =>
      AppCameraHelper.captureRear(
        quality: quality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      );
}
