import 'dart:io';

import 'package:flutter/material.dart';

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
    return RepaintBoundary(
      // 🔥 prevents unnecessary repaint
      child: Container(
        padding: EdgeInsets.only(left: 12, right: 12, top: 6, bottom: 6),
        // margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
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
                        style: const TextStyle(
                          color: Colors.white,
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
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 11,
                        ),
                      ),

                      /// Time
                      Text(
                        "${log.dateTime.hour}:${log.dateTime.minute.toString().padLeft(2, '0')}",
                        style: const TextStyle(
                          color: Color(0xFF81DEEA),
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
                color: Colors.teal.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.teal.withOpacity(0.5)),
              ),
              child: Row(
                children: [
                  CircleAvatar(radius: 3, backgroundColor: Colors.teal),
                  const SizedBox(width: 5),
                  Text(
                    "TAKEN",
                    style: TextStyle(
                      color: Colors.teal,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            // const SizedBox(width: 8),
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
