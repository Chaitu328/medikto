const PLAN_LIMITS = {
  free: {
    reports: 50,
    medications: 5,
    selfieRetentionHours: 48,
    cloudSync: "limited",
    aiAnalytics: false,
    exportFormats: ["pdf"]
  },
  basic: {
    reports: 50,
    medications: 5,
    selfieRetentionHours: 48,
    cloudSync: "limited",
    aiAnalytics: false,
    exportFormats: ["pdf"]
  },
  premium: {
    reports: 250,
    medications: Infinity,
    selfieRetentionHours: 2160, // 90 days / 3 months or indefinitely
    cloudSync: "full",
    aiAnalytics: true,
    exportFormats: ["pdf", "jpeg", "bluetooth", "email"]
  }
};

const PLAN_PRICING = {
  basic: {
    id: "basic",
    title: "Basic Plan",
    priceText: "FREE",
    payableAmount: 0,
    regularPrice: 0,
    discountedPrice: 0,
    discountPercent: 0,
    currency: "INR",
    billingCycle: "forever",
    isFree: true,
    badge: "assets/images/basic-plan.png",
    features: [
      "🧾 Store up to 50 health reports",
      "💊 Manage up to 5 active medications",
      "🔔 Daily medication reminders",
      "📸 Take photo & delete in 48 hours",
      "📁 Upload and view prescriptions anytime",
      "☁️ Secure cloud backup (limited space)"
    ]
  },
  premium: {
    id: "premium",
    title: "Premium Plan",
    priceText: "₹1,000/month",
    payableAmount: 1000,
    regularPrice: 2000,
    discountedPrice: 1000,
    discountPercent: 50,
    currency: "INR",
    billingCycle: "month",
    isFree: false,
    hasTrial: true,
    trialDurationDays: 30,
    trialDurationText: "1 MONTH FREE TRIAL",
    trialOfferText: "1 Month FREE Trial, then ₹1,000/month (50% OFF regular ₹2,000/month)",
    badge: "assets/images/premium-plan.png",
    features: [
      "🧾 Store up to 250 health reports",
      "💊 Manage unlimited medications",
      "📸 Take photo & store indefinitely",
      "📈 Detailed AI health analytics",
      "☁️ Full cloud storage & sync across devices",
      "📤 Share as PDF/JPEG via Bluetooth/Email"
    ]
  }
};

module.exports = {
  PLAN_LIMITS,
  PLAN_PRICING
};