import 'dart:io';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';
import 'package:medikto/features/medications/models/today_scheduled_model.dart';
import 'package:medikto/features/medications/views/selfie_verfication_medicine.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:pdf/pdf.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';

class MedicalRecordsScreen extends ConsumerStatefulWidget {
  const MedicalRecordsScreen({super.key});

  @override
  ConsumerState<MedicalRecordsScreen> createState() =>
      _MedicalRecordsScreenState();
}

class _MedicalRecordsScreenState extends ConsumerState<MedicalRecordsScreen>
    with SingleTickerProviderStateMixin {
  static const Color darkBg = Color(0xFF0D1117);
  static const Color surfaceColor = Color(0xFF161B22);
  static const Color accentCyan = Color(0xFF4FD1C5);
  static const Color textGrey = Color(0xFF8B949E);
  static const Color cardBorder = Color(0xFF30363D);

  late TabController _tabController;
  final Set<String> _expandedDates = {"1 May 2026, Friday"};
  DateTimeRange? _selectedDateRange;
  bool _isSharing = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _getEarlyTakenLabel(String? dateStr, String? timeStr, String? takenAtStr) {
    if (dateStr == null || timeStr == null || takenAtStr == null) return "Taken";
    try {
      final takenAt = DateTime.parse(takenAtStr).toLocal();
      final dateParts = dateStr.split("-");
      if (dateParts.length < 3) return "Taken";
      final year = int.parse(dateParts[0]);
      final month = int.parse(dateParts[1]);
      final day = int.parse(dateParts[2]);

      final cleanTime = timeStr.trim();
      final isPM = cleanTime.toUpperCase().endsWith("PM");
      final isAM = cleanTime.toUpperCase().endsWith("AM");
      final timePart = cleanTime.replaceAll(RegExp(r'[a-zA-Z\s]'), '');
      final timeParts = timePart.split(":");
      if (timeParts.length < 2) return "Taken";
      
      int hour = int.parse(timeParts[0]);
      final minute = int.parse(timeParts[1]);

      if (isPM && hour < 12) hour += 12;
      if (isAM && hour == 12) hour = 0;

      final scheduled = DateTime(year, month, day, hour, minute);

      final diff = scheduled.difference(takenAt);
      if (diff.inMinutes > 10) {
        if (diff.inHours >= 1) {
          final hrs = diff.inHours;
          final mins = diff.inMinutes % 60;
          return "Early (${hrs}h ${mins}m)";
        }
        return "Early (${diff.inMinutes}m)";
      }
    } catch (e) {
      debugPrint("Error calculating early offset: $e");
    }
    return "Taken";
  }

  List<Map<String, dynamic>> _convertRecords(
    List<TodayScheduleModel> schedules,
  ) {
    return schedules.map((item) {
      final parsedDate = DateTime.tryParse(item.date ?? "");

      return {
        "id": item.id,
        "name": item.name ?? "",
        "dose": item.dosage?.replaceAll(RegExp(r'[^0-9]'), '') ?? "",
        "unit": item.dosage?.replaceAll(RegExp(r'[0-9]'), '') ?? "",
        "time": item.time ?? "",
        "dateTime": parsedDate ?? DateTime.now(),
        "dateString": parsedDate != null
            ? DateFormat("d MMM yyyy, EEEE").format(parsedDate)
            : "",
        "status": item.status?.toLowerCase() == "taken"
            ? _getEarlyTakenLabel(item.date, item.time, item.takenAt)
            : _formatStatus(item.status ?? ""),
        "isVerified": item.verified ?? false,
        "proofImage": item.proofImage,
      };
    }).toList();
  }

  String _formatStatus(String status) {
    switch (status.toLowerCase()) {
      case "taken":
        return "Taken";
      case "missed":
        return "Missed";
      default:
        return "Pending";
    }
  }

  List<Map<String, dynamic>> _getFilteredRecords(
    String tabName,
    List<Map<String, dynamic>> records,
  ) {
    return records.where((record) {
      bool matchesTab = tabName == "All Records" || record['status'] == tabName;

      bool matchesDate = true;

      if (_selectedDateRange != null) {
        DateTime date = record['dateTime'];

        matchesDate =
            (date.isAtSameMomentAs(_selectedDateRange!.start) ||
                date.isAfter(_selectedDateRange!.start)) &&
            (date.isAtSameMomentAs(_selectedDateRange!.end) ||
                date.isBefore(_selectedDateRange!.end));
      }

      return matchesTab && matchesDate;
    }).toList();
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: _selectedDateRange,
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: accentCyan,
              onPrimary: Colors.black,
              surface: surfaceColor,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _selectedDateRange = picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,

      appBar: AppBar(
        backgroundColor: darkBg,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        title: const Text(
          "Medical Records",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: accentCyan),
            onPressed: () => _generateAndSharePDF(_tabController.index),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              _buildTopNavigation(),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTabContent("All Records"),
                    _buildTabContent("Taken"),
                    _buildTabContent("Missed"),
                    _buildTabContent("Pending"),
                  ],
                ),
              ),
            ],
          ),

          /// 🔹 Full Screen Loader
          if (_isSharing)
            Container(
              color: Colors.black.withOpacity(0.45),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: accentCyan),

                    SizedBox(height: 14),

                    Text(
                      "Preparing PDF...",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
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

  Widget _buildTopNavigation() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              padding: EdgeInsets.zero,
              labelPadding: const EdgeInsets.only(right: 24),
              indicatorColor: accentCyan,
              labelColor: accentCyan,
              unselectedLabelColor: textGrey,
              dividerColor: Colors.transparent,
              tabs: const [
                Tab(text: "All Records"),
                Tab(text: "Taken"),
                Tab(text: "Missed"),
                Tab(text: "Pending"),
              ],
            ),
          ),
          IconButton(
            icon: Icon(
              Icons.filter_list,
              color: _selectedDateRange != null
                  ? Colors.greenAccent
                  : accentCyan,
            ),
            onPressed: _selectDateRange,
          ),
        ],
      ),
    );
  }

  Widget _buildTabContent(String tabName) {
    final scheduleAsync = ref.watch(getTodayScheduleProvider);

    return scheduleAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: accentCyan)),

      error: (error, stack) => Center(
        child: Text(
          error.toString(),
          style: const TextStyle(color: Colors.red),
        ),
      ),

      data: (response) {
        if (response.status != ResponseStatus.SUCCESS ||
            response.data == null) {
          return const Center(
            child: Text("No records found", style: TextStyle(color: textGrey)),
          );
        }

        final schedules = response.data as List<TodayScheduleModel>;

        final records = _convertRecords(schedules);

        final filteredItems = records.where((record) {
          bool matchesTab =
              tabName == "All Records" || record['status'] == tabName;

          bool matchesDate = true;

          if (_selectedDateRange != null) {
            DateTime date = record['dateTime'];

            matchesDate =
                (date.isAtSameMomentAs(_selectedDateRange!.start) ||
                    date.isAfter(_selectedDateRange!.start)) &&
                (date.isAtSameMomentAs(_selectedDateRange!.end) ||
                    date.isBefore(_selectedDateRange!.end));
          }

          return matchesTab && matchesDate;
        }).toList();

        Map<String, List<Map<String, dynamic>>> grouped = {};

        for (var item in filteredItems) {
          grouped.putIfAbsent(item['dateString'], () => []).add(item);
        }

        if (filteredItems.isEmpty) {
          return const Center(
            child: Text("No records found", style: TextStyle(color: textGrey)),
          );
        }

        return RefreshIndicator(
          color: accentCyan,
          backgroundColor: surfaceColor,
          onRefresh: () async {
            // await ref.refresh(getTodayScheduleProvider.future);
            ref.invalidate(getTodayScheduleProvider);
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            children: [
              _buildComplianceChart(records),
              _buildStatsSection(records),

              ...grouped.keys.map(
                (date) => _buildDateGroup(date, grouped[date]!),
              ),

              _buildBottomInfoCard(),

              const SizedBox(height: 50),
            ],
          ),
        );
      },
    );
  }

  /// 🔹 WEEKLY COMPLIANCE LINE CHART
  Widget _buildComplianceChart(List<Map<String, dynamic>> items) {
    // Group records by date and compute taken/missed/pending counts per day
    final Map<String, Map<String, int>> byDate = {};
    for (final item in items) {
      final dateStr = item['dateString'] as String? ?? '';
      byDate.putIfAbsent(
        dateStr,
        () => {'taken': 0, 'missed': 0, 'pending': 0},
      );
      final status = (item['status'] as String).toLowerCase();
      if (byDate[dateStr]!.containsKey(status)) {
        byDate[dateStr]![status] = byDate[dateStr]![status]! + 1;
      }
    }

    // Take the last 7 days (sorted)
    final sortedDates = byDate.keys.toList()
      ..sort((a, b) {
        final df = DateFormat('d MMM yyyy, EEEE');
        try {
          return df.parse(a).compareTo(df.parse(b));
        } catch (_) {
          return 0;
        }
      });
    final last7 = sortedDates.length > 7
        ? sortedDates.sublist(sortedDates.length - 7)
        : sortedDates;

    // Build fl_chart spot lists
    final takenSpots = <FlSpot>[];
    final missedSpots = <FlSpot>[];
    final pendingSpots = <FlSpot>[];
    for (int i = 0; i < last7.length; i++) {
      final d = byDate[last7[i]]!;
      takenSpots.add(FlSpot(i.toDouble(), d['taken']!.toDouble()));
      missedSpots.add(FlSpot(i.toDouble(), d['missed']!.toDouble()));
      pendingSpots.add(FlSpot(i.toDouble(), d['pending']!.toDouble()));
    }

    // Short day labels for x-axis
    List<String> shortLabels(List<String> dates) {
      return dates.map((d) {
        try {
          final parsed = DateFormat('d MMM yyyy, EEEE').parse(d);
          return DateFormat('EEE').format(parsed);
        } catch (_) {
          return d.length > 3 ? d.substring(0, 3) : d;
        }
      }).toList();
    }

    final labels = shortLabels(last7);

    LineChartBarData _line(List<FlSpot> spots, Color color) {
      return LineChartBarData(
        spots: spots,
        isCurved: true,
        color: color,
        barWidth: 2.5,
        isStrokeCapRound: true,
        dotData: FlDotData(
          show: true,
          getDotPainter: (spot, _, __, ___) => FlDotCirclePainter(
            radius: 4,
            color: color,
            strokeWidth: 1.5,
            strokeColor: Colors.black,
          ),
        ),
        belowBarData: BarAreaData(
          show: true,
          color: color.withOpacity(0.08),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Weekly Compliance',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              Row(
                children: [
                  _chartLegend(Colors.greenAccent, 'Taken'),
                  const SizedBox(width: 10),
                  _chartLegend(Colors.redAccent, 'Missed'),
                  const SizedBox(width: 10),
                  _chartLegend(Colors.orangeAccent, 'Pending'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 160,
            child: last7.isEmpty
                ? const Center(
                    child: Text(
                      'No data yet',
                      style: TextStyle(color: textGrey, fontSize: 12),
                    ),
                  )
                : LineChart(
                    LineChartData(
                      minY: 0,
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                        getDrawingHorizontalLine: (_) => FlLine(
                          color: Colors.white.withOpacity(0.06),
                          strokeWidth: 1,
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 24,
                            getTitlesWidget: (v, _) => Text(
                              v.toInt().toString(),
                              style: const TextStyle(
                                color: textGrey,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            interval: 1,
                            getTitlesWidget: (v, _) {
                              final idx = v.toInt();
                              if (idx < 0 || idx >= labels.length) {
                                return const SizedBox.shrink();
                              }
                              return Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  labels[idx],
                                  style: const TextStyle(
                                    color: textGrey,
                                    fontSize: 9,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        rightTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        topTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                      ),
                      lineBarsData: [
                        _line(takenSpots, Colors.greenAccent),
                        _line(missedSpots, Colors.redAccent),
                        _line(pendingSpots, Colors.orangeAccent),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _chartLegend(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(color: textGrey, fontSize: 9),
        ),
      ],
    );
  }

  Widget _buildStatsSection(List<Map<String, dynamic>> items) {
    final int totalCount = items.length;

    final int takenCount = items
        .where((item) => item['status'] == "Taken")
        .length;

    final int missedCount = items
        .where((item) => item['status'] == "Missed")
        .length;

    final int pendingCount = items
        .where((item) => item['status'] == "Pending")
        .length;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cardBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _statColumn("Total Records", totalCount.toString(), accentCyan),
          _statColumn("Taken", takenCount.toString(), Colors.greenAccent),
          _statColumn("Missed", missedCount.toString(), Colors.redAccent),
          _statColumn("Pending", pendingCount.toString(), Colors.orangeAccent),
        ],
      ),
    );
  }

  Widget _statColumn(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(label, style: const TextStyle(color: textGrey, fontSize: 10)),

        const SizedBox(height: 4),

        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildDateGroup(String date, List<Map<String, dynamic>> dateRecords) {
    bool isOpen = _expandedDates.contains(date);
    return Column(
      children: [
        GestureDetector(
          onTap: () => setState(
            () =>
                isOpen ? _expandedDates.remove(date) : _expandedDates.add(date),
          ),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: isOpen
                  ? const BorderRadius.vertical(top: Radius.circular(12))
                  : BorderRadius.circular(12),
              border: Border.all(color: cardBorder),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today, color: accentCyan, size: 16),
                const SizedBox(width: 8),
                Text(
                  date,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Text(
                  "${dateRecords.length} doses",
                  style: TextStyle(color: textGrey, fontSize: 12),
                ),
                Icon(
                  isOpen ? Icons.expand_less : Icons.expand_more,
                  color: accentCyan,
                ),
              ],
            ),
          ),
        ),
        if (isOpen)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: const BoxDecoration(
              color: surfaceColor,
              border: Border.symmetric(vertical: BorderSide(color: cardBorder)),
            ),
            child: Column(
              children: dateRecords
                  .map((item) => _buildMedicineTile(item))
                  .toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildMedicineTile(Map<String, dynamic> item) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: cardBorder)),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icon
            Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF1C2128),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.local_hospital,
                color: accentCyan,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            // Name/Dose
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    item['name'],
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                    softWrap: true,
                    maxLines: 2,
                  ),
                  Text(
                    "${item['dose']} ${item['unit']}",
                    style: const TextStyle(color: textGrey, fontSize: 11),
                  ),
                ],
              ),
            ),
            // Time
            Expanded(
              flex: 3,
              child: Text(
                item['time'],
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 11),
              ),
            ),
            // Status + Verified Badge
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _statusBadge(item['status']),
                  if (item['isVerified'])
                    const Text(
                      "Verified",
                      style: TextStyle(color: Color(0xFF4A8BFF), fontSize: 9),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // --- VERIFICATION PHOTO ---
            GestureDetector(
              onTap: () async {
                if (item['proofImage'] != null) {
                  // Verified — open full-screen stamped selfie viewer
                  _showSelfieViewer(context, item['proofImage'] as String, item['name'] as String);
                } else {
                  // Not yet verified — go to selfie verification flow
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => SelfieVerficationMedicineScreen(
                        doseId: item['id'],
                        medicineName: item['name'],
                        dosage: item['dose'].toString(),
                        unit: item['unit'].toString(),
                      ),
                    ),
                  );

                  if (result == true) {
                    ref.invalidate(getTodayScheduleProvider);

                    if (mounted) {
                      setState(() {});
                    }
                  }
                }
              },
              child: Container(
                height: 42,
                width: 42,
                decoration: BoxDecoration(
                  color: const Color(0xFF1C2128),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: cardBorder),
                ),
                child: item['status'] == "Taken" && item['proofImage'] != null
                    ? Stack(
                        children: [
                          Container(
                            height: 42,
                            width: 42,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              image: DecorationImage(
                                image: CachedNetworkImageProvider(
                                  "${item['proofImage']}?t=${DateTime.now().millisecondsSinceEpoch}",
                                ),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),

                          const Positioned(
                            right: 2,
                            top: 2,
                            child: Icon(
                              Icons.check_circle,
                              color: Colors.greenAccent,
                              size: 12,
                            ),
                          ),
                        ],
                      )
                    : const Icon(
                        Icons.camera_alt_outlined,
                        color: textGrey,
                        size: 20,
                      ),
              ),
            ),
            const SizedBox(width: 6),
            const Icon(Icons.chevron_right, color: textGrey, size: 18),
          ],
        ),
      ),
    );
  }

  /// 🔹 Full-Screen Stamped Selfie Viewer
  void _showSelfieViewer(BuildContext context, String imageUrl, String medicineName) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.92,
        decoration: const BoxDecoration(
          color: Color(0xFF0D1117),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  const Icon(Icons.verified_user, color: Color(0xFF4FD1C5), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '$medicineName — Verified Proof',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: Colors.white54, size: 20),
                  ),
                ],
              ),
            ),
            const Divider(color: Color(0xFF30363D), height: 1),
            // Selfie image
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: InteractiveViewer(
                    minScale: 0.5,
                    maxScale: 3.0,
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.contain,
                      placeholder: (context, url) => const Center(
                        child: CircularProgressIndicator(color: Color(0xFF4FD1C5)),
                      ),
                      errorWidget: (context, url, error) => const Center(
                        child: Icon(Icons.broken_image_outlined, color: Colors.white38, size: 48),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            // Timestamp info footer
            Container(
              margin: const EdgeInsets.fromLTRB(16, 0, 16, 20),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF161B22),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF30363D)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Color(0xFF4FD1C5), size: 14),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Date, time and Medikto branding are permanently stamped on this image.',
                      style: TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {

    Color color = status == "Taken"
        ? Colors.greenAccent
        : (status == "Missed" ? Colors.redAccent : Colors.orangeAccent);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildBottomInfoCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        children: [
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, color: accentCyan, size: 20),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Selfie verification is required for each taken dose.",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      "Tap on any record to view full details and selfie.",
                      style: TextStyle(color: textGrey, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              _legendDot(Colors.greenAccent, "Taken"),
              const SizedBox(width: 12),
              _legendDot(Colors.orangeAccent, "Pending"),
              const SizedBox(width: 12),
              _legendDot(Colors.redAccent, "Missed"),
            ],
          ),
        ],
      ),
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: textGrey, fontSize: 11)),
      ],
    );
  }

  Future<void> _generateAndSharePDF(int tabIndex) async {
    if (_isSharing) return;

    setState(() {
      _isSharing = true;
    });

    try {
      final tabNames = ["All Records", "Taken", "Missed", "Pending"];

      final response = await ref.read(getTodayScheduleProvider.future);

      if (response.status != ResponseStatus.SUCCESS || response.data == null) {
        return;
      }

      final schedules = response.data as List<TodayScheduleModel>;

      final records = _convertRecords(schedules);

      final currentList = _getFilteredRecords(tabNames[tabIndex], records);

      final pdf = pw.Document();

      pdf.addPage(
        pw.MultiPage(
          pageTheme: pw.PageTheme(
            margin: const pw.EdgeInsets.all(32),
            theme: pw.ThemeData.withFont(
              base: pw.Font.helvetica(),
              bold: pw.Font.helveticaBold(),
            ),
          ),

          build: (context) {
            final takenCount = currentList
                .where((e) => e['status'] == "Taken")
                .length;

            final missedCount = currentList
                .where((e) => e['status'] == "Missed")
                .length;

            final pendingCount = currentList
                .where((e) => e['status'] == "Pending")
                .length;

            return [
              /// 🔹 HEADER
              pw.Container(
                padding: const pw.EdgeInsets.all(24),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex("#4FD1C5"),
                  borderRadius: pw.BorderRadius.circular(20),
                ),

                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          "MEDIKTO",
                          style: pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 26,
                            fontWeight: pw.FontWeight.bold,
                          ),
                        ),

                        pw.SizedBox(height: 6),

                        pw.Text(
                          "Medical Records Report",
                          style: pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 14,
                          ),
                        ),

                        pw.SizedBox(height: 10),

                        pw.Container(
                          padding: const pw.EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: pw.BoxDecoration(
                            color: PdfColors.white,
                            borderRadius: pw.BorderRadius.circular(30),
                          ),
                          child: pw.Text(
                            tabNames[tabIndex],
                            style: pw.TextStyle(
                              color: PdfColor.fromHex("#4FD1C5"),
                              fontWeight: pw.FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                    ),

                    /// 🔹 BIG PLUS ICON WATERMARK
                    pw.Opacity(
                      opacity: 0.18,
                      child: pw.Text(
                        "+",
                        style: pw.TextStyle(
                          fontSize: 100,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              pw.SizedBox(height: 24),

              /// 🔹 REPORT INFO
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text(
                    "Generated On",
                    style: pw.TextStyle(
                      fontWeight: pw.FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),

                  pw.Text(
                    DateFormat("dd MMM yyyy - hh:mm a").format(DateTime.now()),
                    style: const pw.TextStyle(fontSize: 12),
                  ),
                ],
              ),

              pw.SizedBox(height: 24),

              /// 🔹 STATS CARDS
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  _pdfStatCard(
                    "Total",
                    currentList.length.toString(),
                    PdfColor.fromHex("#4FD1C5"),
                  ),

                  _pdfStatCard("Taken", takenCount.toString(), PdfColors.green),

                  _pdfStatCard("Missed", missedCount.toString(), PdfColors.red),

                  _pdfStatCard(
                    "Pending",
                    pendingCount.toString(),
                    PdfColors.orange,
                  ),
                ],
              ),

              pw.SizedBox(height: 28),

              /// 🔹 TABLE TITLE
              pw.Text(
                "Medication History",
                style: pw.TextStyle(
                  fontSize: 18,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex("#1F2937"),
                ),
              ),

              pw.SizedBox(height: 14),

              /// 🔹 PREMIUM TABLE
              pw.TableHelper.fromTextArray(
                border: null,

                headerDecoration: pw.BoxDecoration(
                  color: PdfColor.fromHex("#4FD1C5"),
                  borderRadius: const pw.BorderRadius.only(
                    topLeft: pw.Radius.circular(12),
                    topRight: pw.Radius.circular(12),
                  ),
                ),

                headerStyle: pw.TextStyle(
                  color: PdfColors.white,
                  fontWeight: pw.FontWeight.bold,
                  fontSize: 12,
                ),

                cellStyle: const pw.TextStyle(fontSize: 10),

                cellAlignment: pw.Alignment.center,

                cellPadding: const pw.EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 12,
                ),
                rowDecoration: const pw.BoxDecoration(color: PdfColors.white,
),

                oddRowDecoration: pw.BoxDecoration(
                  color: PdfColor.fromHex("#F8FAFC"),
                ),





                data: <List<String>>[
                  <String>['Date', 'Medicine', 'Dose', 'Time', 'Status'],

                  ...currentList.map(
                    (item) => [
                      item['dateString'],
                      item['name'],
                      "${item['dose']} ${item['unit']}",
                      item['time'],
                      item['status'],
                    ],
                  ),
                ],
              ),

              pw.SizedBox(height: 30),

              /// 🔹 FOOTER CARD
              pw.Container(
                padding: const pw.EdgeInsets.all(16),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex("#F8FAFC"),
                  borderRadius: pw.BorderRadius.circular(14),
                ),

                child: pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Container(
                      height: 24,
                      width: 24,
                      alignment: pw.Alignment.center,
                      decoration: pw.BoxDecoration(
                        color: PdfColor.fromHex("#4FD1C5"),
                        shape: pw.BoxShape.circle,
                      ),
                      child: pw.Text(
                        "i",
                        style: pw.TextStyle(
                          color: PdfColors.white,
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                    ),

                    pw.SizedBox(width: 12),

                    pw.Expanded(
                      child: pw.Text(
                        "This report was generated securely using the Medikto platform. "
                        "Medication adherence and verification records are included for reference purposes.",
                        style: pw.TextStyle(
                          fontSize: 10,
                          color: PdfColor.fromHex("#6B7280"),
                          lineSpacing: 2,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ];
          },
        ),
      );
      final output = await getTemporaryDirectory();

      final file = File("${output.path}/medical_records_report.pdf");

      await file.writeAsBytes(await pdf.save());

      setState(() {
        _isSharing = false;
      });

      await Share.shareXFiles([XFile(file.path)]);
    } catch (e) {
      setState(() {
        _isSharing = false;
      });
    }
  }

  pw.Widget _pdfStatCard(String title, String value, PdfColor color) {
    return pw.Container(
      width: 110,
      padding: const pw.EdgeInsets.all(14),
      decoration: pw.BoxDecoration(
        borderRadius: pw.BorderRadius.circular(14),
        border: pw.Border.all(color: color, width: 1),
      ),

      child: pw.Column(
        children: [
          pw.Text(
            value,
            style: pw.TextStyle(
              color: color,
              fontSize: 22,
              fontWeight: pw.FontWeight.bold,
            ),
          ),

          pw.SizedBox(height: 6),

          pw.Text(title, style: const pw.TextStyle(fontSize: 11)),
        ],
      ),
    );
  }
}
