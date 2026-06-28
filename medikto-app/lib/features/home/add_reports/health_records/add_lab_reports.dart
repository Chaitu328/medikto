import 'package:flutter/material.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/features/medications/widgets/reports_action_sheet.dart';

class AddLabMedicationsScreen extends StatefulWidget {
  const AddLabMedicationsScreen({super.key});

  @override
  State<AddLabMedicationsScreen> createState() =>
      _AddLabMedicationsScreenState();
}

class _AddLabMedicationsScreenState extends State<AddLabMedicationsScreen> {
  // Dark Mode Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  void _showBottomSheet(BuildContext context) {
    showModalBottomSheet(
      backgroundColor: surfaceColor,
      constraints: const BoxConstraints(maxWidth: double.infinity),
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const ReportActionsSheet(
        actions: [
          {"icon": Icons.photo, "title": "Choose from Gallery"},
          {"icon": Icons.camera_alt, "title": "Take a Photo"},
          {"icon": Icons.insert_drive_file, "title": "choose PDF files"},
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
        title: "Lab Reports",
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
                      title: "Lab Report Name",
                      hint: "Enter lab report name (e.g. Blood Panel)",
                    ),

                    /// 🔹 DESCRIPTION
                    _buildTextField(
                      title: "Description",
                      hint: "Enter your report description, clinic name, etc.",
                      maxLines: 3,
                    ),

                    SizedBox(height: size.height * 0.02),

                    /// 🔹 INTERACTIVE UPLOAD AREA
                    GestureDetector(
                      onTap: () => _showBottomSheet(context),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          vertical: 30,
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
                              height: 50,
                              width: 50,
                              decoration: BoxDecoration(
                                color: accentCyan.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.cloud_upload_outlined,
                                color: accentCyan,
                                size: 28,
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              "Upload Lab Report",
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Text(
                              "PDF, PNG or JPG (Max 5MB)",
                              style: TextStyle(
                                color: Colors.white38,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    SizedBox(height: size.height * 0.04),

                    /// 🔹 ADD LAB CARD
                    _buildAddLabReportCard(),

                    SizedBox(height: size.height * 0.05),
                  ],
                ),
              ),
            ),

            /// 🔹 SUBMIT BUTTON
            CustomButton(
              onPressed: () => Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(
                  builder: (_) => const BaseBottomNavigationPage(),
                ),
                (route) => false,
              ),
              buttonColor: accentCyan,
              buttonText: "Add Lab Report",
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
  }) {
    return AppTextFormFieldTitled(
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

  Widget _buildAddLabReportCard() {
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
                child: const Icon(Icons.biotech_outlined, color: accentCyan),
              ),
              const SizedBox(width: 15),
              const Text(
                "Add Lab Result",
                style: TextStyle(
                  fontSize: 18,
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
