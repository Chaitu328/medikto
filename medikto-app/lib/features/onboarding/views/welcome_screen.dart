import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:medikto/features/auth/register_view/register_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

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
                /// 🔹 TOP CONTENT
                Expanded(
                  child: Column(
                    children: [
                      SizedBox(height: size.height * 0.16),

                      Text(
                        "Welcome to Medikto",
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: colors.textPrimary,
                          letterSpacing: 0.5,
                        ),
                      ),

                      const SizedBox(height: 8),

                      Text(
                        "Stay healthy. Stay secure.",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w400,
                          color: colors.textSecondary,
                        ),
                      ),

                      SizedBox(height: size.height * 0.04),

                      /// Responsive Image
                      Flexible(
                        child: Opacity(
                          opacity: isDark ? 0.9 : 1.0,
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
                      // Login Button
                      CustomButton(
                        buttonColor: Colors.transparent,
                        border: Border.all(color: colors.accent, width: 1.5),
                        height: 54,
                        buttonText: "Login",
                        textStyle: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: colors.accent,
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

                      // Register Button
                      CustomButton(
                        buttonColor: colors.accent,
                        height: 54,
                        buttonText: "Register",
                        textStyle: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: colors.onAccent,
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
