# Mobile App Connection & Build Guide

This guide details how to connect the Medikto mobile application to the backend API, manage local development, and compile release builds for production.

---

## 🔗 1. Connecting Mobile App to Backend

The base URL for all API requests is defined in the Flutter project at:
👉 **[api_urls.dart](file:///d:/medikto/medikto-app/lib/core/constants/api_urls.dart)**

### **Local Development Setup**
If the backend is running locally on your computer, you must change `baseUrl` depending on where you are running the mobile client:
* **Android Emulator:** Use IP `http://10.0.2.2:4000/api` (standard alias to localhost).
* **iOS Simulator:** Use `http://localhost:4000/api`.
* **Physical Device (WiFi):** Find your computer's local IP address (e.g. `191.168.1.50`) and set `http://<your_local_ip>:4000/api`.

### **Production Setup**
Once deployed to a server, update the `baseUrl` in `api_urls.dart` to your domain:
```dart
static const String baseUrl = "https://yourdomain.com/api";
```

---

## 🛠️ 2. Development Commands

Run these commands inside the **`medikto-app`** directory:

### **Dependency Retrieval**
Download and link all Flutter packages:
```bash
flutter pub get
```

### **Build Cleaning**
Clear compile caches (run this if you encounter strange build errors):
```bash
flutter clean
```

### **Static Code Analysis**
Verify there are no compile warnings or errors:
```bash
flutter analyze
```

### **Run Application**
Launch the app in debug mode on a connected device/emulator:
```bash
# Run on default/detected device
flutter run

# View all connected devices and their IDs
flutter devices

# Run on a specific device/simulator (e.g. android, ios, emulator ID)
flutter run -d <device_id>
```

#### **💡 Running on Mobile instead of Chrome**
If running `flutter run` opens Chrome by default:
1. **Check connected devices**: Run `flutter devices` to verify if your device/simulator is detected.
2. **If your device is not listed**:
   * **For Physical Android Devices**: Ensure **USB Debugging** is enabled in your phone's Developer Options and that you have authorized the connection.
   * **For Android Emulators**: Open Android Studio -> Device Manager, and launch the virtual device first.
   * **For iOS Simulators (Mac)**: Launch the simulator app first.
3. **Specify target device**: If multiple devices (like Chrome and your phone) are connected, use the `-d` flag:
   ```bash
   flutter run -d android          # Run on connected Android device
   flutter run -d ios              # Run on connected iOS device/simulator
   flutter run -d emulator-5554    # Run on a specific Android emulator ID
   ```

---

## 📦 3. Release & Production Builds

Before building, verify that `google-services.json` is in:
`medikto-app/android/app/google-services.json`.

### **Android Release (APK)**
Generates a standalone installable APK package. 
```bash
flutter build apk --release
```
* **Output Path:** `build/app/outputs/flutter-apk/app-release.apk`

### **Android Release (App Bundle)**
Generates an AAB file (required for publishing to the Google Play Store).
```bash
flutter build appbundle --release
```
* **Output Path:** `build/app/outputs/bundle/release/app-release.aab`

### **iOS Release (IPA)**
Generates an archive payload ready for TestFlight or the App Store (requires macOS with Xcode).
```bash
flutter build ipa --release
```
* **Output Path:** `build/ios/archive/` and `build/ios/ipa/`

---

## 🔧 4. Troubleshooting Checklist
1. **Gradle Build Errors (Android):** Verify you are building using **Java JDK 17**.
2. **Network Connection Refused:** Ensure the backend server is running and the port (`4000`) is open.
3. **SMS OTP Failures:** Ensure you have populated real credentials (Fast2SMS or Twilio) inside the backend `.env` file.
4. **App opens in Chrome instead of Mobile:** Make sure your mobile emulator is running or physical device is connected with USB Debugging active. Check recognition via `flutter devices`, then force the target using `flutter run -d <device_id>`.
