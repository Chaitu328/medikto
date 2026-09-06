import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';

class TimeModel {
  String time;
  bool isEnabled;

  TimeModel({required this.time, this.isEnabled = true});
}

class TimingsSection extends StatefulWidget {
  const TimingsSection({super.key});

  @override
  State<TimingsSection> createState() => _TimingsSectionState();
}

class _TimingsSectionState extends State<TimingsSection> {
  List<TimeModel> times = [
    TimeModel(time: "04:30 PM", isEnabled: true),
    TimeModel(time: "08:30 PM", isEnabled: true),
  ];

  TimeOfDay selectedTime = const TimeOfDay(hour: 12, minute: 0);

  Future<void> _pickTime() async {
    final theme = context.themeColors;
    final isDark = context.isDarkMode;

    final picked = await showTimePicker(
      context: context,
      initialTime: selectedTime,
      initialEntryMode: TimePickerEntryMode.input,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: isDark
                ? ColorScheme.dark(
                    primary: theme.accentPrimary,
                    onPrimary: theme.onAccentPrimary,
                    surface: const Color(0xFF252525),
                    onSurface: Colors.white,
                  )
                : ColorScheme.light(
                    primary: theme.accentPrimary,
                    onPrimary: theme.onAccentPrimary,
                    surface: Colors.white,
                    onSurface: AppColors.lightTextPrimary,
                  ),
            dialogBackgroundColor: theme.surface,
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(foregroundColor: theme.accentPrimary),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => selectedTime = picked);
    }
  }

  String formatTime(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.period == DayPeriod.am ? "AM" : "PM";
    return "$hour:$minute $period";
  }

  void _addTime() {
    setState(() {
      times.add(TimeModel(time: formatTime(selectedTime)));
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.themeColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Timings & Alerts",
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: theme.accentMedium,
          ),
        ),
        const SizedBox(height: 15),

        /// 🔹 Time List
        ...times.asMap().entries.map((entry) {
          TimeModel item = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: theme.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: theme.borderSubtle),
            ),
            child: Row(
              children: [
                Icon(Icons.access_time, size: 18, color: theme.accentMedium),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.time,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: theme.textPrimary,
                    ),
                  ),
                ),
                Transform.scale(
                  scale: 0.8,
                  child: Switch(
                    value: item.isEnabled,
                    onChanged: (value) async {
                      if (!value) {
                        final shouldDisable = await showDialog<bool>(
                          context: context,
                          barrierDismissible: false,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: theme.surface,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            title: Row(
                              children: [
                                const Icon(Icons.warning_amber_rounded, color: Colors.amberAccent, size: 28),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    "Disable Notifications?",
                                    style: TextStyle(color: theme.textPrimary, fontSize: 17, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            content: Text(
                              "Switching off will stop critical notifications for the medicines.",
                              style: TextStyle(color: theme.textSecondary, fontSize: 14, height: 1.4),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: Text(
                                  "Keep Enabled",
                                  style: TextStyle(color: theme.accentMedium, fontWeight: FontWeight.bold),
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
                          setState(() => item.isEnabled = false);
                        }
                      } else {
                        setState(() => item.isEnabled = true);
                      }
                    },
                    activeColor: theme.accentPrimary,
                    activeTrackColor: theme.accentPrimary.withOpacity(0.3),
                    inactiveThumbColor: theme.textMuted,
                    inactiveTrackColor: theme.borderSubtle,
                    trackOutlineColor: WidgetStateProperty.all(
                      Colors.transparent,
                    ),
                  ),
                ),
              ],
            ),
          );
        }),

        const SizedBox(height: 20),

        /// 🔹 Add Time Controls
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: theme.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: theme.accentPrimary.withOpacity(0.25)),
          ),
          child: Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: _pickTime,
                  borderRadius: BorderRadius.circular(8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Select Reminder",
                        style: TextStyle(color: theme.textSecondary, fontSize: 10),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        formatTime(selectedTime),
                        style: TextStyle(
                          fontSize: 18,
                          color: theme.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              ElevatedButton.icon(
                onPressed: _addTime,
                icon: const Icon(Icons.add, size: 16),
                label: const Text("Add"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.accentPrimary,
                  foregroundColor: theme.onAccentPrimary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
