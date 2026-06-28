import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/onboarding/views/onboarding_screens.dart';
import 'package:medikto/features/onboarding/views/welcome_screen.dart';

class OverrallFeaturesScreen extends StatefulWidget {
  const OverrallFeaturesScreen({super.key});

  @override
  State<OverrallFeaturesScreen> createState() => _OverrallFeaturesScreenState();
}

class _OverrallFeaturesScreenState extends State<OverrallFeaturesScreen> {
  // Theme Colors
  static const Color darkBg = Color(0xFF121212);
  static const Color accentCyan = Color(0xFF81DEEA);

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
        backgroundColor: darkBg, // Updated for Dark Mode
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                /// 🔹 SCROLLABLE CONTENT
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      children: [
                        SizedBox(height: size.height * 0.04),

                        Align(
                          alignment: Alignment.centerLeft,
                          child: GestureDetector(
                            onTap: () => Navigator.pushAndRemoveUntil(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const OnboardingScreens(),
                              ),
                              (route) => false,
                            ),
                            child: const Icon(
                              Icons.arrow_back_ios_new, // Modern variant
                              size: 22,
                              color: Colors.white, // Visible on dark background
                            ),
                          ),
                        ),

                        SizedBox(height: size.height * 0.03),

                        // Illustration
                        Image.asset(
                          'assets/images/health-guard.png',
                          width: 280,
                          height: 280,
                          fit: BoxFit.contain,
                        ),

                        SizedBox(height: size.height * 0.04),

                        const Text(
                          "Secure · Store · Share",
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white, // High contrast
                          ),
                        ),

                        SizedBox(height: size.height * 0.03),

                        Center(
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              maxWidth: size.width * 0.65,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _featureItem("Secure Storage"),
                                _featureItem("Medicine Reminders"),
                                _featureItem("Organized Records"),
                                _featureItem("Trusted Privacy"),
                                _featureItem("Doctor Sharing"),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),

                /// 🔥 FIXED BUTTON (STICKY)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20, top: 10),
                  child: CustomButton(
                    height: 54,
                    buttonText: "Get Started",
                    buttonColor: accentCyan, // Brand primary for Dark Mode
                    textStyle: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black, // High contrast on Cyan
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const WelcomeScreen(),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _featureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 8,
            width: 8,
            decoration: const BoxDecoration(
              color: accentCyan, // Changed bullet color to Cyan
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.cyanAccent,
                  blurRadius: 4,
                  spreadRadius: 0,
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Text(
            text,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.white70, // Softer white for list items
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
