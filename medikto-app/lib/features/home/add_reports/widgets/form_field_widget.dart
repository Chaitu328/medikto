import 'package:flutter/material.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';

class FormFieldModel {
  final String title;
  final String hint;
  final Widget? suffix;
  final int maxLines;
  final bool isRow;
  final bool isRequired;

  FormFieldModel({
    required this.title,
    required this.hint,
    this.suffix,
    this.maxLines = 1,
    this.isRow = false,
    this.isRequired = false,
  });
}

class DynamicFormSection extends StatelessWidget {
  final List<FormFieldModel> fields;

  final List<TextEditingController>? controllers;
  final VoidCallback? onTimeTap;
  final VoidCallback? onDateTap;

  const DynamicFormSection({
    super.key,
    required this.fields,
    this.controllers,
    this.onTimeTap,
    this.onDateTap,
  });

  // Dark Mode Palette constants
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);
  static const Color borderColor = Colors.white10;


  

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 10),

        ...fields.asMap().entries.map((entry) {
          final index = entry.key;
          final field = entry.value;
          /// 🔥 Special case (Row → Date & Time)
          if (field.isRow) {
            return Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Expanded(
                    child: AppTextFormFieldTitled(
                      readOnly: true,
                      onTap: onDateTap,
                      // controller: controllers?[index],
                      controller: controllers?[2],
                      
                      isRequired: field.isRequired,
                      borderColor: borderColor,
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
                      hintText: "DD.MM.YY",
                      title: "Date",
                      suffix: const Icon(
                        Icons.calendar_month_outlined,
                        color: accentCyan,
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppTextFormFieldTitled(
                      // controller: controllers?[index + 1],
                      controller: controllers?[3],
                      onTap: onTimeTap,
                      readOnly: true,
                      isRequired: field.isRequired,
                      borderColor: borderColor,
                      focusColor: accentCyan,
                      fillColor: surfaceColor,
                      color: Colors.white,
                      hintStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Colors.white24,
                      ),
                      titleTextStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Colors.white70,
                      ),
                      hintText: "00:00",
                      title: "Time",
                      suffix: const Icon(
                        Icons.access_time_rounded,
                        color: accentCyan,
                        size: 20,
                      ),
                    ),
),
                ],
              ),
            );
          }

          /// 🔥 Normal Field
          TextEditingController? controller;

          /// Blood Pressure
          if (field.title == "Systolic (max 120)") {
            controller = controllers?[0];
          } else if (field.title == "Diastolic (max 80)") {
            controller = controllers?[1];
          }
          /// Heart Rate
          else if (field.title == "Heart Rate") {
            controller = controllers?[0];
          }
          /// Temperature
          else if (field.title == "Body Temperature") {
            controller = controllers?[0];
          } else if (field.title == "RBS Value") {
            controller = controllers?[0];
          }
          /// Notes
          else if (field.title == "Notes") {
            controller = (controllers != null && controllers!.length > 4)
                ? controllers![4]
                : controllers?[1];
          }
          /// 🔥 Normal Field
          return Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: AppTextFormFieldTitled(
              controller: controller,
              isRequired: field.isRequired,
              borderColor: borderColor,
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
              title: field.title,
              hintText: field.hint,
              maxLines: field.maxLines,
              suffix: field.suffix,
            ),
          );
        }).toList(),

        const SizedBox(height: 20),
      ],
    );
  }
}
