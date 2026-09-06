import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/onboarding/views/onboarding_screens.dart';
import 'package:medikto/features/onboarding/views/welcome_screen.dart';

class OverrallFeaturesScreen extends StatefulWidget {
  const OverrallFeaturesScreen({super.key});

  @override
  State<OverrallFeaturesScreen> createState() => _OverrallFeaturesScreenState();
}

class _OverrallFeaturesScreenState extends State<OverrallFeaturesScreen> {
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
        systemNavigationBarColor: colors.bg,
      ),
      child: Scaffold(
        backgroundColor: colors.bg,
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
                            child: Icon(
                              Icons.arrow_back_ios_new,
                              size: 22,
                              color: colors.textPrimary,
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

                        Text(
                          "Secure · Store · Share",
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: colors.textPrimary,
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
                                _featureItem("Secure Storage", colors),
                                _featureItem("Medicine Reminders", colors),
                                _featureItem("Organized Records", colors),
                                _featureItem("Trusted Privacy", colors),
                                _featureItem("Doctor Sharing", colors),
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
                    buttonColor: colors.accentPrimary,
                    textStyle: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: colors.onAccentPrimary,
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

  Widget _featureItem(String text, AppThemeColors colors) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 8,
            width: 8,
            decoration: BoxDecoration(
              color: colors.accentPrimary,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: colors.accentPrimary.withOpacity(0.4),
                  blurRadius: 4,
                  spreadRadius: 0,
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Text(
            text,
            style: TextStyle(
              fontSize: 16,
              color: colors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
