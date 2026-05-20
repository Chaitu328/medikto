# Medikto API Documentation

## 1. Project Overview

Medikto is a comprehensive healthcare backend API built with Node.js, Express, MongoDB, Mongoose, JWT authentication, Cloudinary file uploads, and OTP-based authentication.

The API supports:

- **Authentication**: OTP-based login/signup with JWT tokens
- **User Management**: Profile management, family member management, subscription plans
- **Medication Management**: Add medications, schedule doses, mark as taken, verify with selfies
- **Vitals Tracking**: Blood pressure, heart rate, temperature, blood sugar monitoring with health status
- **Medical Reports**: Upload and manage medical reports with categorization by type
- **Prescriptions**: Upload and manage prescriptions with reminder scheduling

---

## 2. Base URL

```txt
http://localhost:4000/api
```

```txt
https://medikto.onrender.com/api
```


All endpoint URLs in this document are relative to the base URL.

---

## 3. Authentication

The backend uses JWT authentication.

After OTP verification, the API returns a JWT token:

```json
{
  "token": "jwt_token_here"
}
```

For protected routes, send the token in the `Authorization` header:

```http
Authorization: Bearer jwt_token_here
```

### Authentication Errors

Missing token:

```json
{
  "msg": "No token, authorization denied"
}
```

Invalid or expired token:

```json
{
  "msg": "Invalid or expired token"
}
```

Note: The current backend signs JWTs without an explicit expiry.

---

## 4. API Endpoints

# Auth APIs

## Send OTP

**Method:** `POST`  
**URL:** `/auth/sendOTP`  
**Description:** Sends an OTP to the given phone number. The OTP is also logged in the backend console.

### Headers

None.

### Request Body

```json
{
  "phone": "9876543210"
}
```

### Request Example

```http
POST /api/auth/sendOTP
Content-Type: application/json
```

```json
{
  "phone": "9876543210"
}
```

### Response Example

```json
{
  "message": "OTP sent"
}
```

### Error Responses

The current controller does not validate missing phone and does not wrap this route in a `try/catch`, so unexpected server or database errors may return a default Express error.

---

## Verify OTP

**Method:** `POST`  
**URL:** `/auth/verifyOTP`  
**Description:** Verifies OTP. If the phone number does not already exist, a new user is created. Returns JWT token.

### Headers

None.

### Request Body

```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

### Response Example

```json
{
  "token": "jwt_token_here"
}
```

### Error Responses

Status: `400`

```json
{
  "msg": "Invalid OTP"
}
```

Important: Although OTP records store `expiresAt`, the current verification logic does not check expiry.

---

# User APIs

All User APIs require authentication.

## Get Profile

**Method:** `GET`  
**URL:** `/profile`  
**Description:** Returns the authenticated user profile.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Request Body

None.

### Response Example

```json
{
  "_id": "665f1c9d9b7a111111111111",
  "phone": "9876543210",
  "firstName": "Rahul",
  "age": 28,
  "gender": "male",
  "bloodGroup": "O+",
  "height": 175,
  "weight": 72,
  "profilePic": "https://res.cloudinary.com/example/image/upload/profile.jpg",
  "isVerified": true,
  "subscription": "free",
  "familyMembers": [],
  "createdAt": "2026-04-30T10:00:00.000Z",
  "updatedAt": "2026-04-30T10:00:00.000Z"
}
```

### Error Responses

Status: `404`

```json
{
  "message": "User not found"
}
```

Status: `500`

```json
{
  "error": "Server error message"
}
```

---

## Get All Users

**Method:** `GET`  
**URL:** `/users`  
**Description:** Returns all users in the system, newest first. Does not require authentication.

### Headers

None.

### Response Example

```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "_id": "665f1c9d9b7a111111111111",
      "phone": "9876543210",
      "firstName": "Rahul",
      "age": 28,
      "gender": "male",
      "bloodGroup": "O+",
      "height": 175,
      "weight": 72,
      "profilePic": "https://res.cloudinary.com/example/image/upload/profile.jpg",
      "subscription": "free",
      "isVerified": true,
      "createdAt": "2026-04-30T10:00:00.000Z"
    }
  ]
}
```

### Error Responses

Status: `500`

```json
{
  "success": false,
  "error": "Server error message"
}
```

---

## Update Profile

**Method:** `PUT`  
**URL:** `/profile`  
**Description:** Updates authenticated user profile. Supports optional profile image upload.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data
```

### Request Body

