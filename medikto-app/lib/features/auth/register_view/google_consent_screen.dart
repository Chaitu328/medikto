import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/constants/legal_content.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/auth/data/providers/auth_providers.dart';
import 'package:medikto/features/auth/pin/set_pin_screen.dart';
import 'package:medikto/features/profile/views/privacy_policy_screen.dart';
import 'package:medikto/features/profile/views/terms_and_conditions_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

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

  @override
  ConsumerState<GoogleConsentScreen> createState() => _GoogleConsentScreenState();
}

class _GoogleConsentScreenState extends ConsumerState<GoogleConsentScreen> {
  late final TextEditingController _nameController;
  final TextEditingController _phoneController = TextEditingController();
  String _selectedCountryCode = "+91";
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
                children: countries.map((c) {
                  return ListTile(
                    title: Text(
                      "${c['name']} (${c['code']})",
                      style: TextStyle(color: colors.textPrimary),
                    ),
                    trailing: _selectedCountryCode == c['code']
                        ? Icon(Icons.check, color: colors.accentPrimary)
                        : null,
                    onTap: () {
                      setState(() {
                        _selectedCountryCode = c['code']!;
                      });
                      Navigator.pop(context);
                    },
                  );
                }).toList(),
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _handleStartPhoneVerification() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      AppToasts.showError(context, "Please enter your name");
      return;
    }

    final rawPhone = _phoneController.text.trim();
    if (rawPhone.length != 10) {
      AppToasts.showError(context, "Please enter a valid 10-digit mobile number");
      return;
    }

    if (!_isConsentChecked) {
      AppToasts.showError(context, "Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    final fullPhoneNumber = "$_selectedCountryCode$rawPhone";
    final colors = context.themeColors;

    setState(() {
      _isLoading = true;
    });

    try {
      final checkResp = await ref.read(authProvider).checkIfPhoneRegistered(fullPhoneNumber);
      if (checkResp.status == ResponseStatus.SUCCESS && checkResp.data == true) {
        if (mounted) {
          setState(() => _isLoading = false);
          AppToasts.showError(context, "This phone number is already registered. Please log in.");
        }
        return;
      }

      await ref.read(authProvider).sendFirebaseOTP(
        phone: fullPhoneNumber,
        onCodeSent: (verificationId, resendToken) {
          if (mounted) {
            setState(() => _isLoading = false);
            _showOtpVerificationDialog(fullPhoneNumber, verificationId);
            AppToasts.showSuccess(context, "OTP sent to $fullPhoneNumber");
          }
        },
        onVerificationFailed: (FirebaseAuthException e) {
          if (mounted) {
            setState(() => _isLoading = false);
            AppToasts.showError(context, e.message ?? "Phone verification failed");
          }
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        AppToasts.showError(context, "Error sending verification code: $e");
      }
    }
  }

  void _showOtpVerificationDialog(String fullPhoneNumber, String verificationId) {
    final colors = context.themeColors;
    final pinController = TextEditingController();
    bool dialogLoading = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: colors.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: colors.border),
              ),
              title: Text(
                "Verify Mobile Number",
                style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "Enter the 6-digit verification code sent to $fullPhoneNumber",
                    style: TextStyle(color: colors.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: pinController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    style: TextStyle(
                      color: colors.textPrimary,
                      letterSpacing: 8,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                    decoration: InputDecoration(
                      hintText: "------",
                      hintStyle: TextStyle(color: colors.textMuted),
                      filled: true,
                      fillColor: colors.inputFill,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: colors.border),
                      ),
                    ),
                  ),
                  if (dialogLoading)
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: CircularProgressIndicator(color: colors.accentPrimary),
                    ),
                  if (!dialogLoading)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: Text("Cancel", style: TextStyle(color: colors.textMuted)),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: colors.accentPrimary,
                            foregroundColor: colors.onAccentPrimary,
                          ),
                          onPressed: () async {
                            if (pinController.text.length != 6) return;

                            setDialogState(() => dialogLoading = true);

                            try {
                              final credential = PhoneAuthProvider.credential(
                                verificationId: verificationId,
                                smsCode: pinController.text.trim(),
                              );
                              // Verify phone ownership
                              await FirebaseAuth.instance.signInWithCredential(credential);

                              final response = await ref.read(authProvider).completeGoogleRegistration(
                                idToken: widget.idToken,
                                fullName: _nameController.text.trim(),
                                phone: fullPhoneNumber,
                                termsAccepted: true,
                                privacyPolicyAccepted: true,
                                termsVersion: LegalContent.termsVersion,
                                privacyPolicyVersion: LegalContent.privacyPolicyVersion,
                              );

                              if (!mounted) return;
                              Navigator.pop(context); // Close dialog

                              if (response.status == ResponseStatus.SUCCESS) {
                                final userMap = response.data is Map ? response.data['user'] : null;
                                final userId = userMap?['_id'] ?? userMap?['id'];
                                if (userId != null) {
                                  final prefs = await SharedPreferences.getInstance();
                                  await prefs.setString(StorageKeys.userId, userId.toString());
                                }

                                AppToasts.showSuccess(context, "Registration complete! Please set up your 4-digit App PIN.");
                                Navigator.pushAndRemoveUntil(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => SetPinScreen(userId: userId?.toString()),
                                  ),
                                  (route) => false,
                                );
                              } else {
                                AppToasts.showError(context, response.message);
                              }
                            } catch (e) {
                              if (context.mounted) {
                                setDialogState(() => dialogLoading = false);
                                AppToasts.showError(context, "Verification failed: $e");
                              }
                            }
                          },
                          child: const Text(
                            "Verify & Complete",
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: AppBar(
        backgroundColor: colors.bg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: colors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Complete Your Profile",
          style: TextStyle(
            color: colors.textPrimary,
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
                      Text(
                        "Almost there!",
                        style: TextStyle(
                          color: colors.textPrimary,
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Your mobile number is mandatory to secure your account and send medication reminders.",
                        style: TextStyle(
                          color: colors.textSecondary,
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Google Identity Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: colors.card,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: colors.borderSubtle),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: colors.surface,
                              backgroundImage: widget.picture != null && widget.picture!.isNotEmpty
                                  ? NetworkImage(widget.picture!)
                                  : null,
                              child: widget.picture == null || widget.picture!.isEmpty
                                  ? Icon(Icons.person, color: colors.accentPrimary)
                                  : null,
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.name ?? "Google User",
                                    style: TextStyle(
                                      color: colors.textPrimary,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    widget.email ?? "Authenticated via Google",
                                    style: TextStyle(
                                      color: colors.textSecondary,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.check_circle,
                              color: colors.accentPrimary,
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
                        focusColor: colors.accentPrimary,
                        fillColor: colors.inputFill,
                        color: colors.textPrimary,
                        borderColor: colors.border,
                      ),

                      const SizedBox(height: 16),

                      // Phone Field (Mandatory)
                      AppTextFormFieldTitled(
                        controller: _phoneController,
                        title: "Mobile Number (Mandatory)",
                        hintText: "Enter 10-digit mobile number",
                        focusColor: colors.accentPrimary,
                        fillColor: colors.inputFill,
                        color: colors.textPrimary,
                        borderColor: colors.border,
                        textInputType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(10),
                        ],
                        prefix: GestureDetector(
                          onTap: _showCountryCodePicker,
                          behavior: HitTestBehavior.opaque,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _selectedCountryCode,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: colors.accentPrimary,
                                ),
                              ),
                              Icon(
                                Icons.arrow_drop_down,
                                color: colors.textSecondary,
                                size: 18,
                              ),
                              const SizedBox(width: 4),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 28),

                      // Explicit Consent Checkbox
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Theme(
                            data: ThemeData(unselectedWidgetColor: colors.textMuted),
                            child: Checkbox(
                              value: _isConsentChecked,
                              activeColor: colors.accentPrimary,
                              checkColor: colors.onAccentPrimary,
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
                                style: TextStyle(fontSize: 12, color: colors.textSecondary),
                                children: [
                                  TextSpan(
                                    text: "Terms & Conditions",
                                    style: TextStyle(
                                      color: colors.accentMedium,
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
                                    style: TextStyle(
                                      color: colors.accentMedium,
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
                  ? Center(
                      child: CircularProgressIndicator(color: colors.accentPrimary),
                    )
                  : CustomButton(
                      onPressed: _handleStartPhoneVerification,
                      buttonText: "Verify Mobile & Continue",
                      buttonColor: colors.accentPrimary,
                      textStyle: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: colors.onAccentPrimary,
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
