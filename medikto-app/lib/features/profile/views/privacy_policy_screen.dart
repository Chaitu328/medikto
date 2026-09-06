import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/constants/legal_content.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;
    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: AppBar(
        backgroundColor: themeColors.bg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: themeColors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Privacy Policy",
          style: TextStyle(
            color: themeColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: themeColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: themeColors.border),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.privacy_tip_outlined, color: themeColors.accentMedium, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    "Version ${LegalContent.privacyPolicyVersion} • Updated ${LegalContent.privacyPolicyLastUpdated}",
                    style: TextStyle(
                      color: themeColors.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              LegalContent.privacyPolicy,
              style: TextStyle(
                color: themeColors.textSecondary,
                fontSize: 14,
                height: 1.6,
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
