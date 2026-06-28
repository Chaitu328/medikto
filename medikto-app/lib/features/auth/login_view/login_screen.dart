import 'package:flutter/material.dart';
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
  bool isButtonEnabled = false;
  String selectedCountryCode = "+91";

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

  @override
  void initState() {
    super.initState();
    phoneController.addListener(() {
      final isTenDigits = phoneController.text.length == 10;
      if (isTenDigits != isButtonEnabled) {
        setState(() {
          isButtonEnabled = isTenDigits;
        });
      }
    });
  }

  @override
  void dispose() {
    phoneController.dispose();
    super.dispose();
  }

  Future<void> handleLogin() async {
    // 1. Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          const Center(child: CircularProgressIndicator(color: accentCyan)),
    );

    final String fullPhoneNumber = selectedCountryCode + phoneController.text;

    // 2. Call the manager through the provider
    final response = await ref
        .read(authProvider)
        .performLogin(fullPhoneNumber);

    // 3. Pop loading dialog
    if (mounted) Navigator.pop(context);

    if (response.status == ResponseStatus.SUCCESS) {
      AppToasts.showSuccess(context, response.message);
      // 4. Navigate to OTP Screen
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => OtpScreen(phoneNumber: fullPhoneNumber),
          ),
        );

        print("Response Data:------------>>> ${response.data}");
      }
    } else {
      // 5. Show error message
      if (mounted) {
        AppToasts.showError(context, response.message);
        // ScaffoldMessenger.of(context).showSnackBar(
        //   SnackBar(
        //     content: Text(response.message),
        //     backgroundColor: Colors.redAccent,
        //   ),
        // );
        print("Response Data:------------>>> ${response.data}");
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

                SizedBox(height: size.height * 0.01),

                const Text(
                  "Enter your phone number. We will send you a confirmation code.",
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    color: Colors.white54,
                  ),
                ),

                SizedBox(height: size.height * 0.04),

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

                SizedBox(height: size.height * 0.18),

                /// 🔥 BUTTON (Cyan Branding)
                CustomButton(
                  onPressed: isButtonEnabled ? handleLogin : null,
                  // onPressed: isButtonEnabled
                  //     ? () {
                  //         Navigator.push(
                  buttonText: "Send OTP",
                  buttonColor: isButtonEnabled
                      ? accentCyan
                      : accentCyan.withOpacity(0.15),
                  textStyle: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isButtonEnabled ? Colors.black : Colors.white24,
                  ),
                ),
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
            ),
          ),
        ),
      ),
    );
  }
}
