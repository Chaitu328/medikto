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

class AddHeartRateScreen extends ConsumerStatefulWidget {
  const AddHeartRateScreen({super.key});

  @override
  ConsumerState<AddHeartRateScreen> createState() => _AddHeartRateScreenState();
}

class _AddHeartRateScreenState extends ConsumerState<AddHeartRateScreen> {
  // Theme Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  final heartRateController = TextEditingController();
  final dateController = TextEditingController();
  final timeController = TextEditingController();
  final notesController = TextEditingController();
  bool isLoading = false;

  final List<FormFieldModel> hrFields = [
    FormFieldModel(
      title: "Heart Rate",
      hint: "72",
      suffix: const Text(
        "BPM",
        style: TextStyle(
          color: Colors.white54,
          fontSize: 13,
          fontWeight: FontWeight.bold,
        ),
      ),
      isRequired: true,
    ),
    FormFieldModel(title: "", hint: "", isRow: true, isRequired: true),
    FormFieldModel(
      title: "Notes (Optional)",
      hint: "e.g. Measured at rest",
      maxLines: 3,
    ),
  ];

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    dateController.text = DateFormat("yyyy-MM-dd").format(now);
    timeController.text = DateFormat("HH:mm").format(now);
  }

  @override
  void dispose() {
    heartRateController.dispose();
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

  Future<void> addHeartRate() async {
    final hr = int.tryParse(heartRateController.text.trim());
    if (hr == null || hr <= 0) {
      AppToasts.showError(context, "Please enter valid heart rate");
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
        .addHeartRate(
          heartRate: hr,
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
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(getProfileProvider);
    final isGuardian = profileAsync.value?.data is ProfileModel &&
        (profileAsync.value!.data as ProfileModel).role == 'guardian';

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Add Heart Rate",
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
                    // Guidance banner
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
                            child: const Icon(Icons.favorite, color: accentCyan, size: 22),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              "Enter your pulse reading in beats per minute (BPM).",
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
                      fields: hrFields,
                      controllers: [
                        heartRateController,
                        notesController,
                        dateController,
                        timeController,
                      ],
                      onDateTap: selectDate,
                      onTimeTap: selectTime,
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
                    onPressed: isLoading ? null : addHeartRate,
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
