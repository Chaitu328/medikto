import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/constants/legal_content.dart';

class TermsAndConditionsScreen extends StatelessWidget {
  const TermsAndConditionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;

    final markdownStyle = MarkdownStyleSheet(
      h1: TextStyle(
        color: themeColors.textPrimary,
        fontSize: 20,
        fontWeight: FontWeight.bold,
        height: 1.4,
      ),
      h2: TextStyle(
        color: themeColors.textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.bold,
        height: 1.4,
      ),
      h3: TextStyle(
        color: themeColors.textPrimary,
        fontSize: 16,
        fontWeight: FontWeight.bold,
        height: 1.4,
      ),
      p: TextStyle(
        color: themeColors.textSecondary,
        fontSize: 14,
        height: 1.6,
      ),
      strong: TextStyle(
        color: themeColors.textPrimary,
        fontWeight: FontWeight.bold,
      ),
      em: TextStyle(
        color: themeColors.textMuted,
        fontStyle: FontStyle.italic,
      ),
      listBullet: TextStyle(
        color: themeColors.accentPrimary,
        fontSize: 14,
        fontWeight: FontWeight.bold,
      ),
      horizontalRuleDecoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: themeColors.border,
            width: 1.0,
          ),
        ),
      ),
      blockquoteDecoration: BoxDecoration(
        color: themeColors.surface,
        border: Border(
          left: BorderSide(
            color: themeColors.accentPrimary,
            width: 4,
          ),
        ),
        borderRadius: BorderRadius.circular(4),
      ),
      blockquote: TextStyle(
        color: themeColors.textSecondary,
        fontSize: 14,
        fontStyle: FontStyle.italic,
      ),
      pPadding: const EdgeInsets.only(bottom: 12),
      h1Padding: const EdgeInsets.only(top: 8, bottom: 8),
      h2Padding: const EdgeInsets.only(top: 16, bottom: 8),
      h3Padding: const EdgeInsets.only(top: 16, bottom: 8),
      listIndent: 20,
    );

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
          "Terms & Conditions",
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
                  Icon(Icons.verified_user_outlined, color: themeColors.accentMedium, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    "Version ${LegalContent.termsVersion} • Updated ${LegalContent.termsLastUpdated}",
                    style: TextStyle(
                      color: themeColors.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            MarkdownBody(
              data: LegalContent.termsAndConditions,
              styleSheet: markdownStyle,
              selectable: true,
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