Send as `form-data`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `firstName` | string | No | User first name |
| `phone` | string | No | Phone number |
| `age` | number | No | User age |
| `gender` | string | No | Converted to lowercase |
| `bloodGroup` | string | No | Converted to uppercase |
| `height` | number | No | Height in cm |
| `weight` | number | No | Weight in kg |
| `image` | file | No | Profile image |

### Request Example

```txt
form-data:
firstName: Rahul
age: 28
gender: male
bloodGroup: O+
height: 175
weight: 72
image: profile.jpg
```

### Response Example

```json
{
  "_id": "665f1c9d9b7a111111111111",
  "phone": "9876543210",
  "firstName": "Rahul",
  "age": 28,
  "gender": "male",
  "bloodGroup": "O+",
  "height": 175,
  "weight": 72,
  "profilePic": "https://res.cloudinary.com/example/image/upload/profile.jpg",
  "subscription": "free",
  "familyMembers": []
}
```

### Error Responses

Status: `500`

```json
{
  "error": "Server error message"
}
```

---

## Add Family Member

**Method:** `POST`  
**URL:** `/family-members`  
**Description:** Adds a family member to the authenticated user profile.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Priya",
  "relation": "Sister",
  "age": 24
}
```

### Response Example

```json
[
  {
    "_id": "665f1d111111111111111111",
    "name": "Priya",
    "relation": "Sister",
    "age": 24
  }
]
```

### Error Responses

Status: `400`

```json
{
  "message": "Missing fields"
}
```

---

## Update Subscription

**Method:** `PUT`  
**URL:** `/subscription`  
**Description:** Updates user subscription plan.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body

```json
{
  "plan": "basic"
}
```

Allowed values:

```txt
free, basic, premium
```

### Response Example

```json
{
  "message": "Subscription updated",
  "subscription": "basic"
}
```

### Error Responses

Status: `400`

```json
{
  "message": "Invalid plan"
}
```

---

# Medication APIs

All Medication APIs require authentication.

## Add Medication

**Method:** `POST`  
**URL:** `/medications`  
**Description:** Adds a medication and generates a schedule from the provided timings.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Paracetamol",
  "dosage": 500,
  "unit": "mg",
  "timings": ["morning", "night"],
  "notifications": true,
  "instructions": "Take after food"
}
```

Accepted timing shortcuts:

| Timing | Converted Time |
|---|---|
| `morning` | `08:30 AM` |
| `afternoon` | `12:00 PM` |
| `evening` | `06:00 PM` |
| `night` | `08:00 PM` |

You can also send direct time strings:

```json
{
  "timings": ["09:15 AM", "07:45 PM"]
}
```

### Response Example

```json
{
  "_id": "665f20111111111111111111",
  "user": "665f1c9d9b7a111111111111",
  "name": "Paracetamol",
  "dosage": 500,
  "unit": "mg",
  "timings": ["morning", "night"],
  "notifications": true,
  "instructions": "Take after food",
  "createdAt": "2026-05-11T10:00:00.000Z",
  "updatedAt": "2026-05-11T10:00:00.000Z"
}
```

**Note**: Doses for today are automatically created in the Dose collection when a medication is added. Query `GET /today` to retrieve today's doses.

### Error Responses

Status: `400`

```json
{
  "message": "Missing required fields"
}
```

Status: `403`

```json
{
  "message": "Medication limit reached for free plan"
}
```

Plan limits:

| Plan | Medication Limit |
|---|---|
| `free` | 2 |
| `basic` | 5 |
| `premium` | Unlimited |

---

## Get Medications

**Method:** `GET`  
**URL:** `/medications`  
**Description:** Returns all medications for the authenticated user, newest first.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
[
  {
    "_id": "665f20111111111111111111",
    "user": "665f1c9d9b7a111111111111",
    "name": "Paracetamol",
    "dosage": 500,
    "unit": "mg",
    "timings": ["morning", "night"],
    "notifications": true,
    "instructions": "Take after food",
    "createdAt": "2026-05-11T10:00:00.000Z",
    "updatedAt": "2026-05-11T10:00:00.000Z"
  }
]
```

### Error Responses

Status: `500`

```json
{
  "error": "Server error message"
}
```

---

## Update Medication

**Method:** `PUT`  
**URL:** `/medications/:id`  
**Description:** Updates medication details. If `timings` is provided, the schedule is regenerated.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Paracetamol 650",
  "dosage": 650,
  "unit": "mg",
  "timings": ["morning", "evening"],
  "notifications": false,
  "instructions": "Take after meals"
}
```

### Response Example

