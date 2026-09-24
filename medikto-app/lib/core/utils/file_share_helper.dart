import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/security/app_lock_manager.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class FileShareHelper {
  /// Securely shares an actual local file via OS share sheet with PIN verification
  static Future<bool> shareFile({
    required BuildContext context,
    required String fileUrl,
    required String fallbackTitle,
    String? customFileName,
  }) async {
    if (fileUrl.trim().isEmpty) {
      AppToasts.showError(context, "No file attachment found to share.");
      return false;
    }

    return await AppLockManager().requestPinVerification(
      context,
      reason: "Enter PIN to share document",
      loadingTitle: "Preparing document",
      loadingSubtitle: "Downloading and preparing your file...\nPlease wait a moment.",
      onVerified: () async {
        final tempDir = await getTemporaryDirectory();
        final extension = _extractExtension(fileUrl);
        
        final dateStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
        final safeName = customFileName != null && customFileName.trim().isNotEmpty
            ? customFileName.trim()
            : "${_sanitizeFileName(fallbackTitle)}_$dateStr$extension";

        final filePath = "${tempDir.path}/$safeName";
        final file = File(filePath);

        final dio = Dio();
        final response = await dio.get<List<int>>(
          fileUrl,
          options: Options(
            responseType: ResponseType.bytes,
            followRedirects: true,
            validateStatus: (status) => status != null && status < 400,
          ),
        );

        if (response.data == null || response.data!.isEmpty) {
          throw Exception("Unable to download file for sharing.");
        }

        await file.writeAsBytes(response.data!);

        final mimeType = _getMimeType(extension);
        await Share.shareXFiles(
          [
            XFile(
              filePath,
              mimeType: mimeType,
              name: safeName,
            ),
          ],
          subject: fallbackTitle,
        );
      },
    );
  }


  static String _extractExtension(String url) {
    try {
      final cleanUrl = url.split('?').first.toLowerCase();
      if (cleanUrl.endsWith('.pdf')) return '.pdf';
      if (cleanUrl.endsWith('.png')) return '.png';
      if (cleanUrl.endsWith('.jpg')) return '.jpg';
      if (cleanUrl.endsWith('.jpeg')) return '.jpeg';
      if (cleanUrl.endsWith('.webp')) return '.webp';
      if (cleanUrl.endsWith('.gif')) return '.gif';
      if (cleanUrl.endsWith('.doc')) return '.doc';
      if (cleanUrl.endsWith('.docx')) return '.docx';
    } catch (_) {}
    return '.pdf'; // Default fallback for documents
  }

  static String _getMimeType(String ext) {
    switch (ext.toLowerCase()) {
      case '.pdf':
        return 'application/pdf';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  static String _sanitizeFileName(String input) {
    return input
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-zA-Z0-9_\-]'), '_')
        .replaceAll(RegExp(r'_+'), '_')
        .replaceAll(RegExp(r'^_|_$'), '');
  }
}
