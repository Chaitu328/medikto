import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:medikto/features/onboarding/views/onboarding_screens.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    checkAppFlow();
  }

  Future<void> checkAppFlow() async {
    await Future.delayed(const Duration(seconds: 2));

    final prefs = await SharedPreferences.getInstance();

    // 🛠️ TEMPORARY FOR TESTING: Force clear SharedPreferences on startup
    // (Uncomment the line below when you want to force test onboarding again)
    // await prefs.clear();

    /// CHECK ONBOARDING
    final onboardingDone = prefs.getBool(StorageKeys.onboardingDone) ?? false;
    debugPrint("ONBOARDING DONE => $onboardingDone");

    /// FIRST INSTALL
    if (!onboardingDone) {
      navigateToOnboarding();
      return;
    }

    /// CHECK TOKEN
    final token = prefs.getString(StorageKeys.token);

    debugPrint("SAVED TOKEN => $token");

    /// NO TOKEN
    if (token == null || token.isEmpty) {
      navigateToLogin();
      return;
    }

    /// CHECK TOKEN EXPIRY
    bool isExpired = false;
    try {
      if (token.startsWith("mock_")) {
        isExpired = false;
      } else {
        isExpired = JwtDecoder.isExpired(token);
      }
    } catch (_) {
      isExpired = !token.startsWith("mock_");
    }

    debugPrint("TOKEN EXPIRED => $isExpired");

    if (isExpired) {
      /// REMOVE EXPIRED TOKEN
      await prefs.remove(StorageKeys.token);

      navigateToLogin();
    } else {
      navigateToHome();
    }
  }

  void navigateToOnboarding() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const OnboardingScreens()),
    );
  }

  void navigateToHome() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const BaseBottomNavigationPage()),
    );
  }

  void navigateToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: colors.bg,
        body: Container(
          height: double.infinity,
          width: double.infinity,
          decoration: BoxDecoration(color: colors.bg),
          child: Center(
            child: Image.asset(
              "assets/images/medikto_logo.png",
              width: MediaQuery.sizeOf(context).width * 0.5,
            ),
          ),
        ),
      ),
    );
  }
}
