import 'package:flutter/material.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  // Theme Colors consistent with Dashboard and Profile
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

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
                    style: TextStyle(fontSize: 14, color: Colors.white54,
                    ),
                  ),

                  SizedBox(height: size.height * 0.04),

                  _buildField("New Password", "Enter your new password"),
                  const SizedBox(height: 20),

                  _buildField("Confirm Password", "Re-enter your new password"),
                ],
              ),
            ),
            
            // Bottom Action Button
            CustomButton(
              onPressed: () => Navigator.pop(context),
              buttonColor: accentCyan,
              buttonText: "Save Changes",
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color:
                    Colors.black, // Dark text on light button for high contrast
              ),
            ),
            SizedBox(height: size.height * 0.04), // Safe area bottom padding
          ],
        ),
      ),
    );
  }

  Widget _buildField(String title, String hint) {
    return AppTextFormFieldTitled(
      title: title,
      hintText: hint,
      obscureText: true, // Standard for password fields
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
