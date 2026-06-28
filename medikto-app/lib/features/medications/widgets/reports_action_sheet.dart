import 'package:flutter/material.dart';

class ReportActionsSheet extends StatelessWidget {
  final List<Map<String, dynamic>> actions;

  const ReportActionsSheet({super.key, required this.actions});

  // Dark Mode Palette constants
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  Widget build(BuildContext context) {
    return Container(
      // Ensure the container itself matches the dark theme
      decoration: const BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),

            // 🔹 Top Handle (Updated for visibility in dark mode)
            Container(
              height: 5,
              width: 50,
              decoration: BoxDecoration(
                color: Colors.white24, // Subtle contrast
                borderRadius: BorderRadius.circular(100),
              ),
            ),

            const SizedBox(height: 25),

            /// 🔥 Dynamic List (Dark Mode Optimized)
            ...List.generate(actions.length, (index) {
              final item = actions[index];

              return ListTile(
                dense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 6),
                visualDensity: VisualDensity.compact,
                minLeadingWidth: 0,
                horizontalTitleGap: 16,
                
                // 🔹 Leading Icon in Cyan
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: accentCyan.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(item["icon"], color: accentCyan, size: 22),
                ),

                // 🔹 Title in White
                title: Text(
                  item["title"],
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white, // Legible white text
                  ),
                ),
                
                // 🔹 Trailing Arrow (Standard UX pattern)
                trailing: const Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.white10,
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
