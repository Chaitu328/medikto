import 'package:flutter/material.dart';

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
  // Theme Colors consistent with your designs
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);
  static const Color textSecondary = Colors.white54;

  List<TimeModel> times = [
    TimeModel(time: "04:30 PM", isEnabled: true),
    TimeModel(time: "08:30 PM", isEnabled: false),
  ];

  TimeOfDay selectedTime = const TimeOfDay(hour: 12, minute: 0);

  /// 🔥 Dark Mode Time Picker
  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: selectedTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              // 🔥 Switched to Dark
              primary: accentCyan,
              onPrimary: Colors.black,
              surface: Color(0xFF252525),
              onSurface: Colors.white,
            ),
            dialogBackgroundColor: const Color(0xFF1E1E1E),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(foregroundColor: accentCyan),
            ),
            timePickerTheme: const TimePickerThemeData(
              backgroundColor: Color(0xFF1E1E1E),
              hourMinuteTextColor: accentCyan,
              hourMinuteColor: Colors.white10,
              dayPeriodTextColor: accentCyan,
              dayPeriodColor: Colors.white10,
              dialHandColor: accentCyan,
              dialBackgroundColor: Colors.white10,
              entryModeIconColor: accentCyan,
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Timings & Alerts",
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: accentCyan, // Section header in brand Cyan
            
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
              color: surfaceColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                const Icon(Icons.access_time, size: 18, color: accentCyan),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.time,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                ),
                Transform.scale(
                  scale: 0.8,
                  child: Switch(
                    value: item.isEnabled,
                    onChanged: (value) =>
                        setState(() => item.isEnabled = value),
                    activeColor: accentCyan,
                    activeTrackColor: accentCyan.withOpacity(0.3),
                    inactiveThumbColor: Colors.white24,
                    inactiveTrackColor: Colors.black26,
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
            color: surfaceColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: accentCyan.withOpacity(0.2)),
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
                      const Text(
                        "Select Reminder",
                        style: TextStyle(color: textSecondary, fontSize: 10),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        formatTime(selectedTime),
                        style: const TextStyle(
                          fontSize: 18,
                          color: Colors.white,
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
                  backgroundColor: accentCyan,
                  foregroundColor: Colors.black,
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