```json
{
  "_id": "665f20111111111111111111",
  "name": "Paracetamol 650",
  "dosage": 650,
  "unit": "mg",
  "timings": ["morning", "evening"],
  "notifications": false,
  "instructions": "Take after meals",
  "updatedAt": "2026-05-11T10:05:00.000Z"
}
```

### Error Responses

Status: `500`

```json
{
  "error": "Server error message"
}
```

**Note**: Update does not regenerate existing doses, only updates the Medication record. To reflect time changes, you may need to manage doses separately.

---

## Delete Medication

**Method:** `DELETE`  
**URL:** `/medications/:id`  
**Description:** Deletes a medication by ID.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
{
  "message": "Medication deleted"
}
```

### Error Responses

Status: `500`

```json
{
  "error": "Server error message"
}
```

---

## Mark Dose As Taken

**Method:** `PUT`  
**URL:** `/dose/:doseId/taken`  
**Description:** Marks a scheduled dose as taken. A dose is a single instance of a medication at a specific time.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### URL Parameters

| Parameter | Type | Required |
|---|---|---|
| `doseId` | string | Yes |

### Request Body

```
(Empty body - no payload required)
```

### Response Example

```json
{
  "_id": "665f2a111111111111111111",
  "user": "665f1c9d9b7a111111111111",
  "medication": "665f20111111111111111111",
  "name": "Paracetamol",
  "dosage": "500mg",
  "date": "2026-05-11",
  "time": "08:30 AM",
  "status": "taken",
  "takenAt": "2026-05-11T08:35:00.000Z",
  "verified": false,
  "verifiedAt": null,
  "proofImage": null
}
```

### Error Responses

Status: `404`

```json
{
  "message": "Dose not found"
}
```

---

## Verify Dose With Selfie

**Method:** `POST`  
**URL:** `/dose/:doseId/verify`  
**Description:** Uploads a selfie proof for a scheduled dose. Automatically marks the dose as taken and verified. Storage duration depends on subscription plan.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data
```

### URL Parameters

| Parameter | Type | Required |
|---|---|---|
| `doseId` | string | Yes |

### Request Body

Send as `form-data`.

| Field | Type | Required |
|---|---|---|
| `file` | file | Yes |

### Request Example

```txt
form-data:
file: selfie.jpg
```

### Response Example

```json
{
  "message": "Verification successful",
  "dose": {
    "_id": "665f2a111111111111111111",
    "user": "665f1c9d9b7a111111111111",
    "medication": "665f20111111111111111111",
    "name": "Paracetamol",
    "dosage": "500mg",
    "date": "2026-05-11",
    "time": "08:30 AM",
    "status": "taken",
    "takenAt": "2026-05-11T08:35:00.000Z",
    "verified": true,
    "verifiedAt": "2026-05-11T08:35:00.000Z",
    "proofImage": "https://res.cloudinary.com/example/image/upload/selfie.jpg",
    "expiryAt": "2026-05-13T08:35:00.000Z"
  }
}
```

### Storage Rules by Plan

| Plan | Expiry Duration | Notes |
|---|---|---|
| `free` | No auto-delete | Selfie stored indefinitely |
| `basic` | 48 hours | Auto-delete after 48 hours |
| `standard` | 48 hours | Auto-delete after 48 hours |
| `premium` | 3 months | Auto-delete after 3 months |

### Error Responses

Status: `400`

```json
{
  "message": "Selfie required"
}
```

Status: `404`

```json
{
  "message": "Dose not found"
}
```

---

## Delete Selfie (Premium Only)

**Method:** `DELETE`  
**URL:** `/dose/:doseId/selfie`  
**Description:** Soft-deletes a dose selfie. Only available for premium users. The dose can be recovered within 1 year.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### URL Parameters

| Parameter | Type | Required |
|---|---|---|
| `doseId` | string | Yes |

### Response Example

```json
{
  "message": "Selfie deleted successfully"
}
```

### Error Responses

Status: `403`

```json
{
  "message": "Only premium users can delete selfies"
}
```

Status: `404`

```json
{
  "message": "Dose not found"
}
```

---

## Get Today's Dose Schedule

**Method:** `GET`  
**URL:** `/today`  
**Description:** Returns all doses scheduled for today for the authenticated user, sorted by time.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
[
  {
    "_id": "665f2a111111111111111111",
    "user": "665f1c9d9b7a111111111111",
    "medication": "665f20111111111111111111",
    "name": "Paracetamol",
    "dosage": "500mg",
    "date": "2026-05-11",
    "time": "08:30 AM",
    "status": "pending",
    "takenAt": null,
    "verified": false
  },
  {
    "_id": "665f2a222222222222222222",
    "name": "Paracetamol",
    "dosage": "500mg",
    "date": "2026-05-11",
    "time": "09:00 PM",
    "status": "pending",
    "takenAt": null,
    "verified": false
  }
]
```

### Error Responses

Status: `500`

```json
{
  "error": "Server error message"
}
```

---

## Delete Medication

**Method:** `DELETE`  
**URL:** `/medications/:id`  
**Description:** Deletes a medication by ID.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
{
  "message": "Medication deleted"
}
```

