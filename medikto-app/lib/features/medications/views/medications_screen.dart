import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/home/notifications/notification_screen.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';
import 'package:medikto/features/medications/models/today_scheduled_model.dart';
import 'package:medikto/features/medications/views/medical_records_screen.dart';
import 'package:medikto/features/medications/views/medication_verification_screen.dart';
import 'package:medikto/features/medications/views/selfie_verfication_medicine.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';

class TimelineMedicine {
  final String doseId;
  final String time;
  final String title;
  final String sub;
  final IconData icon;
  final String status;
  final bool isTaken;
  final bool isMissed;
  final bool isFuture;

  TimelineMedicine({
    required this.doseId,
    required this.time,
    required this.title,
    required this.sub,
    required this.icon,
    this.status = "pending",
    this.isTaken = false,
    this.isMissed = false,
    this.isFuture = false,
  });
}

class MedicationsScreen extends ConsumerStatefulWidget {
  const MedicationsScreen({super.key});

  @override
  ConsumerState<MedicationsScreen> createState() => _MedicationsScreenState();
}

class _MedicationsScreenState extends ConsumerState<MedicationsScreen> {
  static const Color dangerRed = AppColors.missedRed;
  DateTime selectedDate = DateTime.now();
  Map<String, bool> takenMap = {};
  Set<String> loadingDoseIds = {};

  String _formatDate(DateTime date) {
    return "${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}";
  }

  DateTime? _parseDoseDateTime(String? dateStr, String? timeStr) {
    if (timeStr == null || timeStr.trim().isEmpty) return null;
    try {
      final now = DateTime.now();
      int year = now.year;
      int month = now.month;
      int day = now.day;

      if (dateStr != null && dateStr.trim().isNotEmpty) {
        final dateParts = dateStr.split("-");
        if (dateParts.length >= 3) {
          year = int.parse(dateParts[0]);
          month = int.parse(dateParts[1]);
          day = int.parse(dateParts[2]);
        }
      }

      final cleanTime = timeStr.replaceAll(RegExp(r'\u202F|\u00A0'), ' ').trim();
      final isPM = cleanTime.toUpperCase().endsWith("PM");
      final isAM = cleanTime.toUpperCase().endsWith("AM");
      final timeDigits = cleanTime.replaceAll(RegExp(r'[a-zA-Z\s]'), '');
      final parts = timeDigits.split(":");
      if (parts.length < 2) return null;

      int hour = int.parse(parts[0]);
      final minute = int.parse(parts[1]);

      if (isPM && hour < 12) hour += 12;
      if (isAM && hour == 12) hour = 0;

      return DateTime(year, month, day, hour, minute);
    } catch (_) {
      return null;
    }
  }

  bool _isDoseInFuture(String? dateStr, String? timeStr) {
    final scheduled = _parseDoseDateTime(dateStr, timeStr);
    if (scheduled == null) return false;
    return scheduled.isAfter(DateTime.now());
  }

  bool _isDoseEarly(TodayScheduleModel schedule) {
    final scheduled = _parseDoseDateTime(schedule.date, schedule.time);
    if (scheduled == null) return false;
    final now = DateTime.now();
    final diff = scheduled.difference(now);
    return diff.inMinutes > 10;
  }

  Future<bool> _showEarlyWarningDialog(BuildContext context, TodayScheduleModel schedule) async {
    final colors = context.themeColors;
    int minutesEarly = 0;
    final scheduled = _parseDoseDateTime(schedule.date, schedule.time);
    if (scheduled != null) {
      minutesEarly = scheduled.difference(DateTime.now()).inMinutes;
    }

    String timeLabel = minutesEarly >= 60 
        ? "${(minutesEarly / 60).floor()} hour(s) and ${minutesEarly % 60} minute(s)"
        : "$minutesEarly minute(s)";

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: colors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.orangeAccent, size: 28),
            const SizedBox(width: 10),
            Text("Early Dose Alert", style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          "This dose of ${schedule.name} is scheduled for ${schedule.time}.\n\n"
          "You are marking it as taken $timeLabel early.\n\n"
          "Taking medications too early can be unsafe. Are you sure you want to log this dose now?",
          style: TextStyle(color: colors.textSecondary, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text("Cancel", style: TextStyle(color: colors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orangeAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Yes, Log Early", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  Future<void> selectDate() async {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
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
            datePickerTheme: DatePickerThemeData(
              backgroundColor: colors.surface,
              headerBackgroundColor: colors.accentPrimary,
              headerForegroundColor: colors.onAccentPrimary,
              dayForegroundColor: WidgetStatePropertyAll(colors.textPrimary),
              todayForegroundColor: WidgetStatePropertyAll(colors.accentPrimary),
              yearForegroundColor: WidgetStatePropertyAll(colors.textPrimary),
            ),
          ),
          child: child!,
        );
      },
    );

