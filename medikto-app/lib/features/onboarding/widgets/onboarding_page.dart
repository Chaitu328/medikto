// 🔥 Extracted widget (reduces rebuild cost)
import 'package:flutter/material.dart';

class OnboardingPage extends StatelessWidget {
  final int index;
  final Map<String, String> data;
  final Size size;
  final ValueNotifier<int> currentIndex;
  final int total;
  final PageController controller;

  const OnboardingPage({
    super.key, // Added super.key for best practice
    required this.index,
    required this.data,
    required this.size,
    required this.currentIndex,
    required this.total,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    // Brand colors for consistency
    const Color accentCyan = Color(0xFF81DEEA);

    return Column(
      children: [
        index == 1 || index == 2
            ? SizedBox(height: size.height * 0.02)
            : const SizedBox.shrink(),

        index == 1 || index == 2
            ? Align(
                alignment: Alignment.centerLeft,
                child: InkWell(
                  onTap: () {
                    if (index > 0) {
                      controller.previousPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    }
                  },
                  child: const Icon(
                    Icons.arrow_back_ios,
                    size: 24,
                    color: Colors.white, // Changed for Dark Mode
                  ),
                ),
              )
            : const SizedBox.shrink(),

        index == 1 || index == 2
            ? SizedBox(height: size.height * 0.06)
            : const SizedBox.shrink(),

        Text(
          data["title"]!,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w500,
            color: Colors.white, // Changed for Dark Mode
            letterSpacing: 0.5,
          ),
        ),

        SizedBox(height: size.height * 0.005),

        Text(
          data["desc"]!,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: Colors.white70, // Changed for Dark Mode (softer white)
          ),
        ),

        Expanded(child: Image.asset(data["image"]!)),

        SizedBox(height: size.height * 0.02),

        // ValueListenableBuilder<int>(
        //   valueListenable: currentIndex,
        //   builder: (_, current, __) {
        //     return Row(
        //       mainAxisAlignment: MainAxisAlignment.center,
        //       children: List.generate(
        //         total,
        //         (i) => AnimatedContainer(
        //           duration: const Duration(milliseconds: 300),
        //           margin: const EdgeInsets.symmetric(horizontal: 4),
        //           height: 10,
        //           width: current == i ? 26 : 10,
        //           decoration: BoxDecoration(
        //             color: current == i
        //                 ? accentCyan // Active indicator changed to Cyan
        //                 : Colors
        //                       .white24, // Inactive indicator changed to muted white
        //             borderRadius: BorderRadius.circular(10),
        //           ),
        //         ),
        //       ),
        //     );
        //   },
        // ),
      ],
    );
  }
}
