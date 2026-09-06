import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
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
import 'package:medikto/features/auth/register_view/google_consent_screen.dart';
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
    emailController.addListener(_updateButtonState);
    passwordController.addListener(_updateButtonState);
  }

  void _updateButtonState() {
    setState(() {
      if (isGuardianMode) {
        isButtonEnabled = emailController.text.trim().isNotEmpty &&
            passwordController.text.trim().isNotEmpty;
      } else {
        isButtonEnabled = phoneController.text.length == 10;
      }
    });
  }

  @override
  void dispose() {
    phoneController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> handleGuardianLogin() async {
    final colors = context.themeColors;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
    );

    try {
      final response = await ref.read(authProvider).guardianLogin(
        email: emailController.text.trim(),
        password: passwordController.text.trim(),
      );

      if (mounted) {
        Navigator.pop(context);
      }

      if (response.status == ResponseStatus.SUCCESS) {
        if (mounted) {
          AppToasts.showSuccess(context, "Guardian login successful");
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
        Navigator.pop(context);
        AppToasts.showError(context, "Guardian login failed: $e");
      }
    }
  }

  Future<void> handleLogin() async {
    if (isGuardianMode) {
      await handleGuardianLogin();
      return;
    }

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

      final bool exists = checkResponse.data as bool;
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

  Future<void> handleGoogleLogin() async {
    final colors = context.themeColors;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
    );

    try {
      final response = await ref.read(authProvider).signInWithGoogle();

      if (mounted) {
        Navigator.pop(context);
      }

      if (response.status == ResponseStatus.SUCCESS) {
        final data = response.data as Map<String, dynamic>;
        final bool isNewUser = data['isNewUser'] == true;

        if (isNewUser) {
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (_) => GoogleConsentScreen(
                  idToken: data['idToken'] as String,
                  email: data['email'] as String?,
                  name: data['name'] as String?,
                  picture: data['picture'] as String?,
                ),
              ),
            );
          }
        } else {
          if (mounted) {
            AppToasts.showSuccess(context, "Login successful");
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(
                builder: (_) => const BaseBottomNavigationPage(),
              ),
              (route) => false,
            );
          }
        }
      } else {
        if (mounted) {
          final isCancelled =
              (response.data is Map) && response.data['cancelled'] == true;
          if (isCancelled) {
            AppToasts.showError(context, "Google sign-in was cancelled.");
          } else {
            AppToasts.showError(context, response.message);
          }
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        AppToasts.showError(context, "Google Sign-In failed: $e");
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
                onTap: () => Navigator.pop(context),
                child: Icon(
                  Icons.arrow_back_ios_new,
                  size: 22,
                  color: colors.iconColor,
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
                "Login with your phone number to manage your medications.",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: colors.textSecondary,
                ),
              ),

              SizedBox(height: size.height * 0.04),

              // 🔹 Role Selector Tabs (Patient vs Guardian)
              Container(
                height: 48,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: colors.cardSecondary,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: colors.border),
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
                            color: !isGuardianMode
                                ? colors.accentPrimary
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            "Patient",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: !isGuardianMode
                                  ? colors.onAccentPrimary
                                  : colors.textSecondary,
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
                            color: isGuardianMode
                                ? colors.accentPrimary
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            "Guardian",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: isGuardianMode
                                  ? colors.onAccentPrimary
                                  : colors.textSecondary,
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
                              "+91",
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
              ] else ...[
                /// 🔹 EMAIL & PASSWORD INPUT
                Container(
                  height: 54,
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: colors.border),
                  ),
                  child: TextField(
                    controller: emailController,
                    cursorColor: colors.accentPrimary,
                    keyboardType: TextInputType.emailAddress,
                    style: TextStyle(
                      fontSize: 16,
                      color: colors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Icon(Icons.email_outlined, color: colors.textSecondary),
                      hintText: "Enter your email",
                      hintStyle: TextStyle(
                        fontSize: 16,
                        color: colors.textMuted,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
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
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: colors.border),
                  ),
                  child: TextField(
                    controller: passwordController,
                    cursorColor: colors.accentPrimary,
                    obscureText: _obscurePassword,
                    style: TextStyle(
                      fontSize: 16,
                      color: colors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Icon(Icons.lock_outline, color: colors.textSecondary),
                      suffixIcon: InkWell(
                        onTap: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                        child: Icon(
                          _obscurePassword ? Icons.visibility : Icons.visibility_off,
                          color: colors.textSecondary,
                          size: 20,
                        ),
                      ),
                      hintText: "Enter your password",
                      hintStyle: TextStyle(
                        fontSize: 16,
                        color: colors.textMuted,
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
              ],

              SizedBox(height: size.height * 0.12),

              /// 🔥 BUTTON
              CustomButton(
                onPressed: isButtonEnabled ? handleLogin : null,
                buttonText: isGuardianMode ? "Login" : "Send OTP",
                buttonColor: isButtonEnabled
                    ? colors.accentPrimary
                    : colors.accentPrimary.withOpacity(0.2),
                textStyle: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isButtonEnabled ? colors.onAccentPrimary : colors.textMuted,
                ),
              ),

              if (!isGuardianMode) ...[
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: Divider(color: colors.border)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        "OR",
                        style: TextStyle(
                          color: colors.textMuted,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Expanded(child: Divider(color: colors.border)),
                  ],
                ),
                const SizedBox(height: 20),
                InkWell(
                  onTap: handleGoogleLogin,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    height: 52,
                    decoration: BoxDecoration(
                      color: colors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: colors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.network(
                          "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png",
                          height: 22,
                          width: 22,
                          errorBuilder: (ctx, err, stack) => Icon(
                            Icons.g_mobiledata,
                            color: colors.iconColor,
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          "Continue with Google",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: colors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],

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
                    child: Text(
                      "Bypass Authentication (Dev Mode)",
                      style: TextStyle(
                        color: colors.accentPrimary,
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
    );
  }
}
