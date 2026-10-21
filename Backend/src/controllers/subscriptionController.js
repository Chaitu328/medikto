const mongoose = require("mongoose");
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
      plan: "free",
      status: "active",
      isPremium: false,
      trialUsed: false,
      canClaimTrial: false,
      limits: PLAN_LIMITS.free || PLAN_LIMITS.basic,
      pricing: PLAN_PRICING
    };
  }

  const details = user.subscriptionDetails || {};
  const rawPlan = (details.plan || user.subscription || "free").toLowerCase();
  const rawStatus = (details.status || "active").toLowerCase();
  const trialUsed = details.trialUsed === true;
  const now = new Date();

  // Exactly two plans: Free and Premium. Map any legacy/basic/free to "free".
  let effectivePlan = rawPlan === "premium" ? "premium" : "free";
  let effectiveStatus = rawStatus;
  let isPremium = false;

  // Auto-expiry check for Free Trial
  if (effectiveStatus === "trial") {
    if (details.trialEnd && new Date(details.trialEnd) < now) {
      effectivePlan = "free";
      effectiveStatus = "expired";
      isPremium = false;
    } else {
      effectivePlan = "premium";
      isPremium = true;
    }
  } else if (effectivePlan === "premium") {
    // Check if paid premium has expired
    if (details.subscriptionEnd && new Date(details.subscriptionEnd) < now) {
      effectivePlan = "free";
      effectiveStatus = "expired";
      isPremium = false;
    } else {
      isPremium = true;
      if (effectiveStatus !== "active") {
        effectiveStatus = "active";
      }
    }
  } else {
    effectivePlan = "free";
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
    limits: PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free || PLAN_LIMITS.basic,
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
      user.subscription = "free";
      user.subscriptionDetails.plan = "free";
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
        message: "Invalid subscription plan. Valid plans: free, premium"
      });
    }

    const targetPlan = normalizedPlan === "premium" ? "premium" : "free";
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
      user.subscription = "free";
      user.subscriptionDetails = {
        ...currentDetails,
        plan: "free",
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

// ================= SUPER ADMIN: PATIENT-SPECIFIC SUBSCRIPTION GRANT/REVOKE/UPGRADE =================
exports.grantAdminSubscription = async (req, res) => {
  try {
    // 1. Enforce Super Admin authorization strictly on backend
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Super Admin can manage patient subscription grants."
      });
    }

    const targetId = req.body.patientId || req.body.userId;
    const { action = "grant", durationDays = 365 } = req.body;

    // 2. Validate patient ID
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "A valid Patient ID is required"
      });
    }

    // 3. Find target patient user
    const patient = await User.findById(targetId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Ensure target account is a patient
    if (patient.role && patient.role !== "patient" && patient.role !== "user") {
      return res.status(400).json({
        success: false,
        message: `Subscription grants can only be applied to patient accounts (current role: ${patient.role})`
      });
    }

    const now = new Date();
    const currentDetails = patient.subscriptionDetails?.toObject
      ? patient.subscriptionDetails.toObject()
      : (patient.subscriptionDetails || {});

    if (action === "grant") {
      const days = parseInt(durationDays, 10) || 365;
      if (days <= 0 || days > 3650) {
        return res.status(400).json({
          success: false,
          message: "Grant duration must be between 1 and 3650 days"
        });
      }

      const subscriptionEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      patient.subscription = "premium";
      patient.subscriptionDetails = {
        ...currentDetails,
        plan: "premium",
        status: "active",
        subscriptionStart: now,
        subscriptionEnd: subscriptionEnd,
        grantedBy: req.user.id,
        grantedAt: now,
        grantType: "admin_grant",
        durationDays: days
      };

      await patient.save();

      const effective = getEffectiveSubscription(patient);

      return res.status(200).json({
        success: true,
        message: `Upgraded ${patient.firstName || patient.name || "patient"} to Premium successfully.`,
        subscription: effective,
        patient: {
          _id: patient._id,
          id: patient._id,
          name: [patient.firstName, patient.lastName].filter(Boolean).join(" ") || patient.name || "Patient",
          firstName: patient.firstName,
          email: patient.email,
          phone: patient.phone,
          role: patient.role,
          subscription: effective.plan,
          subscriptionDetails: {
            ...(patient.subscriptionDetails?.toObject ? patient.subscriptionDetails.toObject() : patient.subscriptionDetails),
            plan: effective.plan,
            isPremium: effective.isPremium
          }
        }
      });
    } else if (action === "revoke") {
      patient.subscription = "free";
      patient.subscriptionDetails = {
        ...currentDetails,
        plan: "free",
        status: "active",
        subscriptionEnd: now,
        revokedBy: req.user.id,
        revokedAt: now,
        grantType: "admin_revoked"
      };

      await patient.save();

      const effective = getEffectiveSubscription(patient);

      return res.status(200).json({
        success: true,
        message: `Subscription for ${patient.firstName || patient.name || "patient"} set to Free successfully.`,
        subscription: effective,
        patient: {
          _id: patient._id,
          id: patient._id,
          name: [patient.firstName, patient.lastName].filter(Boolean).join(" ") || patient.name || "Patient",
          firstName: patient.firstName,
          email: patient.email,
          phone: patient.phone,
          role: patient.role,
          subscription: effective.plan,
          subscriptionDetails: {
            ...(patient.subscriptionDetails?.toObject ? patient.subscriptionDetails.toObject() : patient.subscriptionDetails),
            plan: effective.plan,
            isPremium: effective.isPremium
          }
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Supported actions: 'grant', 'revoke'"
      });
    }
  } catch (err) {
    console.error("GRANT ADMIN SUBSCRIPTION ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update subscription",
      error: err.message
    });
  }
};

exports.getEffectiveSubscription = getEffectiveSubscription;
