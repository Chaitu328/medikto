import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';

class OnboardingPage extends StatelessWidget {
  final int index;
  final Map<String, String> data;
  final Size size;
  final ValueNotifier<int> currentIndex;
  final int total;
  final PageController controller;

  const OnboardingPage({
    super.key,
    required this.index,
    required this.data,
    required this.size,
    required this.currentIndex,
    required this.total,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Column(
      children: [
        // Top navigation bar area (consistent height across all slides)
        SizedBox(
          height: 44,
          child: index > 0
              ? Align(
                  alignment: Alignment.centerLeft,
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () {
                      if (index > 0) {
                        controller.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                      child: Icon(
                        Icons.arrow_back_ios_new,
                        size: 22,
                        color: colors.textPrimary,
                      ),
                    ),
                  ),
                )
              : null,
        ),

        // Illustration Image
        Expanded(
          flex: 6,
          child: Center(
            child: Image.asset(
              data["image"] ?? "",
              fit: BoxFit.contain,
              width: size.width * 0.82,
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Content Area (Title & Description)
        Expanded(
          flex: 3,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                data["title"] ?? "",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: colors.textPrimary,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  data["desc"] ?? "",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: colors.textSecondary,
                    height: 1.45,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

