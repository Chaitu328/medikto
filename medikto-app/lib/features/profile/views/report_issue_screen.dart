import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';

class ReportIssueScreen extends StatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
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
    final colors = context.themeColors;

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: const CustomAppBar(
        title: "Report an Issue",
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Tell us what went wrong",
              style: TextStyle(
                color: colors.textPrimary,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Your feedback helps us resolve issues quickly. Our support team will receive this report directly.",
              style: TextStyle(
                color: colors.textSecondary,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),

            // Category Selection
            Text(
              "Issue Category",
              style: TextStyle(
                color: colors.textSecondary,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: colors.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: colors.border),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCategory,
                  dropdownColor: colors.card,
                  isExpanded: true,
                  icon: Icon(Icons.keyboard_arrow_down, color: colors.accentMedium),
                  items: _categories.map((category) {
                    return DropdownMenuItem<String>(
                      value: category,
                      child: Text(
                        category,
                        style: TextStyle(
                          color: colors.textPrimary,
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
            Text(
              "Description",
              style: TextStyle(
                color: colors.textSecondary,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: colors.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: colors.border),
              ),
              child: TextField(
                controller: _descriptionController,
                cursorColor: colors.accentPrimary,
                maxLines: 6,
                style: TextStyle(color: colors.textPrimary, fontSize: 14, height: 1.5),
                decoration: InputDecoration(
                  hintText: "Please describe the issue in detail (e.g. what happened, what you expected)...",
                  hintStyle: TextStyle(color: colors.textMuted, fontSize: 13),
                  contentPadding: const EdgeInsets.all(16),
                  border: InputBorder.none,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Info note
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: colors.accentSubtle,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: colors.accentBorder),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: colors.accentMedium, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      "Your account information will be attached automatically to help us diagnose the problem.",
                      style: TextStyle(color: colors.textSecondary, fontSize: 12, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Submit Button
            _isSubmitting
                ? Center(
                    child: CircularProgressIndicator(color: colors.accentPrimary),
                  )
                : CustomButton(
                    onPressed: _submitIssue,
                    buttonText: "Submit Issue",
                    buttonColor: colors.accentPrimary,
                    textStyle: TextStyle(
                      color: colors.onAccentPrimary,
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
