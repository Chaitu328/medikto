import 'dart:io';

import 'package:file_picker/file_picker.dart';
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

class AddPrescriptionFileScreen extends ConsumerStatefulWidget {
  const AddPrescriptionFileScreen({super.key});

  @override
  ConsumerState<AddPrescriptionFileScreen> createState() =>
      _AddPrescriptionFileScreenState();
}

class _AddPrescriptionFileScreenState
    extends ConsumerState<AddPrescriptionFileScreen> {
  final TextEditingController medicineNameController = TextEditingController();
  final TextEditingController dosageController = TextEditingController();

  File? selectedFile;
  List<Map<String, dynamic>> reminders = [];
  bool isLoading = false;
  final ImagePicker _picker = ImagePicker();

  Future<void> addReminderTime() async {
    final themeColors = context.themeColors;
    final isDark = context.isDarkMode;
    final TimeOfDay? pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      initialEntryMode: TimePickerEntryMode.input,
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
            timePickerTheme: TimePickerThemeData(
              backgroundColor: themeColors.surface,
              hourMinuteTextColor: themeColors.textPrimary,
              hourMinuteColor: themeColors.cardSecondary,
              dialHandColor: themeColors.accentPrimary,
              dialBackgroundColor: themeColors.cardSecondary,
              entryModeIconColor: themeColors.accentPrimary,
            ),
            dialogTheme: DialogThemeData(
              backgroundColor: themeColors.surface,
            ),
          ),
          child: child!,
        );
      },
    );

    if (pickedTime != null) {
      final now = DateTime.now();

      final dateTime = DateTime(
        now.year,
        now.month,
        now.day,
        pickedTime.hour,
        pickedTime.minute,
      );

      final formattedTime = TimeOfDay.fromDateTime(dateTime).format(context);

      setState(() {
        reminders.add({"time": formattedTime, "enabled": true});
      });
    }
  }

  void removeReminder(int index) {
    setState(() {
      reminders.removeAt(index);
    });
  }

  Future<void> pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    );

    if (result != null) {
      setState(() {
        selectedFile = File(result.files.single.path!);
      });
    }
  }

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
            "onTap": () async {
              Navigator.pop(context);
              await pickFromGallery();
            },
          },
          {
            "icon": Icons.camera_alt,
            "title": "Take a Photo",
            "onTap": () async {
              Navigator.pop(context);
              await pickFromCamera();
            },
          },
          {
            "icon": Icons.insert_drive_file,
            "title": "choose PDF files",
            "onTap": () async {
              Navigator.pop(context);
              await pickFile();
            },
          },
        ],
      ),
    );
  }

  Future<void> addPrescription() async {
    if (medicineNameController.text.trim().isEmpty) {
      AppToasts.showError(context, "Please enter medicine name");
      return;
    }

    setState(() {
      isLoading = true;
    });

    final response = await ref.read(
      addPrescriptionProvider({
        "medicineName": medicineNameController.text.trim(),
        "dosageInstructions": dosageController.text.trim(),
        "reminders": [],
        "file": selectedFile,
      }).future,
    );

    setState(() {
      isLoading = false;
    });

    if (response.status == ResponseStatus.SUCCESS) {
      AppToasts.showSuccess(context, response.message);
      ref.invalidate(getPrescriptionsProvider);

      Navigator.pop(context, true);
    } else {
      AppToasts.showError(context, response.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: CustomAppBar(
        title: "Prescription File",
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
                      controller: medicineNameController,
                      title: "Medicine Name",
                      hint: "Enter medicine name (e.g. Lipitor)",
                    ),

                    /// 🔹 DOSAGE FIELD
                    _buildTextField(
                      controller: dosageController,
                      title: "Dosage & Instructions",
                      hint: "e.g. 500mg, after breakfast",
                      maxLines: 4,
                    ),

                    SizedBox(height: size.height * 0.03),

                    /// 🔹 INTERACTIVE UPLOAD AREA
                    GestureDetector(
                      onTap: () => _showBottomSheet(context),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          vertical: 35,
                          horizontal: 20,
                        ),
                        decoration: BoxDecoration(
                          color: themeColors.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: themeColors.accentPrimary.withOpacity(0.2),
                            width: 1.5,
                          ),
                        ),
                        child: Column(
                          children: [
                            Container(
                              height: 54,
                              width: 54,
                              decoration: BoxDecoration(
                                color: themeColors.accentSubtle,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.upload_file_outlined,
                                color: themeColors.accentPrimary,
                                size: 30,
                              ),
                            ),
                            const SizedBox(height: 12),

                            Text(
                              selectedFile != null
                                  ? selectedFile!.path.split('/').last
                                  : "Upload Digital Prescription",
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: themeColors.textPrimary,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),

                            const SizedBox(height: 5),

                            Text(
                              "JPG, PNG or PDF (Max 10MB)",
                              style: TextStyle(
                                color: themeColors.textMuted,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    SizedBox(height: size.height * 0.04),
                  ],
                ),
              ),
            ),

            /// 🔹 ACTION BUTTON
            CustomButton(
              onPressed: isLoading ? null : addPrescription,
              buttonColor: themeColors.accentPrimary,
              buttonText: isLoading ? "Saving..." : "Save Prescription",
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
    required TextEditingController controller,
    required String title,
    required String hint,
    int maxLines = 1,
  }) {
    final themeColors = context.themeColors;
    return AppTextFormFieldTitled(
      controller: controller,
      title: title,
      hintText: hint,
      maxLines: maxLines,
      borderColor: themeColors.border,
      focusColor: themeColors.accentPrimary,
      fillColor: themeColors.surface,
      color: themeColors.textPrimary,
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
