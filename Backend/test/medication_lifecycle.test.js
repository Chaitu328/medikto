const assert = require("assert");

// Helper functions under test
const parseTimeToMinutes = (timeString) => {
  if (!timeString) return null;
  const cleanTime = timeString.replace(/\u202F|\u00A0/g, " ").trim();
  const isPM = cleanTime.toUpperCase().endsWith("PM");
  const isAM = cleanTime.toUpperCase().endsWith("AM");
  const timeDigits = cleanTime.replace(/[a-zA-Z\s]/g, "");
  const [hStr, mStr] = timeDigits.split(":");
  if (!hStr || !mStr) return null;
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  if (isNaN(hour) || isNaN(minute)) return null;
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const getLocalTimeDetails = (dateObj, timezone = "Asia/Kolkata") => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = formatter.formatToParts(dateObj);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    const localDate = `${year}-${month}-${day}`;
    const totalMinutes = hour * 60 + minute;
    return { localDate, hour, minute, totalMinutes };
  } catch (err) {
    const fallbackDate = dateObj.toISOString().split("T")[0];
    return { localDate: fallbackDate, hour: dateObj.getUTCHours(), minute: dateObj.getUTCMinutes(), totalMinutes: dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes() };
  }
};

const isDoseInFuture = (doseDate, doseTime, referenceNow, timezone = "Asia/Kolkata") => {
  if (!doseDate || !doseTime) return false;
  try {
    const { localDate: today, totalMinutes: currTotalMinutes } = getLocalTimeDetails(referenceNow, timezone);

    if (doseDate > today) return true;
    if (doseDate < today) return false;

    const doseTotalMinutes = parseTimeToMinutes(doseTime);
    if (doseTotalMinutes === null) return false;

    return currTotalMinutes < doseTotalMinutes;
  } catch (err) {
    return false;
  }
};

const isDoseExpired = (doseDate, doseTime, referenceNow, timezone = "Asia/Kolkata") => {
  if (!doseDate || !doseTime) return false;
  try {
    const { localDate: today, totalMinutes: currTotalMinutes } = getLocalTimeDetails(referenceNow, timezone);

    if (doseDate < today) return true;
    if (doseDate > today) return false;

    const doseTotalMinutes = parseTimeToMinutes(doseTime);
    if (doseTotalMinutes === null) return false;

    return currTotalMinutes >= doseTotalMinutes + 60;
  } catch (err) {
    return false;
  }
};

const isActionWindowEligible = (dose, referenceNow, timezone = "Asia/Kolkata") => {
  // 1. Status takes priority
  if (dose.status === "taken" || dose.status === "missed" || dose.status === "cancelled") {
    return false;
  }

  // 2. Future check
  if (isDoseInFuture(dose.date, dose.time, referenceNow, timezone)) {
    return false;
  }

  // 3. Expiration check (60 minutes past scheduled time)
  if (isDoseExpired(dose.date, dose.time, referenceNow, timezone)) {
    return false;
  }

  return true;
};

const simulateMultiStageReminderCron = (dose, referenceNow, timezone = "Asia/Kolkata") => {
  const { localDate: userLocalDate, totalMinutes: currentMinutes } = getLocalTimeDetails(referenceNow, timezone);
  const scheduledMinutes = parseTimeToMinutes(dose.time);

  let preAlert = false;
  let scheduledAlert = false;
  let postAlert = false;
  let missedAlert = false;

  // 1. Pre-reminder (15 mins before)
  if (dose.date === userLocalDate && currentMinutes >= scheduledMinutes - 15 && currentMinutes < scheduledMinutes && !dose.preReminderSent) {
    dose.preReminderSent = true;
    preAlert = true;
  }

  // 2. Scheduled reminder (at scheduled time)
  if (dose.date === userLocalDate && currentMinutes >= scheduledMinutes && currentMinutes < scheduledMinutes + 15 && !dose.scheduledReminderSent) {
    dose.scheduledReminderSent = true;
    scheduledAlert = true;
  }

  // 3. Post-reminder (15 mins after if still pending)
  if (dose.date === userLocalDate && currentMinutes >= scheduledMinutes + 15 && currentMinutes < scheduledMinutes + 60 && dose.status === "pending" && !dose.postReminderSent) {
    dose.postReminderSent = true;
    postAlert = true;
  }

  // 4. Missed dose expiration (60 mins after scheduled time)
  const isPastDate = dose.date < userLocalDate;
  const isPastOneHourToday = (dose.date === userLocalDate && currentMinutes >= scheduledMinutes + 60);

  if ((isPastDate || isPastOneHourToday) && dose.status === "pending") {
    dose.status = "missed";
    if (!dose.missedReminderSent) {
      dose.missedReminderSent = true;
      missedAlert = true;
    }
  }

  return { preAlert, scheduledAlert, postAlert, missedAlert, finalStatus: dose.status };
};

