import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/widgets/form_field_widget.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';

class AddSugarLevelsScreen extends ConsumerStatefulWidget {
  const AddSugarLevelsScreen({super.key});

  @override
  ConsumerState<AddSugarLevelsScreen> createState() =>
      _AddSugarLevelsScreenState();
}

class _AddSugarLevelsScreenState extends ConsumerState<AddSugarLevelsScreen> {
  final sugarController = TextEditingController();
  final dateController = TextEditingController();
  final timeController = TextEditingController();
  final notesController = TextEditingController();

  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    dateController.text = DateFormat("yyyy-MM-dd").format(now);
    timeController.text = DateFormat("HH:mm").format(now);
  }

  @override
  void dispose() {
    sugarController.dispose();
    dateController.dispose();
    timeController.dispose();
    notesController.dispose();
    super.dispose();
  }

  Future<void> selectTime() async {
    final theme = context.themeColors;
    final isDark = context.isDarkMode;

    final TimeOfDay? pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      initialEntryMode: TimePickerEntryMode.input,
      builder: (context, child) {
        return Theme(
          data: isDark
              ? ThemeData.dark().copyWith(
                  scaffoldBackgroundColor: theme.bg,
                  colorScheme: ColorScheme.dark(
                    primary: theme.accentPrimary,
                    onPrimary: theme.onAccentPrimary,
                    surface: const Color(0xFF1E1E1E),
                    onSurface: Colors.white,
                  ),
                  dialogTheme: const DialogThemeData(
                    backgroundColor: Color(0xFF1E1E1E),
                  ),
                )
              : ThemeData.light().copyWith(
                  scaffoldBackgroundColor: theme.bg,
                  colorScheme: ColorScheme.light(
                    primary: theme.accentPrimary,
                    onPrimary: theme.onAccentPrimary,
                    surface: Colors.white,
                    onSurface: AppColors.lightTextPrimary,
                  ),
                  dialogTheme: const DialogThemeData(
                    backgroundColor: Colors.white,
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
    final theme = context.themeColors;
    final isDark = context.isDarkMode;

    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
      builder: (context, child) {
        return Theme(
          data: isDark
              ? ThemeData.dark().copyWith(
                  scaffoldBackgroundColor: theme.bg,
                  colorScheme: ColorScheme.dark(
                    primary: theme.accentPrimary,
                    onPrimary: theme.onAccentPrimary,
                    surface: const Color(0xFF1E1E1E),
                    onSurface: Colors.white,
                  ),
                  dialogTheme: const DialogThemeData(
                    backgroundColor: Color(0xFF1E1E1E),
                  ),
                )
              : ThemeData.light().copyWith(
                  scaffoldBackgroundColor: theme.bg,
                  colorScheme: ColorScheme.light(
                    primary: theme.accentPrimary,
                    onPrimary: theme.onAccentPrimary,
                    surface: Colors.white,
                    onSurface: AppColors.lightTextPrimary,
                  ),
                  dialogTheme: const DialogThemeData(
                    backgroundColor: Colors.white,
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

  Future<void> addSugar() async {
    final sugar = int.tryParse(sugarController.text.trim());
    if (sugar == null || sugar <= 0) {
      AppToasts.showError(context, "Please enter valid blood sugar reading");
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
        .addSugar(
          sugarLevel: sugar,
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
    final theme = context.themeColors;
    final profileAsync = ref.watch(getProfileProvider);
    final isGuardian = profileAsync.value?.data is ProfileModel &&
        (profileAsync.value!.data as ProfileModel).role == 'guardian';

    final List<FormFieldModel> slFields = [
      FormFieldModel(
        title: "Blood Sugar Level",
        hint: "110",
        suffix: Text(
          "mg/dL",
          style: TextStyle(
            color: theme.textSecondary,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
        isRequired: true,
      ),
      FormFieldModel(title: "", hint: "", isRow: true, isRequired: true),
      FormFieldModel(
        title: "Notes (Optional)",
        hint: "e.g. Fasting, or 2 hours post-meal",
        maxLines: 3,
        isRequired: false,
      ),
    ];

    return Scaffold(
      backgroundColor: theme.bg,
      appBar: CustomAppBar(
        title: "Add Blood Sugar",
        onBack: () => Navigator.pop(context),
        backgroundColor: theme.bg,
        titleStyle: TextStyle(
          color: theme.textPrimary,
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
                        color: theme.card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: theme.borderSubtle),
                      ),
                      child: Row(
                        children: [
                          Container(
                            height: 40,
                            width: 40,
                            decoration: BoxDecoration(
                              color: theme.accentSubtle,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(Icons.water_drop_outlined, color: theme.accentMedium, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              "Enter your glucose reading in milligrams per deciliter (mg/dL).",
                              style: TextStyle(
                                color: theme.textSecondary,
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
                      fields: slFields,
                      controllers: [
                        sugarController,
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
                    onPressed: isLoading ? null : addSugar,
                    buttonText: isLoading ? "Please wait..." : "Save Record",
                    buttonColor: theme.accentPrimary,
                    textStyle: TextStyle(
                      color: theme.onAccentPrimary,
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
