import 'dart:io';

/// Result of a pre-upload file validation check.
class FileValidationResult {
  final bool isValid;
  final String? errorMessage;

  const FileValidationResult({
    required this.isValid,
    this.errorMessage,
  });

  static const FileValidationResult valid = FileValidationResult(isValid: true);

  static FileValidationResult invalid(String message) =>
      FileValidationResult(isValid: false, errorMessage: message);
}

/// Centralized helper for uniform client-side file size and format validation across Medikto.
///
/// Policy:
/// Standardized maximum file size: 10 MB (10 * 1024 * 1024 bytes).
/// Supported extensions: PDF, PNG, JPG, JPEG, WEBP, DOC, DOCX.
class FileValidationHelper {
  /// Maximum allowed file size in bytes (10 MB).
  static const int maxFileSizeBytes = 10 * 1024 * 1024; // 10,485,760 bytes

  /// Maximum allowed file size in Megabytes for display strings.
  static const int maxFileSizeMb = 10;

  /// Allowed file extensions across reports and prescriptions.
  static const Set<String> allowedExtensions = {
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.doc',
    '.docx',
  };

  /// Only image extensions.
  static const Set<String> allowedImageExtensions = {
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
  };

  /// Validates a [file] against the 10 MB product limit and allowed formats.
  static Future<FileValidationResult> validateFile(
    File? file, {
    bool isPdfOnly = false,
    bool isImageOnly = false,
  }) async {
    if (file == null) {
      return FileValidationResult.invalid("No file selected.");
    }

    if (!await file.exists()) {
      return FileValidationResult.invalid("Selected file could not be found on device.");
    }

    final int size = await file.length();
    if (size > maxFileSizeBytes) {
      return FileValidationResult.invalid(
        "File size exceeds the 10 MB limit. Please select a smaller file.",
      );
    }

    final pathStr = file.path.toLowerCase();
    final dotIndex = pathStr.lastIndexOf('.');
    if (dotIndex == -1) {
      return FileValidationResult.invalid(
        "Invalid file: No file extension found.",
      );
    }

    final ext = pathStr.substring(dotIndex);

    if (isPdfOnly) {
      if (ext != '.pdf') {
        return FileValidationResult.invalid(
          "Unsupported format: $ext. Please select a PDF file.",
        );
      }
      return FileValidationResult.valid;
    }

    if (isImageOnly) {
      if (!allowedImageExtensions.contains(ext)) {
        return FileValidationResult.invalid(
          "Unsupported format: $ext. Allowed formats: PNG, JPG, JPEG, WEBP.",
        );
      }
      return FileValidationResult.valid;
    }

    if (!allowedExtensions.contains(ext)) {
      return FileValidationResult.invalid(
        "Unsupported format: $ext. Allowed formats: PDF, PNG, JPG, JPEG, WEBP.",
      );
    }

    return FileValidationResult.valid;
  }

  /// Synchronous length check helper if byte size is already known.
  static bool isSizeBytesValid(int bytes) => bytes <= maxFileSizeBytes;
}
