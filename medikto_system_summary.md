# 🏥 Medikto — Complete System Summary
> A plain-English guide for everyone: what each part does, who uses it, and the step-by-step process.

---

## 🌐 Big Picture — What is Medikto?

**Medikto** is a medication management platform that connects **patients**, **hospitals**, and **caretakers** together.  
Think of it like a smart health diary — patients track their medicines, hospitals monitor their patients remotely, and caretakers keep an eye on their loved ones.

The system has **3 main parts**:

| Part | Who Uses It | Where It Lives |
|---|---|---|
| 📱 **Mobile App** | Patients & Caretakers | Flutter App (Android/iOS) |
| 🏥 **Admin Panel** | Hospital Admins | `admin.medikto.com` |
| 👑 **Super Admin Panel** | Medikto Platform Owners | `admin.medikto.com/superadmin` |

---

## 👑 PART 1 — Super Admin Panel

### Who is the Super Admin?
The **Super Admin** is the owner/operator of the Medikto platform itself. There is only **one Super Admin**. Think of them as the **CEO of the app** — they control everything at the highest level.

### How does the Super Admin log in?
The Super Admin logs in using **Google Sign-In** (not a username/password). This is more secure and only a pre-approved Google account can access it.

```
Step 1: Go to admin.medikto.com/superadmin/login
Step 2: Click "Sign in with Google"
Step 3: Google verifies identity → System gives a secure token → Super Admin is logged in
```

### What can the Super Admin do?

#### 🏥 Hospital Management
- **Create a new hospital** → When a new hospital joins Medikto, the Super Admin creates a record for it AND creates the hospital's admin account in one step.
- The hospital admin gets a **welcome email** with their login credentials automatically.
- **View all hospitals** — see a list of every hospital registered on the platform.
- **Edit hospital details** — update the hospital's name or address.
- **Enable / Disable / Suspend a hospital** — if a hospital is misbehaving or not paying, the Super Admin can suspend it.
- **Delete a hospital** — permanently remove a hospital and unlink all its patients.

#### 👤 Admin Management
- **Disable/Enable a hospital admin** — if an admin account is compromised, the Super Admin can block it.
- **Delete an admin** — permanently remove a hospital admin account.

#### 👥 User Management
- **View all registered users** (patients, admins, caretakers).

#### 📊 Platform Oversight
- View **all hospitals, all admins, all users** on one dashboard.

---

## 🏥 PART 2 — Hospital Admin Panel

### Who is the Hospital Admin?
A **Hospital Admin** is a staff member of a specific hospital (e.g., a nurse supervisor, clinic manager, or pharmacist). Each hospital has its own admin account. Think of them as the **manager of their hospital's section** in Medikto.

### How does the Hospital Admin log in?
The Hospital Admin logs in with an **Email + Password** assigned by the Super Admin.

```
Step 1: Go to admin.medikto.com/admin/login
Step 2: Enter Email and Password (given by Super Admin)
Step 3: On first login → must change the default password
Step 4: Dashboard opens — admin can now manage their hospital's patients
```

> ⚠️ **First-time login**: The default password is `Admin@123`. The admin MUST change it immediately.

### What can the Hospital Admin do?

#### 🔗 Linking Patients to the Hospital
This is the core job of a hospital admin — connecting their hospital's real-world patients to the app.

```
Step 1: Hospital admin searches for the patient by phone number
Step 2: System sends a push notification (OTP code) to the patient's phone via the app
Step 3: Patient receives the notification and shares the OTP with the hospital staff
Step 4: Admin enters the OTP → Patient is now linked to the hospital ✅
```

> The OTP expires in **5 minutes** for security.

#### 📋 Patient Management
- **View all linked patients** — see every patient connected to their hospital.
- **View patient profiles** — name, age, blood group, phone, subscription plan.

#### 💊 Medication Management
- **View all medications** of their linked patients — what medicine, what dose, what time.

#### 🕐 Today's Schedule
- See **today's medication schedule** for all linked patients — which doses are pending, which are taken, which were missed.

#### 📸 Selfie Verification (Proof of Medication)
- Patients can take a **selfie** when they take their medicine as proof.
- The selfie gets a **timestamp watermark** ("Medikto | 08:30 AM | 08 Jul 2026").
- Hospital admin can:
  - **View selfie proofs** for each dose.
  - **Delete selfies** that are incorrect or inappropriate (soft delete — recoverable for 1 year).
  - **Recover deleted selfies** within 1 year.
  - **View the bin** of all deleted selfies.

#### 📄 Prescriptions
- View all prescriptions uploaded by their patients.
- Delete incorrect prescriptions.

#### 📊 Reports (Medical Reports)
- View lab reports, X-rays, etc., uploaded by patients.
- Filter by type (blood test, scan, etc.).
- Delete reports.

#### 📈 Vitals
- View patient vitals: **Blood Pressure**, **Heart Rate**, **Temperature**, **Blood Sugar**.
- Edit or delete incorrect readings.

