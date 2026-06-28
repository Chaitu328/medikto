import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/widgets/form_field_widget.dart';
import 'package:medikto/bottom_bar.dart';

class AddBloodPressureScreen extends ConsumerStatefulWidget {
  const AddBloodPressureScreen({super.key});

  @override
  ConsumerState<AddBloodPressureScreen> createState() =>
      _AddBloodPressureScreenState();
}

class _AddBloodPressureScreenState
    extends ConsumerState<AddBloodPressureScreen> {
  // Theme Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color accentCyan = Color(0xFF81DEEA);

  final systolicController = TextEditingController();
  final diastolicController = TextEditingController();
  final dateController = TextEditingController();
  final timeController = TextEditingController();
  final notesController = TextEditingController();

  bool isLoading = false;

  final List<FormFieldModel> bpFields = [
    FormFieldModel(
      title: "Systolic (max 120)",
      hint: "100",
      suffix: const Text(
        "mmHg",
        style: TextStyle(color: Colors.white54, fontSize: 12),
      ),
      isRequired: true,
    ),
    FormFieldModel(
      title: "Diastolic (max 80)",
      hint: "80",
      suffix: const Text(
        "mmHg",
        style: TextStyle(color: Colors.white54, fontSize: 12),
      ),
      isRequired: true,
    ),
    FormFieldModel(title: "", hint: "", isRow: true, isRequired: true),
    FormFieldModel(
      title: "Notes",
      hint: "Enter your notes",
      maxLines: 4,
      isRequired: false,
    ),
  ];

  Future<void> addBloodPressure() async {
    setState(() {
      isLoading = true;
    });

    /// DEBUG PRINTS
    print("DATE => ${dateController.text}");
    print("TIME => ${timeController.text}");

    final response = await ref
        .read(reportsProvider)
        .addBloodPressure(
          systolic: int.tryParse(systolicController.text.trim()) ?? 0,
          diastolic: int.tryParse(diastolicController.text.trim()) ?? 0,

          /// SEND CLEAN FORMAT
          date: dateController.text.trim(), // 2026-05-12
          time: "${timeController.text.trim()}:00", // 08:30:00

          notes: notesController.text.trim(),
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
  void dispose() {
    systolicController.dispose();
    diastolicController.dispose();
    dateController.dispose();
    timeController.dispose();
    notesController.dispose();
    super.dispose();
  }

  Future<void> selectTime() async {
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
            dialogTheme: DialogThemeData(
              backgroundColor: const Color(0xFF1E1E1E),
            ),
          ),
          child: child!,
        );
      },
    );

    if (pickedTime != null) {
      final hour = pickedTime.hour.toString().padLeft(2, '0');
      final minute = pickedTime.minute.toString().padLeft(2, '0');

      timeController.text = "$hour:$minute";
    }
  }

  Future<void> selectDate() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            scaffoldBackgroundColor: darkBg,
            colorScheme: const ColorScheme.dark(
              primary: accentCyan,
              surface: Color(0xFF1E1E1E),
              onSurface: Colors.white,
            ),
            dialogTheme: const DialogThemeData(
              backgroundColor: Color(0xFF1E1E1E),
            ),
            datePickerTheme: const DatePickerThemeData(
              backgroundColor: Color(0xFF1E1E1E),
              headerBackgroundColor: accentCyan,
              headerForegroundColor: Colors.black,
              dayForegroundColor: WidgetStatePropertyAll(Colors.white),
              todayForegroundColor: WidgetStatePropertyAll(Colors.white),
              yearForegroundColor: WidgetStatePropertyAll(Colors.white),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Blood Pressure",
        onBack: () => Navigator.pop(context),
        backgroundColor: darkBg,
        titleStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight,
                      ),
                      child: DynamicFormSection(
                        fields: bpFields,

                        /// PASS CONTROLLERS HERE
                        controllers: [
                          systolicController,
                          diastolicController,
                          dateController,
                          timeController,
                          notesController,
                        ],
                        onTimeTap: selectTime,
                        onDateTap: selectDate,
                      ),
                    ),
                  );
                },
              ),
            ),

            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
                child: RepaintBoundary(
                  child: CustomButton(
                    onPressed: isLoading ? null : addBloodPressure,
                    buttonText: isLoading ? "Please wait..." : "Add Record",
                    buttonColor: accentCyan,
                    textStyle: const TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
