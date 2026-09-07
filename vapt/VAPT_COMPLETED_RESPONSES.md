# 🛡️ MEDIKTO — VAPT QUESTIONNAIRE & PRE-REQUISITE COMPLETED RESPONSES

This document contains pre-filled, accurate technical and business answers for all 4 VAPT documents located in `E:\VAPT`:

1. **Document 1: VAPT Questionnaire — Business (`1_VAPT_Questionnaire_Business.pdf`)**
2. **Document 2: VAPT Questionnaire — Technical (`2_VAPT_Questionnaire_Technical.pdf`)**
3. **Document 3: VAPT Requirement Spreadsheet (`VAPT Requirement.xlsx`)**
4. **Document 4: VAPT Prerequisite Checklist (`VAPT_Prerquisite_Checklist.docx`)**

---

# 📄 DOCUMENT 1: VAPT Questionnaire — Business (`1_VAPT_Questionnaire_Business.pdf`)

### 1. You
* **1.1 Organization, your name, role, email, phone:**
  * **Organization:** Medikto Health Technologies Inc. / Medikto
  * **Role:** Founder / Product Owner / Technical Lead
  * **Email:** `info@medikto.com` / `shahmedikto@gmail.com`
* **1.2 Deadline for quote or test:** As soon as possible / Within 2 weeks.
* **1.3 What to include in this price:**
  * [x] Super Admin & Hospital Admin website
  * [x] Android app (APK)
  * [x] iPhone app (iOS TestFlight / IPA)
  * [x] PhonePe Payment Gateway Integration (S2S Callback / Webhook Security)
  * [x] Retest after fixes (1 cycle)
* **1.4 What to leave out:**
  * Public static marketing website can be limited to basic automated scan; focus primarily on authenticated REST API endpoints, Admin Portal, Mobile Apps, and PhonePe payment workflow.
* **1.5 Roughly how many people use this system in total?**
  * [x] 100 – 1,000 (Initial rollout phase)

---

### 2. Super Admin Website — Size
* **2.1 In one sentence: what is this portal for?**
  * Hospital administrators and doctors manage patient registrations, upload digital prescriptions, monitor medication adherence, and view patient health vital summary reports.
* **2.2 Link + practice copy besides live:**
  * **Link:** `https://admin.medikto.com` (Live) / `https://admin-staging.medikto.com` (Staging environment available for testing).
  * [x] We have a UAT / Staging copy.
* **2.3 List every menu item you can see:**
  * Dashboard, Hospital Directory, Doctor / Staff Management, Patient Directory, Prescription & Medication Regimens, Adherence & Dose Logs, Vital Signs Reports, Billing / Transactions (PhonePe), Document Vault, Audit Logs, Settings.
* **2.4 Types of people who log in:**
  * Super Admin, Hospital Admin, Doctor / Clinician (Count: 3 roles).
