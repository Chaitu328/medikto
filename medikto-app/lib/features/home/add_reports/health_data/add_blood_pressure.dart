import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/widgets/form_field_widget.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';

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
  static const Color surfaceColor = Color(0xFF1E1E1E);
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
      hint: "120",
      suffix: const Text(
        "mmHg",
        style: TextStyle(color: Colors.white54, fontSize: 13, fontWeight: FontWeight.bold),
      ),
      isRequired: true,
    ),
    FormFieldModel(
      title: "Diastolic (max 80)",
      hint: "80",
      suffix: const Text(
        "mmHg",
        style: TextStyle(color: Colors.white54, fontSize: 13, fontWeight: FontWeight.bold),
      ),
      isRequired: true,
    ),
    FormFieldModel(title: "", hint: "", isRow: true, isRequired: true),
    FormFieldModel(
      title: "Notes (Optional)",
      hint: "e.g. Taken after resting 10 mins",
      maxLines: 3,
      isRequired: false,
    ),
  ];

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    dateController.text = DateFormat("yyyy-MM-dd").format(now);
    timeController.text = DateFormat("HH:mm").format(now);
  }

  Future<void> addBloodPressure() async {
    final sys = int.tryParse(systolicController.text.trim());
    final dia = int.tryParse(diastolicController.text.trim());

    if (sys == null || sys <= 0) {
      AppToasts.showError(context, "Please enter valid systolic reading");
      return;
    }
    if (dia == null || dia <= 0) {
      AppToasts.showError(context, "Please enter valid diastolic reading");
      return;
    }
    if (dateController.text.trim().isEmpty) {
      AppToasts.showError(context, "Please select date");
      return;
    }
    if (timeController.text.trim().isEmpty) {
      AppToasts.showError(context, "Please select time");
      return;
    }

    setState(() {
      isLoading = true;
    });

    final response = await ref
        .read(reportsProvider)
        .addBloodPressure(
          systolic: sys,
          diastolic: dia,
          date: dateController.text.trim(),
          time: "${timeController.text.trim()}:00",
          notes: notesController.text.trim(),
        );

    setState(() {
      isLoading = false;
    });

    if (response.status == ResponseStatus.SUCCESS) {
      if (mounted) {
        AppToasts.showSuccess(context, response.message);
        ref.invalidate(getVitalsProvider);
        Navigator.pop(context, true);
      }
    } else {
      if (mounted) {
        AppToasts.showError(context, response.message);
      }
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
      initialEntryMode: TimePickerEntryMode.input,
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
              surface: const Color(0xFF1E1E1E),
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
    final profileAsync = ref.watch(getProfileProvider);
    final isGuardian = profileAsync.value?.data is ProfileModel &&
        (profileAsync.value!.data as ProfileModel).role == 'guardian';

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Add Blood Pressure",
        onBack: () => Navigator.pop(context),
        backgroundColor: darkBg,
        titleStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Elderly-friendly guidance banner
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: surfaceColor,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Row(
                        children: [
                          Container(
                            height: 40,
                            width: 40,
                            decoration: BoxDecoration(
                              color: accentCyan.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.favorite_outline, color: accentCyan, size: 22),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              "Enter your systolic and diastolic blood pressure readings below.",
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    DynamicFormSection(
                      fields: bpFields,
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
                  ],
                ),
              ),
            ),
            if (!isGuardian)
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
                  child: CustomButton(
                    onPressed: isLoading ? null : addBloodPressure,
                    buttonText: isLoading ? "Please wait..." : "Save Record",
                    buttonColor: accentCyan,
                    textStyle: const TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
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
