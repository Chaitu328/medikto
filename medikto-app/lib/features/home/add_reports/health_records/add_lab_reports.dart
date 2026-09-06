import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
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
  void _showBottomSheet(BuildContext context) {
    final themeColors = context.themeColors;
    showModalBottomSheet(
      backgroundColor: themeColors.surface,
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
    final themeColors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: CustomAppBar(
        title: "Lab Reports",
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
                              height: 50,
                              width: 50,
                              decoration: BoxDecoration(
                                color: themeColors.accentSubtle,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.cloud_upload_outlined,
                                color: themeColors.accentPrimary,
                                size: 28,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              "Upload Lab Report",
                              style: TextStyle(
                                color: themeColors.textPrimary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              "PDF, PNG or JPG (Max 5MB)",
                              style: TextStyle(
                                color: themeColors.textMuted,
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
              buttonColor: themeColors.accentPrimary,
              buttonText: "Add Lab Report",
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
  }) {
    final themeColors = context.themeColors;
    return AppTextFormFieldTitled(
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

  Widget _buildAddLabReportCard() {
    final themeColors = context.themeColors;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: themeColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: themeColors.border),
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
                  color: themeColors.accentSubtle,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.biotech_outlined, color: themeColors.accentPrimary),
              ),
              const SizedBox(width: 15),
              Text(
                "Add Lab Result",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: themeColors.textPrimary,
                ),
              ),
            ],
          ),
          Icon(Icons.add_circle, color: themeColors.accentPrimary, size: 36),
        ],
      ),
    );
  }
}
