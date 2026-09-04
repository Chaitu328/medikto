import 'dart:io';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';
import 'package:medikto/features/medications/models/medication_model.dart';
import 'package:medikto/features/medications/views/activity_history_screen.dart';
import 'package:medikto/core/network/base_response.dart';

class MedicationTiming {
  final TimeOfDay time;
  final String label;
  bool
  isNotificationEnabled; // Changed to non-final so you can toggle it in the list

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
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF00E5FF);

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
    TimeOfDay? pickedTime = const TimeOfDay(hour: 8, minute: 30);
    final labelController = TextEditingController();
    bool isNotifyEnabled = true; // Local state for the popup

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
                color: surfaceColor, // Matches your app's dark background
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
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Text(
                    "Add Timing",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    "SELECT TIME",
                    style: TextStyle(
                      color: Colors.white54,
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
                            data: Theme.of(context).copyWith(
                              // 1. Set the background color of the dialog
                              colorScheme: ColorScheme.dark(
                                primary: accentCyan, // Header text & clock hand
                                onPrimary: Colors
                                    .black, // Text on top of primary (hand needle)
                                surface: surfaceColor, // Dialog background
                                onSurface: Colors.white, // Default text color
                              ),
                              // 2. Customizing specific picker styles
                              timePickerTheme: TimePickerThemeData(
                                backgroundColor: surfaceColor,
                                hourMinuteColor: Colors.white.withAlpha(13),
                                hourMinuteTextColor: Colors.white,
                                dialBackgroundColor: Colors.white.withAlpha(13),
                                dialHandColor: accentCyan,
                                dialTextColor: Colors.white,
                                entryModeIconColor: accentCyan,
                                helpTextStyle: const TextStyle(
                                  color: Colors.white70,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              textButtonTheme: TextButtonThemeData(
                                style: TextButton.styleFrom(
                                  foregroundColor:
                                      accentCyan, // Color for OK/CANCEL buttons
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
                        color: Colors.white.withAlpha(13),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(
                          "${pickedTime!.hourOfPeriod.toString().padLeft(2, '0')} : ${pickedTime!.minute.toString().padLeft(2, '0')} ${pickedTime!.period == DayPeriod.am ? 'AM' : 'PM'}",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 42,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    "LABEL (OPTIONAL)",
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: labelController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: "e.g. Morning dose",
                      hintStyle: const TextStyle(color: Colors.white24),
                      suffixIcon: const Icon(
                        Icons.wb_sunny_outlined,
                        color: Colors.orangeAccent,
                        size: 20,
                      ),
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.05),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    "NOTIFICATION FOR THIS TIME",
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.03),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.notifications_active,
                          color: accentCyan,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Enable Notification",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                "Get reminded for this timing",
                                style: TextStyle(
                                  color: Colors.white38,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Switch(
                          value: isNotifyEnabled,
                          activeColor: accentCyan,
                          onChanged: (val) =>
                              setModalState(() => isNotifyEnabled = val),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Action Buttons matching your design
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: accentCyan,
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
                      child: const Text(
                        "SAVE TIMING",
                        style: TextStyle(
                          color: Colors.black,
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
                        side: const BorderSide(color: Colors.white10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(27),
                        ),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text(
                        "CANCEL",
                        style: TextStyle(
                          color: Colors.white70,
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
                "Add new medication",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),

              /// 1. CAMERA SCANNER FRAME
              // _buildCameraFrame(),

              // const SizedBox(height: 30),

              /// 2. VERIFY BUTTON
              // ElevatedButton.icon(
              //   style: ElevatedButton.styleFrom(
              //     backgroundColor: accentCyan,
              //     foregroundColor: Colors.black,
              //     minimumSize: const Size(double.infinity, 56),
              //     shape: RoundedRectangleBorder(
              //       borderRadius: BorderRadius.circular(30),
              //     ),
              //   ),
              //   onPressed: () => _captureProofImage(),
              //   icon: const Icon(Icons.camera_alt),
              //   label: const Text(
              //     "Verify with Selfie",
              //     style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              //   ),
              // ),

              // const SizedBox(height: 20),

              /// 3. LOGGING INFO
              // Row(
              //   mainAxisAlignment: MainAxisAlignment.center,
              //   children: [
              //     const Icon(
              //       Icons.info_outline,
              //       color: Colors.white38,
              //       size: 14,
              //     ),
              //     const SizedBox(width: 8),
              //     const Expanded(
              //       child: Text(
              //         "AUTOMATIC DATE, TIME, AND LOCATION LOGGING ENABLED",
              //         style: TextStyle(
              //           color: Colors.white38,
              //           fontSize: 9,
              //           fontWeight: FontWeight.bold,
              //         ),
              //       ),
              //     ),
              //   ],
              // ),
              // SizedBox(height: 30),

              /// 📝 2. MEDICATION FORM FIELDS
              AppTextFormFieldTitled(
                controller: medicationNameController,
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
                titleTextStyle: const TextStyle(
                  color: Colors.white54,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                title: "PATIENT INSTRUCTIONS",
                hintText: "Take with food, avoid alcohol...",
                fillColor: surfaceColor,
                maxLines: 3,
                borderColor: Colors.white10,
              ),

              const SizedBox(height: 30),

              /// 🔥 6. ADD MEDICATION BUTTON
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentCyan,
                  foregroundColor: Colors.black,
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
                  const Text(
                    "RECENT ACTIVITY",
                    style: TextStyle(
                      color: Colors.white,
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
                    child: const Text(
                      "View History",
                      style: TextStyle(color: accentCyan, fontSize: 12),
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
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),

                    data: (response) {
                      final List<dynamic> historyData = response.data ?? [];

                      if (historyData.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.all(20),
                          child: Text(
                            "No Recent Activity",
                            style: TextStyle(color: Colors.white54),
                          ),
                        );
                      }

                      return Column(
                        children: historyData.take(3).map((item) {
                          final bool isTaken =
                              (item.status ?? "").toLowerCase() == "taken";

                          final Color statusColor = isTaken
                              ? Colors.teal
                              : Colors.redAccent;

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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              "TIMINGS",
              style: TextStyle(
                color: Colors.white54,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            GestureDetector(
              onTap: () => _showAddTimingBottomSheet(),
              child: const Row(
                children: [
                  Text(
                    "Add Timing",
                    style: TextStyle(
                      color: accentCyan,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(Icons.add, color: accentCyan, size: 20),
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
    // Logic for icon based on time of day
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
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
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
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  timing.formattedTime,
                  style: const TextStyle(color: accentCyan, fontSize: 13),
                ),
              ],
            ),
          ),
          const Icon(Icons.notifications_active, color: accentCyan, size: 18),
          const SizedBox(width: 6),
          const Text(
            "Notification",
            style: TextStyle(color: Colors.white54, fontSize: 12),
          ),
          Switch(
            value: timing.isNotificationEnabled,
            onChanged: (val) =>
                setState(() => timing.isNotificationEnabled = val),
            activeColor: accentCyan,
          ),
        ],
      ),
    );
  }

  Widget _timeDigit(String val) {
    return Text(
      val,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 48,
        fontWeight: FontWeight.w400,
      ),
    );
  }

  /// 🔹 Helper for the Unit Dropdown
  Widget _buildFrequencyDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "FREQUENCY",
          style: TextStyle(
            color: Colors.white54,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: Colors.white10),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              padding: EdgeInsets.zero,
              value: selectedFrequency,
              dropdownColor: surfaceColor,
              icon: const Icon(
                Icons.keyboard_arrow_down,
                color: Colors.white54,
              ),
              onChanged: (String? newValue) {
                if (newValue != null) {
                  setState(() {
                    selectedFrequency = newValue;
                  });
                }
              },
              items: const [
                DropdownMenuItem(
                  value: "daily",
                  child: Text(
                    "Daily",
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ),
                DropdownMenuItem(
                  value: "weekly",
                  child: Text(
                    "Weekly",
                    style: TextStyle(color: Colors.white, fontSize: 14),
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
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          // height: 54,
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: Colors.white10),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              padding: EdgeInsets.zero,
              value: selectedUnit,
              dropdownColor: surfaceColor,
              icon: const Icon(
                Icons.keyboard_arrow_down,
                color: Colors.white54,
              ),
              style: const TextStyle(color: Colors.white, fontSize: 16),

              items: units.map((unit) {
                return DropdownMenuItem(value: unit, child: Text(unit));
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

  /// 🔹 Helper for Frequency Chips
  // Widget _buildFrequencyChip(String label, bool isSelected) {
  //   return Container(
  //     margin: const EdgeInsets.only(right: 10),
  //     padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
  //     decoration: BoxDecoration(
  //       color: isSelected ? accentCyan : Colors.transparent,
  //       borderRadius: BorderRadius.circular(25),
  //       border: Border.all(color: isSelected ? accentCyan : Colors.white10),
  //       boxShadow: isSelected
  //           ? [BoxShadow(color: accentCyan.withOpacity(0.3), blurRadius: 10)]
  //           : null,
  //     ),
  //     child: Text(
  //       label,
  //       style: TextStyle(
  //         color: isSelected ? Colors.black : Colors.white,
  //         fontWeight: FontWeight.bold,
  //         fontSize: 14,
  //       ),
  //     ),
  //   );
  // }

  /// 🔹 Helper for Course Duration & Continuous Option
  Widget _buildCourseDurationSection() {
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
        color: surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withAlpha(14)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          const Row(
            children: [
              Icon(Icons.calendar_month_outlined, color: accentCyan, size: 20),
              SizedBox(width: 8),
              Text(
                "MEDICATION DURATION",
                style: TextStyle(
                  color: Colors.white70,
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
                    data: ThemeData.dark().copyWith(
                      colorScheme: const ColorScheme.dark(
                        primary: accentCyan,
                        surface: surfaceColor,
                        onSurface: Colors.white,
                      ),
                      dialogBackgroundColor: surfaceColor,
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
                color: Colors.white.withAlpha(10),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.play_circle_outline, color: accentCyan, size: 20),
                  const SizedBox(width: 10),
                  const Text(
                    "Start Date: ",
                    style: TextStyle(color: Colors.white60, fontSize: 13),
                  ),
                  Text(
                    startDateStr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  const Icon(Icons.edit_calendar, color: Colors.white38, size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // [✓] Continue (Ongoing long-term medication)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isContinueMedication ? accentCyan.withAlpha(25) : Colors.white.withAlpha(8),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isContinueMedication ? accentCyan.withAlpha(80) : Colors.white10,
              ),
            ),
            child: Row(
              children: [
                Checkbox(
                  value: isContinueMedication,
                  activeColor: accentCyan,
                  checkColor: Colors.black,
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
                      const Text(
                        "Continue indefinitely",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        "For ongoing conditions (BP, Sugar) — repeats daily until stopped",
                        style: TextStyle(
                          color: isContinueMedication ? Colors.white70 : Colors.white38,
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
            const Text(
              "COURSE DURATION",
              style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
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
                  selectedColor: accentCyan,
                  backgroundColor: Colors.white.withAlpha(12),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.black : Colors.white,
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
                color: Colors.white.withAlpha(8),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.event_available, color: accentCyan, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    "Ends: $endDateStr ($selectedDurationDays days)",
                    style: const TextStyle(
                      color: Colors.white70,
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
    if (!value) {
      final shouldDisable = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: surfaceColor,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.amberAccent, size: 28),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  "Disable Notifications?",
                  style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: const Text(
            "Switching off will stop critical notifications for the medicines.",
            style: TextStyle(color: Colors.white70, fontSize: 14, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text(
                "Keep Enabled",
                style: TextStyle(color: accentCyan, fontWeight: FontWeight.bold),
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withAlpha(14)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Notifications",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 2),
              Text(
                "Receive alerts when doses are due",
                style: TextStyle(
                  color: Colors.white38,
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
              activeThumbColor: accentCyan,
              activeTrackColor: accentCyan.withAlpha(60),
              inactiveThumbColor: Colors.white24,
              inactiveTrackColor: Colors.white10,
              onChanged: _handleNotificationToggle,
            ),
          ),
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

  Widget _buildActivityTile(
    String name,
    String desc,
    String status,
    Color statusColor,
  ) {
    return Container(
      margin: const EdgeInsets.only(top: 15),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
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
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  desc,
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
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
    return AppBar(
      backgroundColor: darkBg,
      elevation: 0,
      leading: IconButton(
        onPressed: () => Navigator.pop(context),
        icon: const Icon(Icons.arrow_back, color: Colors.white),
      ),
      // title: const Row(
      //   children: [
      //     CircleAvatar(
      //       radius: 15,
      //       backgroundColor: Colors.white12,
      //       child: Icon(Icons.person, color: Colors.white, size: 18),
      //     ),
      //     SizedBox(width: 10),
      //     Text(
      //       "Medikto",
      //       style: TextStyle(
      //         color: accentCyan,
      //         fontWeight: FontWeight.bold,
      //         fontSize: 18,
      //       ),
      //     ),
      //   ],
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
}
