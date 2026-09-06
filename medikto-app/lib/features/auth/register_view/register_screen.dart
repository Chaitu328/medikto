import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/auth/data/providers/auth_providers.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:medikto/features/auth/widgets/gender_selection_widget.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'dart:io';
import 'package:flutter/gestures.dart';
import 'package:medikto/core/constants/legal_content.dart';
import 'package:medikto/features/profile/views/privacy_policy_screen.dart';
import 'package:medikto/features/profile/views/terms_and_conditions_screen.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final nameController = TextEditingController();
  final phoneController = TextEditingController();
  final dobController = TextEditingController();

  final caretakerNameController = TextEditingController();
  final caretakerEmailController = TextEditingController();
  final caretakerPhoneController = TextEditingController();
  final caretakerPasswordController = TextEditingController();
  String selectedCaretakerRelation = "Son";

  String selectedGender = "Male";
  File? selectedImage;
  final ImagePicker _picker = ImagePicker();
  String selectedCountryCode = "+91";

  bool inviteCaretaker = false;
  bool obscureCaretakerPassword = true;
  bool isConsentChecked = false;

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

    final customCodeController = TextEditingController();

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
                  Divider(color: colors.borderSubtle),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: TextField(
                      controller: customCodeController,
                      style: TextStyle(color: colors.textPrimary),
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        hintText: "Enter custom code (e.g. +81)",
                        hintStyle: TextStyle(color: colors.textMuted),
                        filled: true,
                        fillColor: colors.inputFill,
                        suffixIcon: IconButton(
                          icon: Icon(Icons.add, color: colors.accentPrimary),
                          onPressed: () {
                            final custom = customCodeController.text.trim();
                            if (custom.isNotEmpty && custom.startsWith("+")) {
                              setState(() {
                                selectedCountryCode = custom;
                              });
                              Navigator.pop(context);
                            }
                          },
                        ),
                      ),
                    ),
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
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    dobController.dispose();
    caretakerNameController.dispose();
    caretakerEmailController.dispose();
    caretakerPhoneController.dispose();
    caretakerPasswordController.dispose();
    super.dispose();
  }

  Future<void> handleRegister() async {
    if (nameController.text.trim().isEmpty) {
      AppToasts.showError(context, "Please enter your full name");
      return;
    }

    if (phoneController.text.trim().length != 10) {
      AppToasts.showError(context, "Please enter a valid 10-digit phone number");
      return;
    }

    if (dobController.text.trim().isEmpty) {
      AppToasts.showError(context, "Please select your date of birth");
      return;
    }

    if (inviteCaretaker) {
      if (caretakerNameController.text.trim().isEmpty) {
        AppToasts.showError(context, "Please enter caretaker name");
        return;
      }
      if (caretakerEmailController.text.trim().isEmpty) {
        AppToasts.showError(context, "Please enter caretaker email");
        return;
      }
      if (caretakerPhoneController.text.trim().length != 10) {
        AppToasts.showError(context, "Please enter valid 10-digit caretaker phone number");
        return;
      }
      if (caretakerPasswordController.text.trim().length < 6) {
        AppToasts.showError(context, "Caretaker password must be at least 6 characters");
        return;
      }
    }

    if (!isConsentChecked) {
      AppToasts.showError(context, "Please accept the Terms & Conditions and Privacy Policy");
      return;
    }

    final fullPhoneNumber = selectedCountryCode + phoneController.text.trim();
    final colors = context.themeColors;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
    );

    try {
      final checkResp = await ref.read(authProvider).checkIfPhoneRegistered(fullPhoneNumber);
      if (checkResp.status == ResponseStatus.SUCCESS && checkResp.data == true) {
        if (mounted) {
          Navigator.pop(context);
          AppToasts.showError(context, "This phone number is already registered. Please log in.");
        }
        return;
      }

      await ref.read(authProvider).sendFirebaseOTP(
        phone: fullPhoneNumber,
        onCodeSent: (verificationId, resendToken) {
          if (mounted) {
            Navigator.pop(context);
            _showOtpVerificationDialog(fullPhoneNumber, verificationId);
            AppToasts.showSuccess(context, "OTP sent to $fullPhoneNumber");
          }
        },
        onVerificationFailed: (FirebaseAuthException e) {
          if (mounted) {
            Navigator.pop(context);
            AppToasts.showError(context, e.message ?? "Firebase OTP failed");
          }
        },
      );
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        AppToasts.showError(context, "Registration error: $e");
      }
    }
  }

  void _showOtpVerificationDialog(String phone, String verificationId) {
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
                "Verify Phone Number",
                style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "Enter the 6-digit code sent to $phone to complete registration.",
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
                                smsCode: pinController.text,
                              );
                              final userCredential =
                                  await FirebaseAuth.instance.signInWithCredential(credential);
                              final idToken = await userCredential.user?.getIdToken();

                              if (idToken == null) {
                                throw Exception("Firebase ID token is null");
                              }

                              final data = {
                                "full_name": nameController.text.trim(),
                                "mobile_number": phone,
                                "dob": dobController.text.trim(),
                                "gender": selectedGender,
                                "token": idToken,
                                "termsAccepted": true,
                                "privacyPolicyAccepted": true,
                                "termsVersion": LegalContent.termsVersion,
                                "privacyPolicyVersion": LegalContent.privacyPolicyVersion,
                                if (inviteCaretaker) ...{
                                  "caretakerEmail": caretakerEmailController.text.trim(),
                                  "caretakerName": caretakerNameController.text.trim(),
                                  "caretakerRelation": selectedCaretakerRelation,
                                  "caretakerPhone": caretakerPhoneController.text.trim(),
                                  "caretakerPassword": caretakerPasswordController.text.trim(),
                                },
                              };

                              final response = await ref.read(authProvider).registerProfile(data);

                              if (!mounted) return;
                              Navigator.pop(context);

                              if (response.status == ResponseStatus.SUCCESS) {
                                if (selectedImage != null) {
                                  try {
                                    await ref.read(profileProvider).updateProfile(
                                      image: selectedImage,
                                    );
                                  } catch (uploadErr) {
                                    debugPrint("Registration profile image upload failed: $uploadErr");
                                  }
                                }

                                nameController.clear();
                                phoneController.clear();
                                dobController.clear();
                                caretakerNameController.clear();
                                caretakerEmailController.clear();
                                caretakerPhoneController.clear();
                                caretakerPasswordController.clear();
                                setState(() {
                                  selectedImage = null;
                                  inviteCaretaker = false;
                                });

                                AppToasts.showSuccess(context, "Account created successfully. Please log in.");
                                Navigator.pushAndRemoveUntil(
                                  context,
                                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                                  (route) => false,
                                );
                              } else {
                                AppToasts.showError(context, response.message);
                              }
                            } catch (e) {
                              if (context.mounted) {
                                setDialogState(() => dialogLoading = false);
                                AppToasts.showError(context, "Verification/Registration failed: $e");
                              }
                            }
                          },
                          child: const Text(
                            "Verify & Register",
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

  void _showImagePickerSheet() {
    final colors = context.themeColors;

    showModalBottomSheet(
      context: context,
      backgroundColor: colors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                "Select Profile Image",
                style: TextStyle(color: colors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _sheetOption(Icons.camera_alt, "Camera", () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.camera);
                  }, colors),
                  _sheetOption(Icons.photo, "Gallery", () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.gallery);
                  }, colors),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    if (source == ImageSource.camera) {
      var status = await Permission.camera.request();
      if (!status.isGranted) {
        AppToasts.showError(context, "Camera permission denied");
        return;
      }
    } else {
      var status = await Permission.photos.request();
      if (!status.isGranted) {
        AppToasts.showError(context, "Gallery permission denied");
        return;
      }
    }

    final XFile? file = await _picker.pickImage(
      source: source,
      imageQuality: 85,
    );

    if (file != null) {
      setState(() {
        selectedImage = File(file.path);
      });
    }
  }

  Widget _sheetOption(IconData icon, String label, VoidCallback onTap, AppThemeColors colors) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: colors.accentSubtle,
            child: Icon(icon, color: colors.accentPrimary, size: 26),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(color: colors.textPrimary, fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: CustomAppBar(
        title: "Create Account",
        showBackButton: true,
        onBack: () => Navigator.pop(context),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: size.height * 0.02),
                    Center(
                      child: Text(
                        "Your journey starts here",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: colors.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        "Start your healthy journey with simple details.",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: colors.textSecondary,
                        ),
                      ),
                    ),
                    SizedBox(height: size.height * 0.03),
                    Center(
                      child: _ProfileAvatar(
                        image: selectedImage,
                        onTap: _showImagePickerSheet,
                      ),
                    ),
                    SizedBox(height: size.height * 0.03),
                    _FormFields(
                      nameCont: nameController,
                      phoneCont: phoneController,
                      dobCont: dobController,
                      selectedGender: selectedGender,
                      onGenderChanged: (value) {
                        setState(() {
                          selectedGender = value;
                        });
                      },
                      selectedCountryCode: selectedCountryCode,
                      onCountryCodeTap: _showCountryCodePicker,
                    ),
                    const SizedBox(height: 15),
                    CheckboxListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        "Invite a Caretaker / Relative",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: colors.textPrimary,
                        ),
                      ),
                      subtitle: Text(
                        "Allow a relative (e.g. Son, Spouse) to monitor your medications and vitals in read-only mode.",
                        style: TextStyle(fontSize: 12, color: colors.textMuted),
                      ),
                      value: inviteCaretaker,
                      activeColor: colors.accentPrimary,
                      checkColor: colors.onAccentPrimary,
                      onChanged: (val) {
                        setState(() {
                          inviteCaretaker = val ?? false;
                        });
                      },
                    ),
                    if (inviteCaretaker) ...[
                      const SizedBox(height: 12),
                      _buildCaretakerField("Caretaker Full Name", "Enter caretaker name", caretakerNameController, colors),
                      const SizedBox(height: 12),
                      _buildCaretakerField("Caretaker Email", "Enter caretaker email", caretakerEmailController, colors, keyboardType: TextInputType.emailAddress),
                      const SizedBox(height: 12),
                      _buildCaretakerField(
                        "Caretaker Phone",
                        "Enter 10-digit phone number",
                        caretakerPhoneController,
                        colors,
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(10),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildCaretakerField(
                        "Caretaker Password",
                        "Enter caretaker password",
                        caretakerPasswordController,
                        colors,
                        obscureText: obscureCaretakerPassword,
                        suffix: Icon(
                          obscureCaretakerPassword
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: colors.textSecondary,
                          size: 20,
                        ),
                        suffixIconOnTap: () {
                          setState(() {
                            obscureCaretakerPassword = !obscureCaretakerPassword;
                          });
                        },
                      ),
                      const SizedBox(height: 15),
                      Text(
                        "Relationship",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: colors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: colors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: colors.border),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: selectedCaretakerRelation,
                            dropdownColor: colors.surface,
                            icon: Icon(Icons.keyboard_arrow_down, color: colors.textSecondary),
                            style: TextStyle(color: colors.textPrimary, fontSize: 16),
                            items: [
                              "Son",
                              "Daughter",
                              "Spouse",
                              "Parents",
                              "Sibling",
                              "Caretaker",
                              "Friend"
                            ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setState(() => selectedCaretakerRelation = val);
                              }
                            },
                          ),
                        ),
                      ),
                    ],
                    SizedBox(height: size.height * 0.02),
                  ],
                ),
              ),
            ),
            _BottomSection(
              size: size,
              isConsentChecked: isConsentChecked,
              onConsentChanged: (val) {
                setState(() {
                  isConsentChecked = val ?? false;
                });
              },
              onTapTerms: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const TermsAndConditionsScreen(),
                  ),
                );
              },
              onTapPrivacy: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const PrivacyPolicyScreen(),
                  ),
                );
              },
              onRegister: handleRegister,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCaretakerField(
    String title,
    String hint,
    TextEditingController controller,
    AppThemeColors colors, {
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    List<TextInputFormatter>? inputFormatters,
    Widget? suffix,
    VoidCallback? suffixIconOnTap,
  }) {
    return AppTextFormFieldTitled(
      controller: controller,
      title: title,
      hintText: hint,
      focusColor: colors.accentPrimary,
      fillColor: colors.surface,
      color: colors.textPrimary,
      borderColor: colors.border,
      textInputType: keyboardType,
      obscureText: obscureText,
      inputFormatters: inputFormatters,
      suffix: suffix,
      suffixIconOnTap: suffixIconOnTap,
      hintStyle: TextStyle(fontSize: 16, color: colors.textMuted),
      titleTextStyle: TextStyle(fontSize: 14, color: colors.textSecondary),
    );
  }
}

