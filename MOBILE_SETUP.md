# 📱 Medikto Mobile App Setup Guide

This guide walks you through the step-by-step process of setting up, configuring, running, and building the Flutter mobile application for the **Medikto** ecosystem.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

1. **Flutter SDK**: 
   - Recommended Version: `3.11.4` or higher.
   - Run `flutter --version` to check your current installation.
2. **Dart SDK**: Included with the Flutter SDK installation.
3. **IDE / Editors**:
   - **VS Code** (with *Flutter* and *Dart* extensions installed) OR
   - **Android Studio** / **IntelliJ IDEA** (with *Flutter* and *Dart* plugins configured).
4. **Platform-Specific SDKs**:
   - **Android**: Android Studio & Android SDK Command-line Tools installed.
   - **iOS (macOS only)**: Xcode installed, along with CocoaPods (`sudo gem install cocoapods` or via Homebrew).

---

## 🚀 Step 1: Getting Dependencies

Navigate to the mobile app directory and retrieve the required Flutter packages:

```bash
# Navigate to the mobile app directory
cd medikto-app

# Fetch dependencies
flutter pub get
```

---

## ⚙️ Step 2: Configuration & Integrations

### 1. Backend API Connection Configuration
By default, the mobile client is configured to connect to the production VPS server. For local development, you should point the app to your local backend server.

Open [api_urls.dart](file:///medikto-app/lib/core/constants/api_urls.dart) and configure the `baseUrl` variable:

```dart
class ApiUrls {
  // Base URL Configurations
  
  // 1. VPS/Production Server (Default)
  static const String baseUrl = "https://api.medikto.com/api"; 
  
  // 2. Local Android Emulator (Redirects to host machine's localhost:4000)
  // static const String baseUrl = "http://10.0.2.2:4000/api"; 
  
  // 3. Local iOS Simulator / Web Browser
  // static const String baseUrl = "http://localhost:4000/api";
  
  // 4. Local Physical Device (Replace with host machine's local IP address)
  // static const String baseUrl = "http://192.168.1.8:4000/api";
  
  ...
}
```

### 2. Firebase & Push Notifications Setup
Medikto utilizes Firebase for SMS OTP authentication and Firebase Cloud Messaging (FCM) for push notifications.

#### 🤖 Android Setup
1. A default `google-services.json` file is already provided inside the project at [android/app/google-services.json](file:///medikto-app/android/app/google-services.json).
2. If you are linking the app to your own Firebase project, replace this file with the one generated from your Firebase Console.

#### 🍏 iOS Setup (macOS only)
1. Add an iOS app inside your Firebase Console under the same project.
2. Download the `GoogleService-Info.plist` file and place it at `ios/Runner/GoogleService-Info.plist`.
3. Open the iOS folder in Xcode: `open ios/Runner.xcworkspace`.
4. Ensure `GoogleService-Info.plist` is linked to the `Runner` target.
5. In Xcode, enable **Push Notifications** and **Background Modes** (check *Background fetch* and *Remote notifications*) under the target's *Signing & Capabilities* tab.
6. **Upload APNs Key to Firebase (Crucial)**:
   - In your [Apple Developer Portal](https://developer.apple.com/account) -> **Certificates, Identifiers & Profiles** -> **Keys**, create an **Apple Push Notifications service (APNs)** key and download the `.p8` file.
   - Go to [Firebase Console](https://console.firebase.google.com) -> **Project Settings** -> **Cloud Messaging** -> **Apple app configuration** -> upload your `.p8` key with your Team ID and Key ID.
7. Always test iOS push notifications on a **physical iPhone/iPad** rather than an iOS Simulator.

---

## 🏃 Step 3: Running the App in Development

1. Check that your physical device or emulator is detected by Flutter:
   ```bash
   flutter devices
   ```
2. Run the application in Debug mode:
   ```bash
   # Run on any available device/emulator
   flutter run

   # Target Android specifically
   flutter run -d android

   # Target iOS specifically (macOS only)
   flutter run -d ios
   ```

---

## 📦 Step 4: Compiling for Production (Release)

When you are ready to build a release package of the application:

### 🤖 Build Android Release
```bash
# Build a universal release APK
flutter build apk --release

# OR build an App Bundle (recommended for Google Play Store publishing)
flutter build appbundle --release
```
The compiled APK will be generated at:  
`medikto-app/build/app/outputs/flutter-apk/app-release.apk`

### 🍏 Build iOS Release (macOS only)
Make sure your distribution certificates and provisioning profiles are configured in Xcode before running:
```bash
flutter build ipa --release
```
Follow the prompts in Xcode Organizer to sign and distribute your application to TestFlight or the App Store.

---

## 🔍 Troubleshooting

- **Dependency Mismatch / Build Errors**:
  Clean the build cache and reinstall dependencies:
  ```bash
  flutter clean
  flutter pub get
  ```
- **iOS Pod Issues**:
  If you run into issues installing CocoaPods dependencies:
  ```bash
  cd ios
  pod deintegrate
  pod cache clean --all
  pod install --repo-update
  cd ..
  ```
- **Network Connection Failures (Local Development)**:
  - If your physical device is connected to your local backend, make sure **both the phone and your PC are connected to the exact same Wi-Fi network**.
  - Ensure the firewall on your host computer allows incoming connections on port `4000`.
