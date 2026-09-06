import 'dart:io';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';
import 'package:medikto/features/medications/models/medication_model.dart';
import 'package:medikto/features/medications/views/activity_history_screen.dart';

class MedicationTiming {
  final TimeOfDay time;
  final String label;
  bool isNotificationEnabled;

  MedicationTiming({
    required this.time,
    required this.label,
    this.isNotificationEnabled = true,
  });

  String get formattedTime =>
      "${time.hourOfPeriod.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')} ${time.period == DayPeriod.am ? 'AM' : 'PM'}";
}

class MedicationVerificationScreen extends ConsumerStatefulWidget {
  final String? medicineName;
  final MedicationModel? medication;
  final bool? isEdit;
  final String? id;
  const MedicationVerificationScreen({
    super.key,
    this.medicineName,
    this.isEdit = false,
    this.medication,
    this.id,
  });

  @override
  ConsumerState<MedicationVerificationScreen> createState() =>
      _MedicationVerificationScreenState();
}

class _MedicationVerificationScreenState
    extends ConsumerState<MedicationVerificationScreen> {
  File? capturedImage;
  final ImagePicker _picker = ImagePicker();
  bool remindersEnabled = true;
  String selectedDosageAmount = "Morning"; // Default radio value
  String selectedUnit = "mg";
  String selectedFrequency = "daily";
  DateTime selectedStartDate = DateTime.now();
  bool isContinueMedication = false;
  int selectedDurationDays = 7;
  final TextEditingController customDaysController = TextEditingController(text: "7");

  final List<String> units = ["mg", "ml", "gm"];
  // List<String> selectedDosageTimings = [];
  // Replace your old _buildDosageRow() with this layout
  List<MedicationTiming> selectedDosageTimings = [];

  final TextEditingController medicationNameController =
      TextEditingController();

  final TextEditingController dosageController = TextEditingController();

  final TextEditingController instructionsController = TextEditingController();

  bool isLoading = false;

  String formatTimingForApi(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.period == DayPeriod.am ? "AM" : "PM";

    return "$hour:$minute $period";
  }

  @override
  void initState() {
    super.initState();

    if (widget.isEdit == true && widget.medication != null) {
      final med = widget.medication!;

      medicationNameController.text = med.name ?? "";
      dosageController.text = med.dosage?.toString() ?? "";
      instructionsController.text = med.instructions ?? "";

      if (units.contains(med.unit)) {
        selectedUnit = med.unit!;
      } else {
        selectedUnit = "mg";
      }

      remindersEnabled = med.notifications ?? true;
      selectedFrequency = med.frequency ?? "daily";

      if (med.startDate != null) {
        selectedStartDate = med.startDate!;
      }

      isContinueMedication = med.isContinue ?? false;
      if (med.duration != null && med.duration! > 0) {
        selectedDurationDays = med.duration!;
        customDaysController.text = med.duration.toString();
      }

      if (med.timings != null) {
        selectedDosageTimings = med.timings!.map((timeString) {
          final parsed = _parseTime(timeString);

          return MedicationTiming(
            time: parsed,
            label: "Dose",
            isNotificationEnabled: true,
          );
        }).toList();
      }
    }
  }

  TimeOfDay _parseTime(String time) {
    final format = time.split(" ");

    final timePart = format[0].split(":");

    int hour = int.parse(timePart[0]);
    int minute = int.parse(timePart[1]);

    final period = format[1];

    if (period == "PM" && hour != 12) {
      hour += 12;
    }

    if (period == "AM" && hour == 12) {
      hour = 0;
    }

    return TimeOfDay(hour: hour, minute: minute);
  }

  Future<void> _captureProofImage() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
    );

    if (image != null) {
      setState(() {
        capturedImage = File(image.path);
      });
    }
  }

  List<String> selectedTimings = [];

  void _showAddTimingBottomSheet() async {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;
    TimeOfDay? pickedTime = const TimeOfDay(hour: 8, minute: 30);
    final labelController = TextEditingController();
    bool isNotifyEnabled = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return SingleChildScrollView(
            child: Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                left: 24,
                right: 24,
                top: 10,
              ),
              decoration: BoxDecoration(
                color: colors.surface,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(28),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Drag Handle
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      margin: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: colors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  Text(
                    "Add Timing",
                    style: TextStyle(
                      color: colors.textPrimary,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),

                  Text(
                    "SELECT TIME",
                    style: TextStyle(
                      color: colors.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () async {
                      final time = await showTimePicker(
                        context: context,
                        initialTime: pickedTime!,
                        initialEntryMode: TimePickerEntryMode.input,
                        builder: (BuildContext context, Widget? child) {
                          return Theme(
                            data: (isDark ? ThemeData.dark() : ThemeData.light()).copyWith(
                              colorScheme: isDark
                                  ? ColorScheme.dark(
                                      primary: colors.accentPrimary,
                                      onPrimary: colors.onAccentPrimary,
                                      surface: colors.surface,
                                      onSurface: colors.textPrimary,
                                    )
                                  : ColorScheme.light(
                                      primary: colors.accentPrimary,
                                      onPrimary: colors.onAccentPrimary,
                                      surface: colors.surface,
                                      onSurface: colors.textPrimary,
                                    ),
                              timePickerTheme: TimePickerThemeData(
                                backgroundColor: colors.surface,
                                hourMinuteColor: colors.inputFill,
                                hourMinuteTextColor: colors.textPrimary,
                                dialBackgroundColor: colors.inputFill,
                                dialHandColor: colors.accentPrimary,
                                dialTextColor: colors.textPrimary,
                                entryModeIconColor: colors.accentPrimary,
                                helpTextStyle: TextStyle(
                                  color: colors.textSecondary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              textButtonTheme: TextButtonThemeData(
                                style: TextButton.styleFrom(
                                  foregroundColor: colors.accentPrimary,
                                ),
                              ),
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (time != null) setModalState(() => pickedTime = time);
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      decoration: BoxDecoration(
                        color: colors.inputFill,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: colors.borderSubtle),
                      ),
                      child: Center(
                        child: Text(
                          "${pickedTime!.hourOfPeriod.toString().padLeft(2, '0')} : ${pickedTime!.minute.toString().padLeft(2, '0')} ${pickedTime!.period == DayPeriod.am ? 'AM' : 'PM'}",
                          style: TextStyle(
                            color: colors.textPrimary,
                            fontSize: 42,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  Text(
                    "LABEL (OPTIONAL)",
                    style: TextStyle(
                      color: colors.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: labelController,
                    style: TextStyle(color: colors.textPrimary),
                    decoration: InputDecoration(
                      hintText: "e.g. Morning dose",
                      hintStyle: TextStyle(color: colors.textMuted),
                      suffixIcon: const Icon(
                        Icons.wb_sunny_outlined,
                        color: Colors.orangeAccent,
                        size: 20,
                      ),
                      filled: true,
                      fillColor: colors.inputFill,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: colors.borderSubtle),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: colors.borderSubtle),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  Text(
                    "NOTIFICATION FOR THIS TIME",
                    style: TextStyle(
                      color: colors.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: colors.inputFill,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: colors.borderSubtle),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.notifications_active,
                          color: colors.accentPrimary,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Enable Notification",
                                style: TextStyle(
                                  color: colors.textPrimary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                "Get reminded for this timing",
                                style: TextStyle(
                                  color: colors.textMuted,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Switch(
                          value: isNotifyEnabled,
                          activeColor: colors.accentPrimary,
                          onChanged: (val) async {
                            if (!val) {
                              final shouldDisable = await showDialog<bool>(
                                context: context,
                                barrierDismissible: false,
                                builder: (ctx) => AlertDialog(
                                  backgroundColor: colors.surface,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                  title: const Row(
                                    children: [
                                      Icon(Icons.warning_amber_rounded, color: Colors.amberAccent, size: 28),
                                      SizedBox(width: 10),
                                      Expanded(
                                        child: Text(
                                          "Disable Notifications?",
                                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
                                  ),
                                  content: Text(
                                    "Switching off will stop critical notifications for the medicines.",
                                    style: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.4),
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(ctx, false),
                                      child: Text(
                                        "Keep Enabled",
                                        style: TextStyle(color: colors.accentPrimary, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.pop(ctx, true),
                                      child: const Text(
                                        "Turn Off",
                                        style: TextStyle(color: Colors.redAccent),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                              if (shouldDisable == true) {
                                setModalState(() => isNotifyEnabled = false);
                              }
                            } else {
                              setModalState(() => isNotifyEnabled = true);
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Action Buttons matching design
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: colors.accentPrimary,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(27),
                        ),
                      ),
                      onPressed: () {
                        setState(() {
                          selectedDosageTimings.add(
                            MedicationTiming(
                              time: pickedTime!,
                              label: labelController.text.isEmpty
                                  ? "Dose"
                                  : labelController.text,
                              isNotificationEnabled: isNotifyEnabled,
                            ),
                          );
                        });
                        Navigator.pop(context);
                      },
                      child: Text(
                        "SAVE TIMING",
                        style: TextStyle(
                          color: colors.onAccentPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: colors.border),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(27),
                        ),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        "CANCEL",
                        style: TextStyle(
                          color: colors.textSecondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "VERIFICATION PROTOCOL",
                style: TextStyle(
                  color: colors.accentMedium,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                widget.isEdit == true ? "Edit medication" : "Add new medication",
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),

              /// 📝 2. MEDICATION FORM FIELDS
              AppTextFormFieldTitled(
                controller: medicationNameController,
                titleTextStyle: TextStyle(
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                title: "MEDICATION NAME",
                hintText: "e.g. Lisinopril",
                fillColor: colors.card,
                borderColor: colors.borderSubtle,
              ),
              const SizedBox(height: 15),

              Row(
                children: [
                  Expanded(
                    child: AppTextFormFieldTitled(
                      controller: dosageController,
                      titleTextStyle: TextStyle(
                        color: colors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                      title: "DOSAGE",
                      hintText: "50",
                      fillColor: colors.card,
                      borderColor: colors.borderSubtle,
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(child: _buildDropdownField("UNIT")),
                ],
              ),
              const SizedBox(height: 20),
              _buildFrequencyDropdown(),
              const SizedBox(height: 20),
              _buildTimingSection(),
              const SizedBox(height: 24),

              /// 🗓️ 3.5 COURSE DURATION & CONTINUOUS OPTION
              _buildCourseDurationSection(),
              const SizedBox(height: 20),

              /// ⏰ 4. SCHEDULED REMINDER CARD
              _buildNotificationToggleCard(),
              const SizedBox(height: 20),

              /// 🗒️ 5. PATIENT INSTRUCTIONS
              AppTextFormFieldTitled(
                controller: instructionsController,
                titleTextStyle: TextStyle(
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                title: "PATIENT INSTRUCTIONS",
                hintText: "Take with food, avoid alcohol...",
                fillColor: colors.card,
                maxLines: 3,
                borderColor: colors.borderSubtle,
              ),

              const SizedBox(height: 30),

              /// 🔥 6. ADD MEDICATION BUTTON
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.accentPrimary,
                  foregroundColor: colors.onAccentPrimary,
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
                onPressed: isLoading
                    ? null
                    : () async {
                        final name = medicationNameController.text.trim();
                        final dosageStr = dosageController.text.trim();
                        final dosage = int.tryParse(dosageStr);

                        if (name.isEmpty) {
                          AppToasts.showError(context, "Please enter a medication name");
                          return;
                        }
                        if (dosageStr.isEmpty || dosage == null || dosage <= 0) {
                          AppToasts.showError(context, "Please enter a valid dosage quantity");
                          return;
                        }
                        if (selectedDosageTimings.isEmpty) {
                          AppToasts.showError(context, "Please add at least one dosage timing");
                          return;
                        }

                        setState(() {
                          isLoading = true;
                        });

                        try {
                          final duration = isContinueMedication ? null : selectedDurationDays;

                          final medication = MedicationModel(
                            name: medicationNameController.text.trim(),
                            dosage: int.tryParse(dosageController.text.trim()),
                            unit: selectedUnit,
                            timings: selectedDosageTimings
                                .map((e) => e.formattedTime)
                                .toList(),
                            notifications: remindersEnabled,
                            instructions: instructionsController.text.trim(),
                            frequency: selectedFrequency,
                            startDate: selectedStartDate,
                            duration: duration,
                            isContinue: isContinueMedication,
                            status: "active",
                          );

                          ResponseData<dynamic> response;

                          if (widget.isEdit == true) {
                            response = await ref.read(
                              updateMedicationProvider({
                                "id": widget.id ?? "",
                                "medication": medication,
                              }).future,
                            );
                          } else {
                            response = await ref.read(
                              addMedicationProvider(medication).future,
                            );
                          }

                          if (!mounted) return;

                          if (response.status == ResponseStatus.SUCCESS) {
                            ref.invalidate(getMedicationsProvider);
                            ref.invalidate(getTodayScheduleProvider);

                            AppToasts.showSuccess(context, response.message);

                            Navigator.pop(context, true);
                          } else {
                            AppToasts.showError(context, response.message);
                          }
                        } catch (e) {
                          if (mounted) {
                            AppToasts.showError(
                              context,
                              "Failed to save medication: $e",
                            );
                          }
                        } finally {
                          if (mounted) {
                            setState(() {
                              isLoading = false;
                            });
                          }
                        }
                      },
                child: isLoading
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.black,
                        ),
                      )
                    : Text(
                        widget.isEdit == true
                            ? "UPDATE MEDICATION"
                            : "ADD MEDICATION",
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
              ),
              const SizedBox(height: 30),

              /// 4. RECENT ACTIVITY LIST
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "RECENT ACTIVITY",
                    style: TextStyle(
                      color: colors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ActivityHistoryScreen(),
                        ),
                      );
                    },
                    child: Text(
                      "View History",
                      style: TextStyle(
                        color: colors.accentMedium,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              Consumer(
                builder: (context, ref, child) {
                  final historyAsync = ref.watch(getTodayScheduleProvider);

                  return historyAsync.when(
                    loading: () => const Padding(
                      padding: EdgeInsets.all(20),
                      child: Center(child: CircularProgressIndicator()),
                    ),

                    error: (error, stack) => Padding(
                      padding: const EdgeInsets.all(20),
                      child: Text(
                        error.toString(),
                        style: TextStyle(color: colors.textPrimary),
                      ),
                    ),

                    data: (response) {
                      final List<dynamic> historyData = response.data ?? [];

                      if (historyData.isEmpty) {
                        return Padding(
                          padding: const EdgeInsets.all(20),
                          child: Text(
                            "No Recent Activity",
                            style: TextStyle(color: colors.textMuted),
                          ),
                        );
                      }

                      return Column(
                        children: historyData.take(3).map((item) {
                          final bool isTaken =
                              (item.status ?? "").toLowerCase() == "taken";

                          final Color statusColor = isTaken
                              ? AppColors.takenGreen
                              : AppColors.missedRed;

                          return _buildActivityTile(
                            item.name ?? "No Name",
                            "${item.time ?? ""} • ${item.verified == true ? "Verified" : "Not Verified"}",
                            (item.status ?? "").toUpperCase(),
                            statusColor,
                          );
                        }).toList(),
                      );
                    },
                  );
                },
              ),
              
              const SizedBox(height: 50),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimingSection() {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "TIMINGS",
              style: TextStyle(
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            GestureDetector(
              onTap: () => _showAddTimingBottomSheet(),
              child: Row(
                children: [
                  Text(
                    "Add Timing",
                    style: TextStyle(
                      color: colors.accentMedium,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.add,
                    color: colors.accentMedium,
                    size: 20,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...selectedDosageTimings
            .map((timing) => _buildTimingCard(timing))
            .toList(),
      ],
    );
  }

  Widget _buildTimingCard(MedicationTiming timing) {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    IconData timeIcon = Icons.wb_sunny_rounded;
    Color iconColor = Colors.yellow;

    int hour = timing.time.hour;
    if (hour >= 5 && hour < 12) {
      timeIcon = Icons.wb_twilight_rounded; // Morning
      iconColor = Colors.orangeAccent;
    } else if (hour >= 12 && hour < 17) {
      timeIcon = Icons.wb_sunny_rounded; // Afternoon
      iconColor = Colors.yellow;
    } else if (hour >= 17 && hour < 21) {
      timeIcon = Icons.wb_twilight_outlined; // Evening
      iconColor = Colors.deepOrangeAccent;
    } else {
      timeIcon = Icons.dark_mode_rounded; // Night
      iconColor = Colors.purpleAccent;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.borderSubtle),
        boxShadow: !isDark
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                )
              ]
            : null,
      ),
      child: Row(
        children: [
          Icon(timeIcon, color: iconColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  timing.label.isEmpty ? "Dose" : timing.label,
                  style: TextStyle(
                    color: colors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  timing.formattedTime,
                  style: TextStyle(
                    color: colors.accentMedium,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.notifications_active,
            color: colors.accentMedium,
            size: 18,
          ),
          const SizedBox(width: 6),
          Text(
            "Notification",
            style: TextStyle(color: colors.textMuted, fontSize: 12),
          ),
          Switch(
            value: timing.isNotificationEnabled,
            onChanged: (val) async {
              if (!val) {
                final shouldDisable = await showDialog<bool>(
                  context: context,
                  barrierDismissible: false,
                  builder: (ctx) => AlertDialog(
                    backgroundColor: colors.surface,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    title: const Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, color: Colors.amberAccent, size: 28),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            "Disable Notifications?",
                            style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    content: Text(
                      "Switching off will stop critical notifications for the medicines.",
                      style: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.4),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: Text(
                          "Keep Enabled",
                          style: TextStyle(color: colors.accentPrimary, fontWeight: FontWeight.bold),
                        ),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text(
                          "Turn Off",
                          style: TextStyle(color: Colors.redAccent),
                        ),
                      ),
                    ],
                  ),
                );
                if (shouldDisable == true) {
                  setState(() => timing.isNotificationEnabled = false);
                }
              } else {
                setState(() => timing.isNotificationEnabled = true);
              }
            },
            activeColor: colors.accentPrimary,
          ),
        ],
      ),
    );
  }

  Widget _timeDigit(String val) {
    final colors = context.themeColors;
    return Text(
      val,
      style: TextStyle(
        color: colors.textPrimary,
        fontSize: 48,
        fontWeight: FontWeight.w400,
      ),
    );
  }

  /// 🔹 Helper for the Unit Dropdown
  Widget _buildFrequencyDropdown() {
    final colors = context.themeColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "FREQUENCY",
          style: TextStyle(
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: colors.card,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              padding: EdgeInsets.zero,
              value: selectedFrequency,
              dropdownColor: colors.surface,
              icon: Icon(
                Icons.keyboard_arrow_down,
                color: colors.textMuted,
              ),
              onChanged: (String? newValue) {
                if (newValue != null) {
                  setState(() {
                    selectedFrequency = newValue;
                  });
                }
              },
              items: [
                DropdownMenuItem(
                  value: "daily",
                  child: Text(
                    "Daily",
                    style: TextStyle(color: colors.textPrimary, fontSize: 14),
                  ),
                ),
                DropdownMenuItem(
                  value: "weekly",
                  child: Text(
                    "Weekly",
                    style: TextStyle(color: colors.textPrimary, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownField(String title) {
    final colors = context.themeColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: colors.card,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              padding: EdgeInsets.zero,
              value: selectedUnit,
              dropdownColor: colors.surface,
              icon: Icon(
                Icons.keyboard_arrow_down,
                color: colors.textMuted,
              ),
              style: TextStyle(color: colors.textPrimary, fontSize: 16),
              items: units.map((unit) {
                return DropdownMenuItem(
                  value: unit,
                  child: Text(unit, style: TextStyle(color: colors.textPrimary)),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  selectedUnit = value!;
                });
              },
            ),
          ),
        ),
      ],
    );
  }

  /// 🔹 Helper for Course Duration & Continuous Option
  Widget _buildCourseDurationSection() {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;
    final now = DateTime.now();
    final isToday = selectedStartDate.year == now.year &&
        selectedStartDate.month == now.month &&
        selectedStartDate.day == now.day;
    final startDateStr = isToday
        ? "Today (${selectedStartDate.day}/${selectedStartDate.month}/${selectedStartDate.year})"
        : "${selectedStartDate.day}/${selectedStartDate.month}/${selectedStartDate.year}";

    final calculatedEndDate = selectedStartDate.add(Duration(days: selectedDurationDays - 1));
    final endDateStr = "${calculatedEndDate.day}/${calculatedEndDate.month}/${calculatedEndDate.year}";

    final durationChips = [3, 5, 7, 14, 30];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.borderSubtle),
        boxShadow: !isDark
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                )
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Row(
            children: [
              Icon(Icons.calendar_month_outlined, color: colors.accentPrimary, size: 20),
              const SizedBox(width: 8),
              Text(
                "MEDICATION DURATION",
                style: TextStyle(
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Start Date Picker Row
          InkWell(
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: selectedStartDate,
                firstDate: DateTime(2020),
                lastDate: DateTime(2040),
                builder: (context, child) {
                  return Theme(
                    data: (isDark ? ThemeData.dark() : ThemeData.light()).copyWith(
                      scaffoldBackgroundColor: colors.bg,
                      colorScheme: isDark
                          ? ColorScheme.dark(
                              primary: colors.accentPrimary,
                              surface: colors.surface,
                              onSurface: colors.textPrimary,
                            )
                          : ColorScheme.light(
                              primary: colors.accentPrimary,
                              surface: colors.surface,
                              onSurface: colors.textPrimary,
                            ),
                      dialogTheme: DialogThemeData(
                        backgroundColor: colors.surface,
                      ),
                    ),
                    child: child!,
                  );
                },
              );
              if (picked != null) {
                setState(() {
                  selectedStartDate = picked;
                });
              }
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: colors.cardSecondary,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: colors.borderSubtle),
              ),
              child: Row(
                children: [
                  Icon(Icons.play_circle_outline, color: colors.accentPrimary, size: 20),
                  const SizedBox(width: 10),
                  Text(
                    "Start Date: ",
                    style: TextStyle(color: colors.textSecondary, fontSize: 13),
                  ),
                  Text(
                    startDateStr,
                    style: TextStyle(
                      color: colors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  Icon(Icons.edit_calendar, color: colors.textMuted, size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // [✓] Continue (Long-term medication)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isContinueMedication ? colors.accentSubtle : colors.cardSecondary,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isContinueMedication ? colors.accentBorder : colors.borderSubtle,
              ),
            ),
            child: Row(
              children: [
                Checkbox(
                  value: isContinueMedication,
                  activeColor: colors.accentPrimary,
                  checkColor: colors.onAccentPrimary,
                  onChanged: (val) {
                    setState(() {
                      isContinueMedication = val ?? false;
                    });
                  },
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Continue until stopped",
                        style: TextStyle(
                          color: colors.textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        "For long-term medicines like BP or diabetes",
                        style: TextStyle(
                          color: colors.textMuted,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          if (!isContinueMedication) ...[
            const SizedBox(height: 16),
            Text(
              "COURSE DURATION",
              style: TextStyle(color: colors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            // Quick Day Chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: durationChips.map((days) {
                final isSelected = selectedDurationDays == days;
                return ChoiceChip(
                  label: Text("$days Days"),
                  selected: isSelected,
                  selectedColor: colors.accentPrimary,
                  backgroundColor: colors.cardSecondary,
                  labelStyle: TextStyle(
                    color: isSelected ? colors.onAccentPrimary : colors.textPrimary,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12,
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        selectedDurationDays = days;
                        customDaysController.text = days.toString();
                      });
                    }
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 12),

            // End Date summary badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: colors.cardSecondary,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: colors.borderSubtle),
              ),
              child: Row(
                children: [
                  Icon(Icons.event_available, color: colors.accentPrimary, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    "Ends: $endDateStr ($selectedDurationDays days)",
                    style: TextStyle(
                      color: colors.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _handleNotificationToggle(bool value) async {
    final colors = context.themeColors;
    if (!value) {
      final shouldDisable = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: colors.surface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.amberAccent, size: 28),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  "Disable Notifications?",
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: Text(
            "Switching off will stop critical notifications for the medicines.",
            style: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text(
                "Keep Enabled",
                style: TextStyle(color: colors.accentPrimary, fontWeight: FontWeight.bold),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text(
                "Turn Off",
                style: TextStyle(color: Colors.redAccent),
              ),
            ),
          ],
        ),
      );

      if (shouldDisable == true) {
        setState(() => remindersEnabled = false);
      }
    } else {
      setState(() => remindersEnabled = true);
    }
  }

  /// 🔹 Helper for the Reminder Card
  Widget _buildNotificationToggleCard() {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.borderSubtle),
        boxShadow: !isDark
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                )
              ]
            : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Notifications",
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                "Get alerts when your medicine is due",
                style: TextStyle(
                  color: colors.textMuted,
                  fontSize: 11,
                ),
              ),
            ],
          ),
          Transform.scale(
            scale: 0.85,
            child: Switch(
              materialTapTargetSize: MaterialTapTargetSize.padded,
              padding: EdgeInsets.zero,
              value: remindersEnabled,
              activeThumbColor: colors.accentPrimary,
              activeTrackColor: colors.accentSubtle,
              inactiveThumbColor: colors.textMuted,
              inactiveTrackColor: colors.cardSecondary,
              onChanged: _handleNotificationToggle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityTile(
    String name,
    String desc,
    String status,
    Color statusColor,
  ) {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    return Container(
      margin: const EdgeInsets.only(top: 15),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.borderSubtle),
        boxShadow: !isDark
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                )
              ]
            : null,
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: statusColor.withOpacity(0.1),
            child: Icon(
              name == "Omega-3" ? Icons.link : Icons.history,
              color: statusColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    color: colors.textPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  desc,
                  style: TextStyle(color: colors.textMuted, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: statusColor.withOpacity(0.5)),
            ),
            child: Row(
              children: [
                CircleAvatar(radius: 3, backgroundColor: statusColor),
                const SizedBox(width: 5),
                Text(
                  status,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    final colors = context.themeColors;

    return AppBar(
      backgroundColor: colors.bg,
      elevation: 0,
      leading: IconButton(
        onPressed: () => Navigator.pop(context),
        icon: Icon(Icons.arrow_back, color: colors.iconColor),
      ),
      actions: [
        IconButton(
          onPressed: () {},
          icon: Icon(Icons.notifications_none, color: colors.iconColor),
        ),
      ],
    );
  }
}
