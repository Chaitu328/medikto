# Medikto Mobile App

This directory contains the Flutter mobile client for the Medikto Medication Adherence & Health Tracking Ecosystem.

---

## 🌟 Health Data & Medical History Consolidation

The mobile client features a unified, patient/elderly-friendly health data architecture:

- **Centralized Medical Documents Hub (`HealthRecordsHubScreen`)**:
  - **Health Vitals Tab**: Consolidates Blood Pressure, Heart Rate, Blood Sugar, and Body Temperature history in one unified view. Includes quick summary cards, integrated trend visualization with `fl_chart`, multi-field search, vital type filter chips, and 1-tap summary export/sharing.
  - **Medical Reports Tab**: Centralized viewing, searching, condition-filtering, and management of uploaded medical lab reports and files.
  - **Prescriptions Tab**: Unified prescription records with dosage instructions, active/disabled reminder filter chips, and detail views.
- **Streamlined Add Reading Flows**:
  - Single-purpose, focused forms for Blood Pressure, Heart Rate, Sugar Levels, and Body Temperature.
  - Auto-prefilled current date & time defaults, immediate save action, automatic return to previous screen with real-time provider invalidation.
- **Elderly-Friendly UI**: High-contrast neutral dark theme (`#121212`, `#1E1E1E`), consistent cyan accent (`#81DEEA`), clear readable typography, large tap targets, and elimination of fragmented per-vital history pages.

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

### 4. Running Tests
Run automated unit and widget tests:
```bash
flutter test
```

---

## 💊 Medication Lifecycle & 60-Minute Action Window

The Medikto mobile app adheres strictly to the unified medication lifecycle and action eligibility rules:

### 1. Multi-Stage Controlled Reminders
- **Pre-Reminder (~15 min before schedule)**: Advance notification (`"Your {name} dose is scheduled at {time}"`). Action buttons remain **hidden** (Dose is Upcoming).
- **Scheduled Reminder (at scheduled time)**: Action window alert (`"It's time to take your {name}"`). Action buttons (`Mark as Taken` & `Verify with Selfie`) become **active**.
- **Post-Reminder (~15 min after schedule)**: Pending dose reminder (`"Your {name} dose scheduled for {time} is still pending"`) dispatched only if the dose is still pending.
- **Missed Alert (+60 min after schedule)**: Dispatched once when the dose action window expires and transitions to `missed`.

### 2. State Machine Hierarchy
`1. Status (taken/missed/cancelled) -> 2. Scheduled Date -> 3. Scheduled Time -> 4. Current Asia/Kolkata Time`

- **Pending + Scheduled in Future**: Badge displays **"Upcoming"**; action buttons are hidden.
- **Pending + Reached / Within 60m Window**: **"Mark as Taken"** and **"Verify with Selfie"** are visible.
- **Pending + >60m Exceeded**: Badge displays **"Missed Dose"**; action buttons are permanently hidden.
- **Taken**: Badge displays **"Medicine Taken"**; action buttons are hidden regardless of time.
- **Notification Tap**: Tapping a reminder notification opens the app directly to the **"My Medications"** tab (`BaseBottomNavigationPage(index: 1)`).

### 3. Medication Edit & Delete Actions
- **Recent Activity & Activity History**: Both screens display compact Edit (`Icons.edit_outlined`) and Delete (`Icons.delete_outline`) icon buttons on medication activity cards.
- **Parent Medication Targeting**: Edit and Delete actions operate on the parent `Medication` model referenced by the dose.
- **Edit Mode**: Opens `MedicationVerificationScreen` pre-populated with existing medication details and displays `"UPDATE MEDICATION"`.
- **Delete Confirmation**: Shows a confirmation dialog before calling `deleteMedicationProvider`, cancelling future doses and stopping future reminders while preserving historical TAKEN and MISSED dose logs.

---

## 📖 Complete Guides

For detailed setup instructions, including backend connection settings, release build compilation, and general troubleshooting:
👉 Refer to the main workspace guide: **[MOBILE_SETUP.md](file:///d:/medikto/MOBILE_SETUP.md)**


