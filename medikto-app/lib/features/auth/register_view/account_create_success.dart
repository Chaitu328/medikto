import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';

class AccountCreateSuccess extends StatefulWidget {
  const AccountCreateSuccess({super.key});

  @override
  State<AccountCreateSuccess> createState() => _AccountCreateSuccessState();
}

class _AccountCreateSuccessState extends State<AccountCreateSuccess> {
  // Brand colors for consistency
  static const Color darkBg = Color(0xFF121212);

  @override
  void initState() {
    super.initState();
    // Logic preserved as per your existing code
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light, // White icons for dark mode
      ),
      child: Scaffold(
        backgroundColor: darkBg, // Switched to Dark Mode background
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Illustration (Ideally a dark-mode friendly asset)
                Image.asset(
                  "assets/images/account-create-success.png",
                  height: 200,
                  width: 240,
                  fit: BoxFit.contain,
                ),
                SizedBox(height: MediaQuery.sizeOf(context).height * 0.02),
                const Text(
                  "Account Created Successfully",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 22, // Slightly bumped for better presence
                    fontWeight: FontWeight.bold,
                    color: Colors.white, // High contrast for dark mode
                  ),
                ),
                SizedBox(height: MediaQuery.sizeOf(context).height * 0.012),
                const Text(
                  "Your health journey starts here",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: Colors.white60, // Muted white for secondary text
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