### Error Responses

Status: `500`

```json
{
  "error": "Server error message"
}
```

---

## Mark Medication As Taken

**Method:** `POST`  
**URL:** `/medications/:id/take`  
**Description:** ⚠️ **DEPRECATED** - Use `PUT /dose/:doseId/taken` instead. This endpoint is deprecated and will be removed in a future version.

---

## Verify Medication With Selfie

**Method:** `POST`  
**URL:** `/medications/:id/verify`  
**Description:** ⚠️ **DEPRECATED** - Use `POST /dose/:doseId/verify` instead. This endpoint is deprecated and will be removed in a future version.

---

# Report APIs

All Report APIs require authentication.

## Upload Report

**Method:** `POST`  
**URL:** `/reports`  
**Description:** Uploads a medical report file.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data
```

### Request Body

Send as `form-data`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | Report title |
| `date` | string/date | Yes | Valid date string |
| `file` | file | Yes | Report file |
| `description` | string | No | Optional |
| `condition` | string | No | `normal`, `moderate`, `critical` |
| `type` | string | No | Defaults to `medical` |

Allowed upload formats:

```txt
jpg, jpeg, png, pdf, doc, docx
```

Allowed report types:

```txt
medical, lab, vaccination, prescription
```

### Request Example

```txt
form-data:
title: Blood Test Report
description: Annual blood test
condition: normal
date: 2026-04-30
type: lab
file: report.pdf
```

### Response Example

```json
{
  "_id": "665f30111111111111111111",
  "user": "665f1c9d9b7a111111111111",
  "title": "Blood Test Report",
  "description": "Annual blood test",
  "condition": "normal",
  "date": "2026-04-30T00:00:00.000Z",
  "type": "lab",
  "fileUrl": "https://res.cloudinary.com/example/raw/upload/report.pdf",
  "createdAt": "2026-04-30T10:00:00.000Z",
  "updatedAt": "2026-04-30T10:00:00.000Z"
}
```

### Error Responses

Status: `400`

```json
{
  "message": "Title and date are required"
}
```

Status: `400`

```json
{
  "message": "File is required"
}
```

Status: `403`

```json
{
  "message": "Report limit reached for free plan"
}
```

Plan limits:

| Plan | Report Limit |
|---|---|
| `free` | 5 |
| `basic` | 50 |
| `premium` | Unlimited |

---

## Get Reports

**Method:** `GET`  
**URL:** `/reports`  
**Description:** Returns all reports for the authenticated user, sorted by report date descending.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
[
  {
    "_id": "665f30111111111111111111",
    "title": "Blood Test Report",
    "description": "Annual blood test",
    "condition": "normal",
    "date": "2026-04-30T00:00:00.000Z",
    "type": "lab",
    "fileUrl": "https://res.cloudinary.com/example/raw/upload/report.pdf"
  }
]
```

---

## Get Reports By Type

**Method:** `GET`  
**URL:** `/reports/type/:type`  
**Description:** Returns reports filtered by type.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### URL Example

```txt
/reports/type/lab
```

### Response Example

```json
[
  {
    "_id": "665f30111111111111111111",
    "title": "Blood Test Report",
    "type": "lab",
    "date": "2026-04-30T00:00:00.000Z",
    "fileUrl": "https://res.cloudinary.com/example/raw/upload/report.pdf"
  }
]
```

---

## Get Report By ID

**Method:** `GET`  
**URL:** `/reports/:id`  
**Description:** Returns one report by ID.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
{
  "_id": "665f30111111111111111111",
  "title": "Blood Test Report",
  "description": "Annual blood test",
  "condition": "normal",
  "date": "2026-04-30T00:00:00.000Z",
  "type": "lab",
  "fileUrl": "https://res.cloudinary.com/example/raw/upload/report.pdf"
}
```

### Error Responses

Status: `404`

```json
{
  "message": "Report not found"
}
```

---

## Delete Report

**Method:** `DELETE`  
**URL:** `/reports/:id`  
**Description:** Deletes a report by ID.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
{
  "message": "Report deleted successfully"
}
```

