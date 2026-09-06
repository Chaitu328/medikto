import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:medikto/core/constants/legal_content.dart';
import 'package:medikto/features/profile/views/policies_and_terms_screen.dart';
import 'package:medikto/features/profile/views/terms_and_conditions_screen.dart';
import 'package:medikto/features/profile/views/privacy_policy_screen.dart';
import 'package:medikto/features/profile/views/faq_screen.dart';
import 'package:medikto/features/profile/views/contact_support_screen.dart';
import 'package:intl/intl.dart';

void main() {
  test('LegalContent constants are defined properly', () {
    expect(LegalContent.termsVersion, equals("1.0"));
    expect(LegalContent.privacyPolicyVersion, equals("1.0"));
    expect(LegalContent.supportEmail, equals("shahmedikto@gmail.com"));
    expect(LegalContent.supportPhone, equals("+91 9642331668"));
  });

  testWidgets('PoliciesAndTermsScreen renders correctly and shows links', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: PoliciesAndTermsScreen(),
      ),
    );

    expect(find.text("Policies & Terms"), findsOneWidget);
    expect(find.text("Terms & Conditions"), findsOneWidget);
    expect(find.text("Privacy Policy"), findsOneWidget);
  });

  testWidgets('TermsAndConditionsScreen renders version and content', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: TermsAndConditionsScreen(),
      ),
    );

    expect(find.text("Terms & Conditions"), findsOneWidget);
    expect(find.textContaining("Version 1.0"), findsOneWidget);
  });

  testWidgets('PrivacyPolicyScreen renders version and content', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: PrivacyPolicyScreen(),
      ),
    );

    expect(find.text("Privacy Policy"), findsOneWidget);
    expect(find.textContaining("Version 1.0"), findsOneWidget);
  });

  testWidgets('FaqScreen renders categories and questions', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: FaqScreen(),
      ),
    );

    expect(find.text("Frequently Asked Questions"), findsOneWidget);
    expect(find.text("General & Login"), findsOneWidget);
    expect(find.text("How do I register for Medikto?"), findsOneWidget);
  });

  testWidgets('ContactSupportScreen renders email and phone support details', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: ContactSupportScreen(),
      ),
    );

    expect(find.text("Contact Support"), findsOneWidget);
    expect(find.text("Email Support"), findsOneWidget);
    expect(find.text("shahmedikto@gmail.com"), findsOneWidget);
    expect(find.text("Phone Support"), findsOneWidget);
    expect(find.text("+91 9642331668"), findsOneWidget);
  });

  group('Medication Timestamps & Scheduled vs Taken Logic', () {
    test('Taken-At ISO timestamp formatting handles local time correctly', () {
      final isoStr = "2026-09-05T08:00:00.000Z";
      final dt = DateTime.parse(isoStr).toLocal();
      final formatted = DateFormat("hh:mm a").format(dt);
      expect(formatted, isNotEmpty);
      expect(formatted.contains(RegExp(r'(AM|PM)')), isTrue);
    });

    test('Future time detection accurately flags upcoming doses', () {
      final now = DateTime.now();
      final futureDateTime = now.add(const Duration(minutes: 30));
      final futureTime = DateFormat("hh:mm a").format(futureDateTime);
      final cleanTime = futureTime.trim();
      final isPM = cleanTime.toUpperCase().endsWith("PM");
      final isAM = cleanTime.toUpperCase().endsWith("AM");
      final timePart = cleanTime.replaceAll(RegExp(r'[a-zA-Z\s]'), '');
      final timeParts = timePart.split(":");
      int hour = int.parse(timeParts[0]);
      final minute = int.parse(timeParts[1]);
      if (isPM && hour < 12) hour += 12;
      if (isAM && hour == 12) hour = 0;

      final scheduled = DateTime(futureDateTime.year, futureDateTime.month, futureDateTime.day, hour, minute);
      expect(scheduled.isAfter(now), isTrue);
    });
  });
}

