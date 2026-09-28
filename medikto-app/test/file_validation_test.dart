import 'package:flutter_test/flutter_test.dart';
import 'package:medikto/core/utils/file_validation_helper.dart';

void main() {
  group('FileValidationHelper Policy & Utilities', () {
    test('Standardized limit is exactly 10 MB (10,485,760 bytes)', () {
      expect(FileValidationHelper.maxFileSizeBytes, 10 * 1024 * 1024);
      expect(FileValidationHelper.maxFileSizeMb, 10);
    });

    test('isSizeBytesValid correctly evaluates boundary values', () {
      // 10 MB exact
      expect(FileValidationHelper.isSizeBytesValid(10 * 1024 * 1024), isTrue);
      // 1 byte below 10 MB
      expect(FileValidationHelper.isSizeBytesValid(10 * 1024 * 1024 - 1), isTrue);
      // 1 byte over 10 MB
      expect(FileValidationHelper.isSizeBytesValid(10 * 1024 * 1024 + 1), isFalse);
      // 15 MB
      expect(FileValidationHelper.isSizeBytesValid(15 * 1024 * 1024), isFalse);
    });

    test('Allowed extensions include standard documents and images', () {
      expect(FileValidationHelper.allowedExtensions, contains('.pdf'));
      expect(FileValidationHelper.allowedExtensions, contains('.jpg'));
      expect(FileValidationHelper.allowedExtensions, contains('.jpeg'));
      expect(FileValidationHelper.allowedExtensions, contains('.png'));
      expect(FileValidationHelper.allowedExtensions, contains('.webp'));
    });

    test('Allowed image extensions only contain images', () {
      expect(FileValidationHelper.allowedImageExtensions, contains('.png'));
      expect(FileValidationHelper.allowedImageExtensions, contains('.jpg'));
      expect(FileValidationHelper.allowedImageExtensions, contains('.jpeg'));
      expect(FileValidationHelper.allowedImageExtensions, contains('.webp'));
      expect(FileValidationHelper.allowedImageExtensions, isNot(contains('.pdf')));
    });

    test('FileValidationResult constants and factories', () {
      expect(FileValidationResult.valid.isValid, isTrue);
      expect(FileValidationResult.valid.errorMessage, isNull);

      final invalid = FileValidationResult.invalid('Too large');
      expect(invalid.isValid, isFalse);
      expect(invalid.errorMessage, 'Too large');
    });
  });
}