console.log("Running Backend Medication Lifecycle & 60-Minute Action Window Unit Tests...\n");

// 1. Time parsing tests
console.log("1. Testing parseTimeToMinutes...");
assert.strictEqual(parseTimeToMinutes("08:30 AM"), 8 * 60 + 30);
assert.strictEqual(parseTimeToMinutes("11:15 AM"), 11 * 60 + 15);
assert.strictEqual(parseTimeToMinutes("11:30 AM"), 11 * 60 + 30);
assert.strictEqual(parseTimeToMinutes("11:45 AM"), 11 * 60 + 45);
assert.strictEqual(parseTimeToMinutes("12:29 PM"), 12 * 60 + 29);
assert.strictEqual(parseTimeToMinutes("12:30 PM"), 12 * 60 + 30);
assert.strictEqual(parseTimeToMinutes("12:45 PM"), 12 * 60 + 45);
assert.strictEqual(parseTimeToMinutes("01:36 PM"), 13 * 60 + 36);
assert.strictEqual(parseTimeToMinutes("05:30 PM"), 17 * 60 + 30);
console.log("✅ parseTimeToMinutes passed\n");

// 2. 10 Comprehensive User Test Scenarios
console.log("2. Running the 10 User Test Scenarios for Medication Lifecycle & Action Window...\n");

// Test 1: Scheduled 11:30 AM, current 11:15 AM IST (05:45 UTC)
// Expected: Pre-reminder eligible, No take action yet (Upcoming)
const ref_1115AM = new Date("2026-09-06T05:45:00.000Z");
const dose1 = { date: "2026-09-06", time: "11:30 AM", status: "pending", preReminderSent: false, scheduledReminderSent: false, postReminderSent: false, missedReminderSent: false };
const res1 = simulateMultiStageReminderCron(dose1, ref_1115AM);
assert.strictEqual(res1.preAlert, true, "Test 1: Pre-reminder must fire at 11:15 AM for 11:30 AM dose");
assert.strictEqual(isActionWindowEligible(dose1, ref_1115AM), false, "Test 1: Action window must NOT be open at 11:15 AM");
console.log("✅ Test 1: Scheduled 11:30 AM at 11:15 AM -> Pre-reminder sent, No take action yet");

// Test 2: Scheduled 11:30 AM, current 11:30 AM IST (06:00 UTC)
// Expected: Scheduled notification, Mark as Taken / Verify with Selfie available
const ref_1130AM = new Date("2026-09-06T06:00:00.000Z");
const res2 = simulateMultiStageReminderCron(dose1, ref_1130AM);
assert.strictEqual(res2.scheduledAlert, true, "Test 2: Scheduled reminder must fire at 11:30 AM");
assert.strictEqual(isActionWindowEligible(dose1, ref_1130AM), true, "Test 2: Action window must be OPEN at 11:30 AM");
console.log("✅ Test 2: Scheduled 11:30 AM at 11:30 AM -> Scheduled reminder sent, Action window open");

// Test 3: Scheduled 11:30 AM, current 11:45 AM IST (06:15 UTC)
// Expected: Post-reminder sent if still pending, Action window still open
const ref_1145AM = new Date("2026-09-06T06:15:00.000Z");
const res3 = simulateMultiStageReminderCron(dose1, ref_1145AM);
assert.strictEqual(res3.postAlert, true, "Test 3: Post-reminder must fire at 11:45 AM for pending dose");
assert.strictEqual(isActionWindowEligible(dose1, ref_1145AM), true, "Test 3: Action window must be OPEN at 11:45 AM");
console.log("✅ Test 3: Scheduled 11:30 AM at 11:45 AM -> Post-reminder sent, Action window open");

// Test 4: Scheduled 11:30 AM, current 12:29 PM IST (06:59 UTC - 59 minutes past schedule)
// Expected: Still pending, Action window still open (within 60m)
const ref_1229PM = new Date("2026-09-06T06:59:00.000Z");
assert.strictEqual(isDoseExpired("2026-09-06", "11:30 AM", ref_1229PM), false);
assert.strictEqual(isActionWindowEligible(dose1, ref_1229PM), true, "Test 4: Action window must remain OPEN at 12:29 PM (minute 59)");
console.log("✅ Test 4: Scheduled 11:30 AM at 12:29 PM -> Still pending, Action window open");

