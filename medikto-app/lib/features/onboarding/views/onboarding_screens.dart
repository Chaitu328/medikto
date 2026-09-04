import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/utils/storage_keys.dart';
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

  // Theme Colors consistent with your design
  static const Color darkBg = Color(0xFF121212);
  static const Color accentCyan = Color(0xFF81DEEA);

  final List<Map<String, String>> data = const [
    {
      "image": "assets/images/onboarding1.png",
      "title": "Welcome to Medikto",
      "desc":
          "Your all-in-one health companion for timely medication reminders and secure health records.",
    },
    {
      "image": "assets/images/onboarding2.png",
      "title": "Never Miss a Dose",
      "desc":
          "Set smart reminders, organise your medications, and track daily doses with ease.",
    },
    {
      "image": "assets/images/onboarding3.png",
      "title": "Your Data, Your Privacy",
      "desc":
          "All your health records are encrypted and stored securely. You control who sees them.",
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

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(StorageKeys.onboardingDone, true);

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const WelcomeScreen()),
    );
  }

  Future<void> _next() async {
    if (currentIndex.value < data.length - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      await _completeOnboarding();
    }
  }

  Future<void> _skip() async {
    await _completeOnboarding();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: darkBg,
      ),
      child: Scaffold(
        backgroundColor: darkBg,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              children: [
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

                // Animated Page Indicators
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
                          height: 8,
                          width: current == i ? 26 : 8,
                          decoration: BoxDecoration(
                            color: current == i ? accentCyan : Colors.white38,
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    );
                  },
                ),

                SizedBox(height: size.height * 0.04),

                _buildBottomControls(size),

                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomControls(Size size) {
    return ValueListenableBuilder<int>(
      valueListenable: currentIndex,
      builder: (_, current, __) {
        final bool isLastPage = current == data.length - 1;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Skip button on first 2 slides, hidden on last slide
              if (!isLastPage)
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: _skip,
                  child: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                    child: Text(
                      "Skip",
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white38,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                )
              else
                const SizedBox(width: 48),

              // Next / Get Started button
              GestureDetector(
                onTap: _next,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  alignment: Alignment.center,
                  height: 48,
                  padding: EdgeInsets.symmetric(
                    horizontal: isLastPage ? 28 : 24,
                  ),
                  decoration: BoxDecoration(
                    color: accentCyan,
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: accentCyan.withOpacity(0.25),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    isLastPage ? "Get Started" : "Next",
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

