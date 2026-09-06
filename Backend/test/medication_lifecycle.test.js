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

console.log("Running Backend Medication Lifecycle & Timezone Unit Tests...\n");

// 1. Time parsing tests
console.log("1. Testing parseTimeToMinutes...");
assert.strictEqual(parseTimeToMinutes("08:30 AM"), 8 * 60 + 30);
assert.strictEqual(parseTimeToMinutes("8:30 AM"), 8 * 60 + 30);
assert.strictEqual(parseTimeToMinutes("12:00 PM"), 12 * 60);
assert.strictEqual(parseTimeToMinutes("12:30 PM"), 12 * 60 + 30);
assert.strictEqual(parseTimeToMinutes("01:36 PM"), 13 * 60 + 36);
assert.strictEqual(parseTimeToMinutes("05:30 PM"), 17 * 60 + 30);
assert.strictEqual(parseTimeToMinutes("08:43 PM"), 20 * 60 + 43);
assert.strictEqual(parseTimeToMinutes("12:00 AM"), 0);
assert.strictEqual(parseTimeToMinutes("12:15 AM"), 15);
console.log("✅ parseTimeToMinutes passed\n");

// 2. Future Dose Protection Tests
console.log("2. Testing isDoseInFuture logic...");
// Reference: 2026-09-06 at 08:35 AM IST (03:05 UTC)
const refNow_0835AM = new Date("2026-09-06T03:05:00.000Z");

// Scheduled 08:30 AM evaluated at 08:35 AM -> NOT in future (actionable)
assert.strictEqual(isDoseInFuture("2026-09-06", "08:30 AM", refNow_0835AM, "Asia/Kolkata"), false);

// Scheduled 05:30 PM evaluated at 08:35 AM -> IN FUTURE
assert.strictEqual(isDoseInFuture("2026-09-06", "05:30 PM", refNow_0835AM, "Asia/Kolkata"), true);

// Scheduled 12:30 PM from yesterday (2026-09-05) evaluated at 08:35 AM today -> NOT in future
assert.strictEqual(isDoseInFuture("2026-09-05", "12:30 PM", refNow_0835AM, "Asia/Kolkata"), false);

// Scheduled 08:30 AM tomorrow (2026-09-07) evaluated at 08:35 AM today -> IN FUTURE
assert.strictEqual(isDoseInFuture("2026-09-07", "08:30 AM", refNow_0835AM, "Asia/Kolkata"), true);

console.log("✅ isDoseInFuture logic passed\n");

// 3. Reminder Job & Missed Dose Detection Tests
console.log("3. Testing Reminder Cron Trigger & Missed Calculation...");

const simulateReminderCron = (dose, referenceNow, timezone = "Asia/Kolkata") => {
  const { localDate: userLocalDate, totalMinutes: currentMinutes } = getLocalTimeDetails(referenceNow, timezone);
  const scheduledMinutes = parseTimeToMinutes(dose.time);

  let onTimeAlert = false;
  let missedAlert = false;

  // On-time trigger
  if (dose.date === userLocalDate && currentMinutes === scheduledMinutes && dose.status === "pending") {
    onTimeAlert = true;
  }

  // Missed dose check (1 hour / 60 minutes after scheduled time)
  const isPastDate = dose.date < userLocalDate;
  const isPastOneHourToday = (dose.date === userLocalDate && currentMinutes >= scheduledMinutes + 60);

  if ((isPastDate || isPastOneHourToday) && dose.status === "pending") {
    dose.status = "missed";
    if (!dose.missedReminderSent) {
      dose.missedReminderSent = true;
      missedAlert = true;
    }
  }

  return { onTimeAlert, missedAlert, finalStatus: dose.status };
};

// Test 3A: At exactly 08:30 AM IST for 08:30 AM scheduled dose
const refNow_0830AM = new Date("2026-09-06T03:00:00.000Z");
const testDoseA = { date: "2026-09-06", time: "08:30 AM", status: "pending", missedReminderSent: false };
const resA = simulateReminderCron(testDoseA, refNow_0830AM);
assert.strictEqual(resA.onTimeAlert, true, "Should fire on-time alert at 08:30 AM");
assert.strictEqual(resA.missedAlert, false, "Should not fire missed alert at 08:30 AM");
assert.strictEqual(testDoseA.status, "pending");

// Test 3B: At 08:35 AM IST (5 mins after schedule)
const resB = simulateReminderCron(testDoseA, refNow_0835AM);
assert.strictEqual(resB.onTimeAlert, false, "Should not re-fire on-time alert at 08:35 AM");
assert.strictEqual(resB.missedAlert, false, "Should not fire missed alert at 5 mins past schedule");
assert.strictEqual(testDoseA.status, "pending");

// Test 3C: At 09:30 AM IST (60 mins after schedule) -> Transitions to MISSED & fires 1 missed reminder
const refNow_0930AM = new Date("2026-09-06T04:00:00.000Z");
const resC = simulateReminderCron(testDoseA, refNow_0930AM);
assert.strictEqual(resC.missedAlert, true, "Should fire missed alert 60 mins after scheduled time");
assert.strictEqual(testDoseA.status, "missed");
assert.strictEqual(testDoseA.missedReminderSent, true);

// Test 3D: Next minute at 09:31 AM IST -> Does NOT re-send missed reminder (already sent)
const refNow_0931AM = new Date("2026-09-06T04:01:00.000Z");
const resD = simulateReminderCron(testDoseA, refNow_0931AM);
assert.strictEqual(resD.missedAlert, false, "Must NOT re-fire missed alert on subsequent cron cycles");
assert.strictEqual(testDoseA.status, "missed");

// Test 3E: Taken dose does NOT transition to missed or fire missed reminder
const takenDose = { date: "2026-09-06", time: "08:30 AM", status: "taken", takenAt: new Date(), missedReminderSent: false };
const resE = simulateReminderCron(takenDose, refNow_0930AM);
assert.strictEqual(resE.missedAlert, false, "Taken dose must never fire missed alert");
assert.strictEqual(takenDose.status, "taken");

console.log("✅ Reminder Cron & Missed Dose Detection tests passed\n");
console.log("ALL BACKEND TESTS PASSED SUCCESSFULLY! 🎉");