### Error Responses

Status: `404`

```json
{
  "message": "Report not found"
}
```

---

# Vitals APIs

All Vitals APIs require authentication.

## Add Blood Pressure

**Method:** `POST`  
**URL:** `/vitals/blood-pressure`  
**Description:** Adds a blood pressure record.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body

```json
{
  "systolic": 118,
  "diastolic": 78,
  "date": "2026-04-30",
  "time": "08:30",
  "notes": "Morning reading"
}
```

### Response Example

```json
{
  "_id": "665f40111111111111111111",
  "user": "665f1c9d9b7a111111111111",
  "type": "bloodPressure",
  "bloodPressure": {
    "systolic": 118,
    "diastolic": 78,
    "status": "Normal"
  },
  "notes": "Morning reading",
  "recordedAt": "2026-04-30T08:30:00.000Z"
}
```

### Error Responses

Status: `400`

```json
{
  "message": "Missing required fields"
}
```

---

## Add Heart Rate

**Method:** `POST`  
**URL:** `/vitals/heart-rate`  
**Description:** Adds a heart rate record.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body

```json
{
  "heartRate": 82,
  "date": "2026-04-30",
  "time": "08:30",
  "notes": "After walk"
}
```

### Response Example

```json
{
  "_id": "665f41111111111111111111",
  "type": "heartRate",
  "heartRate": 82,
  "heartRateStatus": "Normal",
  "notes": "After walk",
  "recordedAt": "2026-04-30T08:30:00.000Z"
}
```

---

## Add Temperature

**Method:** `POST`  
**URL:** `/vitals/temperature`  
**Description:** Adds a temperature record. The backend expects Fahrenheit input and converts it internally to Celsius only for status calculation.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body

```json
{
  "temperature": 98.6,
  "date": "2026-04-30",
  "time": "08:30",
  "notes": "Normal"
}
```

### Response Example

```json
{
  "_id": "665f42111111111111111111",
  "type": "temperature",
  "temperature": 98.6,
  "temperatureStatus": "Normal",
  "notes": "Normal",
  "recordedAt": "2026-04-30T08:30:00.000Z"
}
```

---

## Add Sugar

**Method:** `POST`  
**URL:** `/vitals/sugar`  
**Description:** Adds a sugar level record.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body

```json
{
  "sugarLevel": 110,
  "date": "2026-04-30",
  "time": "08:30",
  "notes": "Fasting"
}
```

### Response Example

```json
{
  "_id": "665f43111111111111111111",
  "type": "sugar",
  "sugarLevel": 110,
  "sugarStatus": "Normal",
  "notes": "Fasting",
  "recordedAt": "2026-04-30T08:30:00.000Z"
}
```

---

## Get Vitals

**Method:** `GET`  
**URL:** `/vitals`  
**Description:** Returns all vitals for the authenticated user, newest first.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
[
  {
    "_id": "665f40111111111111111111",
    "type": "bloodPressure",
    "bloodPressure": {
      "systolic": 118,
      "diastolic": 78,
      "status": "Normal"
    },
    "recordedAt": "2026-04-30T08:30:00.000Z"
  }
]
```

---

## Get Vital By ID

**Method:** `GET`  
**URL:** `/vitals/:id`  
**Description:** Returns one vital record by ID.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Error Responses

Status: `404`

```json
{
  "message": "Vital not found"
}
```

---

## Update Vital

**Method:** `PUT`  
**URL:** `/vitals/:id`  
**Description:** Updates a vital record. The backend determines the vital type from the fields sent.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### Request Body Examples

Blood pressure:

```json
{
  "systolic": 125,
  "diastolic": 82,
  "notes": "Updated reading"
}
```

Heart rate:

```json
{
  "heartRate": 95,
  "notes": "After exercise"
}
```

Temperature:

```json
{
  "temperature": 100.4,
  "notes": "Mild fever"
}
```

Sugar:

```json
{
  "sugarLevel": 150,
  "notes": "After meal"
}
```

### Response Example

```json
{
  "_id": "665f40111111111111111111",
  "type": "heartRate",
  "heartRate": 95,
  "heartRateStatus": "Normal",
  "notes": "After exercise"
}
```

### Error Responses

Status: `404`

```json
{
  "message": "Vital not found"
}
```

---

## Delete Vital

**Method:** `DELETE`  
**URL:** `/vitals/:id`  
**Description:** Deletes a vital record.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
{
  "message": "Deleted successfully"
}
```

### Error Responses

Status: `404`

```json
{
  "message": "Vital not found"
}
```

---

