import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/auth/data/providers/auth_providers.dart';
import 'package:medikto/features/auth/login_view/otp_screen.dart';
import 'package:medikto/features/auth/register_view/register_screen.dart';
import 'package:medikto/features/onboarding/views/welcome_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController phoneController = TextEditingController();
  bool isButtonEnabled = false;
  String selectedCountryCode = "+91";

  void _showCountryCodePicker() {
    final colors = context.themeColors;
    final List<Map<String, String>> countries = [
      {"code": "+91", "name": "India"},
      {"code": "+1", "name": "USA / Canada"},
      {"code": "+44", "name": "United Kingdom"},
      {"code": "+61", "name": "Australia"},
      {"code": "+49", "name": "Germany"},
      {"code": "+971", "name": "UAE"},
      {"code": "+65", "name": "Singapore"},
      {"code": "+33", "name": "France"},
    ];

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: colors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: colors.border),
          ),
          title: Text(
            "Select Country Code",
            style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold),
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ...countries.map((c) {
                    return ListTile(
                      title: Text(
                        "${c['name']} (${c['code']})",
                        style: TextStyle(color: colors.textPrimary),
                      ),
                      trailing: selectedCountryCode == c['code']
                          ? Icon(Icons.check, color: colors.accentPrimary)
                          : null,
                      onTap: () {
                        setState(() {
                          selectedCountryCode = c['code']!;
                        });
                        Navigator.pop(context);
                      },
                    );
                  }),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    phoneController.addListener(_updateButtonState);
  }

  void _updateButtonState() {
    setState(() {
      isButtonEnabled = phoneController.text.length == 10;
    });
  }

  @override
  void dispose() {
    phoneController.dispose();
    super.dispose();
  }

  Future<void> handleLogin() async {
    final colors = context.themeColors;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
    );

    final String fullPhoneNumber = selectedCountryCode + phoneController.text;

    try {
      final checkResponse =
          await ref.read(authProvider).checkIfPhoneRegistered(fullPhoneNumber);
      if (checkResponse.status == ResponseStatus.FAILED) {
        if (mounted) {
          Navigator.pop(context);
          AppToasts.showError(context, checkResponse.message);
        }
        return;
      }

      final bool exists = checkResponse.data == true;
      if (!exists) {
        if (mounted) {
          Navigator.pop(context);
          AppToasts.showError(
            context,
            "This phone number is not registered. Please sign up first.",
          );
        }
        return;
      }

      await ref.read(authProvider).sendFirebaseOTP(
        phone: fullPhoneNumber,
        onCodeSent: (verificationId, resendToken) {
          if (mounted) {
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => OtpScreen(
                  phoneNumber: fullPhoneNumber,
                  verificationId: verificationId,
                ),
              ),
            );
            AppToasts.showSuccess(context, "OTP sent successfully");
          }
        },
        onVerificationFailed: (FirebaseAuthException e) {
          if (mounted) {
            Navigator.pop(context);
            AppToasts.showError(context, e.message ?? "Verification failed");
          }
        },
      );
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        AppToasts.showError(context, "Failed to send verification code: $e");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: colors.bg,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: size.height * 0.06),

              InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () {
                  if (Navigator.of(context).canPop()) {
                    Navigator.pop(context);
                  } else {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                    );
                  }
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
                  child: Icon(
                    Icons.arrow_back_ios_new,
                    size: 22,
                    color: colors.iconColor,
                  ),
                ),
              ),
              SizedBox(height: size.height * 0.02),

              Text(
                "Welcome Back!",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: colors.textPrimary,
                ),
              ),

              const SizedBox(height: 6),

              Text(
                "Login with your registered phone number and OTP.",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: colors.textSecondary,
                ),
              ),

              SizedBox(height: size.height * 0.04),

              /// 🔹 PHONE INPUT
              Row(
                children: [
                  GestureDetector(
                    onTap: _showCountryCodePicker,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      alignment: Alignment.center,
                      height: 54,
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: colors.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.public,
                            size: 18,
                            color: colors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            selectedCountryCode,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: colors.accentPrimary,
                            ),
                          ),
                          const SizedBox(width: 2),
                          Icon(
                            Icons.arrow_drop_down,
                            color: colors.textSecondary,
                            size: 20,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Container(
                      height: 54,
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isButtonEnabled
                              ? colors.accentPrimary.withOpacity(0.5)
                              : colors.border,
                        ),
                      ),
                      child: TextField(
                        controller: phoneController,
                        cursorColor: colors.accentPrimary,
                        keyboardType: TextInputType.number,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          color: colors.textPrimary,
                        ),
                        inputFormatters: [
                          LengthLimitingTextInputFormatter(10),
                        ],
                        decoration: InputDecoration(
                          suffixIcon: phoneController.text.isNotEmpty
                              ? IconButton(
                                  icon: Icon(
                                    Icons.close,
                                    size: 18,
                                    color: colors.textMuted,
                                  ),
                                  onPressed: () {
                                    phoneController.clear();
                                    _updateButtonState();
                                  },
                                )
                              : null,
                          hintText: "Enter mobile number",
                          hintStyle: TextStyle(
                            fontSize: 16,
                            color: colors.textMuted,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 14,
                          ),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: size.height * 0.02),
              Row(
                children: [
                  Text(
                    "Don't have an account?  ",
                    style: TextStyle(fontSize: 14, color: colors.textMuted),
                  ),
                  InkWell(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const RegisterScreen(),
                      ),
                    ),
                    child: Text(
                      "Register",
                      style: TextStyle(
                        fontSize: 14,
                        color: colors.accentMedium,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: size.height * 0.08),

              /// 🔥 BUTTON
              CustomButton(
                onPressed: isButtonEnabled ? handleLogin : null,
                buttonText: "Send OTP",
                buttonColor: isButtonEnabled
                    ? colors.accentPrimary
                    : colors.accentPrimary.withOpacity(0.2),
                textStyle: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isButtonEnabled ? colors.onAccentPrimary : colors.textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
