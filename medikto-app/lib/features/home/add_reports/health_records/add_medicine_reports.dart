import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/medications/widgets/reports_action_sheet.dart';
import 'package:file_picker/file_picker.dart';

class AddMedicalMedicationsScreen extends ConsumerStatefulWidget {
  const AddMedicalMedicationsScreen({super.key});

  @override
  ConsumerState<AddMedicalMedicationsScreen> createState() =>
      _AddMedicalMedicationsScreenState();
}

class _AddMedicalMedicationsScreenState
    extends ConsumerState<AddMedicalMedicationsScreen> {
  // Dark Mode Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  final TextEditingController titleController = TextEditingController();

  final TextEditingController descriptionController = TextEditingController();

  final TextEditingController dateController = TextEditingController();

  final TextEditingController conditionController = TextEditingController();

  File? selectedFile;

  bool isLoading = false;

  String selectedType = "medical";

  final ImagePicker _picker = ImagePicker();

  Future<void> pickFromGallery() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      setState(() {
        selectedFile = File(image.path);
      });
    }
  }

  Future<void> pickFromCamera() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.camera);

    if (image != null) {
      setState(() {
        selectedFile = File(image.path);
      });
    }
  }

  Future<void> pickPdfFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
    );

    if (result != null) {
      setState(() {
        selectedFile = File(result.files.single.path!);
      });
    }
  }

  Future<void> uploadReport() async {
    if (titleController.text.trim().isEmpty) {
      AppToasts.showError(context, "Please enter report title");
      return;
    }

    if (dateController.text.trim().isEmpty) {
      AppToasts.showError(context, "Please select date");
      return;
    }

    if (selectedFile == null) {
      AppToasts.showError(context, "Please select file");
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final response = await ref.read(
        uploadMedicalReportProvider({
          "title": titleController.text.trim(),
          "description": descriptionController.text.trim(),
          "date": dateController.text.trim(),
          "condition": conditionController.text.trim().isEmpty
              ? "normal"
              : conditionController.text.trim(),
          "type": selectedType,
          "file": selectedFile!,
        }).future,
      );

      if (!mounted) return;

      if (response.status == ResponseStatus.SUCCESS) {
        AppToasts.showSuccess(context, response.message);

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const BaseBottomNavigationPage()),
          (route) => false,
        );
      } else {
        AppToasts.showError(context, response.message);
      }
    } catch (e) {
      AppToasts.showError(context, e.toString());
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Future<void> selectDate() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            scaffoldBackgroundColor: darkBg,
            colorScheme: const ColorScheme.dark(
              primary: accentCyan,
              surface: Color(0xFF1E1E1E),
              onSurface: Colors.white,
            ),
            dialogTheme: const DialogThemeData(
              backgroundColor: Color(0xFF1E1E1E),
            ),
            datePickerTheme: const DatePickerThemeData(
              backgroundColor: Color(0xFF1E1E1E),
              headerBackgroundColor: accentCyan,
              headerForegroundColor: Colors.black,
              dayForegroundColor: WidgetStatePropertyAll(Colors.white),
              todayForegroundColor: WidgetStatePropertyAll(Colors.white),
              yearForegroundColor: WidgetStatePropertyAll(Colors.white),
            ),
          ),
          child: child!,
        );
      },
    );

    if (pickedDate != null) {
      final day = pickedDate.day.toString().padLeft(2, '0');
      final month = pickedDate.month.toString().padLeft(2, '0');
      final year = pickedDate.year.toString();

      dateController.text = "$year-$month-$day";
    }
  }


