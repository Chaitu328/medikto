import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';

class ReportIssueScreen extends StatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  final TextEditingController _descriptionController = TextEditingController();
  String _selectedCategory = "Bug / App Issue";
  bool _isSubmitting = false;

  final List<String> _categories = [
    "Bug / App Issue",
    "Medication Tracking",
    "Hospital Access / Sync",
    "Account & Login",
    "Prescription / Reports",
    "Other",
  ];

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submitIssue() async {
    final description = _descriptionController.text.trim();
    if (description.isEmpty) {
      AppToasts.showError(context, "Please enter a description of the issue.");
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final response = await dioClient.tokenRef!.post(
        ApiUrls.reportIssue,
        data: {
          "category": _selectedCategory,
          "description": description,
          "appVersion": "1.0.0",
          "platform": Theme.of(context).platform == TargetPlatform.iOS ? "iOS" : "Android",
        },
        options: Options(headers: {"Content-Type": "application/json"}),
      );

      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });

        if (response.statusCode == 200 || response.statusCode == 201) {
          AppToasts.showSuccess(context, "Your issue has been submitted successfully.");
          Navigator.pop(context);
        } else {
          final msg = response.data?["message"] ?? "Unable to submit your issue. Please try again.";
          AppToasts.showError(context, msg);
        }
      }
    } on DioException catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
        final msg = e.response?.data?["message"] ?? "Failed to connect to server. Please try again.";
        AppToasts.showError(context, msg);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
        AppToasts.showError(context, "An unexpected error occurred. Please try again.");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      appBar: AppBar(
        backgroundColor: darkBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Report an Issue",
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Tell us what went wrong",
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "Your feedback helps us resolve issues quickly. Our support team will receive this report directly.",
              style: TextStyle(
                color: Colors.white54,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),

            // Category Selection
            const Text(
              "Issue Category",
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.06)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCategory,
                  dropdownColor: surfaceColor,
                  isExpanded: true,
                  icon: const Icon(Icons.keyboard_arrow_down, color: accentCyan),
                  items: _categories.map((category) {
                    return DropdownMenuItem<String>(
                      value: category,
                      child: Text(
                        category,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedCategory = val;
                      });
                    }
                  },
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Description Input
            const Text(
              "Description",
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.06)),
              ),
              child: TextField(
                controller: _descriptionController,
                cursorColor: accentCyan,
                maxLines: 6,
                style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.5),
                decoration: const InputDecoration(
                  hintText: "Please describe the issue in detail (e.g. what happened, what you expected)...",
                  hintStyle: TextStyle(color: Colors.white30, fontSize: 13),
                  contentPadding: EdgeInsets.all(16),
                  border: InputBorder.none,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Info note
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: accentCyan.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: accentCyan.withOpacity(0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: accentCyan, size: 18),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      "Your account information will be attached automatically to help us diagnose the problem.",
                      style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Submit Button
            _isSubmitting
                ? const Center(
                    child: CircularProgressIndicator(color: accentCyan),
                  )
                : CustomButton(
                    onPressed: _submitIssue,
                    buttonText: "Submit Issue",
                    buttonColor: accentCyan,
                    textStyle: const TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
