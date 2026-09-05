import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/constants/legal_content.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/auth/data/providers/auth_providers.dart';
import 'package:medikto/features/profile/views/privacy_policy_screen.dart';
import 'package:medikto/features/profile/views/terms_and_conditions_screen.dart';

class GoogleConsentScreen extends ConsumerStatefulWidget {
  final String idToken;
  final String? email;
  final String? name;
  final String? picture;

  const GoogleConsentScreen({
    super.key,
    required this.idToken,
    this.email,
    this.name,
    this.picture,
  });

  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  ConsumerState<GoogleConsentScreen> createState() => _GoogleConsentScreenState();
}

class _GoogleConsentScreenState extends ConsumerState<GoogleConsentScreen> {
  late final TextEditingController _nameController;
  final TextEditingController _phoneController = TextEditingController();
  bool _isConsentChecked = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.name ?? "");
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleCompleteRegistration() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      AppToasts.showError(context, "Please enter your name");
      return;
    }

    if (!_isConsentChecked) {
      AppToasts.showError(context, "Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await ref.read(authProvider).completeGoogleRegistration(
        idToken: widget.idToken,
        fullName: name,
        phone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        termsVersion: LegalContent.termsVersion,
        privacyPolicyVersion: LegalContent.privacyPolicyVersion,
      );

      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });

      if (response.status == ResponseStatus.SUCCESS) {
        AppToasts.showSuccess(context, "Welcome to Medikto!");
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => const BaseBottomNavigationPage(),
          ),
          (route) => false,
        );
      } else {
        AppToasts.showError(context, response.message);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        AppToasts.showError(context, "Registration failed: $e");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GoogleConsentScreen.darkBg,
      appBar: AppBar(
        backgroundColor: GoogleConsentScreen.darkBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Complete Your Profile",
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 12),
                      const Text(
                        "Almost there!",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Please confirm your account details and agree to our policies to activate your Medikto account.",
                        style: TextStyle(
                          color: Colors.white54,
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Google Identity Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: GoogleConsentScreen.surfaceColor,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withOpacity(0.06)),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: Colors.white10,
                              backgroundImage: widget.picture != null && widget.picture!.isNotEmpty
                                  ? NetworkImage(widget.picture!)
                                  : null,
                              child: widget.picture == null || widget.picture!.isEmpty
                                  ? const Icon(Icons.person, color: GoogleConsentScreen.accentCyan)
                                  : null,
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.name ?? "Google User",
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    widget.email ?? "Authenticated via Google",
                                    style: const TextStyle(
                                      color: Colors.white54,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.check_circle,
                              color: GoogleConsentScreen.accentCyan,
                              size: 20,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Name Field
                      AppTextFormFieldTitled(
                        controller: _nameController,
                        title: "Full Name",
                        hintText: "Enter your full name",
                        focusColor: GoogleConsentScreen.accentCyan,
                        fillColor: GoogleConsentScreen.surfaceColor,
                        color: Colors.white,
                        borderColor: Colors.white10,
                      ),

                      const SizedBox(height: 16),

                      // Phone Field (Optional)
                      AppTextFormFieldTitled(
                        controller: _phoneController,
                        title: "Phone Number (Optional)",
                        hintText: "Enter 10-digit mobile number",
                        focusColor: GoogleConsentScreen.accentCyan,
                        fillColor: GoogleConsentScreen.surfaceColor,
                        color: Colors.white,
                        borderColor: Colors.white10,
                        textInputType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(10),
                        ],
                      ),

                      const SizedBox(height: 28),

                      // Explicit Consent Checkbox
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Theme(
                            data: ThemeData(unselectedWidgetColor: Colors.white54),
                            child: Checkbox(
                              value: _isConsentChecked,
                              activeColor: GoogleConsentScreen.accentCyan,
                              checkColor: Colors.black,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(4),
                              ),
                              onChanged: (val) {
                                setState(() {
                                  _isConsentChecked = val ?? false;
                                });
                              },
                            ),
                          ),
                          Expanded(
                            child: Text.rich(
                              TextSpan(
                                text: "I agree to the ",
                                style: const TextStyle(fontSize: 12, color: Colors.white70),
                                children: [
                                  TextSpan(
                                    text: "Terms & Conditions",
                                    style: const TextStyle(
                                      color: GoogleConsentScreen.accentCyan,
                                      fontWeight: FontWeight.bold,
                                      decoration: TextDecoration.underline,
                                    ),
                                    recognizer: TapGestureRecognizer()
                                      ..onTap = () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => const TermsAndConditionsScreen(),
                                          ),
                                        );
                                      },
                                  ),
                                  const TextSpan(text: " and "),
                                  TextSpan(
                                    text: "Privacy Policy",
                                    style: const TextStyle(
                                      color: GoogleConsentScreen.accentCyan,
                                      fontWeight: FontWeight.bold,
                                      decoration: TextDecoration.underline,
                                    ),
                                    recognizer: TapGestureRecognizer()
                                      ..onTap = () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => const PrivacyPolicyScreen(),
                                          ),
                                        );
                                      },
                                  ),
                                  const TextSpan(text: "."),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: GoogleConsentScreen.accentCyan),
                    )
                  : CustomButton(
                      onPressed: _handleCompleteRegistration,
                      buttonText: "Create Account",
                      buttonColor: GoogleConsentScreen.accentCyan,
                      textStyle: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
