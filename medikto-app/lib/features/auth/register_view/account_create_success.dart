import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';

class AccountCreateSuccess extends StatefulWidget {
  const AccountCreateSuccess({super.key});

  @override
  State<AccountCreateSuccess> createState() => _AccountCreateSuccessState();
}

class _AccountCreateSuccessState extends State<AccountCreateSuccess> {
  @override
  void initState() {
    super.initState();
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
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: colors.bg,
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  "assets/images/account-create-success.png",
                  height: 200,
                  width: 240,
                  fit: BoxFit.contain,
                ),
                SizedBox(height: MediaQuery.sizeOf(context).height * 0.02),
                Text(
                  "Account Created Successfully",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: colors.textPrimary,
                  ),
                ),
                SizedBox(height: MediaQuery.sizeOf(context).height * 0.012),
                Text(
                  "Your health journey starts here",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: colors.textSecondary,
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
