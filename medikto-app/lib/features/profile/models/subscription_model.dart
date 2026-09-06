class SubscriptionStatusModel {
  final String plan;
  final String status;
  final bool isPremium;
  final bool trialUsed;
  final bool canClaimTrial;
  final DateTime? trialStart;
  final DateTime? trialEnd;
  final DateTime? subscriptionStart;
  final DateTime? subscriptionEnd;

  SubscriptionStatusModel({
    required this.plan,
    required this.status,
    required this.isPremium,
    required this.trialUsed,
    required this.canClaimTrial,
    this.trialStart,
    this.trialEnd,
    this.subscriptionStart,
    this.subscriptionEnd,
  });

  factory SubscriptionStatusModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic value) {
      if (value == null) return null;
      try {
        return DateTime.parse(value.toString());
      } catch (_) {
        return null;
      }
    }

    final rawPlan = (json['plan'] ?? 'basic').toString().toLowerCase();
    final normalizedPlan = rawPlan == 'free' ? 'basic' : rawPlan;

    return SubscriptionStatusModel(
      plan: normalizedPlan,
      status: (json['status'] ?? 'active').toString().toLowerCase(),
      isPremium: json['isPremium'] == true,
      trialUsed: json['trialUsed'] == true,
      canClaimTrial: json['canClaimTrial'] ?? (json['trialUsed'] != true),
      trialStart: parseDate(json['trialStart']),
      trialEnd: parseDate(json['trialEnd']),
      subscriptionStart: parseDate(json['subscriptionStart']),
      subscriptionEnd: parseDate(json['subscriptionEnd']),
    );
  }

  factory SubscriptionStatusModel.defaultBasic() {
    return SubscriptionStatusModel(
      plan: 'basic',
      status: 'active',
      isPremium: false,
      trialUsed: false,
      canClaimTrial: true,
    );
  }

  int get remainingTrialDays {
    if (trialEnd == null) return 0;
    final now = DateTime.now();
    final difference = trialEnd!.difference(now).inDays;
    return difference >= 0 ? difference + 1 : 0;
  }
}

class PlanOfferingModel {
  final String id;
  final String title;
  final String priceText;
  final int payableAmount;
  final int regularPrice;
  final int discountedPrice;
  final int discountPercent;
  final String currency;
  final String billingCycle;
  final bool isFree;
  final bool hasTrial;
  final int trialDurationDays;
  final String trialDurationText;
  final String trialOfferText;
  final String badge;
  final List<String> features;

  PlanOfferingModel({
    required this.id,
    required this.title,
    required this.priceText,
    required this.payableAmount,
    required this.regularPrice,
    required this.discountedPrice,
    required this.discountPercent,
    required this.currency,
    required this.billingCycle,
    required this.isFree,
    required this.hasTrial,
    required this.trialDurationDays,
    required this.trialDurationText,
    required this.trialOfferText,
    required this.badge,
    required this.features,
  });

  factory PlanOfferingModel.fromJson(Map<String, dynamic> json) {
    return PlanOfferingModel(
      id: json['id'] ?? (json['title']?.toString().toLowerCase().contains('premium') == true ? 'premium' : 'basic'),
      title: json['title'] ?? 'Plan',
      priceText: json['priceText'] ?? 'FREE',
      payableAmount: json['payableAmount'] != null ? (json['payableAmount'] as num).toInt() : 0,
      regularPrice: json['regularPrice'] != null ? (json['regularPrice'] as num).toInt() : 0,
      discountedPrice: json['discountedPrice'] != null ? (json['discountedPrice'] as num).toInt() : 0,
      discountPercent: json['discountPercent'] != null ? (json['discountPercent'] as num).toInt() : 0,
      currency: json['currency'] ?? 'INR',
      billingCycle: json['billingCycle'] ?? 'month',
      isFree: json['isFree'] == true,
      hasTrial: json['hasTrial'] == true,
      trialDurationDays: json['trialDurationDays'] != null ? (json['trialDurationDays'] as num).toInt() : 0,
      trialDurationText: json['trialDurationText'] ?? '',
      trialOfferText: json['trialOfferText'] ?? '',
      badge: json['badge'] ?? '',
      features: (json['features'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}