class _ProfileAvatar extends StatelessWidget {
  final File? image;
  final VoidCallback onTap;

  const _ProfileAvatar({this.image, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          Container(
            height: 120,
            width: 120,
            decoration: BoxDecoration(
              color: colors.cardSecondary,
              shape: BoxShape.circle,
              border: Border.all(color: colors.border, width: 2),
              image: image != null
                  ? DecorationImage(image: FileImage(image!), fit: BoxFit.cover)
                  : null,
            ),
            child: image == null
                ? Icon(Icons.person, size: 60, color: colors.textMuted)
                : null,
          ),
          Positioned(
            bottom: 10,
            right: 0,
            child: Container(
              height: 32,
              width: 32,
              decoration: BoxDecoration(
                color: colors.accentPrimary,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.edit, size: 16, color: colors.onAccentPrimary),
            ),
          ),
        ],
      ),
    );
  }
}

class _FormFields extends StatelessWidget {
  final TextEditingController nameCont;
  final TextEditingController phoneCont;
  final TextEditingController dobCont;
  final String selectedGender;
  final Function(String) onGenderChanged;
  final String selectedCountryCode;
  final VoidCallback onCountryCodeTap;

  const _FormFields({
    required this.nameCont,
    required this.phoneCont,
    required this.dobCont,
    required this.selectedGender,
    required this.onGenderChanged,
    required this.selectedCountryCode,
    required this.onCountryCodeTap,
  });

