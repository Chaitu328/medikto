# Medikto Healthcare Platform

Medikto is an end-to-end digital healthcare ecosystem designed for medication adherence tracking, health vitals monitoring, medical records management, and seamless remote oversight between patients, hospitals, and caretakers.

---

## 📁 Repository Structure

```
medikto/
├── Backend/          # Node.js + Express REST API (MongoDB/DocumentDB, AWS S3, Nodemailer, Firebase Admin)
├── Frontend/         # React + Vite Admin & Super Admin Panel
├── medikto-app/      # Flutter Mobile Application (Android & iOS)
└── README.md
```

---

## 🚀 Key Mobile App Features & Architecture

### 1. Legal Policies & Versioning
- **Centralized Source of Truth**: Document versions and contact information are centralized in `LegalContent` (`medikto-app/lib/core/constants/legal_content.dart`):
  - `termsVersion: "1.0"`
  - `privacyPolicyVersion: "1.0"`
  - Support Email: `shahmedikto@gmail.com`
  - Support Helpline: `+91 9642331668`
- **Separate User Experiences**:
  - **Registration Flow**: A clean consent section with an interactive checkbox `[ ] I agree to the Terms & Conditions and Privacy Policy.` where both links are clickable and open dedicated full-page document viewers (`TermsAndConditionsScreen` and `PrivacyPolicyScreen`).
  - **Help & Support Flow**: Authenticated users can access the dedicated `PoliciesAndTermsScreen` under `Profile -> Help & Support -> Policies & Terms` to review active service terms and data protection policies with version tags.

### 2. Explicit User Consent & Backend Record
- **Mandatory User Action**: Registration cannot proceed without explicitly checking the consent checkbox.
- **Validation**: If a user attempts to continue without consent, a user-friendly error message is displayed:  
  `"Please agree to the Terms & Conditions and Privacy Policy to continue."`
- **Backend Persistence**:
  The user model (`Backend/src/models/userModel.js`) stores:
  - `termsAccepted` (`Boolean`)
  - `privacyPolicyAccepted` (`Boolean`)
  - `consentTimestamp` (`Date`)
  - `termsVersion` (`String`, e.g. `"1.0"`)
  - `privacyPolicyVersion` (`String`, e.g. `"1.0"`)
  - `authProvider` (`String`: `"phone" | "google" | "password"`)

### 3. FAQ System
- Accessible under `Profile -> Help & Support -> FAQs`.
- Categorized with interactive tabs and expandable questions/answers (`ExpansionTile`):
  - **General & Login**: Phone OTP, Google Sign-In, Guardian portal, Profile editing.
  - **Medications & Doses**: Adding medicines, daily dosage schedules, marking doses taken, real-time watermark selfie verification proofs.
  - **Vitals & Reports**: Logging Blood Pressure, Heart Rate, Temperature, Blood Sugar; uploading/viewing prescriptions and lab reports (PDF/images).
  - **Hospitals & Caretakers**: Hospital linkage via OTP, clinical access permissions, adding family caretakers, read-only observer security.
  - **Privacy & Security**: Data encryption, Free/Basic (48h) vs Premium (3-month) selfie storage retention, account deletion.

### 4. Contact Support
- Accessible under `Profile -> Help & Support -> Contact Support`.
- Displays official support channels:
  - **Email**: `shahmedikto@gmail.com` — tapping triggers device email client via `mailto:shahmedikto@gmail.com?subject=Medikto%20Support%20Request`.
  - **Phone**: `+91 9642331668` — tapping launches device phone dialer via `tel:+919642331668`.

### 5. Report an Issue
- Accessible under `Profile -> Help & Support -> Report an Issue`.
- **End-to-End Pipeline**:
  ```
  Mobile App Form (Category + Description)
        ↓
  POST /api/support/report-issue (Authenticated with JWT)
        ↓
  Backend Support Controller
        ↓
  Nodemailer (SMTP / Mock Dev Dispatch)
        ↓
  Destination: shahmedikto@gmail.com
  ```
- Automatically attaches user metadata (User ID, Name, Email/Phone, Role, App Version, Platform).
- Displays `"Your issue has been submitted successfully."` on completion.

---

## 🔐 Authentication Architecture

### 1. Phone Authentication (Unchanged Core Flow)
```
Phone Number ──► Firebase Phone Auth ──► SMS OTP Verification ──► Firebase ID Token ──► Backend /api/auth/verifyOTP ──► Medikto JWT Session
```

### 2. Google Authentication Flow
```
Flutter App ("Continue with Google")
      ↓
Google Sign-In Native SDK (google_sign_in)
      ↓
Google Credential ──► FirebaseAuth.signInWithCredential
      ↓
Firebase ID Token
      ↓
POST /api/auth/google (Backend)
      ↓
Firebase Admin SDK Token Verification (admin.auth().verifyIdToken)
      ↓
Check Database for Existing Account (by firebaseUid or verified email)
      ├── [EXISTING USER] ──► Validate accountStatus ──► Link firebaseUid ──► Return JWT Token ──► Login
      └── [NEW USER] ─────► Return { isNewUser: true } ──► Route to GoogleConsentScreen ──► Explicit Consent ──► POST /api/auth/google/complete-registration ──► Create Account ──► Return JWT Token ──► Login
```

