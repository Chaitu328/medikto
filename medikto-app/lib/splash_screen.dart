import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:medikto/features/onboarding/views/onboarding_screens.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  static const Color darkBg = Color(0xFF121212);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  void initState() {
    super.initState();
    checkAppFlow();
  }

  Future<void> checkAppFlow() async {
    await Future.delayed(const Duration(seconds: 2));

    final prefs = await SharedPreferences.getInstance();

    /// CHECK ONBOARDING
    final onboardingDone = prefs.getBool(StorageKeys.onboardingDone) ?? false;

    /// FIRST INSTALL
    if (!onboardingDone) {
      navigateToOnboarding();
      return;
    }

    /// CHECK TOKEN
    final token = prefs.getString(StorageKeys.token);

    print("SAVED TOKEN => $token");

    /// NO TOKEN
    if (token == null || token.isEmpty) {
      navigateToLogin();
      return;
    }

    /// CHECK TOKEN EXPIRY
    bool isExpired = JwtDecoder.isExpired(token);

    print("TOKEN EXPIRED => $isExpired");

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
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: darkBg,
        body: Container(
          height: double.infinity,
          width: double.infinity,
          decoration: const BoxDecoration(color: darkBg),
          child: Center(
            child: Image.asset(
              "assets/images/main-logo.png",
              width: MediaQuery.sizeOf(context).width * 0.4,
              color: accentCyan,
            ),
          ),
        ),
      ),
    );
  }
}
