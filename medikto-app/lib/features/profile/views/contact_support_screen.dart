import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/constants/legal_content.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:url_launcher/url_launcher.dart';

class ContactSupportScreen extends StatelessWidget {
  const ContactSupportScreen({super.key});


  Future<void> _launchEmail(BuildContext context) async {
    final Uri emailUri = Uri(
      scheme: 'mailto',
      path: LegalContent.supportEmail,
      queryParameters: {
        'subject': 'Medikto Support Request',
      },
    );

    try {
      if (await canLaunchUrl(emailUri)) {
        await launchUrl(emailUri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(emailUri);
      }
    } catch (e) {
      if (context.mounted) {
        AppToasts.showError(context, "Could not open email app. Please write to ${LegalContent.supportEmail}");
      }
    }
  }

  Future<void> _launchPhone(BuildContext context) async {
    final Uri phoneUri = Uri(
      scheme: 'tel',
      path: LegalContent.supportPhone.replaceAll(' ', ''),
    );

    try {
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(phoneUri);
      }
    } catch (e) {
      if (context.mounted) {
        AppToasts.showError(context, "Could not open dialer. Please call ${LegalContent.supportPhone}");
      }
    }
  }

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
          "Contact Support",
          style: TextStyle(
            color: themeColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "How can we help you?",
              style: TextStyle(
                color: themeColors.textPrimary,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Our dedicated support team is available to assist you with any questions or technical assistance.",
              style: TextStyle(
                color: themeColors.textSecondary,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 28),

            // Email Support Card
            _buildContactCard(
              context: context,
              icon: Icons.email_outlined,
              badgeText: "EMAIL US",
              title: "Email Support",
              subtitle: LegalContent.supportEmail,
              description: "Tap to compose an email directly in your preferred email client.",
              actionLabel: "Send Email",
              onTap: () => _launchEmail(context),
            ),

            const SizedBox(height: 18),

            // Phone Support Card
            _buildContactCard(
              context: context,
              icon: Icons.phone_outlined,
              badgeText: "CALL US",
              title: "Phone Support",
              subtitle: LegalContent.supportPhone,
              description: "Tap to call our customer support helpline.",
              actionLabel: "Call Now",
              onTap: () => _launchPhone(context),
            ),

            const Spacer(),

            // Help note
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: themeColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: themeColors.border),
              ),
              child: Row(
                children: [
                  Icon(Icons.access_time_rounded, color: themeColors.accentMedium, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      "Operating Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST",
                      style: TextStyle(color: themeColors.textSecondary, fontSize: 12, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard({
    required BuildContext context,
    required IconData icon,
    required String badgeText,
    required String title,
    required String subtitle,
    required String description,
    required String actionLabel,
    required VoidCallback onTap,
  }) {
    final themeColors = context.themeColors;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: themeColors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: themeColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: themeColors.accentSubtle,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: themeColors.accentMedium, size: 22),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        color: themeColors.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: themeColors.accentMedium,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Icon(Icons.arrow_forward_ios, color: themeColors.textMuted, size: 16),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              description,
              style: TextStyle(
                color: themeColors.textSecondary,
                fontSize: 12,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
