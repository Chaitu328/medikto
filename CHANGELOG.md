# Project Changelog - Implemented Changes

This document provides a comprehensive log of all codebase modifications, new file additions, and architectural changes implemented across the Medikto workspace.

---

## 1. Medication Unit Modifications
* **Mobile Client Changes:**
  * Modified [medication_verification_screen.dart](file:///d:/medikto/medikto-app/lib/features/medications/views/medication_verification_screen.dart).
  * Removed unit options `"Tablet"` and `"Capsule"`.
  * Preserved only `"ml"`, `"mg"`, and `"gm"` as available units.
  * Added validation in the form submission block to ensure input alignment.

---

## 2. Display Health Vitals (History Header)
* **New Component:** Created [latest_vital_header.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/widgets/latest_vital_header.dart) to show the user's latest recorded vital measurement before the entry fields.
* **Entry Screens Updated:** Added the `LatestVitalHeader` widget to the top of:
  * [add_blood_pressure.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/health_data/add_blood_pressure.dart)
  * [add_body_temparature.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/health_data/add_body_temparature.dart)
  * [add_heart_rate.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/health_data/add_heart_rate.dart)
  * [add_sugar_levels.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/health_data/add_sugar_levels.dart)
* **Data Refreshing:** Set up `ref.invalidate(getVitalsProvider)` inside all vital addition forms to invalidate the Riverpod cache and trigger real-time updates.

---

## 3. Health Reports & Prescriptions Views
* **Backend Changes:** Added listing and details fetching routes and controllers for:
  * `GET /api/reports` / `GET /api/reports/:id`
  * `GET /api/prescriptions` / `GET /api/prescriptions/:id`
* **Mobile Client Additions:**
  * Created [medical_reports_list_screen.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/health_records/medical_reports_list_screen.dart) & [medical_report_detail_screen.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/health_records/medical_report_detail_screen.dart).
  * Created [prescriptions_list_screen.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/health_records/prescriptions_list_screen.dart) & [prescription_detail_screen.dart](file:///d:/medikto/medikto-app/lib/features/home/add_reports/health_records/prescription_detail_screen.dart).
  * Integrated PDF viewing, download, sharing, and print triggers.

---

## 4. Development Bypass
* **Mobile Login Update:** Modified [login_screen.dart](file:///d:/medikto/medikto-app/lib/features/auth/login_view/login_screen.dart) to include a "Bypass Authentication (Dev Mode)" action button. It saves a token `"mock_dev_token"` in `SharedPreferences` and launches `BaseBottomNavigationPage` to bypass code obstacles during local developer test cycles.
* **Splash Screen Fix:** Updated [splash_screen.dart](file:///d:/medikto/medikto-app/lib/splash_screen.dart) to bypass `JwtDecoder.isExpired` validation checks for mock tokens.
* **Backend Middleware Bypasses:** Refactored [authmiddleware.js](file:///d:/medikto/Backend/src/middlewares/authmiddleware.js) to skip token parsing checks when receiving `"dummy-token"` (for admin-panel development) or `"mock_"` prefixes (for mobile client development), mock-loading the first patient in the database to prevent API crashes.

---

## 5. Hospital Linkage Consent & Revoke
* **Backend Schemas:** Created [hospitalModel.js](file:///d:/medikto/Backend/src/models/hospitalModel.js) and [hospitalLinkOtpModel.js](file:///d:/medikto/Backend/src/models/hospitalLinkOtpModel.js).
* **OTP Verification Flows:** Developed [hospitalController.js](file:///d:/medikto/Backend/src/controllers/hospitalController.js) exposing `POST /hospitals/send-link-otp` (sends SMS code to patient) and `POST /hospitals/verify-link` (verifies code and binds patient).
* **Data Isolation:** Enforced hospital isolation inside backend query `getAllUsers`, ensuring logged-in hospital admins see only patients bound to their managed hospital.
* **Mobile Connected List:** Developed [connected_hospitals_screen.dart](file:///d:/medikto/medikto-app/lib/features/profile/views/connected_hospitals_screen.dart) allowing patients to view and disconnect linked hospital access. Added routing in the profile settings menu.

---

## 6. Twilio SMS Gateway Integration
* **Central Helper:** Created [smsHelper.js](file:///d:/medikto/Backend/src/utils/smsHelper.js) to normalise inputs and handle message dispatches automatically via Twilio, fallback to Fast2SMS, or print to the developer logs.
* **Integrated Routes:** Mapped SMS dispatch across all authentication handlers (`sendOTP`, `register`, and `sendLinkOTP`).

---

## 7. Firebase Cloud Messaging (FCM) Push Notifications
* **Gradle Plugins applied:** Updated settings and build configs:
  * [settings.gradle.kts](file:///d:/medikto/medikto-app/android/settings.gradle.kts)
  * [build.gradle.kts](file:///d:/medikto/medikto-app/android/app/build.gradle.kts)
* **Mobile Client Manager:** Created [notification_manager.dart](file:///d:/medikto/medikto-app/lib/core/network/notification_manager.dart) to handle request permissions, listen to foreground/background messaging streams, and sync tokens.
* **Auto Token Upload:** Configured automatic token sync inside [bottom_bar.dart](file:///d:/medikto/medikto-app/lib/bottom_bar.dart) upon login.
* **Backend FCM SDK Setup:** Configured FCM Admin SDK inside [app.js](file:///d:/medikto/Backend/app.js) and created [notificationHelper.js](file:///d:/medikto/Backend/src/utils/notificationHelper.js) to dispatch payloads.
* **Hospital Linkage Alerts:** Triggered push alerts in `hospitalController.js` on OTP dispatch and successful linkages.

---

## 8. Caretaker (Guardian) Observer Role
* **Caretaker Invitations:** Created [caretakerInviteModel.js](file:///d:/medikto/Backend/src/models/caretakerInviteModel.js) and [emailHelper.js](file:///d:/medikto/Backend/src/utils/emailHelper.js) using `nodemailer` to send invite emails.
* **User Roles Mappings:** Expanded [userModel.js](file:///d:/medikto/Backend/src/models/userModel.js) to include `"guardian"` role type and `guardianFor` relationship array.
* **Auto-Link Registry:** Checked and processed pending caretaker matching phone/email invites inside [authContoller.js](file:///d:/medikto/Backend/src/controllers/authContoller.js).
* **Read-Only API Locks:** Created and mapped `blockGuardianWrite` inside [authmiddleware.js](file:///d:/medikto/Backend/src/middlewares/authmiddleware.js) and [routes.js](file:///d:/medikto/Backend/src/Routes/routes.js) to prevent guardian write requests.
* **Caretaker Signup UI:** Added optional caretaker invitation details inputs inside [register_screen.dart](file:///d:/medikto/medikto-app/lib/features/auth/register_view/register_screen.dart).
* **Central Query Interceptor:** Created static `activePatientId` inside [dio_client.dart](file:///d:/medikto/medikto-app/lib/core/network/dio_client.dart) to automatically append `?patientId=patientId` to all outgoing HTTP calls when selected.
* **Patient Dropdown Switcher:** Rendered a dropdown switcher widget inside [home_screen.dart](file:///d:/medikto/medikto-app/lib/features/home/home_view/home_screen.dart) for guardian roles.
* **Locked Observer Screens:** Applied view-only restrictions inside [medications_screen.dart](file:///d:/medikto/medikto-app/lib/features/medications/views/medications_screen.dart), vitals entry screens, and reports list screens.
