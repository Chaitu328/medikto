import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  // Theme Colors consistent with Dashboard and Profile
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  final TextEditingController _currentPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    final oldPassword = _currentPasswordController.text.trim();
    final newPassword = _newPasswordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (oldPassword.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
      AppToasts.showError(context, "All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      AppToasts.showError(context, "New password must be at least 6 characters");
      return;
    }

    if (newPassword != confirmPassword) {
      AppToasts.showError(context, "Passwords do not match");
      return;
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: accentCyan),
      ),
    );

    try {
      final response = await ref.read(profileProvider).changeGuardianPassword(
            oldPassword: oldPassword,
            newPassword: newPassword,
          );

      if (mounted) {
        Navigator.pop(context); // Close loader
      }

      if (response.status == ResponseStatus.SUCCESS) {
        if (mounted) {
          AppToasts.showSuccess(context, response.message);
          Navigator.pop(context); // Go back to profile
        }
      } else {
        if (mounted) {
          AppToasts.showError(context, response.message);
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loader
        AppToasts.showError(context, "Failed to change password: $e");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: AppBar(
        titleSpacing: 0,
        toolbarHeight: 60,
        backgroundColor: darkBg,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        scrolledUnderElevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: const Icon(
            Icons.arrow_back_ios_new,
            color: Colors.white,
            size: 20,
          ),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 20),
            child: Icon(Icons.info_outline_rounded, color: Colors.white70),
          ),
        ],
        title: const Text(
          "Change Password",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: size.height * 0.02),
                    const Text(
                      "Security Update",
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Choose a strong password to protect your health data.",
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white54,
                      ),
                    ),
                    SizedBox(height: size.height * 0.04),

                    _buildField(
                      "Current Password",
                      "Enter your current password",
                      controller: _currentPasswordController,
                      obscureText: _obscureCurrentPassword,
                      suffix: Icon(
                        _obscureCurrentPassword ? Icons.visibility : Icons.visibility_off,
                        color: Colors.white54,
                      ),
                      suffixIconOnTap: () {
                        setState(() {
                          _obscureCurrentPassword = !_obscureCurrentPassword;
                        });
                      },
                    ),
                    const SizedBox(height: 20),

                    _buildField(
                      "New Password",
                      "Enter your new password",
                      controller: _newPasswordController,
                      obscureText: _obscureNewPassword,
                      suffix: Icon(
                        _obscureNewPassword ? Icons.visibility : Icons.visibility_off,
                        color: Colors.white54,
                      ),
                      suffixIconOnTap: () {
                        setState(() {
                          _obscureNewPassword = !_obscureNewPassword;
                        });
                      },
                    ),
                    const SizedBox(height: 20),

                    _buildField(
                      "Confirm Password",
                      "Re-enter your new password",
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirmPassword,
                      suffix: Icon(
                        _obscureConfirmPassword ? Icons.visibility : Icons.visibility_off,
                        color: Colors.white54,
                      ),
                      suffixIconOnTap: () {
                        setState(() {
                          _obscureConfirmPassword = !_obscureConfirmPassword;
                        });
                      },
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Bottom Action Button
            CustomButton(
              onPressed: _handleSave,
              buttonColor: accentCyan,
              buttonText: "Save Changes",
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black, // Dark text on light button for high contrast
              ),
            ),
            SizedBox(height: size.height * 0.04), // Safe area bottom padding
          ],
        ),
      ),
    );
  }

  Widget _buildField(
    String title,
    String hint, {
    required TextEditingController controller,
    required bool obscureText,
    required Widget suffix,
    required VoidCallback suffixIconOnTap,
  }) {
    return AppTextFormFieldTitled(
      title: title,
      hintText: hint,
      controller: controller,
      obscureText: obscureText,
      suffix: suffix,
      suffixIconOnTap: suffixIconOnTap,
      focusColor: accentCyan,
      fillColor: surfaceColor,
      color: Colors.white,
      borderColor: Colors.white.withOpacity(0.1),
      hintStyle: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: Colors.white24,
      ),
      titleTextStyle: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.bold,
        color: Colors.white70,
      ),
    );
  }
}