# Prescription APIs

All Prescription APIs require authentication.

## Add Prescription

**Method:** `POST`  
**URL:** `/prescriptions`  
**Description:** Adds a prescription with medicine name, dosage instructions, reminders, and optional file upload.

### Headers

```http
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data
```

### Request Body

Send as `form-data`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `medicineName` | string | Yes | Medicine name |
| `dosageInstructions` | string | No | Dosage text |
| `reminders` | JSON string | Yes | Must be a JSON array in form-data |
| `file` | file | No | Prescription file/image |

### Request Example

```txt
form-data:
medicineName: Amoxicillin
dosageInstructions: 500mg after breakfast
reminders: [{"time":"08:30 AM","enabled":true},{"time":"08:00 PM","enabled":true}]
file: prescription.pdf
```

### Response Example

```json
{
  "_id": "665f50111111111111111111",
  "user": "665f1c9d9b7a111111111111",
  "medicineName": "Amoxicillin",
  "dosageInstructions": "500mg after breakfast",
  "reminders": [
    {
      "time": "08:30 AM",
      "enabled": true
    },
    {
      "time": "08:00 PM",
      "enabled": true
    }
  ],
  "fileUrl": "https://res.cloudinary.com/example/raw/upload/prescription.pdf",
  "createdAt": "2026-04-30T10:00:00.000Z",
  "updatedAt": "2026-04-30T10:00:00.000Z"
}
```

### Error Responses

Status: `400`

```json
{
  "message": "Invalid reminders format"
}
```

Status: `400`

```json
{
  "message": "Medicine name and at least one reminder required"
}
```

---

## Get Prescriptions

**Method:** `GET`  
**URL:** `/prescriptions`  
**Description:** Returns all prescriptions for the authenticated user, newest first.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
[
  {
    "_id": "665f50111111111111111111",
    "medicineName": "Amoxicillin",
    "dosageInstructions": "500mg after breakfast",
    "reminders": [
      {
        "time": "08:30 AM",
        "enabled": true
      }
    ],
    "fileUrl": "https://res.cloudinary.com/example/raw/upload/prescription.pdf"
  }
]
```

---

## Get Prescription By ID

**Method:** `GET`  
**URL:** `/prescriptions/:id`  
**Description:** Returns one prescription by ID.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
{
  "_id": "665f50111111111111111111",
  "medicineName": "Amoxicillin",
  "dosageInstructions": "500mg after breakfast",
  "reminders": [
    {
      "time": "08:30 AM",
      "enabled": true
    }
  ],
  "fileUrl": "https://res.cloudinary.com/example/raw/upload/prescription.pdf"
}
```

### Error Responses

Status: `404`

```json
{
  "message": "Not found"
}
```

---

## Delete Prescription

**Method:** `DELETE`  
**URL:** `/prescriptions/:id`  
**Description:** Deletes a prescription.

### Headers

```http
Authorization: Bearer jwt_token_here
```

### Response Example

```json
{
  "message": "Deleted successfully"
}
```

### Error Responses

Status: `404`

```json
{
  "message": "Not found"
}
```

---

# Logs APIs (Currently Disabled)

**Note**: Log APIs are currently commented out in the routes. The following endpoints are not active:
- `POST /logs/take` - Take medication with selfie
- `GET /logs` - Get all logs
- `GET /logs/compliance` - Get compliance data
- `DELETE /logs/:id` - Delete log
- `GET /logs/export` - Export logs as PDF

These endpoints will be enabled in a future update.

---

## 5. Special Cases

## File Uploads

The backend uses `multipart/form-data` and Cloudinary upload storage.

Upload field names:

| Feature | Endpoint | File Field |
|---|---|---|
| Profile image | `PUT /profile` | `image` |
| Medication selfie verification | `POST /dose/:doseId/verify` | `file` |
| Report upload | `POST /reports` | `file` |
| Prescription upload | `POST /prescriptions` | `file` |

Allowed formats:

```txt
jpg, jpeg, png, pdf, doc, docx
```

---

## Prescription Reminders

For `POST /prescriptions`, send `reminders` as a JSON string when using `form-data`.

Correct:

```txt
reminders: [{"time":"08:30 AM","enabled":true}]
```

Incorrect:

```txt
reminders: 08:30 AM
```

---

## Medication Timings

For `POST /medications` and `PUT /medications/:id`, `timings` should be an array.

Recommended JSON:

```json
{
  "timings": ["morning", "night"]
}
```

If using form-data, send repeated fields:

```txt
timings: morning
timings: night
```

Do not send a JSON string for medication timings unless the backend is updated to parse it.

