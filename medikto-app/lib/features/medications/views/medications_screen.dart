import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/home/notifications/notification_screen.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';
import 'package:medikto/features/medications/models/medication_model.dart';
import 'package:medikto/features/medications/models/today_scheduled_model.dart';
import 'package:medikto/features/medications/views/medical_records_screen.dart';
import 'package:medikto/features/medications/views/medication_verification_screen.dart';
import 'package:medikto/features/medications/views/selfie_verfication_medicine.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';

class TimelineMedicine {
  String doseId; // 🔥 ADD THIS
  String time;
  String title;
  String sub;
  IconData icon;
  bool isTaken;

  TimelineMedicine({
    required this.doseId,
    required this.time,
    required this.title,
    required this.sub,
    required this.icon,
    this.isTaken = false,
  });
}

class MedicationsScreen extends ConsumerStatefulWidget {
  const MedicationsScreen({super.key});

  @override
  ConsumerState<MedicationsScreen> createState() => _MedicationsScreenState();
}

class _MedicationsScreenState extends ConsumerState<MedicationsScreen> {
  // Brand Dark Colors consistent with design
  static const Color darkBg = Color(0xFF121212); // Deep Charcoal
  static const Color surfaceColor = Color(0xFF1E1E1E); // Elevated Grey
  static const Color accentCyan = Color(0xFF81DEEA); // Branding Cyan
  static const Color dangerRed = Color(0xFFE57373); // Critical Alerts
  DateTime selectedDate = DateTime.now();
  Map<String, bool> takenMap = {};
  Set<String> loadingDoseIds = {};

  List<MedicationModel> _getMedicationsForSelectedDate(
    List<MedicationModel> medications,
    List<TodayScheduleModel> todayList,
  ) {
    final filtered = medications.where((medication) {
      if (medication.createdAt == null) return false;

      final medicationDate = medication.createdAt!;

      return medicationDate.year == selectedDate.year &&
          medicationDate.month == selectedDate.month &&
          medicationDate.day == selectedDate.day;
    }).toList();

    filtered.sort((a, b) {
      final aTime = a.timings?.isNotEmpty == true ? a.timings!.first : "";

      final bTime = b.timings?.isNotEmpty == true ? b.timings!.first : "";

      final aSchedule = todayList.firstWhere(
        (e) => e.name == a.name && e.time == aTime,
        orElse: () => TodayScheduleModel(),
      );

      final bSchedule = todayList.firstWhere(
        (e) => e.name == b.name && e.time == bTime,
        orElse: () => TodayScheduleModel(),
      );

      final aTaken = aSchedule.status?.toLowerCase() == "taken";
      final bTaken = bSchedule.status?.toLowerCase() == "taken";

      /// 🔥 Pending medicines always on TOP
      if (aTaken != bTaken) {
        return aTaken ? 1 : -1;
      }

      // /// Then sort by time
      // final aTime = a.timings?.isNotEmpty == true ? a.timings!.first : "";

      // final bTime = b.timings?.isNotEmpty == true ? b.timings!.first : "";

      return aTime.compareTo(bTime);
    });

    return filtered;
  }

