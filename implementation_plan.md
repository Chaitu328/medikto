# Implementation Plan - Medication Compliance Enhancements

This document outlines the changes planned for backend and mobile modules to support selfie timestamps, line graphs, FCM reminders, and user schema bindings.

## User Review Required

> [!IMPORTANT]
> **User Schema Binding Changes**:
> We are uncommenting the `user` fields in `medicationModel.js` and `doseModel.js` on the backend and updating the controllers to save and filter records by `req.user.id` (or `req.query.patientId` for caretakers/guardians). This replaces the temporary "global database shared state" model with proper multi-user data isolation.

## Open Questions

None at this time.

## Proposed Changes

### Backend Component
We will update schemas, controllers, and jobs to enable user-specific medication scheduling and trigger push notifications via FCM.

---

#### [MODIFY] [medicationModel.js](file:///d:/medikto/Backend/src/models/medicationModel.js)
- Uncomment the `user` field reference (referencing `User` schema).

#### [MODIFY] [doseModel.js](file:///d:/medikto/Backend/src/models/doseModel.js)
- Uncomment the `user` field reference (referencing `User` schema).

#### [MODIFY] [medicationController.js](file:///d:/medikto/Backend/src/controllers/medicationController.js)
- In `addMedication`, set `user: req.user.id` on both `Medication.create()` and the generated `Dose` records.
- In `getMedications` and `getTodaySchedule`, filter queries by `user: req.user.id` (or `req.query.patientId` if a caretaker/guardian is viewing).
- In `verifyWithSelfie`, add an incoming text overlay transformation when uploading to Cloudinary:
  ```javascript
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  const stampText = `Medicto\n${timeStr}\n${dateStr}`;
  // Use Cloudinary transformation parameter to bake this text into the image
  ```

#### [MODIFY] [reminder.js](file:///d:/medikto/Backend/src/jobs/reminder.js)
- Retrieve medications scheduled for the current time.
- Fetch the associated user's active `fcmToken`.
- If an `fcmToken` is registered, invoke `notificationHelper.sendPushNotification()` to deliver a real-time reminder alert to their device.

---

### Mobile Client Component
We will update the schedule API parser, add a compliance graph using `fl_chart`, and build a selfie viewer dialog.

---

#### [MODIFY] [medications_manager.dart](file:///d:/medikto/medikto-app/lib/features/medications/data/medications_manager.dart)
- Update `getTodaySchedule` to check if `response.data` is a `List` or a `Map` (extracting `schedules` or `doses`), preventing crashes when retrieving data.

#### [MODIFY] [medical_records_screen.dart](file:///d:/medikto/medikto-app/lib/features/medications/views/medical_records_screen.dart)
- Include a `LineChart` (utilizing `fl_chart`) at the top of the view to render a weekly medication compliance trend.
- Make the verified selfie image thumbnail clickable, opening an interactive dialog showing the full stamped image from Cloudinary.

---

## Verification Plan

### Automated Tests
- Trigger medication cron schedules manually on the backend to test FCM push dispatch alerts.

### Manual Verification
- Upload a medication dose verification selfie on the mobile client and view the generated Cloudinary URL to verify the visual date/time stamp overlay is burned into the image.
- Tap on the verified selfie thumbnail in the mobile client's "Compliance Records" page to confirm it opens a full-screen stamped image viewer.
- Confirm the new compliance trend line chart renders correctly at the top of the records tab views.
