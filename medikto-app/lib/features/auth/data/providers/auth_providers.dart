import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/auth/data/managers/auth_manager.dart';

final authProvider = Provider<AuthManager>((ref) => AuthManager());

final loginProvider = FutureProvider.autoDispose.family<ResponseData, String>(
  (ref, phone) => ref.watch(authProvider).performLogin(phone),
);


final registerProvider = FutureProvider.autoDispose.family<ResponseData, Map<String, dynamic>>(
  (ref, data) => ref.watch(authProvider).registerProfile(data),
);

/// VERIFY OTP PROVIDER
final verifyOtpProvider = FutureProvider.autoDispose
    .family<ResponseData, Map<String, dynamic>>(
      (ref, data) => ref
          .watch(authProvider)
          .verifyOtp(phone: data['phone'], otp: data['otp']),
    );
