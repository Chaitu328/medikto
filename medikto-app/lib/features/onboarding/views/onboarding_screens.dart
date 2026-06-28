import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/features/onboarding/views/overall_features_screen.dart';
import 'package:medikto/features/onboarding/views/welcome_screen.dart';
import 'package:medikto/features/onboarding/widgets/onboarding_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OnboardingScreens extends StatefulWidget {
  const OnboardingScreens({super.key});

  @override
  State<OnboardingScreens> createState() => _OnboardingScreensState();
}

class _OnboardingScreensState extends State<OnboardingScreens> {
  final PageController _controller = PageController();
  final ValueNotifier<int> currentIndex = ValueNotifier(0);

  // Theme Colors consistent with your new design
  static const Color darkBg = Color(0xFF121212);
  static const Color accentCyan = Color(0xFF81DEEA);

  final List<Map<String, String>> data = const [
    {
      "image": "assets/images/onboarding1.png",
      "title": "Welcome to Medikto",
      "desc": "Your smart companion for timely medications and secure health records.",
    },
    {
      "image": "assets/images/onboarding2.png",
      "title": "Medikto – Medicine reminder app",
      "desc": "Upload, organize, and access anytime",
    },
    {
      "image": "assets/images/onboarding3.png",
      "title": "Your Data, Protected",
      "desc": "We ensure privacy with encryption",
    },
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      for (var item in data) {
        precacheImage(AssetImage(item["image"]!), context);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    currentIndex.dispose();
    super.dispose();
  }

  Future<void> _next() async {
    if (currentIndex.value < data.length - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {

      /// SAVE ONBOARDING STATUS
      final prefs = await SharedPreferences.getInstance();

      await prefs.setBool(StorageKeys.onboardingDone, true);

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const OverrallFeaturesScreen()),
      );
    }
  }

  // void _next() {
  //   if (currentIndex.value < data.length - 1) {
  //     _controller.nextPage(
  //       duration: const Duration(milliseconds: 300),
  //       curve: Curves.easeInOut,
  //     );
  //   } else {
  //     Navigator.pushReplacement(
  //       context,
  //       MaterialPageRoute(builder: (_) => const OverrallFeaturesScreen()),
  //     );
  //   }
  // }

  // void _skip() {
  //   Navigator.pushReplacement(
  //     context,
  //     MaterialPageRoute(builder: (_) => const WelcomeScreen()),
  //   );
  // }

  Future<void> _skip() async {
    /// SAVE ONBOARDING STATUS
    final prefs = await SharedPreferences.getInstance();

    await prefs.setBool(StorageKeys.onboardingDone, true);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const WelcomeScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent, // Immersive look
        statusBarIconBrightness: Brightness.light, // White icons for Dark Mode
        systemNavigationBarColor: darkBg,
      ),
      child: Scaffold(
        backgroundColor: darkBg, // Deep Charcoal
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ValueListenableBuilder<int>(
                  valueListenable: currentIndex,
                  builder: (_, index, __) {
                    return index == 0
                        ? SizedBox(height: size.height * 0.16)
                        : const SizedBox.shrink();
                  },
                ),

                Expanded(
                  child: PageView.builder(
                    controller: _controller,
                    itemCount: data.length,
                    onPageChanged: (index) => currentIndex.value = index,
                    itemBuilder: (_, index) {
                      return OnboardingPage(
                        index: index,
                        data: data[index],
                        size: size,
                        currentIndex: currentIndex,
                        total: data.length,
                        controller: _controller,
                      );
                    },
                  ),
                ),

// ✅ INDICATORS (FIXED POSITION)
                ValueListenableBuilder<int>(
                  valueListenable: currentIndex,
                  builder: (_, current, __) {
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        data.length,
                        (i) => AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          height: 10,
                          width: current == i ? 26 : 10,
                          decoration: BoxDecoration(
                            color: current == i ? accentCyan : Colors.white24,
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    );
                  },
                ),

                SizedBox(height: size.height * 0.12),

_buildBottomControls(size),
                SizedBox(height: size.height * 0.02),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomControls(Size size) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          GestureDetector(
            onTap: _skip,
            child: const Text(
              "Skip",
              style: TextStyle(
                fontSize: 16,
                color: Colors.white38, // Muted white for skip
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: _next,
            child: Container(
              alignment: Alignment.center,
              height: size.height * 0.05,
              width: size.width * 0.28,
              decoration: BoxDecoration(
                color: accentCyan, // Brand Cyan
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: accentCyan.withOpacity(0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Text(
                "Next",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black, // High contrast black text on Cyan
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
