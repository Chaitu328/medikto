# Medikto Mobile App

This directory contains the Flutter mobile client for the Medikto Medication Adherence & Health Tracking Ecosystem.

---

## 🚀 Quick Start & Development

To run the application locally on a mobile device or simulator instead of Chrome:

### 1. Check Connected Devices
Verify if your phone or emulator is connected and recognized by running:
```bash
flutter devices
```

### 2. If Your Device is Not Listed:
* **For Physical Android Devices**: Enable **USB Debugging** in your phone's Developer Options and authorize the connection on your screen.
* **For Android Emulators**: Open Android Studio -> Device Manager, and launch the virtual device first.
* **For iOS Simulators (Mac)**: Launch the Xcode simulator app first.

### 3. Run the App
If multiple targets are available (e.g. Chrome and your phone), force Flutter to target the mobile client using the `-d` flag:
```bash
# Run on connected Android device/emulator
flutter run -d android

# Run on connected iOS device/simulator
flutter run -d ios

# Run on a specific emulator ID
flutter run -d emulator-5554
```

---

## 📖 Complete Guides

For detailed setup instructions, including backend connection settings, release build compilation, and general troubleshooting:
👉 Refer to the main workspace guide: **[MOBILE_SETUP.md](file:///d:/medikto/MOBILE_SETUP.md)**