    if (pickedDate != null) {
      setState(() {
        selectedDate = pickedDate;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final formattedDate = _formatDate(selectedDate);
    final scheduleAsync = ref.watch(getScheduleForDateProvider(formattedDate));

    final profileAsync = ref.watch(getProfileProvider);
    final profile = profileAsync.value?.data is ProfileModel
        ? profileAsync.value!.data as ProfileModel
        : null;
    final isGuardian = profile?.role == 'guardian';

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: _buildAppBar(profile),
      body: SafeArea(
        child: RefreshIndicator(
          color: colors.accentPrimary,
          backgroundColor: colors.surface,
          onRefresh: () async {
            await ref.refresh(getScheduleForDateProvider(formattedDate).future);
            await ref.refresh(getTodayScheduleProvider.future);
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            cacheExtent: 1200,
            slivers: [
              /// HEADER
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    if (!isGuardian)
                      RepaintBoundary(child: _buildAddMedicationCard()),
                  ]),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              /// CALENDAR
              SliverToBoxAdapter(
                child: RepaintBoundary(child: _buildCalendarSection(context)),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 10)),

              /// TIMELINE HEADER
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Container(
                        height: 8,
                        width: 8,
                        decoration: BoxDecoration(
                          color: colors.accentPrimary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        "DAILY TIMELINE",
                        style: TextStyle(
                          color: colors.textSecondary,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 15)),

              /// FILTERED DOSES FOR SELECTED DATE
              scheduleAsync.when(
                loading: () => const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  ),
                ),
                error: (err, _) => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
                    child: Center(
                      child: Text(
                        "Failed to load schedule",
                        style: TextStyle(color: colors.textSecondary),
                      ),
                    ),
                  ),
                ),
                data: (response) {
                  final rawList = response.data is List<TodayScheduleModel>
                      ? response.data as List<TodayScheduleModel>
                      : <TodayScheduleModel>[];

                  if (rawList.isEmpty) {
                    return SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 40,
                        ),
                        child: Center(
                          child: Container(
                            margin: const EdgeInsets.only(top: 10),
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: colors.card,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: colors.borderSubtle),
                            ),
                            child: Column(
                              children: [
                                Icon(
                                  Icons.hourglass_empty,
                                  color: colors.textMuted,
                                  size: 40,
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  "No medications for this date",
                                  style: TextStyle(color: colors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  }

                  // Sort doses: Pending first, then chronologically by scheduled time
                  final sortedDoses = List<TodayScheduleModel>.from(rawList);
                  sortedDoses.sort((a, b) {
                    final aTaken = a.status?.toLowerCase() == "taken" || takenMap[a.id] == true;
                    final bTaken = b.status?.toLowerCase() == "taken" || takenMap[b.id] == true;
                    if (aTaken != bTaken) {
                      return aTaken ? 1 : -1;
                    }
                    final aDt = _parseDoseDateTime(a.date, a.time);
                    final bDt = _parseDoseDateTime(b.date, b.time);
                    if (aDt != null && bDt != null) {
                      return aDt.compareTo(bDt);
                    }
                    return (a.time ?? "").compareTo(b.time ?? "");
                  });

                  return SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final schedule = sortedDoses[index];
                          final scheduleId = schedule.id ?? "";
                          final rawStatus = (schedule.status ?? "pending").toLowerCase();

                          // Exact State Machine Evaluation:
                          final isTaken = rawStatus == "taken" || takenMap[scheduleId] == true;
                          final isMissed = rawStatus == "missed" && !isTaken;
                          final isCancelled = rawStatus == "cancelled" && !isTaken;
                          final isFuture = !isTaken && !isMissed && !isCancelled && _isDoseInFuture(schedule.date, schedule.time);

                          return RepaintBoundary(
                            child: _buildAdvancedTimelineItem(
                              item: TimelineMedicine(
                                doseId: scheduleId,
                                time: schedule.time ?? "--",
                                title: schedule.name ?? "Medicine",
                                sub: schedule.dosage ?? "",
                                icon: Icons.medication,
                                status: isTaken ? "taken" : (isMissed ? "missed" : (isCancelled ? "cancelled" : "pending")),
                                isTaken: isTaken,
                                isMissed: isMissed,
                                isFuture: isFuture,
                              ),
                              isLast: index == sortedDoses.length - 1,
                              isGuardian: isGuardian,
                              onMarkTaken: () async {
                                if (scheduleId.isEmpty) return;

                                if (_isDoseEarly(schedule)) {
                                  final proceed = await _showEarlyWarningDialog(context, schedule);
                                  if (!proceed) return;
                                }

                                setState(() {
                                  loadingDoseIds.add(scheduleId);
                                });

                                final result = await ref.read(
                                  markDoseTakenProvider(scheduleId).future,
                                );

                                setState(() {
                                  loadingDoseIds.remove(scheduleId);
                                });

                                if (result.status == ResponseStatus.SUCCESS) {
                                  setState(() {
                                    takenMap[scheduleId] = true;
                                  });

                                  ref.invalidate(getScheduleForDateProvider(formattedDate));
                                  ref.invalidate(getTodayScheduleProvider);
                                  ref.invalidate(getAdherenceProvider);
                                }
                              },
                              onVerifyWithSelfie: () async {
                                if (scheduleId.isEmpty) return;

                                if (_isDoseEarly(schedule)) {
                                  final proceed = await _showEarlyWarningDialog(context, schedule);
                                  if (!proceed) return;
                                }

                                final result = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        SelfieVerficationMedicineScreen(
                                          doseId: scheduleId,
                                          medicineName: schedule.name ?? "",
                                          dosage: schedule.dosage ?? "",
                                          unit: "",
                                        ),
                                  ),
                                );

                                if (result != null) {
                                  setState(() {
                                    takenMap[scheduleId] = true;
                                  });

                                  ref.invalidate(getScheduleForDateProvider(formattedDate));
                                  ref.invalidate(getTodayScheduleProvider);
                                  ref.invalidate(getAdherenceProvider);
                                }
                              },
                            ),
                          );
                        },
                        childCount: sortedDoses.length,
                        addAutomaticKeepAlives: false,
                        addRepaintBoundaries: true,
                        addSemanticIndexes: false,
                      ),
                    ),
                  );
                },
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 10)),

              SliverToBoxAdapter(
                child: RepaintBoundary(child: _buildMedicalComplianceButton()),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        ),
      ),
    );
  }

  /// 🔹 CALENDAR SECTION
  Widget _buildCalendarSection(BuildContext context) {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;
    final screenWidth = MediaQuery.sizeOf(context).width;

    final itemWidth = screenWidth / 5.5;

    final List<DateTime> dates = List.generate(15, (index) {
      return DateTime.now().add(Duration(days: index - 2));
    });

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Column(
        children: [
          // Header remains padded
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "${_getMonthName(selectedDate.month)} ${selectedDate.year}",
                  style: TextStyle(
                    color: colors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                GestureDetector(
                  onTap: selectDate,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: colors.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: colors.borderSubtle),
                    ),
                    child: Icon(
                      Icons.calendar_month_outlined,
                      color: colors.accentPrimary,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 15),

          // Scrollable area
          SizedBox(
            height: 90,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: dates.length,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.only(left: 20),
              itemBuilder: (context, index) {
                final date = dates[index];
                bool isSelected = DateUtils.isSameDay(date, selectedDate);
                bool isToday = DateUtils.isSameDay(date, DateTime.now());

                return GestureDetector(
                  onTap: () => setState(() => selectedDate = date),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    width: itemWidth,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? colors.accentPrimary
                          : colors.card,
                      borderRadius: BorderRadius.circular(16),
                      border: isToday && !isSelected
                          ? Border.all(
                              color: colors.accentBorder,
                            )
                          : Border.all(color: isSelected ? Colors.transparent : colors.borderSubtle),
                      boxShadow: !isDark && !isSelected
                          ? [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.04),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              )
                            ]
                          : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _getWeekdayName(date.weekday),
                          style: TextStyle(
                            color: isSelected ? colors.onAccentPrimary : colors.textMuted,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          date.day.toString(),
                          style: TextStyle(
                            color: isSelected ? colors.onAccentPrimary : colors.textPrimary,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _getWeekdayName(int weekday) {
    return ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][weekday - 1];
  }

  String _getMonthName(int month) {
    return [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][month - 1];
  }

  Widget _buildAdvancedTimelineItem({
    required TimelineMedicine item,
    required bool isLast,
    required VoidCallback onMarkTaken,
    required VoidCallback onVerifyWithSelfie,
    bool isGuardian = false,
  }) {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;
    final isTaken = item.isTaken;
    final isMissed = item.isMissed;
    final isFuture = item.isFuture;
    final isActionable = !isTaken && !isMissed && !isFuture && !isGuardian;
    final isLoading = loadingDoseIds.contains(item.doseId);

    // Dynamic timeline indicator styles
    Color indicatorBg = Colors.transparent;
    Color indicatorBorder = colors.borderSubtle;
    Widget? indicatorIcon;

    if (isTaken) {
      indicatorBg = colors.accentPrimary;
      indicatorBorder = colors.accentPrimary;
      indicatorIcon = Icon(Icons.check, size: 16, color: colors.onAccentPrimary);
    } else if (isMissed) {
      indicatorBg = dangerRed.withOpacity(0.15);
      indicatorBorder = dangerRed;
      indicatorIcon = const Icon(Icons.close, size: 14, color: dangerRed);
    } else if (isActionable) {
      indicatorBg = colors.accentSubtle;
      indicatorBorder = colors.accentBorder;
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          /// 🔹 LEFT TIMELINE INDICATOR
          Column(
            children: [
              Container(
                margin: const EdgeInsets.only(top: 8),
                height: 24,
                width: 24,
                decoration: BoxDecoration(
                  color: indicatorBg,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: indicatorBorder,
                    width: 1.5,
                  ),
                ),
                child: indicatorIcon,
              ),
              if (!isLast)
                Expanded(child: Container(width: 2, color: colors.borderSubtle)),
            ],
          ),

          const SizedBox(width: 20),

          /// 🔹 CARD
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: colors.card,
                borderRadius: BorderRadius.circular(16),
                border: isActionable
                    ? Border.all(color: colors.accentBorder, width: 1.5)
                    : isMissed
                    ? Border.all(color: dangerRed.withOpacity(0.4), width: 1.2)
                    : Border.all(color: colors.borderSubtle),
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
                  /// TITLE + TIME
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        item.title,
                        style: TextStyle(
                          color: colors.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        item.time,
                        style: TextStyle(
                          color: isTaken
                              ? colors.accentMedium
                              : isMissed
                              ? dangerRed
                              : isActionable
                              ? colors.accentMedium
                              : colors.textMuted,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 4),

                  Text(
                    item.sub,
                    style: TextStyle(color: colors.textSecondary, fontSize: 11),
                  ),

                  const SizedBox(height: 12),

                  /// 🔥 ACTION BUTTONS (Available at or after scheduled dose time for pending doses)
                  if (isActionable) ...[
                    SizedBox(
                      width: double.infinity,
                      height: 42,
                      child: ElevatedButton.icon(
                        onPressed: isLoading ? null : onMarkTaken,
                        icon: isLoading
                            ? const SizedBox(
                                height: 16,
                                width: 16,
                                child: CircularProgressIndicator(
                                  color: Colors.black54,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.check_circle_outline, size: 18),
                        label: const Text("Mark as Taken"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: colors.accentPrimary,
                          foregroundColor: colors.onAccentPrimary,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    SizedBox(
                      width: double.infinity,
                      height: 42,
                      child: OutlinedButton.icon(
                        onPressed: isLoading ? null : onVerifyWithSelfie,
                        icon: Icon(
                          Icons.camera_alt_outlined,
                          size: 18,
                          color: colors.accentPrimary,
                        ),
                        label: Text(
                          "Verify with Selfie",
                          style: TextStyle(
                            color: colors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: colors.border),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ],

                  /// ⏳ UPCOMING BADGE (Scheduled in the future)
                  if (isFuture)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: colors.cardSecondary,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: colors.borderSubtle),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.schedule,
                            color: colors.accentMedium,
                            size: 12,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            "Upcoming (Scheduled ${item.time})",
                            style: TextStyle(
                              color: colors.textSecondary,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),

                  /// ⚠️ MISSED STATUS BADGE
                  if (isMissed)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: dangerRed.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: dangerRed.withOpacity(0.3)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.warning_amber_rounded,
                            color: dangerRed,
                            size: 12,
                          ),
                          SizedBox(width: 6),
                          Text(
                            "Missed Dose",
                            style: TextStyle(
                              color: dangerRed,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),

                  /// ✅ TAKEN STATUS (Verification Badge)
                  if (isTaken)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: colors.accentSubtle,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: colors.accentBorder),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.check_circle,
                            color: colors.accentMedium,
                            size: 12,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            "Medicine Taken",
                            style: TextStyle(
                              color: colors.accentMedium,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMedicalComplianceButton() {
    final colors = context.themeColors;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: SizedBox(
        width: double.infinity,
        height: 55,
        child: ElevatedButton.icon(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const MedicalRecordsScreen()),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: colors.accentPrimary,
            foregroundColor: colors.onAccentPrimary,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          icon: Image.asset(
            "assets/images/item2.png",
            width: 20,
            height: 20,
            color: colors.onAccentPrimary,
          ),
          label: const Text(
            "Medications record",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
      ),
    );
  }

  Widget _buildAddMedicationCard() {
    final colors = context.themeColors;
    final isDark = context.isDarkMode;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.borderSubtle),
        boxShadow: !isDark
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                )
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: colors.accentSubtle,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  "QUICK ACTION",
                  style: TextStyle(
                    color: colors.accentMedium,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
              Icon(
                Icons.add_moderator_outlined,
                color: colors.textMuted,
                size: 20,
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            "Add Medication",
            style: TextStyle(
              color: colors.textPrimary,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "Keep track of your health by adding your daily prescriptions.",
            style: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.4),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        MedicationVerificationScreen(medicineName: "Test"),
                  ),
                );

                if (result == true) {
                  await ref.refresh(getMedicationsProvider.future);
                  await ref.refresh(getTodayScheduleProvider.future);
                  final formattedDate = _formatDate(selectedDate);
                  await ref.refresh(getScheduleForDateProvider(formattedDate).future);
                  setState(() {});
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: colors.accentPrimary,
                foregroundColor: colors.onAccentPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.add_circle_outline, size: 20),
                  SizedBox(width: 8),
                  Text(
                    "Add New Medicine",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(ProfileModel? profile) {
    final colors = context.themeColors;

    return AppBar(
      backgroundColor: colors.bg,
      elevation: 0,
      title: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: colors.cardSecondary,
            backgroundImage:
                profile?.profilePic != null && profile!.profilePic!.isNotEmpty
                ? CachedNetworkImageProvider(
                    "${profile.profilePic!}?t=${DateTime.now().millisecondsSinceEpoch}",
                  )
                : null,
            child: profile?.profilePic == null || profile!.profilePic!.isEmpty
                ? Icon(Icons.person, color: colors.iconColor, size: 18)
                : null,
          ),
          const SizedBox(width: 12),
          Text(
            "My Medications",
            style: TextStyle(
              color: colors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const NotificationScreen()),
          ),
          icon: Icon(Icons.notifications, color: colors.iconColor),
        ),
        const SizedBox(width: 10),
      ],
    );
  }
}
