import 'package:flutter/material.dart';

class HealthDataCard extends StatefulWidget {
  final String? title;
  final String? image;
  final GestureTapCallback? onTap;
  const HealthDataCard({super.key, this.image, this.onTap, this.title});

  @override
  State<HealthDataCard> createState() => _HealthDataCardState();
}

class _HealthDataCardState extends State<HealthDataCard> {
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => widget.onTap?.call(),
      child: Container(
        padding: const EdgeInsets.all(12),
        // ✅ No fixed height/width: allows parent Grid to control sizing
        decoration: BoxDecoration(
          color: surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center, 
          children: [
            // Icon
            Image.asset(widget.image ?? "", height: 24, width: 24),
            const SizedBox(width: 10),

            // Text Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min, // ✅ Prevents vertical expansion
                children: [
                  // ✅ Title: No Maxlines, just Clip
                  Text(
                    widget.title ?? "",
                    // softWrap:
                    //     false, // 🔥 Prevents text from wrapping to next line
                    overflow:
                        TextOverflow.clip, // 🔥 Clips the text as requested
                    style: const TextStyle(
                      fontSize: 13, 
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(
                    height: 4,
                  ), // Reduced spacing to prevent vertical overflow
                  // ✅ Responsive Add Row
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(
                          Icons.add_circle_outline,
                          color: accentCyan,
                          size: 18,
                        ),
                        SizedBox(width: 6),
                        Text(
                          "Add",
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: accentCyan,
                          ),
                        ),
                      ],
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
}