### 3. Account Matching & Linking Rules
- **Existing Phone User with matching Google Email**: If a user previously signed up via Phone OTP and has the same email, the backend securely links the `firebaseUid` upon Firebase token verification without creating duplicate records.
- **Account Status Enforcement**: If an account is marked as `disabled`, login is rejected with `"Your account is currently disabled. Please contact support."`.
- **New Google Users**: A new Google user is **never** created automatically without explicit consent. They are routed to `GoogleConsentScreen` to review policy links and check the mandatory consent box before account creation.

---

## ⚙️ Firebase Configuration & Console Requirements

### Android Configuration:
- **Package Name**: `com.example.medikto`
- **Config File**: `medikto-app/android/app/google-services.json`
- **Firebase Console Steps**:
  1. Open Firebase Console -> Project `med-vault-b69a6` -> Authentication -> Sign-in method.
  2. Enable **Google** provider and configure the support email (`shahmedikto@gmail.com`).
  3. Ensure SHA-1 and SHA-256 fingerprints for both Debug and Release keystores are added under Project Settings -> Android App.

### iOS Configuration:
- **Bundle Identifier**: `com.example.medikto`
- **Config File**: `medikto-app/ios/Runner/GoogleService-Info.plist`
- **URL Schemes**: `CFBundleURLTypes` in `Info.plist` configured with reversed client ID:  
  `com.googleusercontent.apps.696322298012-up1hn0poeq5529q4jcc319do0nn5ckh1`

---

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd Backend
npm install
npm run dev
```

### 2. Flutter Mobile App Setup
```bash
cd medikto-app
flutter pub get
flutter run
```

### 3. Admin Panel Setup
```bash
cd Frontend/Admin-panel
npm install
npm run dev
```

---

## 💊 Medication Reminder Lifecycle & 60-Minute Action Window

The Medikto medication management system enforces a strict separation between notification delivery and dose action availability:

### 1. Multi-Stage Notification Timeline (Controlled Reminders)
For a dose scheduled at **11:30 AM IST**:
- **Pre-Reminder (~11:15 AM IST)**: Dispatches `💊 Medication Reminder` (`"Your {name} dose is scheduled at 11:30 AM"`). The dose is **Upcoming**; the action window has not opened yet.
- **Scheduled-Time Reminder (11:30 AM IST)**: Dispatches `💊 Medication Due` (`"It's time to take your {name}"`). The **60-Minute Action Window begins**.
- **Post-Reminder (~11:45 AM IST)**: Dispatches `💊 Medication Reminder` (`"Your {name} dose scheduled for 11:30 AM is still pending"`) **only if the dose remains pending**.
- **Missed Expiration Alert (12:30 PM IST)**: Dispatches `⚠️ Missed Medication Reminder`. Sent exactly once when the 60-minute action window expires. No further reminders are sent.

### 2. 60-Minute Action Window & State Machine
```
                    ┌─────────────────────┐
                    │      PENDING        │
                    └──────────┬──────────┘
                               │
                     Before scheduled time
                               │
                               ▼
                         UPCOMING
                      No take actions
                               │
                               │
                     Scheduled time reached
                               │
                               ▼
                    ┌─────────────────────┐
                    │   60 MINUTE WINDOW  │
                    │                     │
                    │ Mark as Taken       │
                    │ Verify with Selfie  │
                    └─────────┬───────────┘
                              │
               ┌──────────────┴──────────────┐
               │                             │
          User takes medicine          60 minutes expire
               │                             │
               ▼                             ▼
            TAKEN                          MISSED
               │                             │
               ▼                             ▼
        No take actions              No take actions
```

- **Timezone**: `Asia/Kolkata` across all calculations.
- **Status Priority Rule**: `1. Status (taken/missed/cancelled) -> 2. Scheduled Date -> 3. Scheduled Time -> 4. Current Asia/Kolkata Time`.
- **Taken Doses**: Permanently `taken`, distinct `time` (e.g. `11:30 AM`) and `takenAt` (ISO timestamp).
- **Missed Doses**: Permanently `missed` after 60 minutes. Server rejects any take action on expired doses.
### 3. Medication Edit & Delete Actions & Historical Record Preservation
- **Entity Relationship**: Recent Activity and Activity History display daily `Dose` records, which reference a parent `Medication` template. The **Edit** and **Delete** actions operate on the parent `Medication` entity (`dose.medication`).
- **Edit Action**:
  - Tapping Edit on a Recent Activity tile or Activity History item opens the Add Medication form pre-populated with existing medication details (Name, Dosage, Unit, Timings, Frequency, Start Date, Duration/Continuous, Notifications toggle, Patient Instructions).
  - Form operates in EDIT mode with the button displaying `"UPDATE MEDICATION"`.
  - Updating a medication re-calculates/updates **future** pending doses and notifications only.
- **Delete Action**:
  - Tapping Delete prompts the user with a confirmation dialog:
    - *"Delete Medication? Are you sure you want to delete '[Name]'? Past medication history will be preserved, but future scheduled doses and reminders will be cancelled."*
  - Deleting a medication sets `medication.status = "cancelled"` (removing it from the active medication schedule) and marks future pending doses as `cancelled` (`isDeleted: true`), immediately halting future reminders.
- **Historical Record Preservation**:
  - Editing or deleting a medication **never** alters, rewrites, or deletes past `TAKEN`, `MISSED`, or `CANCELLED` dose logs.
  - Historical `scheduled date`, `scheduled time`, `takenAt` timestamps, and selfie verification proofs remain fully intact for medical auditing.
- **Theme Consistency**: Edit and Delete actions function identically and present clean, theme-tokenized visual styles in both Dark Theme and Light Theme.

---

## 📄 License & Compliance

Medikto is proprietary software. All rights reserved.