import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/widgets/form_field_widget.dart';

class AddSugarLevelsScreen extends ConsumerStatefulWidget {
  const AddSugarLevelsScreen({super.key});

  @override
  ConsumerState<AddSugarLevelsScreen> createState() =>
      _AddSugarLevelsScreenState();
}

class _AddSugarLevelsScreenState extends ConsumerState<AddSugarLevelsScreen> {

  static const Color darkBg = Color(0xFF121212);
  static const Color accentCyan = Color(0xFF81DEEA);

  final sugarController = TextEditingController();
  final dateController = TextEditingController();
  final timeController = TextEditingController();
  final notesController = TextEditingController();

  bool isLoading = false;

  final List<FormFieldModel> slFields = [
    FormFieldModel(
      title: "RBS Value",
      hint: "Enter RBS value",
      suffix: const Text(
        "mg/dL",
        style: TextStyle(
          color: Colors.white54,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
      isRequired: true,
    ),

    FormFieldModel(title: "", hint: "", isRow: true, isRequired: true),

    FormFieldModel(
      title: "Notes",
      hint: "Enter your notes, others",
      maxLines: 3,
      isRequired: false,
    ),
  ];

  Future<void> addSugar() async {
    setState(() {
      isLoading = true;
    });

    final response = await ref
        .read(reportsProvider)
        .addSugar(
          sugarLevel: int.tryParse(sugarController.text.trim()) ?? 0,

          date: dateController.text.trim(),

          time: "${timeController.text.trim()}:00",

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
  void dispose() {
    sugarController.dispose();
    dateController.dispose();
    timeController.dispose();
    notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,

      appBar: CustomAppBar(
        title: "Sugar Levels",
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
                    onPressed: isLoading ? null : addSugar,

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