  Future<void> _selectDOB(
    BuildContext context,
    TextEditingController controller,
  ) async {
    DateTime now = DateTime.now();

    DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 18),
      firstDate: DateTime(1900),
      lastDate: now,
    );

    if (pickedDate != null) {
      String formatted =
          "${pickedDate.day.toString().padLeft(2, '0')}/"
          "${pickedDate.month.toString().padLeft(2, '0')}/"
          "${pickedDate.year}";

      controller.text = formatted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildField("Full Name", "Enter your full name", nameCont, colors),
        SizedBox(height: size.height * 0.01),
        AppTextFormFieldTitled(
          controller: phoneCont,
          title: "Contact",
          hintText: "Enter phone number",
          focusColor: colors.accentPrimary,
          fillColor: colors.surface,
          color: colors.textPrimary,
          textInputType: TextInputType.phone,
          inputFormatters: [LengthLimitingTextInputFormatter(10)],
          prefix: GestureDetector(
            onTap: onCountryCodeTap,
            behavior: HitTestBehavior.opaque,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  selectedCountryCode,
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
          borderColor: colors.border,
          hintStyle: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: colors.textMuted,
          ),
          titleTextStyle: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: colors.textSecondary,
          ),
        ),
        SizedBox(height: size.height * 0.01),
        GestureDetector(
          onTap: () => _selectDOB(context, dobCont),
          child: AbsorbPointer(
            child: _buildField("DOB", "DD/MM/YYYY", dobCont, colors),
          ),
        ),
        SizedBox(height: size.height * 0.01),
        GenderSection(
          selectedGender: selectedGender,
          onChanged: onGenderChanged,
        ),
      ],
    );
  }

  Widget _buildField(
    String title,
    String hint,
    TextEditingController controller,
    AppThemeColors colors, {
    bool obscureText = false,
    Widget? suffix,
    VoidCallback? suffixIconOnTap,
  }) {
    return AppTextFormFieldTitled(
      controller: controller,
      title: title,
      hintText: hint,
      focusColor: colors.accentPrimary,
      fillColor: colors.surface,
      color: colors.textPrimary,
      borderColor: colors.border,
      obscureText: obscureText,
      suffix: suffix,
      suffixIconOnTap: suffixIconOnTap,
      hintStyle: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: colors.textMuted,
      ),
      titleTextStyle: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: colors.textSecondary,
      ),
    );
  }
}

