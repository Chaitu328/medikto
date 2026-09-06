import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:medikto/firebase_options.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:medikto/main.dart';
import 'package:medikto/bottom_bar.dart';

// Android notification channel specification
const AndroidNotificationChannel mediktoNotificationChannel =
    AndroidNotificationChannel(
      'medikto_channel',
      'Medikto Medication Reminders',
      description: 'High-priority medication schedule and missed dose alerts',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    );

final FlutterLocalNotificationsPlugin _localNotifications =
    FlutterLocalNotificationsPlugin();

void _navigateToMedications() {
  try {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      navigatorKey.currentState?.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => const BaseBottomNavigationPage(index: 1),
        ),
        (route) => false,
      );
    });
  } catch (e) {
    if (kDebugMode) {
      print("Error navigating to medications on notification click: $e");
    }
  }
}

// Background message handler
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  if (kDebugMode) {
    print("Handling background/terminated FCM message: ${message.messageId} - ${message.data}");
  }
}

class NotificationManager {
  factory NotificationManager() => _instance;
  NotificationManager._internal();
  static final NotificationManager _instance = NotificationManager._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

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

    // 3. Initialize Flutter Local Notifications & create Android channel
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    const initSettings = InitializationSettings(
      android: androidInit,
      iOS: iosInit,
    );

    await _localNotifications.initialize(
      settings: initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        if (kDebugMode) {
          print('Local notification clicked with payload: ${response.payload}');
        }
        _navigateToMedications();
      },
    );

    // Explicitly create notification channel on Android system
    final androidImplementation = _localNotifications
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >();
    if (androidImplementation != null) {
      await androidImplementation.createNotificationChannel(
        mediktoNotificationChannel,
      );
      if (kDebugMode) {
        print('Android notification channel [medikto_channel] registered with high importance');
      }
    }

    // 4. Enable foreground notification presentation options for iOS / macOS
    await _fcm.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // 5. Listen to foreground messages and show local notification heads-up
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (kDebugMode) {
        print('Received foreground notification: ${message.notification?.title} - ${message.notification?.body}');
        print('Message data: ${message.data}');
      }

      final notification = message.notification;
      if (notification != null) {
        _localNotifications.show(
          id: notification.hashCode,
          title: notification.title ?? "💊 Medication Reminder",
          body: notification.body ?? "",
          notificationDetails: NotificationDetails(
            android: AndroidNotificationDetails(
              mediktoNotificationChannel.id,
              mediktoNotificationChannel.name,
              channelDescription: mediktoNotificationChannel.description,
              importance: Importance.max,
              priority: Priority.high,
              icon: '@mipmap/ic_launcher',
              playSound: true,
              enableVibration: true,
            ),
            iOS: const DarwinNotificationDetails(
              presentAlert: true,
              presentBadge: true,
              presentSound: true,
            ),
          ),
          payload: message.data['doseId'] ?? '',
        );
      }
    });

    // 6. Handle notification click events when app opens from background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (kDebugMode) {
        print('Notification clicked! Opened app: ${message.data}');
      }
      _navigateToMedications();
    });

    // 7. Check if app was opened directly from terminated state via notification click
    final initialMessage = await _fcm.getInitialMessage();
    if (initialMessage != null) {
      if (kDebugMode) {
        print('App launched from terminated state via notification: ${initialMessage.data}');
      }
      _navigateToMedications();
    }

    // 8. Listen for token refresh events
    _fcm.onTokenRefresh.listen((newToken) {
      if (kDebugMode) {
        print('FCM Token refreshed: $newToken');
      }
      registerFCMToken();
    });

    _isInitialized = true;

    // 9. Retrieve and upload FCM token if logged in
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
        String timezone = "Asia/Kolkata";
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
