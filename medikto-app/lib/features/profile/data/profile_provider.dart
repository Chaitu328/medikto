import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/profile/data/profile_manager.dart';

final profileProvider = Provider<ProfileManager>((ref) => ProfileManager());

final getProfileProvider = FutureProvider.autoDispose<ResponseData>(
  (ref) => ref.watch(profileProvider).getProfile(),
);

/// UPDATE SUBSCRIPTION PROVIDER
final updateSubscriptionProvider = FutureProvider.family<ResponseData, String>((
  ref,
  plan,
) async {
  return ref.watch(profileProvider).updateSubscription(plan: plan);
});

final updateProfileProvider =
    FutureProvider.family<ResponseData, Map<String, dynamic>>((
      ref,
      body,
    ) async {
      return ref
          .watch(profileProvider)
          .updateProfile(
            firstName: body['firstName'],
            phone: body['phone'],
            bloodGroup: body['bloodGroup'],
            gender: body['gender'],
            age: body['age'],
            height: body['height'],
            weight: body['weight'],
            image: body['image'],
          );
    });
