import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
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
  // Theme Colors
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);
  static const Color primaryBlue = Color(0xFF213598);
  File? selectedImage;
  final ImagePicker _picker = ImagePicker();

  final firstNameController = TextEditingController();
  final phoneController = TextEditingController();
  final bloodGroupController = TextEditingController();
  final ageController = TextEditingController();
  final heightController = TextEditingController();
  final weightController = TextEditingController();

  String selectedGender = "male";

  bool isLoading = false;
  bool isDataLoaded = false;

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
      phoneController.text = profile.phone ?? "";
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
    showModalBottomSheet(
      context: context,
      backgroundColor: surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Select Profile Image",
                style: TextStyle(color: Colors.white, fontSize: 18),
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
    // 🔥 Request permission
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

    // 🔥 Pick image
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
    if (isLoading) return;

    setState(() {
      isLoading = true;
    });

    try {
      final response = await ref
          .read(profileProvider)
          .updateProfile(
            firstName: firstNameController.text.trim(),
            phone: phoneController.text.trim(),
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

        /// REFRESH PROFILE
        ref.invalidate(getProfileProvider);

        /// SMALL DELAY FOR SMOOTH UX
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
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: accentCyan,
            child: Icon(icon, color: Colors.black),
          ),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }



  @override
  void dispose() {
    firstNameController.dispose();
    phoneController.dispose();
    bloodGroupController.dispose();
    ageController.dispose();
    heightController.dispose();
    weightController.dispose();
    super.dispose();
  }
  
  

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.sizeOf(context);

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
          child: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 20),
            child: Icon(Icons.info_outline_rounded, color: Colors.white),
          ),
        ],
        title: const Text(
          "Edit Profile",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
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

                  /// 🔹 Profile Image (Dark Mode Styling)
                  Align(
                    alignment: Alignment.center,
                    child: GestureDetector(
                      onTap: _showImagePickerSheet, // 👈 OPEN BOTTOM SHEET
                      child: Stack(
                        children: [
                          Container(
                            height: 120,
                            width: 120,
                            decoration: BoxDecoration(
                              color: surfaceColor,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white10,
                                width: 2,
                              ),

                              /// 🔥 SHOW IMAGE IF SELECTED
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

                            /// 🔥 DEFAULT ICON IF NO IMAGE
                            child:
                                (selectedImage == null &&
                                    !(isDataLoaded &&
                                        ref
                                                .read(getProfileProvider)
                                                .value
                                                ?.data
                                                ?.profilePic !=
                                            null))
                                ? const Icon(
                                    Icons.person,
                                    size: 60,
                                    color: Colors.white24,
                                  )
                                : null,
                          ),

                          /// 🔥 CAMERA BUTTON
                          Positioned(
                            bottom: 5,
                            right: 5,
                            child: Container(
                              height: 34,
                              width: 34,
                              decoration: BoxDecoration(
                                color: accentCyan,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.3),
                                    blurRadius: 5,
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.camera_alt,
                                size: 18,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
),
                  SizedBox(height: screenSize.height * 0.04),

                  const Text(
                    "Basic Details",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
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
                    focusColor: accentCyan,
                    fillColor: surfaceColor,
                    color: Colors.white,
                    textInputType: TextInputType.phone,
                    prefix: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 10),
                      child: Text(
                        "+91",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: accentCyan,
                        ),
                      ),
                    ),
                    borderColor: Colors.white10,
                    hintStyle: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w400,
                      color: Colors.white24,
                    ),
                    titleTextStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.white70,
                    ),
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
                        child:
                            GenderSection(
                          selectedGender: selectedGender,
                          onChanged: (value) {
                            setState(() {
                              selectedGender = value;
                            });
                          },
                        )
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
                  ), // Spacing for bottom button
                ],
              ),
            ),
          ),

          /// 🔥 Bottom Save Button
          Positioned(
            left: 20,
            right: 20,
            bottom: 20,
            child: CustomButton(
              onPressed: updateProfile,
              isLoading: isLoading,
              buttonColor: accentCyan, // Cyan pops better in Dark Mode
              buttonText: "Save Changes",
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold, 
                color: Colors.black,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// 🔥 Dark Mode Field Helper
  Widget _buildField({
    required TextEditingController controller,
    required String title,
    required String hint,
    IconData? suffixIcon,
  }) {
    return AppTextFormFieldTitled(
      controller: controller,
      focusColor: accentCyan,
      hintText: hint,
      hintStyle: const TextStyle(
        fontSize: 16,
        color: Colors.white24,
        fontWeight: FontWeight.w400,
      ),
      borderColor: Colors.white10,
      fillColor: surfaceColor,
      color: Colors.white,
      title: title,
      titleTextStyle: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: Colors.white70,
      ),
      suffixIcon: suffixIcon,
    );
  }
}
