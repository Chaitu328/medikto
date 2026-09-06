import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/subscription_model.dart';

/// SUBSCRIPTION STATUS PROVIDER
final subscriptionStatusProvider = FutureProvider.autoDispose<SubscriptionStatusModel>((ref) async {
  final profileManager = ref.watch(profileProvider);
  final response = await profileManager.getSubscriptionStatus();

  if (response.status == ResponseStatus.SUCCESS && response.data != null) {
    if (response.data is Map<String, dynamic>) {
      return SubscriptionStatusModel.fromJson(response.data);
    }
  }

  // Fallback to basic if unauthenticated or error
  return SubscriptionStatusModel.defaultBasic();
});

/// SUBSCRIPTION PLANS CONFIGURATION PROVIDER
final subscriptionPlansProvider = FutureProvider.autoDispose<List<PlanOfferingModel>>((ref) async {
  final profileManager = ref.watch(profileProvider);
  final response = await profileManager.getSubscriptionPlans();

  if (response.status == ResponseStatus.SUCCESS && response.data != null) {
    final plansList = response.data['plans'] as List<dynamic>?;
    if (plansList != null) {
      return plansList
          .map((item) => PlanOfferingModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
  }

  // Fallback plans if offline/loading
  return [
    PlanOfferingModel(
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
      hasTrial: false,
      trialDurationDays: 0,
      trialDurationText: "",
      trialOfferText: "",
      badge: "assets/images/basic-plan.png",
      features: [
        "🧾 Store up to 50 health reports",
        "💊 Manage up to 5 active medications",
        "🔔 Daily medication reminders",
        "📸 Take photo & delete in 48 hours",
        "📁 Upload and view prescriptions anytime",
        "☁️ Secure cloud backup (limited space)"
      ],
    ),
    PlanOfferingModel(
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
      ],
    ),
  ];
});