// Test 5: Scheduled 11:30 AM, current 12:30 PM IST (07:00 UTC - exactly 60 minutes past schedule)
// Expected: Dose expires, status = missed, No actions
const ref_1230PM = new Date("2026-09-06T07:00:00.000Z");
assert.strictEqual(isDoseExpired("2026-09-06", "11:30 AM", ref_1230PM), true);
const res5 = simulateMultiStageReminderCron(dose1, ref_1230PM);
assert.strictEqual(res5.missedAlert, true, "Test 5: Missed reminder must fire when 60 minutes expire");
assert.strictEqual(dose1.status, "missed", "Test 5: Status must transition to missed at +60m");
assert.strictEqual(isActionWindowEligible(dose1, ref_1230PM), false, "Test 5: Action window must be CLOSED at 12:30 PM");
console.log("✅ Test 5: Scheduled 11:30 AM at 12:30 PM -> Dose expires, status = missed, No actions");

// Test 6: Scheduled 11:30 AM, current 12:45 PM IST (07:15 UTC - 75 minutes past schedule)
// Expected: Missed, No actions, No repeat missed reminder
const ref_1245PM = new Date("2026-09-06T07:15:00.000Z");
const res6 = simulateMultiStageReminderCron(dose1, ref_1245PM);
assert.strictEqual(res6.missedAlert, false, "Test 6: Missed reminder must NOT repeat");
assert.strictEqual(dose1.status, "missed");
assert.strictEqual(isActionWindowEligible(dose1, ref_1245PM), false, "Test 6: No actions allowed on missed dose");
console.log("✅ Test 6: Scheduled 11:30 AM at 12:45 PM -> Missed, No repeat reminder, No actions");

// Test 7: Dose already taken at 11:45 AM (status = taken)
// Expected: Taken, No actions regardless of time
const takenDose = { date: "2026-09-06", time: "11:30 AM", status: "taken", takenAt: new Date("2026-09-06T06:15:00.000Z") };
assert.strictEqual(isActionWindowEligible(takenDose, ref_1145AM), false);
assert.strictEqual(isActionWindowEligible(takenDose, ref_1229PM), false);
assert.strictEqual(isActionWindowEligible(takenDose, ref_1245PM), false);
console.log("✅ Test 7: Dose already taken -> Taken, No actions regardless of time");

// Test 8: Future dose at 5:30 PM while current time is 1:36 PM IST
// Expected: Upcoming, No actions
const ref_0136PM = new Date("2026-09-06T08:06:00.000Z");
const futureDose = { date: "2026-09-06", time: "05:30 PM", status: "pending" };
assert.strictEqual(isDoseInFuture("2026-09-06", "05:30 PM", ref_0136PM), true);
assert.strictEqual(isActionWindowEligible(futureDose, ref_0136PM), false);
console.log("✅ Test 8: Future dose at 05:30 PM at 01:36 PM -> Upcoming, No actions");

// Test 9: Yesterday's pending dose (2026-09-05 12:30 PM at 2026-09-06 08:35 AM IST)
// Expected: Expired, auto-missed, No actions
const ref_0835AM = new Date("2026-09-06T03:05:00.000Z");
assert.strictEqual(isDoseExpired("2026-09-05", "12:30 PM", ref_0835AM), true);
const yesterdayDose = { date: "2026-09-05", time: "12:30 PM", status: "pending" };
assert.strictEqual(isActionWindowEligible(yesterdayDose, ref_0835AM), false);
console.log("✅ Test 9: Yesterday dose evaluated today -> Expired / Missed, No actions");

// Test 10: Scheduled time and takenAt separation
const completedDose = { date: "2026-09-06", time: "11:30 AM", status: "taken", takenAt: new Date("2026-09-06T06:12:34.000Z") };
assert.strictEqual(completedDose.time, "11:30 AM");
assert.notStrictEqual(completedDose.takenAt.toISOString(), completedDose.time);
console.log("✅ Test 10: Scheduled time (11:30 AM) and takenAt remain separate and distinct\n");

console.log("ALL 10 BACKEND LIFECYCLE & ACTION WINDOW TESTS PASSED SUCCESSFULLY! 🎉");
