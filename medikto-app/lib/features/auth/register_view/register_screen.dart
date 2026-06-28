import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/auth/data/providers/auth_providers.dart';
import 'package:medikto/features/auth/register_view/account_create_success.dart';
import 'package:medikto/features/auth/widgets/gender_selection_widget.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  // Dark Mode Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  // Controllers for all fields
  final nameController = TextEditingController();
  final phoneController = TextEditingController();
  final dobController = TextEditingController();
  // final aadharController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  String selectedGender = "Male"; // Default value for GenderSelectionWidget
  File? selectedImage;
  final ImagePicker _picker = ImagePicker();
  String selectedIdType = "Aadhaar";
  final govIdController = TextEditingController();

  Future<void> handleRegister() async {
    // 1. Basic Validation
    if (passwordController.text != confirmPasswordController.text) {
      AppToasts.showError(context, "Passwords do not match");
      return;
    }

    // 2. Show Loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: CircularProgressIndicator(color: Color(0xFF81DEEA)),
      ),
    );

    try {
      // 3. Prepare Data
      final data = {
        "full_name": nameController.text,
        "mobile_number": phoneController.text,
        "dob": dobController.text,
        "gender": selectedGender,

        /// ✅ NEW OPTIONAL ID
        "government_id_type": selectedIdType,
        "government_id_number": govIdController.text.isEmpty
            ? null
            : govIdController.text,

        "password": passwordController.text,
        "password_confirmation": confirmPasswordController.text,

        if (selectedImage != null)
          "profile_image": await MultipartFile.fromFile(
            selectedImage!.path,
            filename: "profile.jpg",
          ),
      };

      // 4. Call Manager
      final response = await ref.read(authProvider).registerProfile(data);

      if (!mounted) return;
      Navigator.pop(context); // Close loading dialog ONLY if still mounted

      if (response.status == ResponseStatus.SUCCESS) {
        AppToasts.showSuccess(context, response.message);

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const AccountCreateSuccess()),
        );
      } else {
        AppToasts.showError(context, response.message);
      }

      debugPrint(
        "Response Status: ${response.status} - Data: ${response.data}",
      );
    } catch (e) {
      // 5. Handle unexpected crashes (e.g., parsing errors, no internet)
      if (mounted) {
        Navigator.pop(context); // CRITICAL: Close the loader so UI isn't stuck
        AppToasts.showError(context, "Something went wrong. Please try again.");
      }
      debugPrint("Registration Crash Error: $e");
    }
  }

  void _showImagePickerSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: RegisterScreen.surfaceColor,
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

  Widget _sheetOption(IconData icon, String title, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: RegisterScreen.accentCyan,
            child: Icon(icon, color: Colors.black),
          ),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }
  
  
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light, // White icons for dark mode
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: Scaffold(
          backgroundColor: RegisterScreen.darkBg,
          body: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              children: [
                /// 🔹 SCROLLABLE CONTENT
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: size.height * 0.04),

                        /// 🔹 TITLE
                        const Center(
                          child: Text(
                            "Your journey starts here",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),

                        const SizedBox(height: 8),

                        const Center(
                          child: Text(
                            "Start your healthy journey with simple details.",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                              color: Colors.white54,
                            ),
                          ),
                        ),

                        SizedBox(height: size.height * 0.04),

                        /// 🔹 PROFILE IMAGE
                        Center(
                          child: _ProfileAvatar(
                            image: selectedImage,
                            onTap: _showImagePickerSheet,
                          ),
                        ),

                        SizedBox(height: size.height * 0.04),

                        /// 🔹 FORM FIELDS
                        _FormFields(
                          nameCont: nameController,
                          phoneCont: phoneController,
                          dobCont: dobController,
                          passCont: passwordController,
                          confirmPassCont: confirmPasswordController,
                          govIdController: govIdController,
                          selectedIdType: selectedIdType,
                          onIdTypeChanged: (val) {
                            setState(() => selectedIdType = val);
                          },
                          selectedGender: selectedGender,

                          onGenderChanged: (value) {
                            setState(() {
                              selectedGender = value;
                            });
                          },
                        ),

                        SizedBox(height: size.height * 0.02),
                      ],
                    ),
                  ),
                ),

                /// 🔥 BOTTOM SECTION
                _BottomSection(
                  size: size,
                  // onRegister: () => handleRegister(),
                  onRegister: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const AccountCreateSuccess(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfileAvatar extends StatelessWidget {
  final File? image;
  final VoidCallback onTap;

  const _ProfileAvatar({this.image, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          Container(
            height: 120,
            width: 120,
            decoration: BoxDecoration(
              color: const Color(0xFF252525),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white10, width: 2),
              image: image != null
                  ? DecorationImage(image: FileImage(image!), fit: BoxFit.cover)
                  : null,
            ),
            child: image == null
                ? const Icon(Icons.person, size: 60, color: Colors.white24)
                : null,
          ),
          Positioned(
            bottom: 10,
            right: 0,
            child: Container(
              height: 32,
              width: 32,
              decoration: const BoxDecoration(
                color: Color(0xFF81DEEA),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.edit, size: 16, color: Colors.black),
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
  final TextEditingController govIdController;
  final String selectedIdType;
  final Function(String) onIdTypeChanged;
  final TextEditingController passCont;
  final TextEditingController confirmPassCont;
  final String selectedGender;
  final Function(String) onGenderChanged;
  
  const _FormFields({
    required this.nameCont,
    required this.phoneCont,
    required this.dobCont,
    required this.govIdController,
    required this.passCont,
    required this.confirmPassCont,
    required this.selectedIdType,
    required this.onIdTypeChanged,
    required this.selectedGender,
    required this.onGenderChanged,
  });

  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  

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
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF81DEEA), // Cyan
              onPrimary: Colors.black,
              surface: Color(0xFF1E1E1E),
              onSurface: Colors.white,
            ),
            dialogBackgroundColor: const Color(0xFF1E1E1E),
          ),
          child: child!,
        );
      },
    );

    if (pickedDate != null) {
      /// ✅ DD/MM/YYYY FORMAT
      String formatted =
          "${pickedDate.day.toString().padLeft(2, '0')}/"
          "${pickedDate.month.toString().padLeft(2, '0')}/"
          "${pickedDate.year}";

      controller.text = formatted;
    }
  }

  

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildField("Full Name", "Enter your full name", nameCont),
        SizedBox(height: size.height * 0.01),

        AppTextFormFieldTitled(
          controller: phoneCont,
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

        SizedBox(height: size.height * 0.01),

        /// 🔹 DOB + GENDER
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => _selectDOB(context, dobCont),
                child: AbsorbPointer(
                  child: _buildField("DOB", "DD/MM/YYYY", dobCont),
                ),
              ),
            ),
            SizedBox(width: size.width * 0.04),
            Expanded(
              child: Expanded(
                child: GenderSection(
                  selectedGender: selectedGender,
                  onChanged: onGenderChanged,
                ),
              ),
            ), // Ensure internal widget is dark
          ],
        ),

        SizedBox(height: size.height * 0.01),

        // _buildField("Aadhar Number", "0000 0000 0000", aadharCont),
        // SizedBox(height: size.height * 0.02),
        const Text(
          "Government ID (Optional)",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white70,
          ),
        ),

        SizedBox(height: size.height * 0.01),

        /// 🔹 DROPDOWN
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white10),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: selectedIdType,
              dropdownColor: surfaceColor,
              icon: const Icon(
                Icons.keyboard_arrow_down,
                color: Colors.white54,
              ),
              style: const TextStyle(color: Colors.white),
              items: [
                "Aadhaar",
                "Passport",
                "Driving License",
              ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (val) {
                if (val != null) onIdTypeChanged(val);
              },
            ),
          ),
        ),

        SizedBox(height: size.height * 0.01),

        /// 🔹 ID INPUT FIELD
        AppTextFormFieldTitled(
          controller: govIdController,
          title: "$selectedIdType Number",
          hintText: selectedIdType == "Aadhaar"
              ? "0000 0000 0000"
              : "Enter $selectedIdType number",
          focusColor: accentCyan,
          fillColor: surfaceColor,
          color: Colors.white,
          borderColor: Colors.white10,
          textInputType: selectedIdType == "Aadhaar"
              ? TextInputType.number
              : TextInputType.text,
          inputFormatters: selectedIdType == "Aadhaar"
              ? [FilteringTextInputFormatter.digitsOnly]
              : [],
          hintStyle: const TextStyle(fontSize: 16, color: Colors.white24),
          titleTextStyle: const TextStyle(fontSize: 14, color: Colors.white70),
        ),

        SizedBox(height: size.height * 0.02),

        const Text(
          "Security",
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),

        SizedBox(height: size.height * 0.01),

        _buildField("New Password", "Enter your new password", passCont),
        SizedBox(height: size.height * 0.01),

        _buildField(
          "Confirm Password",
          "Re-enter your new password",
          confirmPassCont,
        ),
      ],
    );
  }

  Widget _buildField(
    String title,
    String hint,
    TextEditingController controller,
  ) {
    return AppTextFormFieldTitled(
      controller: controller, // Link the controller here
      title: title,
      hintText: hint,
      focusColor: accentCyan,
      fillColor: surfaceColor,
      color: Colors.white,
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
    );
  }
}

class _BottomSection extends StatelessWidget {
  final Size size;
  final VoidCallback onRegister; // Add this line

  const _BottomSection({required this.size, required this.onRegister});

  @override
  Widget build(BuildContext context) {
    const Color accentCyan = Color(0xFF81DEEA);

    return Column(
      children: [
        CustomButton(
          onPressed: onRegister, // Use the callback here
          buttonText: "Create Account",
          buttonColor: accentCyan,
          textStyle: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),

        SizedBox(height: size.height * 0.02),

        const Text.rich(
          textAlign: TextAlign.center,
          TextSpan(
            text: "By signing up, I agree to health safe ",
            style: TextStyle(fontSize: 11, color: Colors.white38),
            children: [
              TextSpan(
                text: "Terms of use ",
                style: TextStyle(
                  color: accentCyan,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextSpan(text: "and "),
              TextSpan(
                text: "Privacy Policy",
                style: TextStyle(
                  color: accentCyan,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        // SizedBox(height: size.height * 0.01),
      ],
    );
  }
}
