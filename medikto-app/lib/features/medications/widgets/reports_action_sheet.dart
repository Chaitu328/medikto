import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';

class ReportActionsSheet extends StatelessWidget {
  final List<Map<String, dynamic>> actions;

  const ReportActionsSheet({super.key, required this.actions});

  @override
  Widget build(BuildContext context) {
    final theme = context.themeColors;
    return Container(
      decoration: BoxDecoration(
        color: theme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),

            // 🔹 Top Handle
            Container(
              height: 5,
              width: 50,
              decoration: BoxDecoration(
                color: theme.textMuted.withOpacity(0.3),
                borderRadius: BorderRadius.circular(100),
              ),
            ),

            const SizedBox(height: 25),

            /// 🔥 Dynamic List
            ...List.generate(actions.length, (index) {
              final item = actions[index];

              return ListTile(
                dense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 6),
                visualDensity: VisualDensity.compact,
                minLeadingWidth: 0,
                horizontalTitleGap: 16,
                
                // 🔹 Leading Icon in Brand Accent
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: theme.accentSubtle,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(item["icon"], color: theme.accent, size: 22),
                ),

                // 🔹 Title
                title: Text(
                  item["title"],
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: theme.textPrimary,
                  ),
                ),
                
                // 🔹 Trailing Arrow
                trailing: Icon(
                  Icons.arrow_forward_ios,
                  color: theme.textMuted,
                  size: 14,
                ),

                onTap: item["onTap"],
              );
            }),
            
            SizedBox(height: MediaQuery.sizeOf(context).height * 0.02),
          ],
        ),
      ),
    );
  }
}