  Future<void> selectDate() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: selectedDate,
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
      setState(() {
        selectedDate = pickedDate;
      });
    }
  }
  @override
  Widget build(BuildContext context) {
    final medicationsAsync = ref.watch(getMedicationsProvider);
    final todayScheduleAsync = ref.watch(getTodayScheduleProvider);
    final todayList = todayScheduleAsync.value?.data is List<TodayScheduleModel>
        ? todayScheduleAsync.value!.data as List<TodayScheduleModel>
        : <TodayScheduleModel>[];

    final medications = medicationsAsync.value?.data is List<MedicationModel>
        ? medicationsAsync.value!.data as List<MedicationModel>
        : <MedicationModel>[];

    final profileAsync = ref.watch(getProfileProvider);
    final profile = profileAsync.value?.data is ProfileModel
        ? profileAsync.value!.data as ProfileModel
        : null;
    return Scaffold(
      backgroundColor: darkBg,
      appBar: _buildAppBar(profile),
      body: SafeArea(
        child: RefreshIndicator(
          color: accentCyan,
          backgroundColor: surfaceColor,
          onRefresh: () async {
            await ref.refresh(getMedicationsProvider.future);
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
                        decoration: const BoxDecoration(
                          color: accentCyan,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        "DAILY TIMELINE",
                        style: TextStyle(
                          color: Colors.white70,
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

              /// FILTERED MEDICATIONS
              Builder(
                builder: (context) {
                  final filteredMedications = _getMedicationsForSelectedDate(
                    medications,
                    todayList,
                  );

                  final isTodaySelected = DateUtils.isSameDay(
                    selectedDate,
                    DateTime.now(),
                  );

                  if (filteredMedications.isEmpty) {
                    return SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 40,
                        ),
                        child: Center(
                          child: Container(
                            margin: const EdgeInsets.only(top: 10),
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white.withAlpha(20),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Column(
                              children: [
                                Icon(
                                  Icons.hourglass_empty,
                                  color: Colors.white30,
                                  size: 40,
                                ),
                                SizedBox(height: 10),
                                Text(
                                  "No medications for this date",
                                  style: TextStyle(color: Colors.white54),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final medication = filteredMedications[index];

                          final time = medication.timings?.isNotEmpty == true
                              ? medication.timings!.first
                              : "--";

                          final currentTime =
                              medication.timings?.isNotEmpty == true
                              ? medication.timings!.first
                              : "";

                          final schedule = isTodaySelected
                              ? todayList.firstWhere(
                                  (e) =>
                                      e.name == medication.name &&
                                      e.time == currentTime,
                                  orElse: () => TodayScheduleModel(),
                                )
                              : TodayScheduleModel(status: "taken");

                          final scheduleId = schedule.id ?? "";

                          final isTaken =
                              schedule.status?.toLowerCase() == "taken" ||
                              takenMap[scheduleId] == true;

                          final isCurrent = isTodaySelected && !isTaken;

                          return RepaintBoundary(
                            child: _buildAdvancedTimelineItem(
                              item: TimelineMedicine(
                                // doseId: medication.id ?? "",
                                doseId: scheduleId ?? "",
                                time: time,

                                title: medication.name ?? "Medicine",
                                sub:
                                    "${medication.dosage ?? ""}${medication.unit ?? ""}",
                                icon: Icons.medication,
                                // isTaken: false,
                                // isTaken: takenMap[scheduleId ?? ""] ?? false,
                                isTaken: isTaken,
                                // isTaken:
                                //     schedule.status?.toLowerCase() ==
                                //         "taken" ||
                                //     takenMap[scheduleId] == true,
                              ),
                              isLast: index == filteredMedications.length - 1,
                              // isCurrent: index == 0,
                              isCurrent: isCurrent,
                              onMarkTaken: () async {
                                final doseId = scheduleId;

                                setState(() {
                                  loadingDoseIds.add(doseId);
                                });

                                final result = await ref.read(
                                  markDoseTakenProvider(doseId).future,
                                );

                                setState(() {
                                  loadingDoseIds.remove(doseId);
                                });

                                if (result.status == ResponseStatus.SUCCESS) {
                                  setState(() {
                                    takenMap[doseId] = true;
                                  });

                                  ref.invalidate(getTodayScheduleProvider);
                                }
                              },
                              onVerifyWithSelfie: () async {
                                // final doseId = todayList.length > index
                                //     ? todayList[index].id ?? ""
                                //     : "";
                                final doseId = scheduleId;

                                final result = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        SelfieVerficationMedicineScreen(
                                          doseId: doseId,
                                          medicineName: medication.name ?? "",
                                          dosage: "${medication.dosage ?? ""}",
                                          unit: medication.unit ?? "mg",
                                        ),
                                  ),
                                );

                                if (result != null) {
                                  setState(() {
                                    takenMap[doseId] = true;
                                  });

                                  await ref.refresh(
                                    getTodayScheduleProvider.future,
                                  );
                                  // await ref.refresh(getMedicationsProvider.future);
                                }
                              },
                            ),
                          );
                        },
                        childCount: filteredMedications.length,
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
      ), // floatingActionButton: FloatingActionButton(
      //   onPressed: () {},
      //   backgroundColor: accentCyan,
      //   child: const Icon(Icons.add, color: Colors.black, size: 28),
      // ),
    );
  }

  /// 🔹 CALENDAR SECTION
  Widget _buildCalendarSection(BuildContext context) {
    final screenWidth = MediaQuery.sizeOf(context).width;

    // Logic: Calculate item width based on screen size so 5.5 items are visible
    // This gives a visual hint that the list is scrollable
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
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                GestureDetector(
                  onTap: selectDate,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: surfaceColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: accentCyan.withOpacity(0.2)),
                    ),
                    child: const Icon(
                      Icons.calendar_month_outlined,
                      color: accentCyan,
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
            height: 90, // Fixed height for the horizontal bar
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: dates.length,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.only(left: 20), // Start padding
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
                          ? const Color(0xFF81DEEA)
                          : const Color(0xFF1E1E1E),
                      borderRadius: BorderRadius.circular(16),
                      border: isToday && !isSelected
                          ? Border.all(
                              color: const Color(0xFF81DEEA).withOpacity(0.5),
                            )
                          : Border.all(color: Colors.transparent),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _getWeekdayName(date.weekday),
                          style: TextStyle(
                            color: isSelected ? Colors.black : Colors.white38,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          date.day.toString(),
                          style: TextStyle(
                            color: isSelected ? Colors.black : Colors.white,
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

  // Helper helpers for dynamic names without needing external packages
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

  /// 🔹 TIMELINE ITEM (Vertical list items)
  Widget _buildTimelineItem({
    required String time,
    required String title,
    required String sub,
    required IconData icon,
    bool isTaken = false,
    bool isUpcoming = false,
    bool isLast = false,
  }) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Vertical Indicator
          Column(
            children: [
              Container(
                margin: const EdgeInsets.only(top: 8),
                height: 24,
                width: 24,
                decoration: BoxDecoration(
                  color: isTaken
                      ? accentCyan
                      : isUpcoming
                      ? accentCyan.withOpacity(0.1)
                      : Colors.transparent,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isTaken ? accentCyan : accentCyan.withOpacity(0.4),
                    width: isTaken ? 0 : 1.5,
                  ),
                ),
                child: isTaken
                    ? const Icon(Icons.check, size: 16, color: Colors.black)
                    : null,
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    decoration: BoxDecoration(
                      color: Colors.white10,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 20),
          // Content Card
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(16),
                border: isUpcoming
                    ? Border.all(color: accentCyan.withOpacity(0.2))
                    : null,
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: accentCyan.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: accentCyan, size: 22),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                            Text(
                              time,
                              style: TextStyle(
                                color: isTaken
                                    ? accentCyan
                                    : isUpcoming
                                    ? accentCyan.withOpacity(0.7)
                                    : Colors.white38,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          sub,
                          style: const TextStyle(
                            color: Colors.white54,
                            fontSize: 11,
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

  Widget _buildAdvancedTimelineItem({
    required TimelineMedicine item,
    required bool isLast,
    required bool isCurrent,
    required VoidCallback onMarkTaken,
    required VoidCallback onVerifyWithSelfie,
  }) {
    bool isTaken = item.isTaken;

    // final markState = ref.watch(markDoseTakenProvider(item.doseId));
    final isLoading = loadingDoseIds.contains(item.doseId);

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
                  color: isTaken
                      ? accentCyan
                      : isCurrent
                      ? accentCyan.withOpacity(0.1)
                      : Colors.transparent,
                  shape: BoxShape.circle,
                  border: Border.all(color: accentCyan.withOpacity(0.5)),
                ),
                child: isTaken
                    ? const Icon(Icons.check, size: 16, color: Colors.black)
                    : null,
              ),
              if (!isLast)
                Expanded(child: Container(width: 2, color: Colors.white10)),
            ],
          ),

          const SizedBox(width: 20),

          /// 🔹 CARD
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(16),
                border: isCurrent
                    ? Border.all(color: accentCyan.withOpacity(0.3))
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
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        item.time,
                        style: TextStyle(
                          color: isTaken
                              ? accentCyan
                              : isCurrent
                              ? accentCyan.withOpacity(0.7)
                              : Colors.white38,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 4),

                  Text(
                    item.sub,
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),

                  const SizedBox(height: 12),

                  /// 🔥 ACTION BUTTONS WITH ICONS FIXED
                  if (!isTaken && isCurrent) ...[
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
                                  color: Colors.white54,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.check_circle_outline, size: 18),
                        label: const Text("Mark as Taken"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: accentCyan,
                          foregroundColor: Colors.black,
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
                        // ✅ Changed to .icon
                        onPressed: isLoading ? null : onVerifyWithSelfie,
                        //                         onPressed: () {
                        //                           Navigator.push(
                        //                             context,
                        //                             MaterialPageRoute(
                        //                               builder: (_) => SelfieVerficationMedicineScreen(
                        //   doseId:m.id ?? "",
                        //   medicineName: schedule.name ?? "",
                        //   dosage: schedule.dosage ?? "",
                        //   unit: schedule.unit ?? "mg",
                        // ),
                        //                             ),
                        //                           );
                        //                         },
                        icon: const Icon(
                          Icons.camera_alt_outlined,
                          size: 18,
                          color: accentCyan,
                        ), // ✅ Added Icon
                        label: const Text("Verify with Selfie"),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.white24),
                          foregroundColor: Colors.white70,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ],

                  /// ✅ TAKEN STATUS (Verification Badge)
                  if (isTaken)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: accentCyan.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.check_circle, color: accentCyan, size: 12),
                          SizedBox(width: 6),
                          Text(
                            "Medicine Taken",
                            style: TextStyle(
                              color: accentCyan,
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

  /// 🔹 REFILL CARD
  // Widget _buildRefillCard() {
  //   return Container(
  //     padding: const EdgeInsets.all(16),
  //     decoration: BoxDecoration(
  //       color: surfaceColor,
  //       borderRadius: BorderRadius.circular(16),
  //     ),
  //     child: Column(
  //       crossAxisAlignment: CrossAxisAlignment.start,
  //       children: [
  //         const Text(
  //           "REFILL STATUS",
  //           style: TextStyle(
  //             color: Colors.white38,
  //             fontSize: 10,
  //             fontWeight: FontWeight.bold,
  //           ),
  //         ),
  //         // const Spacer(),
  //         SizedBox(height: 16),
  //         const Text(
  //           "12 days left",
  //           style: TextStyle(
  //             color: Colors.white,
  //             fontSize: 22,
  //             fontWeight: FontWeight.bold,
  //           ),
  //         ),
  //         const SizedBox(height: 10),
  //         ClipRRect(
  //           borderRadius: BorderRadius.circular(10),
  //           child: const LinearProgressIndicator(
  //             value: 0.7,
  //             minHeight: 8,
  //             backgroundColor: Colors.white10,
  //             valueColor: AlwaysStoppedAnimation<Color>(Colors.redAccent),
  //           ),
  //         ),
  //       ],
  //     ),
  //   );
  // }

  // /// 🔹 DOCTOR NOTE CARD
  // Widget _buildDoctorNoteCard() {
  //   return Container(
  //     padding: const EdgeInsets.all(16),
  //     decoration: BoxDecoration(
  //       color: surfaceColor,
  //       borderRadius: BorderRadius.circular(16),
  //     ),
  //     child: Column(
  //       crossAxisAlignment: CrossAxisAlignment.start,
  //       children: [
  //         const Text(
  //           "DOCTOR NOTE",
  //           style: TextStyle(
  //             color: Colors.white38,
  //             fontSize: 10,
  //             fontWeight: FontWeight.bold,
  //           ),
  //         ),
  //         // const Spacer(),
  //         SizedBox(height: 16),
  //         Text(
  //           "“Monitor blood pressure levels after morning...",
  //           overflow: TextOverflow.ellipsis,
  //           maxLines: 2,
  //           style: TextStyle(color: Colors.white70, fontSize: 12),
  //         ),
  //         // const Spacer(),
  //         SizedBox(height: 16),
  //         InkWell(
  //           onTap: () {},
  //           child: Row(
  //             children: const [
  //               Icon(Icons.open_in_new, color: accentCyan, size: 14),
  //               SizedBox(width: 5),
  //               Text(
  //                 "View Dr. Aris",
  //                 style: TextStyle(
  //                   color: accentCyan,
  //                   fontSize: 12,
  //                   fontWeight: FontWeight.w600,
  //                 ),
  //               ),
  //             ],
  //           ),
  //         ),
  //       ],
  //     ),
  //   );
  // }

  /// 🔹 Helper: Weekly Compliance Card

  Widget _buildMedicalComplianceButton() {
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
            backgroundColor: accentCyan,
            foregroundColor: Colors.black,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          icon: Image.asset(
            "assets/images/item2.png",
            width: 20,
            height: 20,
            color: Colors.black,
          ),
          label: const Text(
            "Compliance Records",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
      ),
    );
  }

  Widget _buildAddMedicationCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E), // surfaceColor
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
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
                  color: const Color(0xFF81DEEA).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  "QUICK ACTION",
                  style: TextStyle(
                    color: Color(0xFF81DEEA),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
              Icon(
                Icons.add_moderator_outlined,
                color: Colors.white.withOpacity(0.2),
                size: 20,
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            "Add Medication",
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            "Keep track of your health by adding your daily prescriptions.",
            style: TextStyle(color: Colors.white54, fontSize: 14, height: 1.4),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () async {
                // Navigate to your medication adding logic

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

                  setState(() {});
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF81DEEA),
                foregroundColor: Colors.black,
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
    return AppBar(
      backgroundColor: darkBg,
      elevation: 0,
      title: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: surfaceColor,

            backgroundImage:
                profile?.profilePic != null && profile!.profilePic!.isNotEmpty
                ? CachedNetworkImageProvider(
                    "${profile.profilePic!}?t=${DateTime.now().millisecondsSinceEpoch}",
                  )
                : null,

            child: profile?.profilePic == null || profile!.profilePic!.isEmpty
                ? const Icon(Icons.person, color: Colors.white, size: 18)
                : null,
          ),

          const SizedBox(width: 12),

          const Text(
            "My Medications",
            style: TextStyle(
              color: Colors.white,
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
          icon: const Icon(Icons.notifications, color: accentCyan),
        ),

        const SizedBox(width: 10),
      ],
    );
  }
}