class _BottomSection extends StatelessWidget {
  final Size size;
  final bool isConsentChecked;
  final ValueChanged<bool?> onConsentChanged;
  final VoidCallback onTapTerms;
  final VoidCallback onTapPrivacy;
  final VoidCallback onRegister;

  const _BottomSection({
    required this.size,
    required this.isConsentChecked,
    required this.onConsentChanged,
    required this.onTapTerms,
    required this.onTapPrivacy,
    required this.onRegister,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Checkbox(
              value: isConsentChecked,
              activeColor: colors.accentPrimary,
              checkColor: colors.onAccentPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
              onChanged: onConsentChanged,
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
                      recognizer: TapGestureRecognizer()..onTap = onTapTerms,
                    ),
                    const TextSpan(text: " and "),
                    TextSpan(
                      text: "Privacy Policy",
                      style: TextStyle(
                        color: colors.accentMedium,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.underline,
                      ),
                      recognizer: TapGestureRecognizer()..onTap = onTapPrivacy,
                    ),
                    const TextSpan(text: "."),
                  ],
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: size.height * 0.015),
        CustomButton(
          onPressed: onRegister,
          buttonText: "Create Account",
          buttonColor: colors.accentPrimary,
          textStyle: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: colors.onAccentPrimary,
          ),
        ),
      ],
    );
  }
}
