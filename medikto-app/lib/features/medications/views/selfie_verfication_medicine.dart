import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path/path.dart' as path;

class SelfieVerficationMedicineScreen extends ConsumerStatefulWidget {
  final String? doseId;
  final String? medicineName;
  final String? dosage;
  final String? unit;
  const SelfieVerficationMedicineScreen({
    super.key,
    this.dosage,
    this.doseId,
    this.medicineName,
    this.unit,
  });

  @override
  ConsumerState<SelfieVerficationMedicineScreen> createState() =>
      _SelfieVerficationMedicineScreenState();
}

class _SelfieVerficationMedicineScreenState
    extends ConsumerState<SelfieVerficationMedicineScreen> {
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF00E5FF);
  bool isLoading = false;

  File? capturedImage;
  final ImagePicker _picker = ImagePicker();
  bool remindersEnabled = true;


  final TextEditingController medicationNameController =
      TextEditingController();
  final TextEditingController dosageController = TextEditingController();

  Future<File> compressImage(File file) async {
    final dir = await Directory.systemTemp.createTemp();

    final targetPath = path.join(
      dir.path,
      "${DateTime.now().millisecondsSinceEpoch}.jpg",
    );

    final compressedFile = await FlutterImageCompress.compressAndGetFile(
      file.path,
      targetPath,
      quality: 20,
      minWidth: 500,
      minHeight: 500,
      format: CompressFormat.jpeg,
    );

    return File(compressedFile!.path);
  }
Future<void> _captureProofImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.camera);

    if (image == null) return;

    setState(() {
      isLoading = true;
    });

    try {
      final originalFile = File(image.path);

      // 🔥 compressed image
      final compressedImage = await compressImage(originalFile);

      setState(() {
        capturedImage = compressedImage;
      });

      final response = await ref.read(
        verifyDoseSelfieProvider({
          "doseId": widget.doseId,
          "imageFile": compressedImage,
        }).future,
      );

      if (!mounted) return;

      if (response.status == ResponseStatus.SUCCESS) {
        ref.invalidate(getTodayScheduleProvider);
        AppToasts.showSuccess(context, response.message);

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

  @override
  void initState() {
    super.initState();

    medicationNameController.text = widget.medicineName ?? "";

    dosageController.text = widget.dosage ?? "";
  }

  @override
  void dispose() {
    medicationNameController.dispose();
    dosageController.dispose();
    super.dispose();
  }


  

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "VERIFICATION PROTOCOL",
                style: TextStyle(
                  color: accentCyan,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 5),
              const Text(
                "Today's Schedule",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 25),

              /// 1. CAMERA SCANNER FRAME
              _buildCameraFrame(),

              const SizedBox(height: 30),

              /// 2. VERIFY BUTTON
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentCyan,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
                onPressed: isLoading ? null : _captureProofImage,
                icon: isLoading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white54,
                        ),
                      )
                    : const Icon(Icons.camera_alt),
                label: Text(
                  isLoading ? "Verifying..." : "Verify with Selfie",
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              /// 3. LOGGING INFO
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: Colors.white38,
                    size: 14,
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      "AUTOMATIC DATE, TIME, AND LOCATION LOGGING ENABLED",
                      style: TextStyle(
                        color: Colors.white38,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 30),

              /// 📝 2. MEDICATION FORM FIELDS
              AppTextFormFieldTitled(
                controller: medicationNameController,
                readOnly: true,
                titleTextStyle: const TextStyle(
                  color: Colors.white54,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                title: "MEDICATION NAME",
                hintText: "e.g. Lisinopril",
                fillColor: surfaceColor,
                borderColor: Colors.white10,
              ),
              const SizedBox(height: 15),

              Row(
                children: [
                  Expanded(
                    child: AppTextFormFieldTitled(
                      controller: dosageController,
                      readOnly: true,
                      titleTextStyle: const TextStyle(
                        color: Colors.white54,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                      title: "DOSAGE",
                      hintText: "50",
                      fillColor: surfaceColor,
                      borderColor: Colors.white10,
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: _buildDropdownField("UNIT", widget.unit ?? ""),
                  ),
                ],
              ),
              // const SizedBox(height: 20),
              /// /// 📅 3. FREQUENCY & DOSAGE ROW
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDropdownField(String title, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          height: 54,
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 16),
              ),
              const Icon(Icons.keyboard_arrow_down, color: Colors.white54),
            ],
          ),
        ),
      ],
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: darkBg,
      elevation: 0,
      leading: IconButton(
        onPressed: () => Navigator.pop(context),
        icon: const Icon(Icons.arrow_back, color: Colors.white),
      ),
      // title: Text(
      //   "Medikto",
      //   style: TextStyle(
      //     color: accentCyan,
      //     fontWeight: FontWeight.bold,
      //     fontSize: 18,
      //   ),
      // ),
      actions: [
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.notifications_none, color: Colors.white),
        ),
      ],
    );
  }

  Widget _buildCameraFrame() {
    return Container(
      height: 280,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        image: capturedImage != null
            ? DecorationImage(
                image: FileImage(capturedImage!),
                fit: BoxFit.cover,
              )
            : null,
        color: surfaceColor,
      ),
      child: Stack(
        children: [
          /// 🌫 Dark overlay for better contrast
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              color: Colors.black.withOpacity(
                capturedImage != null ? 0.2 : 0.45,
              ),
            ),
          ),

          /// 🔥 CORNERS
          _buildCorner(top: 0, left: 0, angle: 0),
          _buildCorner(top: 0, right: 0, angle: 1.57),
          _buildCorner(bottom: 0, left: 0, angle: 4.71),
          _buildCorner(bottom: 0, right: 0, angle: 3.14),

          /// 📷 CENTER CONTENT
          if (capturedImage == null)
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.camera_alt, color: Colors.white54, size: 55),
                  SizedBox(height: 10),
                  Text(
                    "Tap to capture proof",
                    style: TextStyle(
                      color: Colors.white54,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

          // /// 📌 BOTTOM INSTRUCTION
          // Positioned(
          //   bottom: 18,
          //   left: 18,
          //   right: 18,
          //   child: Container(
          //     padding: const EdgeInsets.symmetric(
          //       horizontal: 16,
          //       vertical: 10,
          //     ),
          //     decoration: BoxDecoration(
          //       color: Colors.black.withOpacity(0.6),
          //       borderRadius: BorderRadius.circular(16),
          //       border: Border.all(
          //         color: const Color(0xFF00E5FF).withOpacity(0.4),
          //       ),
          //     ),
          //     child: const Text(
          //       "Tap to capture proof of medication",
          //       textAlign: TextAlign.center,
          //       style: TextStyle(
          //         color: Color(0xFF00E5FF),
          //         fontSize: 12,
          //         fontWeight: FontWeight.w600,
          //       ),
          //     ),
          //   ),
          // ),
        ],
      ),
    );
  }

  Widget _buildCorner({
    double? top,
    double? bottom,
    double? left,
    double? right,
    required double angle,
  }) {
    return Positioned(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: Transform.rotate(
        angle: angle,
        child: Container(
          height: 30,
          width: 30,
          decoration: const BoxDecoration(
            border: Border(
              top: BorderSide(color: accentCyan, width: 3),
              left: BorderSide(color: accentCyan, width: 3),
            ),
          ),
        ),
      ),
    );
  }
}