---

## Time Formats

Medication schedule times use 12-hour format:

```txt
08:30 AM
12:00 PM
06:00 PM
08:00 PM
```

Prescription reminder times should also use this style:

```txt
04:30 PM
```

Vitals use separate `date` and `time` fields, combined by the backend like this:

```js
new Date(`${date}T${time}`)
```

Recommended vitals format:

```json
{
  "date": "2026-04-30",
  "time": "08:30"
}
```

---

## 6. Data Models

## User

| Field | Type | Description |
|---|---|---|
| `firstName` | string | User name |
| `phone` | string | Unique phone number |
| `age` | number | User age |
| `gender` | string | `male`, `female`, `other` |
| `bloodGroup` | string | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` |
| `height` | number | Height in cm |
| `weight` | number | Weight in kg |
| `profilePic` | string | Cloudinary image URL |
| `password` | string | Exists in schema but not used by current auth flow |
| `isVerified` | boolean | OTP verification status |
| `subscription` | string | `free`, `basic`, `premium`; default `free` |
| `familyMembers` | array | Family member objects |
| `createdAt` | date | Auto timestamp |
| `updatedAt` | date | Auto timestamp |

Family member:

```json
{
  "name": "Priya",
  "relation": "Sister",
  "age": 24
}
```

---

## OTP

| Field | Type | Description |
|---|---|---|
| `phone` | string | Phone number |
| `otp` | string | OTP code |
| `expiresAt` | date | Expiry timestamp, currently not checked during verification |

---

## Medication

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | User reference |
| `name` | string | Medicine name |
| `dosage` | number | Dose amount |
| `unit` | string | Example: `mg`, `ml` |
| `timings` | string[] | Original timing labels or time strings |
| `notifications` | boolean | Defaults to `true` |
| `instructions` | string | Extra medicine instructions |

---

## Dose

A dose represents a single scheduled instance of a medication.

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | User reference |
| `medication` | ObjectId | Medication reference |
| `name` | string | Medicine name (copied from medication) |
| `dosage` | string | Formatted dosage (e.g., "500mg") |
| `date` | string | Date in YYYY-MM-DD format |
| `time` | string | Time in 12-hour format (e.g., "08:30 AM") |
| `status` | string | `pending`, `taken`, default `pending` |
| `takenAt` | date | Timestamp when marked as taken |
| `verified` | boolean | Whether selfie verification is done |
| `verifiedAt` | date | Timestamp when verified |
| `proofImage` | string | Cloudinary URL of verification selfie |
| `expiryAt` | date | Auto-delete time (varies by plan) |
| `isDeleted` | boolean | Soft-delete flag for premium users |
| `deletedAt` | date | Soft-delete timestamp |
| `deletionReason` | string | Reason for deletion (typically "user") |
| `canRecoverUntil` | date | Date until selfie can be recovered (1 year) |

---

## Medication (Old)

## Report

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | User reference |
| `title` | string | Required report title |
| `description` | string | Optional description |
| `condition` | string | `normal`, `moderate`, `critical`; default `normal` |
| `date` | date | Required report date |
| `fileUrl` | string | Required uploaded file URL |
| `type` | string | `medical`, `lab`, `vaccination`, `prescription`; default `medical` |

---

## Vitals

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | User reference |
| `type` | string | `bloodPressure`, `heartRate`, `temperature`, `sugar` |
| `bloodPressure` | object | Systolic, diastolic, status |
| `heartRate` | number | Heart rate value |
| `heartRateStatus` | string | `Low`, `Normal`, `High` |
| `temperature` | number | Fahrenheit value from frontend |
| `temperatureStatus` | string | `Low`, `Normal`, `Fever` |
| `sugarLevel` | number | Sugar value |
| `sugarStatus` | string | `Low`, `Normal`, `Prediabetes`, `Diabetes` |
| `notes` | string | Optional notes |
| `recordedAt` | date | Combined date/time |

---

## Prescription

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | User reference |
| `medicineName` | string | Required medicine name |
| `dosageInstructions` | string | Dosage instructions |
| `reminders` | array | Reminder times |
| `fileUrl` | string | Optional uploaded file URL |

Reminder:

```json
{
  "time": "04:30 PM",
  "enabled": true
}
```

---

## Log

A log model exists, but all `/logs` routes are currently commented out in `routes.js`, so these APIs are not exposed.

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | User reference |
| `medication` | ObjectId | Medication reference |
| `takenAt` | date | Taken timestamp |
| `selfieUrl` | string | Selfie proof URL |
| `autoDeleteAt` | date | Auto-delete time for non-premium users |

---

## 7. Notes for Frontend Developer

### Authentication
- Always send the JWT token on protected routes using `Authorization: Bearer <token>`.
- JWT tokens are issued with a 7-day expiry.
- OTP is valid for 5 minutes.
- Maximum 3 OTP requests per phone number in 10 minutes.
- Minimum 60 seconds between OTP requests for the same phone.
- Maximum 3 verification attempts before requiring a new OTP.
- `GET /users` does not require authentication.

### File Uploads
- Use `multipart/form-data` only for routes with file uploads.
- Use exact file field names: `image` for profile, `file` for reports/prescriptions/dose verification.

### Request Data Format
- Medication `timings` must be an array, not a single comma-separated string.
- Prescription `reminders` must be a JSON array string when sent as form-data.
- Vitals `date` and `time` are required for create APIs and are combined by the backend.
- Temperature input is treated as Fahrenheit; the backend converts to Celsius for status calculation.

### Data Normalization
- Report `condition` is lowercased by the backend.
- Profile `gender` is lowercased by the backend.
- Profile `bloodGroup` is uppercased by the backend.

### Dose Management
- When creating a medication with `POST /medications`, doses are automatically generated for today.
- A dose represents a single instance of a medication at a specific scheduled time.
- Use `PUT /dose/:doseId/taken` to mark a dose as taken without verification.
- Use `POST /dose/:doseId/verify` to upload a selfie and automatically mark as taken & verified.
- Use `DELETE /dose/:doseId/selfie` to soft-delete selfies (premium users only, recoverable for 1 year).

### Plan Limits & Features
- Plan limits apply to medications and reports only.
- Selfie storage duration depends on subscription plan:
  - **Free**: Stored indefinitely
  - **Basic/Standard**: 48 hours auto-delete
  - **Premium**: 3 months auto-delete, plus ability to manually delete selfies

### Security & Privacy
- Some `GET /:id` endpoints do not verify record ownership. Frontend should only use IDs returned from that user's list APIs.
- Family members are stored within the user document and are not individually addressable.

### Unavailable/Disabled Features
- `PUT /medications/:id` exists but documentation shows old format.
- `PUT /prescriptions/:id` (update) controller exists, but no route is registered.
- `POST /medications/:id/take` and `POST /medications/:id/verify` are deprecated; use `/dose/:doseId/taken` and `/dose/:doseId/verify` instead.
- All `/logs` APIs are commented out in routes and unavailable.

### Vitals Status Calculations
- **Blood Pressure**:
  - Normal: systolic < 120 AND diastolic < 80
  - Elevated: systolic < 130 AND diastolic < 80
  - Hypertension Stage 1: systolic < 140 OR diastolic < 90
  - Hypertension Stage 2: systolic >= 140 OR diastolic >= 90
- **Heart Rate**: Low (< 60), Normal (60-100), High (> 100)
- **Temperature**: Low (< 36°C), Normal (36-37.5°C), Fever (> 37.5°C)
- **Sugar Level**: Low (< 70), Normal (70-140), Prediabetes (140-200), Diabetes (> 200)

### Medication Timing Format
- Preset shortcuts: `morning` (08:30 AM), `afternoon` (12:00 PM), `evening` (06:00 PM), `night` (09:00 PM)
- Or send explicit times as strings in 12-hour format with AM/PM

---

## 8. Currently Registered Routes

These are the routes currently registered in `src/Routes/routes.js`.

```txt
POST   /api/auth/sendOTP
POST   /api/auth/verifyOTP
POST   /api/auth/resendOTP

GET    /api/users
GET    /api/profile
PUT    /api/profile
POST   /api/family-members
PUT    /api/subscription

POST   /api/medications
GET    /api/medications
GET    /api/today
PUT    /api/medications/:id
DELETE /api/medications/:id
PUT    /api/dose/:doseId/taken
POST   /api/dose/:doseId/verify
DELETE /api/dose/:doseId/selfie

POST   /api/reports
GET    /api/reports
GET    /api/reports/type/:type
GET    /api/reports/:id
DELETE /api/reports/:id

GET    /api/vitals
GET    /api/vitals/:id
PUT    /api/vitals/:id
DELETE /api/vitals/:id
POST   /api/vitals/blood-pressure
POST   /api/vitals/heart-rate
POST   /api/vitals/temperature
POST   /api/vitals/sugar

POST   /api/prescriptions
GET    /api/prescriptions
GET    /api/prescriptions/:id
DELETE /api/prescriptions/:id
```

