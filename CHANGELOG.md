# Changelog

All notable changes to the **Medikto** Medication Adherence & Health Tracking Ecosystem will be documented in this file.

---

## [1.0.0] - 2026-07-08

### Added
- **Guardian/Caretaker Management System**:
  - Implemented the guardian authentication flow, invitation management, and API integration.
  - Added read-only access rules for guardians monitoring medication schedules, vitals logs, and selfie uploads.
  - Implemented client-side guardian dashboard and backend controller linking algorithms.
- **Hospital Management & OTP-Based Linking**:
  - Developed super-admin controllers for hospital creation and automated admin account initialization.
  - Implemented secure 5-minute SMS/Push OTP-based workflow for linking patient accounts with hospitals.
  - Built an administrative hospital panel for patient searching, connection management, and adherence reviews.
- **Notification Stack & Timezone Support**:
  - Added automated timezone-aware medication reminder push notifications.
  - Integrated Firebase Cloud Messaging (FCM) on both Backend (Node.js) and Mobile Client (Flutter).
  - Enhanced FCM token refreshes and background/foreground handler logic on the mobile client.
- **Vitals & Health Hub**:
  - Built a comprehensive health hub inside the Flutter app.
  - Implemented vitals tracking screens (Blood Pressure, Heart Rate, Temperature, Blood Sugar).
  - Built PDF prescription uploads and image storage integrations for lab reports.
- **Selfie Verification (Proof of Medication)**:
  - Added compliance selfie uploads with custom watermark styling (time, date, app context) for verification.
  - Implemented soft-delete bins for deleted compliance selfies, allowing admin recovery for up to 1 year.
- **API Network Layer**:
  - Integrated a clean `Dio` network client with authentication interceptors in the Flutter mobile application.
  - Configured custom JWT token interceptors for automatic header authorization.
- **Super Admin Panel**:
  - Integrated Google OAuth Sign-In for Super Admins.
  - Created platforms to manage all registered hospitals, hospital administrators, and general platform statistics.

### Changed
- **Server URLs & Base Configuration**:
  - Transitioned default mobile client API endpoint settings to target VPS Server (`https://api.medikto.com/api`).
  - Updated Backend `google-callback` handling URLs for Super Admin OAuth flow.
  - Refined local development endpoints inside `api_urls.dart` to support localhost Android emulators (`10.0.2.2`).
- **Security & Authorization Refinement**:
  - Improved user verification response sequences to handle unregistered phone numbers gracefully.
  - Structured JWT verification middleware rules across all Express API routes.
- **Git Repository Organization**:
  - Normalized monorepo project configurations and excluded local debug artifacts.
  - Updated root `.gitignore` to exclude node modules, local env files, and Flutter build outputs (`.dart_tool/`, `build/`).

---

> **Note**: For code documentation and API routing maps, refer to `./Backend/API_DOCUMENTATION.md`.
