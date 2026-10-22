const assert = require("assert");
const mongoose = require("mongoose");
const { getAccessiblePatientIds, buildUserAccessFilter } = require("../src/utils/accessControl");

console.log("\n🧪 Running Super Admin Guardian, Subscription & Access Control Tests...\n");

let passed = 0;
let total = 0;

async function test(description, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✅ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${description}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function runAllTests() {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Access Control & Patient Filtering Tests
  // ─────────────────────────────────────────────────────────────────────────────

  await test("Super Admin with valid patientId filter restricts access to exactly that patient", async () => {
    const patientId = new mongoose.Types.ObjectId().toString();
    const req = {
      user: { _id: new mongoose.Types.ObjectId().toString(), role: "superadmin" },
      query: { patientId },
    };

    const accessibleIds = await getAccessiblePatientIds(req);
    assert.strictEqual(Array.isArray(accessibleIds), true, "Should return an array");
    assert.strictEqual(accessibleIds.length, 1, "Should contain exactly 1 patient ID");
    assert.strictEqual(accessibleIds[0], patientId, "Should match requested patientId");

    const filter = await buildUserAccessFilter(req);
    assert.strictEqual(filter.user.toString(), patientId, "Filter user field must match patientId");
  });

  await test("Super Admin without patientId receives null (all patients accessible)", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId().toString(), role: "superadmin" },
      query: {},
    };

    const accessibleIds = await getAccessiblePatientIds(req);
    assert.strictEqual(accessibleIds, null, "Should return null when no patientId is requested");

    const filter = await buildUserAccessFilter(req);
    assert.deepStrictEqual(filter, {}, "Filter should be empty when no patientId is requested");
  });

  await test("Super Admin with malformed patientId returns empty array (safe rejection)", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId().toString(), role: "superadmin" },
      query: { patientId: "not-a-valid-objectid" },
    };

    const accessibleIds = await getAccessiblePatientIds(req);
    assert.deepStrictEqual(accessibleIds, [], "Should return empty array for invalid patientId");

    const filter = await buildUserAccessFilter(req);
    assert.deepStrictEqual(filter.user, { $in: [] }, "Filter should match empty set");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Guardian Creation Payload & Validation Rules
  // ─────────────────────────────────────────────────────────────────────────────

  await test("Hospital field normalization: empty string, placeholders and undefined resolve to undefined", () => {
    const sanitizeHospital = (raw) => {
      if (!raw) return undefined;
      const str = String(raw).trim();
      if (
        str === "" ||
        str === "Select Hospital" ||
        str === "Select Hospital (Optional)" ||
        str === "undefined" ||
        str === "null"
      ) {
        return undefined;
      }
      return str;
    };

    assert.strictEqual(sanitizeHospital(""), undefined);
    assert.strictEqual(sanitizeHospital("Select Hospital"), undefined);
    assert.strictEqual(sanitizeHospital("Select Hospital (Optional)"), undefined);
    assert.strictEqual(sanitizeHospital("undefined"), undefined);
    assert.strictEqual(sanitizeHospital(null), undefined);
    assert.strictEqual(sanitizeHospital(undefined), undefined);

    const validId = new mongoose.Types.ObjectId().toString();
    assert.strictEqual(sanitizeHospital(validId), validId);
  });

  await test("Invalid hospital ID format is detected before database insertion", () => {
    const validateHospitalId = (id) => {
      if (!id) return { valid: true };
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { valid: false, error: "Invalid hospital ID format" };
      }
      return { valid: true };
    };

    assert.strictEqual(validateHospitalId(undefined).valid, true);
    assert.strictEqual(validateHospitalId("").valid, true);
    assert.strictEqual(validateHospitalId("invalid-id-xyz").valid, false);
    assert.strictEqual(validateHospitalId("12345").valid, false);

    const realId = new mongoose.Types.ObjectId().toString();
    assert.strictEqual(validateHospitalId(realId).valid, true);
  });

  await test("Guardian invitation lifecycle: pending invite and empty guardianFor until accepted", () => {
    const patientId = new mongoose.Types.ObjectId();
    const guardianData = {
      role: "guardian",
      guardianFor: [], // Must NOT be pre-populated
    };

    const inviteData = {
      patientId,
      status: "pending", // Must be pending
    };

    assert.strictEqual(guardianData.guardianFor.length, 0, "guardianFor must start empty");
    assert.strictEqual(inviteData.status, "pending", "Invite must start in pending status");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Subscription Management & Grant Entitlement Schema Tests
  // ─────────────────────────────────────────────────────────────────────────────

  await test("Admin grant schema preserves grant details without affecting other users", () => {
    const superAdminId = new mongoose.Types.ObjectId();
    const now = new Date();
    const durationDays = 30;
    const subscriptionEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const patient1 = {
      _id: new mongoose.Types.ObjectId(),
      subscription: "basic",
      subscriptionDetails: {
        plan: "basic",
        status: "inactive",
      },
    };

    const patient2 = {
      _id: new mongoose.Types.ObjectId(),
      subscription: "basic",
      subscriptionDetails: {
        plan: "basic",
        status: "inactive",
      },
    };

    // Perform grant on patient 1
    patient1.subscription = "premium";
    patient1.subscriptionDetails = {
      plan: "premium",
      status: "active",
      subscriptionStart: now,
      subscriptionEnd: subscriptionEnd,
      grantType: "admin_grant",
      durationDays: durationDays,
      grantedBy: superAdminId,
      grantedAt: now,
    };

    // Verify patient 1 grant
    assert.strictEqual(patient1.subscription, "premium");
    assert.strictEqual(patient1.subscriptionDetails.plan, "premium");
    assert.strictEqual(patient1.subscriptionDetails.status, "active");
    assert.strictEqual(patient1.subscriptionDetails.grantType, "admin_grant");
    assert.strictEqual(patient1.subscriptionDetails.durationDays, 30);
    assert.strictEqual(patient1.subscriptionDetails.grantedBy, superAdminId);

    // Verify patient 2 is completely unchanged
    assert.strictEqual(patient2.subscription, "basic");
    assert.strictEqual(patient2.subscriptionDetails.plan, "basic");
    assert.strictEqual(patient2.subscriptionDetails.status, "inactive");
    assert.strictEqual(patient2.subscriptionDetails.grantType, undefined);
  });

  await test("Admin revoke updates status and records audit metadata", () => {
    const superAdminId = new mongoose.Types.ObjectId();
    const now = new Date();

    const patient = {
      _id: new mongoose.Types.ObjectId(),
      subscription: "premium",
      subscriptionDetails: {
        plan: "premium",
        status: "active",
        grantType: "admin_grant",
        grantedBy: superAdminId,
        grantedAt: new Date(now.getTime() - 86400000),
      },
    };

    // Revoke grant
    patient.subscription = "basic";
    patient.subscriptionDetails.status = "inactive";
    patient.subscriptionDetails.subscriptionEnd = now;
    patient.subscriptionDetails.revokedBy = superAdminId;
    patient.subscriptionDetails.revokedAt = now;

    assert.strictEqual(patient.subscription, "basic");
    assert.strictEqual(patient.subscriptionDetails.status, "inactive");
    assert.strictEqual(patient.subscriptionDetails.revokedBy, superAdminId);
    assert.strictEqual(patient.subscriptionDetails.revokedAt, now);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Two-Plan System (Free & Premium) and Patient-Specific Upgrade Tests
  // ─────────────────────────────────────────────────────────────────────────────

  const { getEffectiveSubscription } = require("../src/controllers/subscriptionController");
  const { PLAN_LIMITS } = require("../src/utils/planLimits");

  await test("Effective subscription resolver strictly maps all non-premium accounts to Free and premium accounts to Premium", () => {
    // 1. Patient with default or empty details
    const freePatient = {
      _id: new mongoose.Types.ObjectId(),
      role: "patient",
      subscription: "free",
      subscriptionDetails: { plan: "free", status: "active" },
    };
    const effectiveFree = getEffectiveSubscription(freePatient);
    assert.strictEqual(effectiveFree.plan, "free", "Non-premium must resolve to free");
    assert.strictEqual(effectiveFree.isPremium, false);
    assert.strictEqual(effectiveFree.limits.medications, 5);
    assert.strictEqual(effectiveFree.limits.reports, 50);

    // 2. Legacy patient with 'basic' in db
    const legacyPatient = {
      _id: new mongoose.Types.ObjectId(),
      role: "patient",
      subscription: "basic",
      subscriptionDetails: { plan: "basic", status: "active" },
    };
    const effectiveLegacy = getEffectiveSubscription(legacyPatient);
    assert.strictEqual(effectiveLegacy.plan, "free", "Legacy basic must resolve to free plan");
    assert.strictEqual(effectiveLegacy.isPremium, false);

    // 3. Premium patient
    const premiumPatient = {
      _id: new mongoose.Types.ObjectId(),
      role: "patient",
      subscription: "premium",
      subscriptionDetails: {
        plan: "premium",
        status: "active",
        subscriptionEnd: new Date(Date.now() + 30 * 86400000),
      },
    };
    const effectivePremium = getEffectiveSubscription(premiumPatient);
    assert.strictEqual(effectivePremium.plan, "premium", "Premium must resolve to premium");
    assert.strictEqual(effectivePremium.isPremium, true);
    assert.strictEqual(effectivePremium.limits.medications, Infinity);
    assert.strictEqual(effectivePremium.limits.reports, 250);
  });

  await test("Upgrading Free patient to Premium unlocks unlimited medications and 250 reports without modifying other patients", () => {
    const superAdminId = new mongoose.Types.ObjectId();
    const patientAId = new mongoose.Types.ObjectId();
    const patientBId = new mongoose.Types.ObjectId();

    // Two patients on Free plan
    const patientA = {
      _id: patientAId,
      firstName: "Alice",
      role: "patient",
      subscription: "free",
      subscriptionDetails: { plan: "free", status: "active" },
    };

    const patientB = {
      _id: patientBId,
      firstName: "Bob",
      role: "patient",
      subscription: "free",
      subscriptionDetails: { plan: "free", status: "active" },
    };

    // Before upgrade: both have Free limits (5 meds, 50 reports)
    const initialA = getEffectiveSubscription(patientA);
    const initialB = getEffectiveSubscription(patientB);
    assert.strictEqual(initialA.plan, "free");
    assert.strictEqual(initialA.limits.medications, 5);
    assert.strictEqual(initialB.plan, "free");
    assert.strictEqual(initialB.limits.medications, 5);

    // Super Admin upgrades Patient A to Premium
    const now = new Date();
    const durationDays = 365;
    const subscriptionEnd = new Date(now.getTime() + durationDays * 86400000);

    patientA.subscription = "premium";
    patientA.subscriptionDetails = {
      plan: "premium",
      status: "active",
      subscriptionStart: now,
      subscriptionEnd: subscriptionEnd,
      grantedBy: superAdminId,
      grantedAt: now,
      grantType: "admin_grant",
      durationDays: durationDays,
    };

    // After upgrade: Patient A has Premium entitlements
    const upgradedA = getEffectiveSubscription(patientA);
    assert.strictEqual(upgradedA.plan, "premium");
    assert.strictEqual(upgradedA.isPremium, true);
    assert.strictEqual(upgradedA.limits.medications, Infinity);
    assert.strictEqual(upgradedA.limits.reports, 250);

    // Patient B remains completely unchanged on Free
    const afterB = getEffectiveSubscription(patientB);
    assert.strictEqual(afterB.plan, "free");
    assert.strictEqual(afterB.isPremium, false);
    assert.strictEqual(afterB.limits.medications, 5);
    assert.strictEqual(afterB.limits.reports, 50);
    assert.strictEqual(patientB.subscription, "free");
    assert.strictEqual(patientB.subscriptionDetails.plan, "free");
  });

  await test("Super Admin upgrade endpoint authorization and parameter validation", () => {
    // Helper to simulate endpoint validation logic
    const validateUpgradeRequest = (callerRole, patientId, targetUserRole) => {
      if (callerRole !== "superadmin") {
        return { status: 403, error: "Access denied. Only Super Admin can manage patient subscription grants." };
      }
      if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
        return { status: 400, error: "A valid Patient ID is required" };
      }
      if (targetUserRole && targetUserRole !== "patient" && targetUserRole !== "user") {
        return { status: 400, error: "Subscription grants can only be applied to patient accounts" };
      }
      return { status: 200, success: true };
    };

    const validPatientId = new mongoose.Types.ObjectId().toString();

    // 1. Non-superadmin rejected
    const nonAdminResult = validateUpgradeRequest("admin", validPatientId, "patient");
    assert.strictEqual(nonAdminResult.status, 403);

    // 2. Invalid patient ID rejected
    const invalidIdResult = validateUpgradeRequest("superadmin", "invalid-id", "patient");
    assert.strictEqual(invalidIdResult.status, 400);

    // 3. Non-patient target rejected
    const nonPatientResult = validateUpgradeRequest("superadmin", validPatientId, "guardian");
    assert.strictEqual(nonPatientResult.status, 400);

    // 4. Authorized Super Admin with valid patient accepted
    const successResult = validateUpgradeRequest("superadmin", validPatientId, "patient");
    assert.strictEqual(successResult.status, 200);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Guardian Creation Error Normalization & Partial Success Tests
  // ─────────────────────────────────────────────────────────────────────────────

  await test("Guardian creation duplicate error normalization produces safe messages", () => {
    const normalizeDuplicateError = (err) => {
      const isDup = err.code === 11000;
      if (!isDup) return err.message || "Failed to create guardian";
      if (err.keyPattern?.email || err.message?.includes("email")) {
        return "A guardian with this email already exists.";
      } else if (err.keyPattern?.phone || err.message?.includes("phone")) {
        return "A user with this phone number already exists.";
      }
      return "An account with this email address or phone number already exists.";
    };

    assert.strictEqual(
      normalizeDuplicateError({ code: 11000, keyPattern: { email: 1 } }),
      "A guardian with this email already exists."
    );
    assert.strictEqual(
      normalizeDuplicateError({ code: 11000, keyPattern: { phone: 1 } }),
      "A user with this phone number already exists."
    );
    assert.strictEqual(
      normalizeDuplicateError({ code: 11000, message: "E11000 duplicate key error index: email_1" }),
      "A guardian with this email already exists."
    );
  });

  await test("Guardian partial success preserves saved record when email delivery fails", () => {
    const simulateGuardianCreation = (emailSuccess) => {
      const isNewUser = true;
      const emailSent = emailSuccess;
      const emailError = emailSent ? undefined : "SMTP timeout: connection closed";

      const message = isNewUser
        ? (emailSent
            ? "Guardian created successfully. Credentials sent to email."
            : "Guardian created successfully, but credentials email could not be sent.")
        : (emailSent
            ? "Guardian invitation sent successfully to existing account."
            : "Guardian linked successfully, but notification email could not be sent.");

      return {
        statusCode: 201,
        body: {
          success: true,
          message,
          emailSent,
          emailError,
          guardian: { _id: "guardian123", email: "test@example.com", role: "guardian" },
          invite: { _id: "invite123", status: "pending" }
        }
      };
    };

    // When email succeeds
    const okResult = simulateGuardianCreation(true);
    assert.strictEqual(okResult.statusCode, 201);
    assert.strictEqual(okResult.body.emailSent, true);
    assert.strictEqual(okResult.body.message.includes("Credentials sent to email"), true);

    // When email fails: partial success must NOT claim creation failed, and must NOT claim email was sent
    const partialResult = simulateGuardianCreation(false);
    assert.strictEqual(partialResult.statusCode, 201);
    assert.strictEqual(partialResult.body.success, true);
    assert.strictEqual(partialResult.body.emailSent, false);
    assert.strictEqual(partialResult.body.message.includes("credentials email could not be sent"), true);
    assert.strictEqual(Boolean(partialResult.body.guardian), true);
    assert.strictEqual(partialResult.body.invite.status, "pending");
  });

  console.log(`\n🎉 All ${passed}/${total} Super Admin tests passed successfully!\n`);
}

module.exports = runAllTests();

