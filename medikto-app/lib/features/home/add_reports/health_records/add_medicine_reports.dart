import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
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
        ref.invalidate(getReportsProvider);

        Navigator.pop(context, true);
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
    final themeColors = context.themeColors;
    final isDark = context.isDarkMode;
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
      builder: (context, child) {
        return Theme(
          data: (isDark ? ThemeData.dark() : ThemeData.light()).copyWith(
            scaffoldBackgroundColor: themeColors.bg,
            colorScheme: ColorScheme(
              brightness: isDark ? Brightness.dark : Brightness.light,
              primary: themeColors.accentPrimary,
              onPrimary: themeColors.onAccentPrimary,
              secondary: themeColors.accentPrimary,
              onSecondary: themeColors.onAccentPrimary,
              error: AppColors.missedRed,
              onError: Colors.white,
              surface: themeColors.surface,
              onSurface: themeColors.textPrimary,
            ),
            dialogTheme: DialogThemeData(
              backgroundColor: themeColors.surface,
            ),
            datePickerTheme: DatePickerThemeData(
              backgroundColor: themeColors.surface,
              headerBackgroundColor: themeColors.accentPrimary,
              headerForegroundColor: themeColors.onAccentPrimary,
              dayForegroundColor: WidgetStatePropertyAll(themeColors.textPrimary),
              todayForegroundColor: WidgetStatePropertyAll(themeColors.accentPrimary),
              yearForegroundColor: WidgetStatePropertyAll(themeColors.textPrimary),
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
    final themeColors = context.themeColors;
    showModalBottomSheet(
      backgroundColor: themeColors.surface,
      constraints: const BoxConstraints(maxWidth: double.infinity),
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
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
    final themeColors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: CustomAppBar(
        title: "Medical Reports",
        backgroundColor: themeColors.bg,
        titleStyle: TextStyle(
          color: themeColors.textPrimary,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () => Navigator.pop(context),
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
                            suffix: Icon(
                              Icons.calendar_month_outlined,
                              color: themeColors.accentPrimary,
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
                            suffix: Icon(
                              Icons.keyboard_arrow_down_sharp,
                              color: themeColors.accentPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: size.height * 0.02),

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
                          color: themeColors.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: themeColors.accentPrimary.withOpacity(0.3),
                            width: 1.5,
                            style: BorderStyle.solid,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              height: 64,
                              width: 64,
                              decoration: BoxDecoration(
                                color: themeColors.accentSubtle,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.cloud_upload_outlined,
                                color: themeColors.accentPrimary,
                                size: 32,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              "Upload Medical Report",
                              style: TextStyle(
                                color: themeColors.textPrimary,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Support PDF, PNG, JPG (Max 5MB)",
                              style: TextStyle(
                                color: themeColors.textMuted,
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: themeColors.accentSubtle,
                                borderRadius: BorderRadius.circular(30),
                              ),
                              child: Text(
                                "Browse Files",
                                style: TextStyle(
                                  color: themeColors.accentPrimary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            if (selectedFile != null) ...[
                              const SizedBox(height: 12),
                              Text(
                                selectedFile!.path.split('/').last,
                                style: TextStyle(
                                  color: themeColors.textSecondary,
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
                  ],
                ),
              ),
            ),

            /// 🔹 SUBMIT BUTTON
            CustomButton(
              isLoading: isLoading,
              onPressed: uploadReport,
              buttonColor: themeColors.accentPrimary,
              buttonText: "Add Report",
              textStyle: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: themeColors.onAccentPrimary,
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
    final themeColors = context.themeColors;
    return AppTextFormFieldTitled(
      onTap: onTap,
      controller: controller,
      readOnly: readOnly,
      title: title,
      hintText: hint,
      maxLines: maxLines,
      borderColor: themeColors.border,
      focusColor: themeColors.accentPrimary,
      fillColor: themeColors.surface,
      color: themeColors.textPrimary,
      suffix: suffix,
      hintStyle: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: themeColors.textMuted,
      ),
      titleTextStyle: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: themeColors.textSecondary,
      ),
    );
  }
}
