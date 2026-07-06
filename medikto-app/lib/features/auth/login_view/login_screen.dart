import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/auth/data/providers/auth_providers.dart';
import 'package:medikto/features/auth/login_view/otp_screen.dart';
import 'package:medikto/features/auth/register_view/register_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/bottom_bar.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool isButtonEnabled = false;
  String selectedCountryCode = "+91";
  bool isGuardianMode = false;
  bool _obscurePassword = true;

  // Dark Mode Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  void _showCountryCodePicker() {
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

    final customCodeController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: surfaceColor,
          title: const Text(
            "Select Country Code",
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
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
                        style: const TextStyle(color: Colors.white),
                      ),
                      trailing: selectedCountryCode == c['code']
                          ? const Icon(Icons.check, color: accentCyan)
                          : null,
                      onTap: () {
                        setState(() {
                          selectedCountryCode = c['code']!;
                        });
                        Navigator.pop(context);
                      },
                    );
                  }).toList(),
                  const Divider(color: Colors.white24),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: TextField(
                      controller: customCodeController,
                      style: const TextStyle(color: Colors.white),
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        hintText: "Enter custom code (e.g. +353)",
                        hintStyle: TextStyle(color: Colors.white38),
                        enabledBorder: UnderlineInputBorder(
                          borderSide: BorderSide(color: Colors.white24),
                        ),
                        focusedBorder: UnderlineInputBorder(
                          borderSide: BorderSide(color: accentCyan),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  CustomButton(
                    buttonText: "Apply Custom Code",
                    buttonColor: accentCyan,
                    textStyle: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                    onPressed: () {
                      String code = customCodeController.text.trim();
                      if (code.isNotEmpty) {
                        if (!code.startsWith("+")) {
                          code = "+$code";
                        }
                        setState(() {
                          selectedCountryCode = code;
                        });
                      }
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _updateButtonState() {
    bool enabled = false;
    if (isGuardianMode) {
      enabled = emailController.text.trim().isNotEmpty && passwordController.text.isNotEmpty;
    } else {
      enabled = phoneController.text.length == 10;
    }
    if (enabled != isButtonEnabled) {
      setState(() {
        isButtonEnabled = enabled;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    phoneController.addListener(_updateButtonState);
    emailController.addListener(_updateButtonState);
    passwordController.addListener(_updateButtonState);
  }

  @override
  void dispose() {
    phoneController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> handleGuardianLogin() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          const Center(child: CircularProgressIndicator(color: accentCyan)),
    );

    try {
      final response = await ref.read(authProvider).loginGuardian(
        email: emailController.text.trim(),
        password: passwordController.text,
      );

      if (mounted) {
        Navigator.pop(context); // Close loading dialog
      }

      if (response.status == ResponseStatus.SUCCESS) {
        if (mounted) {
          AppToasts.showSuccess(context, response.message);
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (_) => const BaseBottomNavigationPage(),
            ),
            (route) => false,
          );
        }
      } else {
        if (mounted) {
          AppToasts.showError(context, response.message);
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading dialog
        AppToasts.showError(context, "An error occurred: $e");
      }
    }
  }

  Future<void> handleLogin() async {
    if (isGuardianMode) {
      await handleGuardianLogin();
      return;
    }

    // 1. Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          const Center(child: CircularProgressIndicator(color: accentCyan)),
    );

    final String fullPhoneNumber = selectedCountryCode + phoneController.text;

    try {
      // Check if user is registered first
      final checkResponse = await ref.read(authProvider).checkIfPhoneRegistered(fullPhoneNumber);
      if (checkResponse.status == ResponseStatus.FAILED) {
        if (mounted) {
          Navigator.pop(context); // Close loading dialog
          AppToasts.showError(context, checkResponse.message);
        }
        return;
      }

      final bool exists = checkResponse.data as bool;
      if (!exists) {
        if (mounted) {
          Navigator.pop(context); // Close loading dialog
          AppToasts.showError(context, "This phone number is not registered. Please sign up first.");
        }
        return;
      }

      // Proceed to send Firebase OTP
      await ref.read(authProvider).sendFirebaseOTP(
        phone: fullPhoneNumber,
        onCodeSent: (verificationId, resendToken) {
          if (mounted) {
            Navigator.pop(context); // Close loading dialog
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => OtpScreen(
                  phoneNumber: fullPhoneNumber,
                  verificationId: verificationId,
                ),
              ),
            );
            AppToasts.showSuccess(context, "OTP sent successfully via Firebase");
          }
        },
        onVerificationFailed: (FirebaseAuthException e) {
          if (mounted) {
            Navigator.pop(context); // Close loading dialog
            AppToasts.showError(context, e.message ?? "Verification failed");
          }
        },
      );
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading dialog
        AppToasts.showError(context, "Failed to send verification code: $e");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light, // White icons for dark mode
      ),
      child: Scaffold(
        backgroundColor: darkBg,
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: size.height * 0.06),

                InkWell(
                  onTap: () => Navigator.pop(context),
                  child: const Icon(
                    Icons.arrow_back_ios_new, // Modern variant
                    size: 22,
                    color: Colors.white,
                  ),
                ),

                SizedBox(height: size.height * 0.02),

                const Text(
                  "Let’s get started!",
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  isGuardianMode
                      ? "Enter your email and password to access the Guardian Portal."
                      : "Enter your phone number. We will send you a confirmation code.",
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    color: Colors.white54,
                  ),
                ),

                SizedBox(height: size.height * 0.03),

                // 🔹 Role Selector Tabs (Patient vs Guardian)
                Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: surfaceColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              isGuardianMode = false;
                              _updateButtonState();
                            });
                          },
                          child: Container(
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: !isGuardianMode ? accentCyan : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              "Patient",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: !isGuardianMode ? Colors.black : Colors.white60,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              isGuardianMode = true;
                              _updateButtonState();
                            });
                          },
                          child: Container(
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: isGuardianMode ? accentCyan : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              "Guardian",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: isGuardianMode ? Colors.black : Colors.white60,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: size.height * 0.03),

                if (!isGuardianMode) ...[
                  /// 🔹 PHONE INPUT (Dark Mode Optimized)
                  Row(
                    children: [
                      GestureDetector(
                        onTap: _showCountryCodePicker,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          alignment: Alignment.center,
                          height: 54,
                          decoration: BoxDecoration(
                            color: surfaceColor,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.05),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.public,
                                size: 18,
                                color: Colors.white54,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                selectedCountryCode,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: accentCyan,
                                ),
                              ),
                              const SizedBox(width: 2),
                              const Icon(
                                Icons.arrow_drop_down,
                                color: Colors.white54,
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
                            color: surfaceColor,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isButtonEnabled
                                  ? accentCyan.withOpacity(0.5)
                                  : Colors.white.withOpacity(0.05),
                            ),
                          ),
                          child: TextField(
                            controller: phoneController,
                            cursorColor: accentCyan,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w500,
                              color: Colors.white,
                            ),
                            inputFormatters: [
                              LengthLimitingTextInputFormatter(10),
                            ],
                            decoration: InputDecoration(
                              suffixIcon: phoneController.text.isNotEmpty
                                  ? InkWell(
                                      onTap: () => phoneController.clear(),
                                      child: const Icon(
                                        Icons.cancel,
                                        color: Colors.white24,
                                        size: 20,
                                      ),
                                    )
                                  : null,
                              hintText: "Enter mobile number",
                              hintStyle: const TextStyle(
                                fontSize: 16,
                                color: Colors.white24,
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
                ] else ...[
                  /// 🔹 EMAIL & PASSWORD INPUT (Dark Mode Optimized)
                  Container(
                    height: 54,
                    decoration: BoxDecoration(
                      color: surfaceColor,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.05),
                      ),
                    ),
                    child: TextField(
                      controller: emailController,
                      cursorColor: accentCyan,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                      ),
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.email_outlined, color: Colors.white54),
                        hintText: "Enter your email",
                        hintStyle: TextStyle(
                          fontSize: 16,
                          color: Colors.white24,
                        ),
                        contentPadding: EdgeInsets.symmetric(
                          vertical: 14,
                        ),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    height: 54,
                    decoration: BoxDecoration(
                      color: surfaceColor,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.05),
                      ),
                    ),
                    child: TextField(
                      controller: passwordController,
                      cursorColor: accentCyan,
                      obscureText: _obscurePassword,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                      ),
                      decoration: InputDecoration(
                        prefixIcon: const Icon(Icons.lock_outline, color: Colors.white54),
                        suffixIcon: InkWell(
                          onTap: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                          child: Icon(
                            _obscurePassword ? Icons.visibility : Icons.visibility_off,
                            color: Colors.white54,
                            size: 20,
                          ),
                        ),
                        hintText: "Enter your password",
                        hintStyle: const TextStyle(
                          fontSize: 16,
                          color: Colors.white24,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 14,
                        ),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ],

                if (!isGuardianMode) ...[
                  SizedBox(height: size.height * 0.02),
                  Row(
                    children: [
                      const Text(
                        "Don't have an account?  ",
                        style: TextStyle(fontSize: 14, color: Colors.white38),
                      ),
                      InkWell(
                        onTap: () => Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const RegisterScreen(),
                          ),
                          (route) => false,
                        ),
                        child: const Text(
                          "Register",
                          style: TextStyle(
                            fontSize: 14,
                            color: accentCyan,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],

                SizedBox(height: size.height * 0.12),

                /// 🔥 BUTTON (Cyan Branding)
                CustomButton(
                  onPressed: isButtonEnabled ? handleLogin : null,
                  buttonText: isGuardianMode ? "Login" : "Send OTP",
                  buttonColor: isButtonEnabled
                      ? accentCyan
                      : accentCyan.withOpacity(0.15),
                  textStyle: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isButtonEnabled ? Colors.black : Colors.white24,
                  ),
                ),

                if (kDebugMode) ...[
                  const SizedBox(height: 15),
                  Center(
                    child: TextButton(
                      onPressed: () async {
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setString(StorageKeys.token, "mock_dev_token");
                        if (mounted) {
                          Navigator.pushAndRemoveUntil(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const BaseBottomNavigationPage(),
                            ),
                            (route) => false,
                          );
                        }
                      },
                      child: const Text(
                        "Bypass Authentication (Dev Mode)",
                        style: TextStyle(
                          color: accentCyan,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
