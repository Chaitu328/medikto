import 'package:firebase_core/firebase_core.dart';
import 'package:medikto/firebase_options.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:flutter_timezone/flutter_timezone.dart';

// Background message handler
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
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

    // 2. Request user permissions (iOS & Android 13+)
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    if (kDebugMode) {
      print('User granted notification permission: ${settings.authorizationStatus}');
    }

    // 3. Enable foreground notification presentation options for iOS / macOS
    await _fcm.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // 4. Listen to foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (kDebugMode) {
        print('Received foreground notification: ${message.notification?.title} - ${message.notification?.body}');
        print('Message data: ${message.data}');
      }
    });

    // 5. Handle notification click events when app opens from background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (kDebugMode) {
        print('Notification clicked! Opened app: ${message.data}');
      }
    });

    // 6. Listen for token refresh events
    _fcm.onTokenRefresh.listen((newToken) {
      if (kDebugMode) {
        print('FCM Token refreshed: $newToken');
      }
      registerFCMToken();
    });

    // 7. Retrieve and upload FCM token if logged in
    await registerFCMToken();
  }

  Future<void> registerFCMToken() async {
    try {
      // On iOS, ensure APNs token is generated before requesting FCM token
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        String? apnsToken = await _fcm.getAPNSToken();
        if (apnsToken == null) {
          if (kDebugMode) {
            print("APNs token is not ready yet. Retrying in 2 seconds...");
          }
          await Future.delayed(const Duration(seconds: 2));
          apnsToken = await _fcm.getAPNSToken();
        }
        if (kDebugMode) {
          print("Retrieved APNs token: $apnsToken");
        }
      }

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
