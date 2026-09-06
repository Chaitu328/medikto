import 'dart:io';

import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';

class MedicationLog {
  final String imagePath;
  final String medicineName;
  final DateTime dateTime;

  const MedicationLog({
    required this.imagePath,
    required this.medicineName,
    required this.dateTime,
  });
}

class MedicationLogCard extends StatelessWidget {
  final MedicationLog log;

  const MedicationLogCard({super.key, required this.log});

  @override
  Widget build(BuildContext context) {
    final theme = context.themeColors;
    return RepaintBoundary(
      // 🔥 prevents unnecessary repaint
      child: Container(
        padding: const EdgeInsets.only(left: 12, right: 12, top: 6, bottom: 6),
        decoration: BoxDecoration(
          color: theme.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: theme.borderSubtle),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                /// IMAGE
                _buildImage(),

                const SizedBox(width: 10),

                /// CONTENT (Flexible instead of Expanded)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      /// Medicine Name
                      Text(
                        log.medicineName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: theme.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),

                      const SizedBox(height: 6),

                      /// Date
                      Text(
                        "${log.dateTime.day}/${log.dateTime.month}/${log.dateTime.year}",
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: theme.textSecondary,
                          fontSize: 11,
                        ),
                      ),

                      /// Time
                      Text(
                        "${log.dateTime.hour}:${log.dateTime.minute.toString().padLeft(2, '0')}",
                        style: TextStyle(
                          color: theme.accent,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            /// ICON (fixed size)
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.takenGreen.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.takenGreen.withOpacity(0.4)),
              ),
              child: const Row(
                children: [
                  CircleAvatar(radius: 3, backgroundColor: AppColors.takenGreen),
                  SizedBox(width: 5),
                  Text(
                    "TAKEN",
                    style: TextStyle(
                      color: AppColors.takenGreen,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage() {
    final isAsset = log.imagePath.startsWith("assets/");

    return SizedBox(
      width: 60, // 🔥 reduce width
      height: 60,
      child: ClipRRect(
        borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
        child: isAsset
            ? Image.asset(log.imagePath, fit: BoxFit.cover, cacheWidth: 200)
            : Image.file(
                File(log.imagePath),
                fit: BoxFit.cover,
                cacheWidth: 200,
              ),
      ),
    );
  }
}
