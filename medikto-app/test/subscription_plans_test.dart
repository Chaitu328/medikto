import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/home/premium_plans_views/premium_plans.dart';
import 'package:medikto/features/profile/data/subscription_provider.dart';
import 'package:medikto/features/profile/models/subscription_model.dart';

void main() {
  group('Subscription Models & Logic Tests', () {
    test('SubscriptionStatusModel correctly parses Basic plan', () {
      final json = {
        'plan': 'basic',
        'status': 'active',
        'isPremium': false,
        'trialUsed': false,
        'canClaimTrial': true,
      };

      final model = SubscriptionStatusModel.fromJson(json);
      expect(model.plan, 'basic');
      expect(model.status, 'active');
      expect(model.isPremium, false);
      expect(model.trialUsed, false);
      expect(model.canClaimTrial, true);
    });

    test('SubscriptionStatusModel correctly parses Premium Trial and remaining days', () {
      final now = DateTime.now();
      final trialEnd = now.add(const Duration(days: 20));

      final json = {
        'plan': 'premium',
        'status': 'trial',
        'isPremium': true,
        'trialUsed': true,
        'canClaimTrial': false,
        'trialStart': now.toIso8601String(),
        'trialEnd': trialEnd.toIso8601String(),
      };

      final model = SubscriptionStatusModel.fromJson(json);
      expect(model.plan, 'premium');
      expect(model.status, 'trial');
      expect(model.isPremium, true);
      expect(model.trialUsed, true);
      expect(model.canClaimTrial, false);
      expect(model.remainingTrialDays, greaterThanOrEqualTo(20));
    });

    test('PlanOfferingModel parses canonical pricing: ₹2000, 50% OFF, ₹1000, 1 Month Trial', () {
      final json = {
        'id': 'premium',
        'title': 'Premium Plan',
        'priceText': '₹1,000/month',
        'payableAmount': 1000,
        'regularPrice': 2000,
        'discountedPrice': 1000,
        'discountPercent': 50,
        'currency': 'INR',
        'isFree': false,
        'hasTrial': true,
        'trialDurationDays': 30,
        'trialDurationText': '1 MONTH FREE TRIAL',
        'features': [
          'Store up to 250 health reports',
          'Manage unlimited medications',
        ],
      };

      final model = PlanOfferingModel.fromJson(json);
      expect(model.id, 'premium');
      expect(model.regularPrice, 2000);
      expect(model.discountPercent, 50);
      expect(model.discountedPrice, 1000);
      expect(model.hasTrial, true);
      expect(model.trialDurationDays, 30);
      expect(model.trialDurationText, '1 MONTH FREE TRIAL');
    });
  });

  group('PremiumPlansScreen Widget Tests', () {
    testWidgets('Renders Plans Screen with Basic FREE and Premium ₹2,000 struck, 50% OFF, ₹1,000/mo, 1 Month Trial', (tester) async {
      final mockStatus = SubscriptionStatusModel.defaultBasic();
      final mockPlans = [
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
          badge: "",
          features: ["Store up to 50 health reports", "Manage up to 5 active medications"],
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
          trialOfferText: "1 Month FREE Trial, then ₹1,000/month",
          badge: "",
          features: ["Store up to 250 health reports", "Manage unlimited medications"],
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            subscriptionStatusProvider.overrideWith((ref) => Future.value(mockStatus)),
            subscriptionPlansProvider.overrideWith((ref) => Future.value(mockPlans)),
          ],
          child: MaterialApp(
            themeMode: ThemeMode.dark,
            darkTheme: ThemeData.dark(),
            home: const PremiumPlansScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify Screen Title
      expect(find.text("Our Plans"), findsOneWidget);

      // Verify Basic Plan Elements
      expect(find.text("Basic Plan"), findsOneWidget);
      expect(find.text("FREE"), findsOneWidget);
      expect(find.text("Store up to 50 health reports"), findsOneWidget);

      // Verify Premium Plan Commercial Pricing Elements
      expect(find.text("Premium Plan"), findsOneWidget);
      expect(find.text("₹2,000/month"), findsOneWidget);
      expect(find.text("50% OFF"), findsOneWidget);
      expect(find.text("1 MONTH FREE TRIAL"), findsOneWidget);

      // Verify CTA button for trial-eligible Basic user
      expect(find.text("Start 1 Month Free Trial"), findsOneWidget);
    });

    testWidgets('Renders cleanly in Light Theme', (tester) async {
      final mockStatus = SubscriptionStatusModel.defaultBasic();
      final mockPlans = [
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
          badge: "",
          features: ["Store up to 50 health reports"],
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
          trialOfferText: "1 Month FREE Trial, then ₹1,000/month",
          badge: "",
          features: ["Store up to 250 health reports"],
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            subscriptionStatusProvider.overrideWith((ref) => Future.value(mockStatus)),
            subscriptionPlansProvider.overrideWith((ref) => Future.value(mockPlans)),
          ],
          child: MaterialApp(
            themeMode: ThemeMode.light,
            theme: ThemeData.light(),
            home: const PremiumPlansScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text("Our Plans"), findsOneWidget);
      expect(find.text("50% OFF"), findsOneWidget);
      expect(find.text("1 MONTH FREE TRIAL"), findsOneWidget);
    });
  });
}
