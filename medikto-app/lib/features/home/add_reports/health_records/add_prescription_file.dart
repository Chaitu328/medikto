import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/widgets/timings_widget.dart';
import 'package:medikto/features/medications/widgets/reports_action_sheet.dart';

class AddPrescriptionFileScreen extends ConsumerStatefulWidget {
  const AddPrescriptionFileScreen({super.key});

  @override
  ConsumerState<AddPrescriptionFileScreen> createState() =>
      _AddPrescriptionFileScreenState();
}

class _AddPrescriptionFileScreenState
    extends ConsumerState<AddPrescriptionFileScreen> {
  // Theme Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  final TextEditingController medicineNameController = TextEditingController();

  final TextEditingController dosageController = TextEditingController();

  File? selectedFile;

  /// SAMPLE REMINDERS
  /// Replace with your timings widget data if needed
  List<Map<String, dynamic>> reminders = [];

  bool isLoading = false;
  final ImagePicker _picker = ImagePicker();

  Future<void> addReminderTime() async {
    final TimeOfDay? pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            scaffoldBackgroundColor: darkBg,
            colorScheme: const ColorScheme.dark(
              primary: accentCyan,
              surface: Color(0xFF1E1E1E),
              onSurface: Colors.white,
            ),
            timePickerTheme: const TimePickerThemeData(
              backgroundColor: Color(0xFF1E1E1E),
              hourMinuteTextColor: Colors.white,
              hourMinuteColor: Color(0xFF2A2A2A),
              dialHandColor: accentCyan,
              dialBackgroundColor: Color(0xFF2A2A2A),
              entryModeIconColor: accentCyan,
            ),
            dialogTheme: const DialogThemeData(
              backgroundColor: Color(0xFF1E1E1E),
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
    showModalBottomSheet(
      backgroundColor: surfaceColor,
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

    if (reminders.isEmpty) {
      AppToasts.showError(context, "Please add at least one reminder");
      return;
    }

    setState(() {
      isLoading = true;
    });

    final response = await ref.read(
      addPrescriptionProvider({
        "medicineName": medicineNameController.text.trim(),
        "dosageInstructions": dosageController.text.trim(),
        "reminders": reminders,
        "file": selectedFile,
      }).future,
    );

    setState(() {
      isLoading = false;
    });

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
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Prescription File",
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

                    SizedBox(height: size.height * 0.01),

                    // const TimingsSection(),
                    SizedBox(height: size.height * 0.01),

                    /// 🔹 REMINDERS SECTION
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: surfaceColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                "Reminder Timings",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),

                              GestureDetector(
                                onTap: addReminderTime,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: accentCyan.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                  child: const Row(
                                    children: [
                                      Icon(
                                        Icons.add,
                                        color: accentCyan,
                                        size: 18,
                                      ),
                                      SizedBox(width: 4),
                                      Text(
                                        "Add Time",
                                        style: TextStyle(
                                          color: accentCyan,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 15),

                          reminders.isEmpty
                              ? const Center(
                                  child: Text(
                                    "No reminders added",
                                    style: TextStyle(color: Colors.white38),
                                  ),
                                )
                              : Column(
                                  children: List.generate(reminders.length, (
                                    index,
                                  ) {
                                    final reminder = reminders[index];

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 10),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 14,
                                        vertical: 12,
                                      ),
                                      decoration: BoxDecoration(
                                        color: darkBg,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Row(
                                            children: [
                                              const Icon(
                                                Icons.alarm,
                                                color: accentCyan,
                                              ),
                                              const SizedBox(width: 10),
                                              Text(
                                                reminder["time"],
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ],
                                          ),

                                          Row(
                                            children: [
                                              Switch(
                                                value: reminder["enabled"],
                                                activeThumbColor: accentCyan,
                                                onChanged: (value) {
                                                  setState(() {
                                                    reminders[index]["enabled"] =
                                                        value;
                                                  });
                                                },
                                              ),

                                              IconButton(
                                                onPressed: () =>
                                                    removeReminder(index),
                                                icon: const Icon(
                                                  Icons.delete_outline,
                                                  color: Colors.red,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    );
                                  }),
                                ),
                        ],
                      ),
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
                          color: surfaceColor,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: accentCyan.withOpacity(0.2),
                            width: 1.5,
                          ),
                        ),
                        child: Column(
                          children: [
                            Container(
                              height: 54,
                              width: 54,
                              decoration: BoxDecoration(
                                color: accentCyan.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.upload_file_outlined,
                                color: accentCyan,
                                size: 30,
                              ),
                            ),
                            const SizedBox(height: 12),

                            Text(
                              selectedFile != null
                                  ? selectedFile!.path.split('/').last
                                  : "Upload Digital Prescription",
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),

                            const SizedBox(height: 5),

                            const Text(
                              "JPG, PNG or PDF (Max 10MB)",
                              style: TextStyle(
                                color: Colors.white38,
                                fontSize: 11,
                              ),
                            ),
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

            /// 🔹 ACTION BUTTON
            CustomButton(
              onPressed: isLoading ? null : addPrescription,
              buttonColor: accentCyan,
              buttonText: isLoading ? "Saving..." : "Save Prescription",
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black,
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
    return AppTextFormFieldTitled(
      controller: controller,
      title: title,
      hintText: hint,
      maxLines: maxLines,
      borderColor: Colors.white10,
      focusColor: accentCyan,
      fillColor: surfaceColor,
      color: Colors.white,
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
                height: 44,
                width: 44,
                decoration: BoxDecoration(
                  color: accentCyan.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.medication_liquid_rounded,
                  color: accentCyan,
                  size: 24,
                ),
              ),
              const SizedBox(width: 15),
              const Text(
                "Add Another Medicine",
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
