import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/home/notifications/notification_manager.dart';

final notificationManagerProvider = Provider<NotificationManager>(
  (ref) => NotificationManager(),
);

final getNotificationsProvider = FutureProvider<ResponseData>((ref) async {
  return ref.read(notificationManagerProvider).getNotifications();
});
