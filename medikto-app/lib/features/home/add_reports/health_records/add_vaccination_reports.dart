import 'package:flutter/material.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/home/add_reports/widgets/form_field_widget.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/features/medications/widgets/reports_action_sheet.dart';

class AddVaccinationMedicationsScreen extends StatefulWidget {
  const AddVaccinationMedicationsScreen({super.key});

  @override
  State<AddVaccinationMedicationsScreen> createState() =>
      _AddVaccinationMedicationsScreenState();
}

class _AddVaccinationMedicationsScreenState
    extends State<AddVaccinationMedicationsScreen> {
  // Theme Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  final List<FormFieldModel> vrFields = [
    FormFieldModel(
      title: "Vaccine Name",
      hint: "Enter vaccine name",
      isRequired: true,
    ),
    FormFieldModel(
      title: "Description",
      hint: "Enter your vaccine description, others",
      maxLines: 3,
    ),
    FormFieldModel(title: "", hint: "", isRow: true, isRequired: true),
  ];

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
        title: "Vaccination Reports",
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
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: size.height * 0.02),

                    /// 🔹 FORM FIELDS (Automatically use dark theme logic)
                    DynamicFormSection(fields: vrFields),

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
                              "Upload Vaccination Certificate",
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Text(
                              "PDF or Image (Max 5MB)",
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

                    /// 🔹 ADD VACCINATION CARD
                    _buildAddVaccinationCard(),

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
              buttonText: "Add Report",
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

  Widget _buildAddVaccinationCard() {
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
                child: const Icon(Icons.vaccines_outlined, color: accentCyan),
              ),
              const SizedBox(width: 15),
              const Text(
                "Add Dose Info",
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
