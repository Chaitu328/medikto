import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';

class HealthDataCard extends StatefulWidget {
  final String? title;
  final String? image;
  final GestureTapCallback? onTap;
  final String? value;

  const HealthDataCard({
    super.key,
    this.image,
    this.onTap,
    this.title,
    this.value,
  });

  @override
  State<HealthDataCard> createState() => _HealthDataCardState();
}

class _HealthDataCardState extends State<HealthDataCard> {
  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return GestureDetector(
      onTap: () => widget.onTap?.call(),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: colors.borderSubtle),
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
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    widget.title ?? "",
                    overflow: TextOverflow.clip,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: colors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Responsive Add or Value Row
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: widget.value != null && widget.value!.isNotEmpty
                        ? Text(
                            widget.value!,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: colors.accent,
                            ),
                          )
                        : Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.add_circle_outline,
                                color: colors.accent,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                "Add",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: colors.accent,
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
