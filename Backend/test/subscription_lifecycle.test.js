const assert = require("assert");
const { PLAN_LIMITS, PLAN_PRICING } = require("../src/utils/planLimits");
const { getEffectiveSubscription } = require("../src/controllers/subscriptionController");

console.log("Starting Subscription Lifecycle & Entitlements Tests...\n");

// Test 1: Canonical Pricing Configuration
{
  console.log("Test 1: Canonical Pricing and Plan Structure");
  assert.strictEqual(PLAN_PRICING.basic.payableAmount, 0);
  assert.strictEqual(PLAN_PRICING.basic.priceText, "FREE");
  assert.strictEqual(PLAN_PRICING.basic.isFree, true);

  assert.strictEqual(PLAN_PRICING.premium.regularPrice, 2000, "Regular price must be 2000");
  assert.strictEqual(PLAN_PRICING.premium.discountPercent, 50, "Discount must be 50%");
  assert.strictEqual(PLAN_PRICING.premium.discountedPrice, 1000, "Discounted price must be 1000");
  assert.strictEqual(PLAN_PRICING.premium.payableAmount, 1000, "Payable amount must be 1000");
  assert.strictEqual(PLAN_PRICING.premium.hasTrial, true);
  assert.strictEqual(PLAN_PRICING.premium.trialDurationDays, 30);
  console.log("  ✓ Pricing correctly configured: ₹2,000 struck through, 50% OFF, ₹1,000/mo, 1 Month Free Trial");
}

// Test 2: New / Default User Subscription Resolution
{
  console.log("Test 2: New user defaults to Basic and eligible for 1-month trial");
  const newUser = {
    subscription: "free",
    subscriptionDetails: {
      plan: "basic",
      status: "active",
      trialUsed: false
    }
  };

  const effective = getEffectiveSubscription(newUser);
  assert.strictEqual(effective.plan, "basic");
  assert.strictEqual(effective.isPremium, false);
  assert.strictEqual(effective.canClaimTrial, true, "New user must be able to claim free trial");
  assert.strictEqual(effective.limits.medications, 5, "Basic plan has max 5 medications");
  assert.strictEqual(effective.limits.reports, 50, "Basic plan has max 50 reports");
  console.log("  ✓ New user defaults to Basic, can claim trial, has 5 meds / 50 reports limit");
}

// Test 3: Active Premium Trial User
{
  console.log("Test 3: User during active 1-Month Free Trial");
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000); // 25 days remaining

  const trialUser = {
    subscription: "premium",
    subscriptionDetails: {
      plan: "premium",
      status: "trial",
      trialStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      trialEnd: trialEnd,
      trialUsed: true
    }
  };

  const effective = getEffectiveSubscription(trialUser);
  assert.strictEqual(effective.plan, "premium");
  assert.strictEqual(effective.status, "trial");
  assert.strictEqual(effective.isPremium, true);
  assert.strictEqual(effective.canClaimTrial, false, "Cannot re-claim trial");
  assert.strictEqual(effective.limits.medications, Infinity, "Premium has unlimited medications");
  assert.strictEqual(effective.limits.reports, 250, "Premium has 250 reports");
  console.log("  ✓ Trial user gets full Premium access with trialUsed = true");
}

// Test 4: Trial Expired Auto-Reversion to Basic
{
  console.log("Test 4: Auto-reversion when Free Trial expires");
  const now = new Date();
  const expiredTrialEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // Expired yesterday

  const expiredUser = {
    subscription: "premium",
    subscriptionDetails: {
      plan: "premium",
      status: "trial",
      trialStart: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
      trialEnd: expiredTrialEnd,
      trialUsed: true
    }
  };

  const effective = getEffectiveSubscription(expiredUser);
  assert.strictEqual(effective.plan, "basic", "Expired trial must revert effective plan to basic");
  assert.strictEqual(effective.status, "expired");
  assert.strictEqual(effective.isPremium, false);
  assert.strictEqual(effective.canClaimTrial, false, "Consumed trial cannot be re-claimed");
  assert.strictEqual(effective.limits.medications, 5, "Limits revert to Basic 5 meds");
  assert.strictEqual(effective.limits.reports, 50, "Limits revert to Basic 50 reports");
  console.log("  ✓ Expired trial automatically reverts to Basic with limits restored");
}

// Test 5: Paid Premium Active Subscription
{
  console.log("Test 5: Paid Premium Active Subscription");
  const now = new Date();
  const subEnd = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

  const paidUser = {
    subscription: "premium",
    subscriptionDetails: {
      plan: "premium",
      status: "active",
      subscriptionStart: now,
      subscriptionEnd: subEnd,
      trialUsed: true
    }
  };

  const effective = getEffectiveSubscription(paidUser);
  assert.strictEqual(effective.plan, "premium");
  assert.strictEqual(effective.status, "active");
  assert.strictEqual(effective.isPremium, true);
  assert.strictEqual(effective.canClaimTrial, false);
  console.log("  ✓ Paid Premium user has active status and full entitlements");
}

// Test 6: Legacy User Compatibility (subscription = 'free' or 'basic' without subscriptionDetails)
{
  console.log("Test 6: Backward Compatibility for Legacy Users");
  const legacyUser = {
    subscription: "free"
  };

  const effective = getEffectiveSubscription(legacyUser);
  assert.strictEqual(effective.plan, "basic");
  assert.strictEqual(effective.isPremium, false);
  assert.strictEqual(effective.canClaimTrial, true);
  console.log("  ✓ Legacy users with 'free' string seamlessly resolve to Basic with trial eligibility");
}

console.log("\nAll 6 Subscription Lifecycle & Entitlement tests passed successfully!");
