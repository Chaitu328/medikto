import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/medications/widgets/reports_action_sheet.dart';

class ReportCard extends StatelessWidget {
  const ReportCard({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = context.themeColors;
    return Container(
      padding: const EdgeInsets.only(top: 16, left: 10, right: 10),
      decoration: BoxDecoration(
        color: theme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.borderSubtle),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            height: 80,
            width: 80,
            decoration: BoxDecoration(
              color: theme.cardSecondary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Image.asset(
              "assets/images/item2.png",
              color: theme.accent,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  "Prescription",
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: theme.textPrimary,
                  ),
                ),
              ),
              InkWell(
                onTap: () => _showBottomSheet(context),
                child: Icon(Icons.more_horiz, size: 18, color: theme.iconColor),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showBottomSheet(BuildContext context) {
    final theme = context.themeColors;
    showModalBottomSheet(
      backgroundColor: theme.surface,
      constraints: const BoxConstraints(maxWidth: double.infinity),
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => ReportActionsSheet(
        actions: [
          {"icon": Icons.download, "title": "Download"},
          {"icon": Icons.link, "title": "Copy Link"},
          {"icon": Icons.share, "title": "Share"},
          {"icon": Icons.delete, "title": "Delete"},
        ],
      ),
    );
  }
}
