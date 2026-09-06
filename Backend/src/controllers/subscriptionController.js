const User = require("../models/userModel");
const { PLAN_LIMITS, PLAN_PRICING } = require("../utils/planLimits");

/**
 * Resolves the effective subscription status for a user, handling automatic expiry.
 * @param {Object} user - Mongoose User document or user object
 * @returns {Object} Effective subscription data
 */
const getEffectiveSubscription = (user) => {
  if (!user) {
    return {
      plan: "basic",
      status: "active",
      isPremium: false,
      trialUsed: false,
      canClaimTrial: true,
      limits: PLAN_LIMITS.basic,
      pricing: PLAN_PRICING
    };
  }

  const details = user.subscriptionDetails || {};
  const rawPlan = (details.plan || user.subscription || "basic").toLowerCase();
  const rawStatus = (details.status || "active").toLowerCase();
  const trialUsed = details.trialUsed === true;
  const now = new Date();

  let effectivePlan = rawPlan === "free" ? "basic" : rawPlan;
  let effectiveStatus = rawStatus;
  let isPremium = false;

  // Auto-expiry check for Free Trial
  if (effectiveStatus === "trial") {
    if (details.trialEnd && new Date(details.trialEnd) < now) {
      effectivePlan = "basic";
      effectiveStatus = "expired";
      isPremium = false;
    } else {
      effectivePlan = "premium";
      isPremium = true;
    }
  } else if (effectivePlan === "premium") {
    // Check if paid premium has expired
    if (details.subscriptionEnd && new Date(details.subscriptionEnd) < now) {
      effectivePlan = "basic";
      effectiveStatus = "expired";
      isPremium = false;
    } else {
      isPremium = true;
      if (effectiveStatus !== "active") {
        effectiveStatus = "active";
      }
    }
  } else {
    effectivePlan = "basic";
    isPremium = false;
  }

  const canClaimTrial = !trialUsed;

  return {
    plan: effectivePlan,
    status: effectiveStatus,
    isPremium,
    trialUsed,
    canClaimTrial,
    trialStart: details.trialStart || null,
    trialEnd: details.trialEnd || null,
    subscriptionStart: details.subscriptionStart || null,
    subscriptionEnd: details.subscriptionEnd || null,
    limits: PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.basic,
    pricing: PLAN_PRICING
  };
};

// ================= GET SUBSCRIPTION STATUS =================
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("subscription subscriptionDetails");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const effective = getEffectiveSubscription(user);

    // If status auto-expired, persist update quietly in background
    if (
      user.subscriptionDetails?.status === "trial" &&
      effective.status === "expired"
    ) {
      user.subscription = "basic";
      user.subscriptionDetails.plan = "basic";
      user.subscriptionDetails.status = "expired";
      await user.save();
    }

    return res.status(200).json({
      success: true,
      subscription: effective
    });
  } catch (err) {
    console.error("GET SUBSCRIPTION STATUS ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= GET PLANS CONFIGURATION =================
exports.getPlans = async (req, res) => {
  try {
    let canClaimTrial = true;
    let currentPlan = "basic";
    let isPremium = false;

    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("subscription subscriptionDetails");
      if (user) {
        const effective = getEffectiveSubscription(user);
        canClaimTrial = effective.canClaimTrial;
        currentPlan = effective.plan;
        isPremium = effective.isPremium;
      }
    }

    return res.status(200).json({
      success: true,
      plans: [PLAN_PRICING.basic, PLAN_PRICING.premium],
      limits: PLAN_LIMITS,
      userState: {
        currentPlan,
        isPremium,
        canClaimTrial
      }
    });
  } catch (err) {
    console.error("GET PLANS ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= START 1-MONTH FREE TRIAL =================
exports.startTrial = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Backend rule: One free trial per user
    if (user.subscriptionDetails?.trialUsed === true) {
      return res.status(400).json({
        success: false,
        message: "You have already used your 1-month free trial."
      });
    }

    const trialStart = new Date();
    const trialEnd = new Date(trialStart.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial

    user.subscription = "premium";
    user.subscriptionDetails = {
      plan: "premium",
      status: "trial",
      trialStart,
      trialEnd,
      trialUsed: true,
      subscriptionStart: trialStart,
      subscriptionEnd: trialEnd
    };

    await user.save();

    const effective = getEffectiveSubscription(user);

    return res.status(200).json({
      success: true,
      message: "1-Month Free Trial activated successfully!",
      subscription: effective,
      user: {
        _id: user._id,
        subscription: user.subscription,
        subscriptionDetails: user.subscriptionDetails
      }
    });
  } catch (err) {
    console.error("START TRIAL ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= UPDATE SUBSCRIPTION (UPGRADE/SWITCH) =================
exports.updateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const normalizedPlan = (plan || "").toLowerCase();
    if (!["free", "basic", "premium"].includes(normalizedPlan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan. Valid plans: basic, premium"
      });
    }

    const targetPlan = normalizedPlan === "free" ? "basic" : normalizedPlan;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const now = new Date();
    const currentDetails = user.subscriptionDetails || {};

    if (targetPlan === "premium") {
      // 1-month subscription period for paid/upgraded premium
      const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      user.subscription = "premium";
      user.subscriptionDetails = {
        ...currentDetails,
        plan: "premium",
        status: "active",
        subscriptionStart: now,
        subscriptionEnd: subscriptionEnd
      };
    } else {
      user.subscription = "basic";
      user.subscriptionDetails = {
        ...currentDetails,
        plan: "basic",
        status: "active"
      };
    }

    await user.save();

    const effective = getEffectiveSubscription(user);

    return res.status(200).json({
      success: true,
      message: `Subscription updated to ${targetPlan.toUpperCase()} successfully`,
      subscription: effective,
      data: user
    });
  } catch (err) {
    console.error("UPDATE SUBSCRIPTION ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.getEffectiveSubscription = getEffectiveSubscription;