#### ✅ Compliance Tracker
- See how well each patient is following their medication schedule.
- Shows the **adherence percentage** — "This patient took 80% of their medicines on time this week."

#### 👥 Caretakers
- View all caretakers (guardians) who are monitoring patients.
- Enable or disable caretaker accounts.

#### ⚙️ Settings
- Change admin password.

---

## 📱 PART 3 — Mobile App (Flutter)

### Who uses the Mobile App?
- **Patients** — the main users. They track their own medicines.
- **Caretakers / Guardians** — family members or nurses who monitor a patient remotely.

### How does a Patient register?
```
Step 1: Download the Medikto app
Step 2: Enter phone number → receive OTP via SMS
Step 3: Verify OTP → enter name → account created ✅
Step 4: Complete profile (age, blood group, height, weight — optional)
```

### What can a Patient do?

#### 💊 Medications
- **Add a medicine** — name, dosage (e.g., 500mg), timing (morning/afternoon/evening/night), frequency (daily/weekly).
- **View all medicines** currently being taken.
- **Edit or remove a medicine**.

#### ⏰ Today's Schedule
- See a **timeline of today's doses** — what to take and at what time.
- **Mark a dose as "Taken"** with one tap.
- **Take a selfie** as proof of taking the medicine (optional, for hospital verification).
- System auto-creates tomorrow's doses every day automatically.

#### 📋 Prescriptions
- Upload a photo/PDF of the doctor's prescription.
- View all prescriptions in one place.

#### 🧪 Vitals
- Log blood pressure readings (systolic/diastolic).
- Log heart rate (bpm).
- Log body temperature.
- Log blood sugar levels.
- View history of all readings.

#### 📁 Reports
- Upload medical reports (blood test, X-ray, scan, etc.).
- Organize by type.
- Download or view any past report.

#### 🏥 Hospital Connection
- **Link to a hospital** — when admitted to or enrolled in a hospital using Medikto:
  - Hospital admin initiates the connection.
  - Patient receives a push notification with an OTP.
  - Patient shares the OTP with the hospital → connected ✅
- View all hospitals they are linked to.
- **Unlink a hospital** when no longer a patient there.

#### 👨‍👩‍👦 Family Members
- Add family members to the profile (name, relation, age) for reference.

#### 🔔 Notifications
- Receive push notifications for:
  - Hospital connection requests (with OTP).
  - Medication reminders.
  - Successful hospital link confirmations.
- View all notifications, mark as read.

#### 📦 Subscription Plans
| Plan | Selfie Storage | Notes |
|---|---|---|
| Free | 48 hours | Selfie proof deleted after 48 hours |
| Basic | 48 hours | Same as Free |
| Premium | 3 months | Selfie proofs kept for 3 months |

### How does a Caretaker / Guardian work?

A **Caretaker** is someone (family member, nurse) who watches over a patient remotely.

#### How is a Caretaker added?
```
Option A — During Patient Registration:
  Patient fills in caretaker's email & name during signup
  → System creates the caretaker account
  → Caretaker receives an email invitation
  → Caretaker logs in → automatically linked to the patient ✅

Option B — Hospital Admin creates the caretaker:
  Admin creates the guardian account manually
  → Caretaker gets login credentials
  → Caretaker logs in → linked to their patient ✅
```

#### What can a Caretaker see?
- All medications of the patient they are monitoring.
- Today's schedule.
- Vitals and reports (read-only).

> ⚠️ **Caretakers CANNOT add, edit, or delete** medications, reports, vitals, or prescriptions. They can only **view** (read-only access).

---

## 🔄 End-to-End Flow — How Everything Connects

```
1. Super Admin creates Hospital XYZ + creates Admin for Hospital XYZ
      ↓
2. Admin of Hospital XYZ logs in (email + password)
      ↓
3. Patient downloads the app → registers with phone number
      ↓
4. Patient visits Hospital XYZ → Admin links the patient via OTP
      ↓
5. Patient adds their medicines in the app
      ↓
6. Every day, app shows today's medicine schedule
      ↓
7. Patient marks medicines as "taken" (optionally with selfie proof)
      ↓
8. Hospital Admin can monitor compliance, vitals, reports, and prescriptions
      ↓
9. Caretaker (if added) can remotely monitor the patient's schedule
      ↓
10. Super Admin oversees all hospitals, admins, and platform health
```

---

## 🔐 Security & Roles Summary

| Role | Login Method | Access Level |
|---|---|---|
| **Super Admin** | Google OAuth (one trusted Google account) | Full platform access |
| **Hospital Admin** | Email + Password | Their hospital's patients only |
| **Patient** | Phone OTP (Firebase) | Their own data only |
| **Caretaker/Guardian** | Email + Password | Read-only access to their patient's data |

---

## 📍 Key URLs

| Service | URL |
|---|---|
| Admin & Super Admin Panel | `https://admin.medikto.com` |
| Super Admin Login | `https://admin.medikto.com/superadmin/login` |
| Hospital Admin Login | `https://admin.medikto.com/admin/login` |
| Mobile App | Android / iOS App Store |
