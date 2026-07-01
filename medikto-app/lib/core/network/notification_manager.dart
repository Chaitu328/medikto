import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:flutter_timezone/flutter_timezone.dart';

// Background message handler
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  if (kDebugMode) {
    print("Handling background message: ${message.messageId}");
  }
}

class NotificationManager {
  factory NotificationManager() => _instance;
  NotificationManager._internal();
  static final NotificationManager _instance = NotificationManager._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // 1. Register background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // 2. Request user permissions
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (kDebugMode) {
      print('User granted permission: ${settings.authorizationStatus}');
    }

    // 3. Listen to foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (kDebugMode) {
        print('Received foreground message: ${message.notification?.title}');
      }
      // Since notifications are handled by the system in background,
      // in foreground we can display alert, custom banner or dialog if needed.
    });

    // 4. Handle notification click events when app opens from background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (kDebugMode) {
        print('Notification clicked! Opened app: ${message.data}');
      }
    });

    // 5. Retrieve and upload FCM token if logged in
    await registerFCMToken();
  }

  Future<void> registerFCMToken() async {
    try {
      final token = await _fcm.getToken();
      if (token == null) {
        if (kDebugMode) print("FCM Token is null");
        return;
      }

      if (kDebugMode) {
        print("Retrieved FCM Token: $token");
      }

      // Check if dioClient has a base authorization token (user is authenticated)
      if (dioClient.ref != null) {
        String timezone = "UTC";
        try {
          final tzInfo = await FlutterTimezone.getLocalTimezone();
          timezone = tzInfo.identifier;
        } catch (tzErr) {
          if (kDebugMode) print("Error fetching timezone: $tzErr");
        }

        final response = await dioClient.ref!.put(
          "/profile/fcm-token",
          data: {
            "fcmToken": token,
            "timezone": timezone,
          },
        );
        if (kDebugMode) {
          print("FCM Token registration on backend response: ${response.statusCode}");
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print("Error registering FCM token: $e");
      }
    }
  }
}
