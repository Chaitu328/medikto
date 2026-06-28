import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:medikto/features/auth/register_view/register_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    // Theme Colors
    const Color darkBg = Color(0xFF121212);
    const Color accentCyan = Color(0xFF81DEEA);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent, // Immersive look
        statusBarIconBrightness: Brightness.light, // White icons for Dark Mode
        systemNavigationBarColor: darkBg,
      ),
      child: Scaffold(
        backgroundColor: darkBg,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                /// 🔹 TOP CONTENT
                Expanded(
                  child: Column(
                    children: [
                      SizedBox(height: size.height * 0.16),

                      const Text(
                        "Welcome to Medikto",
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),

                      const SizedBox(height: 8),

                      const Text(
                        "Stay healthy. Stay secure.",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w400,
                          color:
                              Colors.white54, // Muted white for secondary text
                        ),
                      ),

                      SizedBox(height: size.height * 0.04),

                      /// 🔥 Responsive Image (Opacity adjusted for Dark Mode)
                      Flexible(
                        child: Opacity(
                          opacity: 0.9,
                          child: Image.asset(
                            'assets/images/health-guard.png',
                            width: size.width * 0.75,
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                /// 🔥 STICKY BUTTONS
                Padding(
                  padding: const EdgeInsets.only(bottom: 30, top: 10),
                  child: Column(
                    children: [
                      // Login Button - Outlined Style for Dark Mode
                      CustomButton(
                        buttonColor: Colors.transparent,
                        border: Border.all(color: accentCyan, width: 1.5),
                        height: 54,
                        buttonText: "Login",
                        textStyle: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: accentCyan,
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const LoginScreen(),
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 16),

                      // Register Button - Solid Style
                      CustomButton(
                        buttonColor: accentCyan,
                        height: 54,
                        buttonText: "Register",
                        textStyle: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black, // Dark text on Cyan background
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const RegisterScreen(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
