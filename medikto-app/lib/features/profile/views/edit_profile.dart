import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/auth/widgets/gender_selection_widget.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:permission_handler/permission_handler.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  File? selectedImage;
  final ImagePicker _picker = ImagePicker();
  String selectedCountryCode = "+91";

  final firstNameController = TextEditingController();
  final phoneController = TextEditingController();
  final emailController = TextEditingController();
  final bloodGroupController = TextEditingController();
  final ageController = TextEditingController();
  final heightController = TextEditingController();
  final weightController = TextEditingController();

  String selectedGender = "male";

  bool isLoading = false;
  bool isDataLoaded = false;

  void _showCountryCodePicker() {
    final themeColors = context.themeColors;
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
          backgroundColor: themeColors.surface,
          title: Text(
            "Select Country Code",
            style: TextStyle(color: themeColors.textPrimary, fontWeight: FontWeight.bold),
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
                        style: TextStyle(color: themeColors.textPrimary),
                      ),
                      trailing: selectedCountryCode == c['code']
                          ? Icon(Icons.check, color: themeColors.accentPrimary)
                          : null,
                      onTap: () {
                        setState(() {
                          selectedCountryCode = c['code']!;
                        });
                        Navigator.pop(context);
                      },
                    );
                  }),
                  Divider(color: themeColors.border),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: TextField(
                      controller: customCodeController,
                      style: TextStyle(color: themeColors.textPrimary),
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        hintText: "Enter custom code (e.g. +353)",
                        hintStyle: TextStyle(color: themeColors.textMuted),
                        enabledBorder: UnderlineInputBorder(
                          borderSide: BorderSide(color: themeColors.border),
                        ),
                        focusedBorder: UnderlineInputBorder(
                          borderSide: BorderSide(color: themeColors.accentPrimary),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  CustomButton(
                    buttonText: "Apply Custom Code",
                    buttonColor: themeColors.accentPrimary,
                    textStyle: TextStyle(color: themeColors.onAccentPrimary, fontWeight: FontWeight.bold),
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

    WidgetsBinding.instance.addPostFrameCallback((_) {
      loadProfileData();
    });
  }

  Future<void> loadProfileData() async {
    final response = await ref.read(profileProvider).getProfile();

    if (response.status == ResponseStatus.SUCCESS) {
      final ProfileModel profile = response.data;

      firstNameController.text = profile.firstName ?? "";
      
      String rawPhone = profile.phone ?? "";
      if (rawPhone.startsWith("+")) {
        if (rawPhone.length > 10) {
          selectedCountryCode = rawPhone.substring(0, rawPhone.length - 10);
          phoneController.text = rawPhone.substring(rawPhone.length - 10);
        } else {
          selectedCountryCode = "+91";
          phoneController.text = rawPhone;
        }
      } else {
        selectedCountryCode = "+91";
        phoneController.text = rawPhone;
      }

      emailController.text = profile.email ?? "";
      bloodGroupController.text = profile.bloodGroup ?? "";
      ageController.text = profile.age?.toString() ?? "";
      heightController.text = profile.height?.toString() ?? "";
      weightController.text = profile.weight?.toString() ?? "";

      selectedGender = (profile.gender ?? "male").toLowerCase();

      setState(() {
        isDataLoaded = true;
      });
    }
  }

  void _showImagePickerSheet() {
    final themeColors = context.themeColors;
    showModalBottomSheet(
      context: context,
      backgroundColor: themeColors.surface,
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
                style: TextStyle(color: themeColors.textPrimary, fontSize: 18),
              ),
              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _sheetOption(Icons.camera_alt, "Camera", () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.camera);
                  }),
                  _sheetOption(Icons.photo, "Gallery", () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.gallery);
                  }),
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

    final picked = await _picker.pickImage(source: source, imageQuality: 70);

    if (picked != null) {
      setState(() {
        selectedImage = File(picked.path);
      });
    } else {
      debugPrint("No image selected");
    }
  }

  Future<void> updateProfile() async {
    if (phoneController.text.trim().length != 10) {
      AppToasts.showError(context, "Contact number must be exactly 10 digits");
      return;
    }

    if (isLoading) return;

    setState(() {
      isLoading = true;
    });

    try {
      final response = await ref
          .read(profileProvider)
          .updateProfile(
            firstName: firstNameController.text.trim(),
            phone: selectedCountryCode + phoneController.text.trim(),
            email: emailController.text.trim(),
            bloodGroup: bloodGroupController.text.trim(),
            gender: selectedGender.toLowerCase(),
            age: ageController.text.trim(),
            height: heightController.text.trim(),
            weight: weightController.text.trim(),
            image: selectedImage,
          );

      if (!mounted) return;

      setState(() {
        isLoading = false;
      });

      if (response.status == ResponseStatus.SUCCESS) {
        AppToasts.showSuccess(context, "Profile updated successfully");

        ref.invalidate(getProfileProvider);

        await Future.delayed(const Duration(milliseconds: 500));

        if (mounted) {
          Navigator.pop(context, true);
        }
      } else {
        AppToasts.showError(context, response.message);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
        });

        AppToasts.showError(context, "Something went wrong");
      }

      debugPrint("UPDATE PROFILE ERROR => $e");
    }
  }

  Widget _sheetOption(IconData icon, String title, VoidCallback onTap) {
    final themeColors = context.themeColors;
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: themeColors.accentSubtle,
            child: Icon(icon, color: themeColors.accentPrimary),
          ),
          const SizedBox(height: 8),
          Text(title, style: TextStyle(color: themeColors.textSecondary)),
        ],
      ),
    );
  }

  @override
  void dispose() {
    firstNameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    bloodGroupController.dispose();
    ageController.dispose();
    heightController.dispose();
    weightController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;
    final Size screenSize = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: AppBar(
        titleSpacing: 0,
        toolbarHeight: 60,
        backgroundColor: themeColors.bg,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        scrolledUnderElevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Icon(Icons.arrow_back_ios_new, color: themeColors.textPrimary),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 20),
            child: Icon(Icons.info_outline_rounded, color: themeColors.textPrimary),
          ),
        ],
        title: Text(
          "Edit Profile",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: themeColors.textPrimary,
          ),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(height: screenSize.height * 0.016),

                  /// 🔹 Profile Image
                  Align(
                    alignment: Alignment.center,
                    child: GestureDetector(
                      onTap: _showImagePickerSheet,
                      child: Stack(
                        children: [
                          Container(
                            height: 120,
                            width: 120,
                            decoration: BoxDecoration(
                              color: themeColors.surface,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: themeColors.border,
                                width: 2,
                              ),
                              image: selectedImage != null
                                  ? DecorationImage(
                                      image: FileImage(selectedImage!),
                                      fit: BoxFit.cover,
                                    )
                                  : isDataLoaded &&
                                          ref
                                                  .read(getProfileProvider)
                                                  .value
                                                  ?.data
                                                  ?.profilePic !=
                                              null &&
                                          ref
                                              .read(getProfileProvider)
                                              .value!
                                              .data
                                              .profilePic!
                                              .isNotEmpty
                                      ? DecorationImage(
                                          image: CachedNetworkImageProvider(
                                            "${ref.read(getProfileProvider).value!.data.profilePic!}?t=${DateTime.now().millisecondsSinceEpoch}",
                                          ),
                                          fit: BoxFit.cover,
                                        )
                                      : null,
                            ),
                            child: (selectedImage == null &&
                                    !(isDataLoaded &&
                                        ref
                                                .read(getProfileProvider)
                                                .value
                                                ?.data
                                                ?.profilePic !=
                                            null))
                                ? Icon(
                                    Icons.person,
                                    size: 60,
                                    color: themeColors.textMuted,
                                  )
                                : null,
                          ),

                          /// CAMERA BUTTON
                          Positioned(
                            bottom: 5,
                            right: 5,
                            child: Container(
                              height: 34,
                              width: 34,
                              decoration: BoxDecoration(
                                color: themeColors.accentPrimary,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.2),
                                    blurRadius: 5,
                                  ),
                                ],
                              ),
                              child: Icon(
                                Icons.camera_alt,
                                size: 18,
                                color: themeColors.onAccentPrimary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: screenSize.height * 0.04),

                  Text(
                    "Basic Details",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: themeColors.textPrimary,
                    ),
                  ),

                  SizedBox(height: screenSize.height * 0.02),

                  /// 🔹 Input Fields
                  _buildField(
                    controller: firstNameController,
                    title: "First Name",
                    hint: "Enter your first name",
                  ),

                  const SizedBox(height: 15),

                  AppTextFormFieldTitled(
                    controller: phoneController,
                    title: "Contact",
                    hintText: "Enter phone number",
                    focusColor: themeColors.accentPrimary,
                    fillColor: themeColors.surface,
                    color: themeColors.textPrimary,
                    textInputType: TextInputType.phone,
                    inputFormatters: [LengthLimitingTextInputFormatter(10)],
                    prefix: GestureDetector(
                      onTap: _showCountryCodePicker,
                      behavior: HitTestBehavior.opaque,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            selectedCountryCode,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: themeColors.accentPrimary,
                            ),
                          ),
                          Icon(
                            Icons.arrow_drop_down,
                            color: themeColors.textSecondary,
                            size: 18,
                          ),
                          const SizedBox(width: 4),
                        ],
                      ),
                    ),
                    borderColor: themeColors.border,
                    hintStyle: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w400,
                      color: themeColors.textMuted,
                    ),
                    titleTextStyle: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: themeColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 15),

                  _buildField(
                    controller: emailController,
                    title: "Email Address",
                    hint: "Enter your email address",
                    keyboardType: TextInputType.emailAddress,
                  ),

                  const SizedBox(height: 15),

                  _buildField(
                    controller: bloodGroupController,
                    title: "Blood Group",
                    hint: "Select Blood Group",
                    suffixIcon: Icons.keyboard_arrow_down_rounded,
                  ),

                  const SizedBox(height: 15),

                  /// 🔹 Age + Gender
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 1,
                        child: _buildField(
                          title: "Age",
                          hint: "Age",
                          controller: ageController,
                        ),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        flex: 2,
                        child: GenderSection(
                          selectedGender: selectedGender,
                          onChanged: (value) {
                            setState(() {
                              selectedGender = value;
                            });
                          },
                        ),
                      )
                    ],
                  ),

                  const SizedBox(height: 15),

                  /// 🔹 Height + Weight
                  Row(
                    children: [
                      Expanded(
                        child: _buildField(
                          controller: heightController,
                          title: "Height",
                          hint: "Cm",
                          suffixIcon: Icons.height,
                        ),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: _buildField(
                          controller: weightController,
                          title: "Weight",
                          hint: "Kg's",
                          suffixIcon: Icons.monitor_weight_outlined,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(
                    height: screenSize.height * 0.15,
                  ),
                ],
              ),
            ),
          ),

          /// Bottom Save Button
          Positioned(
            left: 20,
            right: 20,
            bottom: 20,
            child: CustomButton(
              onPressed: updateProfile,
              isLoading: isLoading,
              buttonColor: themeColors.accentPrimary,
              buttonText: "Save Changes",
              textStyle: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold, 
                color: themeColors.onAccentPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String title,
    required String hint,
    IconData? suffixIcon,
    TextInputType? keyboardType,
  }) {
    final themeColors = context.themeColors;
    return AppTextFormFieldTitled(
      controller: controller,
      focusColor: themeColors.accentPrimary,
      hintText: hint,
      textInputType: keyboardType,
      hintStyle: TextStyle(
        fontSize: 16,
        color: themeColors.textMuted,
        fontWeight: FontWeight.w400,
      ),
      borderColor: themeColors.border,
      fillColor: themeColors.surface,
      color: themeColors.textPrimary,
      title: title,
      titleTextStyle: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: themeColors.textSecondary,
      ),
      suffixIcon: suffixIcon,
    );
  }
}