* **2.5 One company, or many companies/branches in the same portal?**
  * [x] Many companies inside one portal (Multi-tenant: Super Admin manages multiple hospitals/clinics, each Hospital Admin only accesses their assigned hospital's patients).
* **2.6 Second step at login:**
  * Email + Secure Password with JWT Session authentication (Role-based access control).
* **Size Category:**
  * [x] **Typical (16–30 screens)**.
* **What a Super Admin actually does (5 typical tasks):**
  1. Register a new hospital branch and onboard Hospital Admin credentials.
  2. Map doctors and clinical staff to hospital departments.
  3. Review overall patient enrollment and system-wide adherence metrics.
  4. Inspect security audit logs for unauthorized access attempts.
  5. Configure system settings and prescription template rules.

---

### 3. Super Admin — Pricing Factors
* **3.1 Different access per person (Role-based menus):** [x] **Yes** (Super Admin sees all hospitals; Hospital Admin only sees their clinic).
* **3.2 Create / approve / reject work:** [x] **Yes** (Doctor approves prescription uploads; Patient links via 5-min OTP).
* **3.3 Upload or download files / Excel:** [x] **Yes** (PDF medical prescriptions, lab reports, doctor summary export).
* **3.4 Money (payments, wallet, payouts):** [x] **Yes** (PhonePe Payment Gateway integration for hospital / subscription billing. All payment processing handled via PhonePe redirect/SDK; zero card data stored on server; requires testing of server-to-server webhook & callback signature validation).
* **3.5 “Login as” another user (Impersonation):** [x] **No** (Strict RBAC, no session impersonation).
* **3.6 Connected to other tools:** [x] **Yes** (PhonePe Payment Gateway, Firebase Cloud Messaging for push notifications, SMS OTP gateway for phone verification, AWS S3 for document storage).

---

### 4. Android App
* **4.1 Android app name + Play Store link:**
  * **Name:** Medikto
  * **Status:** In private testing / APK ready for direct testing.
* **4.2 Who is this Android app for? How do they sign in?**
  * **Users:** Patients, Seniors, and Family Caregivers.
  * **Sign in:** Mobile Phone Number + 6-digit SMS OTP (+91 verification).
* **4.3 Types of user in Android app:**
  * Patient / Senior (main user managing pill reminders & vitals), Caregiver (linked family member receiving dose alerts).
* **4.4 Same system behind this app as Super Admin?**
  * [x] **Yes** (Unified Node.js REST API backend at `https://api-prd.medikto.com/api`).
* **4.5 Can you supply the APK for testing?**
  * [x] **Yes** (Debug / non-obfuscated or release APK can be provided).
* **Android Size:**
  * [x] **Typical (16–25 screens)**.
* **Android User Journey:**
  * Open App → Enter Phone Number → Verify 6-digit SMS OTP → Home Dashboard (Today's Pill Timeline) → Receive Pill Alarm → Take Dose & Take Selfie Proof (optional) → Confirm Dose Taken → View Vitals / Add BP & Blood Sugar → View Prescription Vault.
* **Feature Ticks (Android):**
  * Payments / In-app billing: [x] **Yes** (PhonePe Payment Gateway integration for subscriptions / clinic services).
  * KYC / Camera / ID Photos: [x] **Yes** (Camera used for optional Dose Selfie confirmation and prescription photo scanning).
  * Chat or in-app messages: [x] **No** (Caregiver alerts via Push Notification / SMS).
  * Maps or live location: [x] **No**
  * Works partly offline: [x] **Yes** (Local pill alarms work offline via local notifications; syncs with API when online).
  * Push Notifications: [x] **Yes** (Firebase Cloud Messaging for dose alarms and missed dose caregiver alerts).

---

### 5. iPhone / iOS App
* **5.1 iPhone app name + App Store link:**
  * **Name:** Medikto
  * **Status:** Flutter cross-platform build (TestFlight / IPA available).
* **5.2 Who is this iPhone app for? How do they sign in?**
  * Patients, Seniors, and Caregivers via Phone Number + SMS OTP (+ Face ID / Touch ID biometric lock support).
* **5.3 Types of user in iPhone app:** Patient, Caregiver.
* **5.4 Same system behind this app as Super Admin?**
  * [x] **Yes** (Shared REST API).
* **5.5 Can you supply TestFlight access or IPA?**
  * [x] **Yes** (TestFlight invite or IPA file).
* **5.6 Deltas vs Android:**
  * None — Built with Flutter, feature parity between Android and iOS.
* **iOS Size:** [x] **Typical (16–25 screens)**.
* **Feature Ticks (iOS):**
  * Payments / In-app billing: [x] **Yes** (PhonePe / UPI / In-app payment integration).

---

### 6. Test Setup & Logistics
* **6.1 Where should we test?**
  * [x] **Practice / Staging UAT copy (Recommended)** to protect live patient medical data.
* **6.2 If this leaked, what would hurt most?**
  * Patient personal health data (PHI), medical prescriptions, phone numbers, and clinical vitals history.
* **6.3 Attachments to provide:**
  * [x] Admin UI Screenshots & Architecture Diagram
  * [x] Android APK
  * [x] Postman API Collection / Swagger Route documentation
* **6.4 Previous security tests:**
  * First formal third-party VAPT assessment.
* **6.5 Compliance drivers:**
  * Healthcare client onboarding / Hospital integration security clearance / ISO 27001 readiness / DISHA / HIPAA data protection guidelines.
* **6.6 Blackout dates:** None.

---

# 📄 DOCUMENT 2: VAPT Questionnaire — Technical (`2_VAPT_Questionnaire_Technical.pdf`)

### 1. Context
* **1.1 Technical Contact:**
  * **Lead:** Technical Lead / Backend Engineer
  * **Email:** `support@medikto.com` / `shahmedikto@gmail.com`
* **1.2 Scope to include in this quote:**
  * [x] Admin UI (`https://admin.medikto.com`)
  * [x] Portal APIs (`https://api-prd.medikto.com/api`)
  * [x] Android Application (APK)
  * [x] iOS Application (TestFlight)
  * [x] Mobile REST APIs
  * [x] PhonePe Payment Integration (Server-to-Server callbacks & webhooks)
  * [x] Retest (1 cycle)
* **1.3 Testing Type & Environment:**
  * [x] **Gray Box (Recommended)** (Credentials provided for each user role).
  * [x] **Environment:** Staging / UAT instance with dedicated test database.
* **1.4 Hard Exclusions:**
  * No Denial of Service (DoS/DDoS) stress testing on live production infrastructure.

---

### 2. Architecture
* **2.1 One-line Architecture:**
  * Flutter Mobile App (iOS/Android) + React Vite Admin SPA + Node.js/Express REST API on AWS EC2 (Dockerized) + AWS DocumentDB (MongoDB 6.0 engine with TLS) + AWS S3 (AES-256 encrypted storage).
* **2.2 Admin vs Mobile Backend:**
  * [x] **Same backend, unified REST API** with role-gated routes (`/api/auth`, `/api/patient`, `/api/doctor`, `/api/admin`, `/api/medications`, `/api/vitals`, `/api/prescriptions`, `/api/payments`).
* **2.3 Cloud & Hosting:**
  * **Cloud Provider:** AWS (Region: `ap-south-1` Mumbai).
  * **Tenancy:** Multi-tenant database with strict `hospitalId` and `patientId` tenant isolation.
  * **Access:** Public HTTPS (TLS 1.2/1.3) reverse-proxied via Host Nginx.
* **2.4 Staging ≈ Production?**
  * [x] **Yes** (Identical Docker container image, database schema, and authentication stack).
* **2.5 Backend Stack:**
  * **Runtime:** Node.js 22 LTS / Express.js.
  * **Database:** AWS DocumentDB (MongoDB API with TLS certificate authentication).
  * **Storage:** AWS S3 with Pre-signed URL uploads and private bucket policies.
  * **Security Middleware:** Helmet (HTTP headers), CORS whitelist, Express Rate-Limiter, Winston audit logs.

---

### 3. Admin & API Metrics
* **3.1 Admin UI Routes / Modules:**
  * **Modules:** 7 (Hospitals, Doctors, Patients, Prescriptions, Vitals & Reports, Billing / PhonePe Payments, System Audit).
  * **Authenticated Pages:** ~14 pages.
* **3.2 Admin RBAC Roles:**
  * **Count:** 3 roles (`super_admin`, `hospital_admin`, `doctor`).
  * **Model:** Role-Based Access Control (RBAC) enforced in API middleware via JWT claims.
* **3.3 Authentication & Session Tokens:**
  * **Mechanism:** Bearer JWT (JSON Web Tokens) with expiration.
  * **Admin Login:** Email + Bcrypt-hashed password.
  * **Mobile Login:** Mobile Number + Firebase SMS OTP verification.
* **3.4 API Surface:**
  * **Style:** RESTful JSON API.
  * **Endpoints:** ~28 authenticated endpoints, ~4 public endpoints (`/health`, `/api/auth/login`, `/api/contact`, `/api/payments/webhook`).
  * **Documentation:** Postman API Collection available.
* **3.5 Web Security Price Drivers:**
  * Multi-tenant data segregation: [x] **Yes**
  * File uploads (Prescription PDFs / Images): [x] **Yes** (Stored in private AWS S3 via pre-signed URLs).
  * Payments / Gateway: [x] **Yes** (PhonePe PG with SHA-256 / S2S webhook signature verification).
  * WAF Active: [x] Host Nginx rate limiting + AWS Security Groups.

---

### 4. Android Application Technical Details
* **4.1 Package / App Details:**
  * **Application ID:** `com.medikto.app` / `com.example.medikto_app`
  * **Delivery:** Debug / Staging APK provided for pentesting.
* **4.2 Framework:** [x] **Flutter (Dart)**.
* **4.3 Screens & Roles:** ~18 unique screens; 2 client roles (Patient, Linked Caregiver).
* **4.4 Token Storage:**
  * [x] **Encrypted Storage / Android Keystore** via `flutter_secure_storage`.
* **4.5 API Surface:** Uses the primary REST API (`/api/patient/*`, `/api/medications/*`, `/api/vitals/*`).
* **Technical Controls:**
  * TLS / HTTPS: [x] **Yes** (All API communication strictly over HTTPS TLS 1.2+).
  * Camera / File Picker: [x] **Yes** (Camera for dose confirmation selfie, file picker for lab reports).
  * Push Notifications: [x] **Yes** (Firebase Cloud Messaging).
  * Payments: [x] **Yes** (PhonePe Payment Gateway).

---

### 5. iOS Application Technical Details
* **5.1 Bundle ID:** `com.medikto.app` (Delivery: TestFlight / IPA).
* **5.2 Framework:** [x] **Flutter (Dart)**.
* **5.3 Token Storage:** [x] **iOS Keychain** via `flutter_secure_storage`.
* **5.4 Deltas vs Android:** None (shared Flutter codebase).
* **5.5 Payments:** [x] **Yes** (PhonePe / UPI / In-app payment integration).

---

### 6. Testing Logistics & Authorization
* **6.1 Prior Pentest:** Initial third-party baseline VAPT.
* **6.2 Compliance Requirement:** Client healthcare data security assurance, Hospital partnership onboarding, ISO 27001 readiness.
* **6.3 WAF / IP Whitelisting:** Tester source IPs will be whitelisted in Nginx rate-limiting and AWS Security Groups.
* **6.4 Test Accounts:** Will provision 1 Super Admin, 1 Hospital Admin, 1 Doctor, 2 Test Patient accounts with dummy health data.

---

# 📊 DOCUMENT 3: VAPT Requirement Spreadsheet (`VAPT Requirement.xlsx`)

| Sr Num | Activity | Scope / Details for Medikto |
|:---:|:---|:---|
| **1** | **Network Vulnerability Assessment (Black Box)** | External IP / Domain: `api-prd.medikto.com`, `admin.medikto.com`, `medikto.health` (1 Server Instance / AWS EC2). |
| **2** | **Total Number of Sites** | **1 AWS Cloud Region** (`ap-south-1` Mumbai). |
| **3** | **Cloud, On-Prem, Hybrid** | **Cloud (AWS)** — 1 AWS EC2 instance (Docker host), 1 AWS DocumentDB cluster, 1 AWS S3 bucket. |
| **3** | **Network Penetration Testing (Gray Box)** | **1 External Public Elastic IP** (AWS EC2 hosting Reverse Proxy). |
| **4** | **Web Application Security Assessment (Gray Box)** | **2 Web Applications:**<br>1. Super Admin & Hospital Admin Portal (`https://admin.medikto.com` ~14 pages, 3 roles)<br>2. Landing Marketing Site (`https://medikto.health` 1 landing page).<br>+ REST API backend (~28 endpoints including PhonePe payment webhooks). |
| **5** | **Security Configuration Review** | Review of Host Nginx SSL/TLS configuration, Docker container isolation, AWS Security Groups, and AWS S3 Bucket Policies. |
| **6** | **Conformity Assessment** | Verification & 1 re-test cycle after developers patch identified vulnerabilities. |
| **7** | **Any other information** | Mobile Apps (Android APK + iOS TestFlight) built with Flutter; API uses JWT authentication, PhonePe Payment Gateway (S2S webhooks), and AWS DocumentDB with TLS encryption. |

---

# 📋 DOCUMENT 4: VAPT Prerequisite Checklist (`VAPT_Prerquisite_Checklist.docx`)

### General & Network Prerequisites:
- [x] **IP Whitelisting:** AWS Security Group & Nginx will whitelist tester IPs once provided.
- [x] **Scope Definition:** Defined (Admin Portal + Backend REST APIs + Android/iOS Mobile Apps + AWS Host Config).
- [x] **Testing Environment:** Staging environment provided with sanitized dummy patient data.

### Database & System Access:
- [x] **Database Type:** AWS DocumentDB (MongoDB API) with TLS certificate authentication.
- [x] **Test Credentials:** Dedicated test user credentials with read/write access to test collections will be provisioned.
- [x] **API Documentation:** Postman collection and endpoint specification provided.
- [x] **Test Accounts:**
  - `super_admin` test account
  - `hospital_admin` test account
  - `doctor` test account
  - `patient` (mobile test account with SMS OTP test bypass or test SIM)