void _showBottomSheet(BuildContext context) {
    showModalBottomSheet(
      backgroundColor: surfaceColor,
      constraints: const BoxConstraints(maxWidth: double.infinity),
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24),
      ),
      ),
      builder: (_) => ReportActionsSheet(
        actions: [
          {
            "icon": Icons.photo,
            "title": "Choose from Gallery",
            "onTap": () {
              Navigator.pop(context);
              pickFromGallery();
            },
          },
          {
            "icon": Icons.camera_alt,
            "title": "Take a Photo",
            "onTap": () {
              Navigator.pop(context);
              pickFromCamera();
            },
          },
          {
            "icon": Icons.insert_drive_file,
            "title": "Choose PDF files",
            "onTap": () {
              Navigator.pop(context);
              pickPdfFile();
            },
          },
        ],
      ),
    );
  }
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Medical Reports",
        backgroundColor: darkBg,
        titleStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            /// 🔹 FORM AREA
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: size.height * 0.02),

                    /// 🔹 NAME FIELD
                    _buildTextField(
                      controller: titleController,
                      title: "Medicine Report Name",
                      hint: "Enter medicine report name",
                    ),

                    /// 🔹 DESCRIPTION
                    _buildTextField(
                      controller: descriptionController,
                      title: "Description",
                      hint: "Enter your medicine description, others",
                      maxLines: 3,
                    ),

                    /// 🔹 DATE + CONDITION
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            onTap: selectDate,
                            readOnly: true,
                            controller: dateController,
                            title: "Date",
                            hint: "DD.MM.YY",
                            suffix: const Icon(
                              Icons.calendar_month_outlined,
                              color: accentCyan,
                              size: 20,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildTextField(
                            controller: conditionController,
                            title: "Condition",
                            hint: "Critical",
                            suffix: const Icon(
                              Icons.keyboard_arrow_down_sharp,
                              color: accentCyan,
                            ),
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: size.height * 0.02),

                    /// 🔹 UPLOAD IMAGE (Tinted for Dark Mode)
                    /// 🔹 INTERACTIVE UPLOAD AREA
                    GestureDetector(
                      onTap: () => _showBottomSheet(context),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          vertical: 40,
                          horizontal: 20,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E1E1E), // Surface Grey
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: const Color(
                              0xFF81DEEA,
                            ).withOpacity(0.3), // Cyan accent
                            width: 1.5,
                            style: BorderStyle
                                .solid, // Note: For dashed effect, use 'dotted_border' package
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Pulsing Icon Effect
                            Container(
                              height: 64,
                              width: 64,
                              decoration: BoxDecoration(
                                color: const Color(0xFF81DEEA).withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.cloud_upload_outlined,
                                color: Color(0xFF81DEEA),
                                size: 32,
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              "Upload Medical Report",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              "Support PDF, PNG, JPG (Max 5MB)",
                              style: TextStyle(
                                color: Colors.white38,
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Small decorative "Browse" button
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(
                                  0xFF81DEEA,
                                ).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(30),
                              ),
                              child: const Text(
                                "Browse Files",
                                style: TextStyle(
                                  color: Color(0xFF81DEEA),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              
                            ),
                            if (selectedFile != null) ...[
                              const SizedBox(height: 12),
                              Text(
                                selectedFile!.path.split('/').last,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: size.height * 0.04),

                    /// 🔹 ADD MEDICATION CARD
                    // _buildAddMedicationCard(),

                    // SizedBox(height: size.height * 0.05),
                  ],
                ),
              ),
            ),

            /// 🔹 SUBMIT BUTTON
            CustomButton(
              isLoading: isLoading,
              onPressed: uploadReport,
              buttonColor: accentCyan,
              buttonText: "Add Report",
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black, // Dark text on light button
              ),
            ),

            SizedBox(height: size.height * 0.03),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String title,
    required String hint,
    int maxLines = 1,
    Widget? suffix,
    TextEditingController? controller,
    bool readOnly = false,
    VoidCallback? onTap,
  }) {
    return AppTextFormFieldTitled(
      onTap: onTap,
      controller: controller,
      readOnly: readOnly,
      title: title,
      hintText: hint,
      maxLines: maxLines,
      borderColor: Colors.white10,
      focusColor: accentCyan,
      fillColor: surfaceColor,
      color: Colors.white,
      suffix: suffix,
      hintStyle: const TextStyle(
        fontSize: 14,
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

  Widget _buildAddMedicationCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: accentCyan.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Image.asset(
                  "assets/images/item2.png",
                  color: accentCyan,
                ),
              ),
              const SizedBox(width: 15),
              const Text(
                "Add Medication",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const Icon(Icons.add_circle, color: accentCyan, size: 36),
        ],
      ),
    );
  }

}
