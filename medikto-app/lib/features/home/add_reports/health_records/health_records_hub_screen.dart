import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/health_data/add_blood_pressure.dart';
import 'package:medikto/features/home/add_reports/health_data/add_body_temparature.dart';
import 'package:medikto/features/home/add_reports/health_data/add_heart_rate.dart';
import 'package:medikto/features/home/add_reports/health_data/add_sugar_levels.dart';
import 'package:medikto/features/home/add_reports/health_records/add_medicine_reports.dart';
import 'package:medikto/features/home/add_reports/health_records/add_prescription_file.dart';
import 'package:medikto/features/home/add_reports/health_records/medical_report_detail_screen.dart';
import 'package:medikto/features/home/add_reports/health_records/prescription_detail_screen.dart';
import 'package:medikto/features/home/add_reports/models/medical_report_model.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';

class HealthRecordsHubScreen extends ConsumerStatefulWidget {
  final int initialTabIndex;
  const HealthRecordsHubScreen({super.key, this.initialTabIndex = 0});

  @override
  ConsumerState<HealthRecordsHubScreen> createState() =>
      _HealthRecordsHubScreenState();
}

class _HealthRecordsHubScreenState extends ConsumerState<HealthRecordsHubScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Search controllers
  final TextEditingController _vitalSearchController = TextEditingController();
  final TextEditingController _reportSearchController = TextEditingController();
  final TextEditingController _prescriptionSearchController =
      TextEditingController();

  // Search state
  String _vitalQuery = "";
  String _reportQuery = "";
  String _prescriptionQuery = "";

  // Filter state
  String _selectedVitalFilter = "All"; // All, bloodPressure, heartRate, sugar, temperature
  String _selectedReportCondition = "All"; // All, Critical, Moderate, Normal
  String _selectedReportType = "All"; // All, Medical, Lab, Vaccination, Prescription
  String _selectedPrescriptionReminder = "All"; // All, Active, Disabled
  bool _showTrendChart = true;

  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color cardColor = Color(0xFF181818);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 3,
      vsync: this,
      initialIndex: widget.initialTabIndex.clamp(0, 2),
    );
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
    _vitalSearchController.addListener(() {
      setState(() {
        _vitalQuery = _vitalSearchController.text.toLowerCase();
      });
    });
    _reportSearchController.addListener(() {
      setState(() {
        _reportQuery = _reportSearchController.text.toLowerCase();
      });
    });
    _prescriptionSearchController.addListener(() {
      setState(() {
        _prescriptionQuery = _prescriptionSearchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _vitalSearchController.dispose();
    _reportSearchController.dispose();
    _prescriptionSearchController.dispose();
    super.dispose();
  }

  void _shareAllVitals(List<VitalsModel> records) {
    if (records.isEmpty) {
      Share.share("No health readings recorded yet in Medikto.");
      return;
    }

    final buffer = StringBuffer();
    buffer.writeln("📋 Medikto Health Records Summary");
    buffer.writeln("--------------------------------------");

    for (int i = 0; i < records.length && i < 20; i++) {
      final r = records[i];
      final dateStr = r.recordedAt != null
          ? DateFormat("dd MMM yyyy, hh:mm a").format(r.recordedAt!.toLocal())
          : "N/A";

      String title = _getVitalTitle(r.type);
      String val = _getVitalValueWithUnit(r);
      String status = _getVitalStatus(r);

      buffer.writeln("• $dateStr — $title: $val ${status.isNotEmpty ? '($status)' : ''}");
      if (r.notes != null && r.notes!.isNotEmpty) {
        buffer.writeln("  Notes: ${r.notes}");
      }
    }

    buffer.writeln("--------------------------------------");
    buffer.writeln("Generated via Medikto Health App");

    Share.share(buffer.toString(), subject: "My Health Records & Vitals History");
  }

  String _getVitalTitle(String type) {
    switch (type) {
      case "bloodPressure":
        return "Blood Pressure";
      case "heartRate":
        return "Heart Rate";
      case "sugar":
        return "Blood Sugar";
      case "temperature":
        return "Body Temperature";
      default:
        return "Vital Reading";
    }
  }

  String _getVitalValueWithUnit(VitalsModel r) {
    switch (r.type) {
      case "bloodPressure":
        return "${r.systolic ?? '--'}/${r.diastolic ?? '--'} mmHg";
      case "heartRate":
        return "${r.heartRate ?? '--'} BPM";
      case "sugar":
        return "${r.sugarLevel ?? '--'} mg/dL";
      case "temperature":
        return "${r.temperature ?? '--'} °F";
      default:
        return "--";
    }
  }

  String _getVitalStatus(VitalsModel r) {
    switch (r.type) {
      case "bloodPressure":
        return r.bloodPressureStatus ?? "";
      case "heartRate":
        return r.heartRateStatus ?? "";
      case "sugar":
        return r.sugarStatus ?? "";
      case "temperature":
        return r.temperatureStatus ?? "";
      default:
        return "";
    }
  }

  IconData _getVitalIcon(String type) {
    switch (type) {
      case "bloodPressure":
        return Icons.favorite_outline;
      case "heartRate":
        return Icons.favorite;
      case "sugar":
        return Icons.water_drop_outlined;
      case "temperature":
        return Icons.thermostat;
      default:
        return Icons.health_and_safety_outlined;
    }
  }

  void _openAddVitalScreen(String type) async {
    Widget screen;
    switch (type) {
      case "bloodPressure":
        screen = const AddBloodPressureScreen();
        break;
      case "heartRate":
        screen = const AddHeartRateScreen();
        break;
      case "temperature":
        screen = const AddBodyTemparatureScreen();
        break;
      case "sugar":
        screen = const AddSugarLevelsScreen();
        break;
      default:
        return;
    }

    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => screen),
    );
    if (result == true) {
      ref.invalidate(getVitalsProvider);
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
        title: "Medical Documents Hub",
        backgroundColor: darkBg,
        titleStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () => Navigator.pop(context),
      ),
      floatingActionButton: isGuardian
          ? null
          : _buildFloatingActionButton(),
      body: Column(
        children: [
          // Elegant, elderly-friendly TabBar container
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white10),
            ),
            child: TabBar(
              controller: _tabController,
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelPadding: const EdgeInsets.symmetric(horizontal: 2),
              indicator: BoxDecoration(
                color: accentCyan.withOpacity(0.18),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: accentCyan.withOpacity(0.4)),
              ),
              labelColor: accentCyan,
              unselectedLabelColor: Colors.white54,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle:
                  const TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
              tabs: const [
                Tab(text: "Vitals"),
                Tab(text: "Reports"),
                Tab(text: "Prescriptions"),
              ],
            ),
          ),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildVitalsHistoryTab(isGuardian),
                _buildReportsTab(),
                _buildPrescriptionsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget? _buildFloatingActionButton() {
    if (_tabController.index == 1) {
      return FloatingActionButton.extended(
        backgroundColor: accentCyan,
        foregroundColor: Colors.black,
        icon: const Icon(Icons.upload_file, size: 20),
        label: const Text("Upload Report", style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const AddMedicalMedicationsScreen(),
            ),
          );
          ref.invalidate(getReportsProvider);
        },
      );
    } else if (_tabController.index == 2) {
      return FloatingActionButton.extended(
        backgroundColor: accentCyan,
        foregroundColor: Colors.black,
        icon: const Icon(Icons.add, size: 20),
        label: const Text("Add Prescription", style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const AddPrescriptionFileScreen(),
            ),
          );
          ref.invalidate(getPrescriptionsProvider);
        },
      );
    }
    return null;
  }

  // ================= 1. HEALTH VITALS & CENTRAL HISTORY TAB =================
  Widget _buildVitalsHistoryTab(bool isGuardian) {
    final vitalsAsync = ref.watch(getVitalsProvider);

    return RefreshIndicator(
      color: accentCyan,
      backgroundColor: surfaceColor,
      onRefresh: () async {
        ref.invalidate(getVitalsProvider);
      },
      child: vitalsAsync.when(
        data: (responseData) {
          final List<VitalsModel> allVitals =
              (responseData.data as List?)?.cast<VitalsModel>() ?? [];

          // Latest readings map
          VitalsModel? latestBP;
          VitalsModel? latestHR;
          VitalsModel? latestSugar;
          VitalsModel? latestTemp;

          try {
            latestBP = allVitals.firstWhere((e) => e.type == "bloodPressure");
          } catch (_) {}
          try {
            latestHR = allVitals.firstWhere((e) => e.type == "heartRate");
          } catch (_) {}
          try {
            latestSugar = allVitals.firstWhere((e) => e.type == "sugar");
          } catch (_) {}
          try {
            latestTemp = allVitals.firstWhere((e) => e.type == "temperature");
          } catch (_) {}

          // Filter records according to selected chip and search query
          final filteredRecords = allVitals.where((r) {
            final matchesType = _selectedVitalFilter == "All" ||
                r.type.toLowerCase() == _selectedVitalFilter.toLowerCase();

            final title = _getVitalTitle(r.type).toLowerCase();
            final val = _getVitalValueWithUnit(r).toLowerCase();
            final notes = r.notes?.toLowerCase() ?? "";
            final status = _getVitalStatus(r).toLowerCase();
            final date = r.recordedAt != null
                ? DateFormat("dd MMM yyyy").format(r.recordedAt!.toLocal()).toLowerCase()
                : "";

            final matchesQuery = _vitalQuery.isEmpty ||
                title.contains(_vitalQuery) ||
                val.contains(_vitalQuery) ||
                notes.contains(_vitalQuery) ||
                status.contains(_vitalQuery) ||
                date.contains(_vitalQuery);

            return matchesType && matchesQuery;
          }).toList();

          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            children: [
              // Search input
              _buildSearchBar(
                _vitalSearchController,
                "Search vitals by name, value, date, notes...",
              ),
              const SizedBox(height: 12),

              // Filter Chips
              _buildVitalFilterChips(),

              const SizedBox(height: 12),

              // Optional Trend Graph (if a specific vital is selected or records exist)
              if (_selectedVitalFilter != "All" && _showTrendChart) ...[
                _buildCentralTrendChart(
                  filteredRecords
                      .where((e) => e.type == _selectedVitalFilter)
                      .toList(),
                  _selectedVitalFilter,
                ),
                const SizedBox(height: 16),
              ],

              // Previous Readings Header + Share
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _selectedVitalFilter == "All"
                        ? "ALL PREVIOUS READINGS"
                        : "${_getVitalTitle(_selectedVitalFilter).toUpperCase()} HISTORY",
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  if (filteredRecords.isNotEmpty)
                    InkWell(
                      onTap: () => _shareAllVitals(filteredRecords),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: accentCyan.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: accentCyan.withOpacity(0.3)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.share_outlined, color: accentCyan, size: 14),
                            SizedBox(width: 4),
                            Text(
                              "Share",
                              style: TextStyle(
                                color: accentCyan,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),

              // History list items
              if (filteredRecords.isEmpty)
                _buildEmptyState(
                  icon: Icons.monitor_heart_outlined,
                  title: "No Vital Readings Found",
                  subtitle: "Tap the floating '+' button to record a new entry.",
                )
              else
                ...filteredRecords.map((r) => _buildUnifiedVitalRecordCard(r)),

              const SizedBox(height: 80),
            ],
          );
        },
        loading: () =>
            const Center(child: CircularProgressIndicator(color: accentCyan)),
        error: (err, st) => _buildErrorState(err.toString()),
      ),
    );
  }

  Widget _buildVitalSummaryGrid({
    required VitalsModel? latestBP,
    required VitalsModel? latestHR,
    required VitalsModel? latestSugar,
    required VitalsModel? latestTemp,
    required bool isGuardian,
  }) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.15,
      children: [
        _buildVitalSummaryCard(
          title: "Blood Pressure",
          type: "bloodPressure",
          icon: Icons.favorite_outline,
          value: latestBP != null && latestBP.systolic != null
              ? "${latestBP.systolic}/${latestBP.diastolic} mmHg"
              : "No reading",
          date: latestBP?.recordedAt,
          status: latestBP?.bloodPressureStatus,
          isGuardian: isGuardian,
        ),
        _buildVitalSummaryCard(
          title: "Heart Rate",
          type: "heartRate",
          icon: Icons.favorite,
          value: latestHR != null && latestHR.heartRate != null
              ? "${latestHR.heartRate} BPM"
              : "No reading",
          date: latestHR?.recordedAt,
          status: latestHR?.heartRateStatus,
          isGuardian: isGuardian,
        ),
        _buildVitalSummaryCard(
          title: "Blood Sugar",
          type: "sugar",
          icon: Icons.water_drop_outlined,
          value: latestSugar != null && latestSugar.sugarLevel != null
              ? "${latestSugar.sugarLevel} mg/dL"
              : "No reading",
          date: latestSugar?.recordedAt,
          status: latestSugar?.sugarStatus,
          isGuardian: isGuardian,
        ),
        _buildVitalSummaryCard(
          title: "Body Temperature",
          type: "temperature",
          icon: Icons.thermostat,
          value: latestTemp != null && latestTemp.temperature != null
              ? "${latestTemp.temperature} °F"
              : "No reading",
          date: latestTemp?.recordedAt,
          status: latestTemp?.temperatureStatus,
          isGuardian: isGuardian,
        ),
      ],
    );
  }

  Widget _buildVitalSummaryCard({
    required String title,
    required String type,
    required IconData icon,
    required String value,
    required DateTime? date,
    required String? status,
    required bool isGuardian,
  }) {
    final hasValue = value != "No reading";
    final timeStr = date != null ? _formatRecordDate(date) : "";

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: accentCyan, size: 18),
                  const SizedBox(width: 6),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (status != null && status.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: accentCyan.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    status,
                    style: const TextStyle(
                      color: accentCyan,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  color: hasValue ? Colors.white : Colors.white38,
                  fontSize: hasValue ? 16 : 13,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (timeStr.isNotEmpty)
                Text(
                  timeStr,
                  style: const TextStyle(color: Colors.white38, fontSize: 10),
                  maxLines: 1,
                ),
            ],
          ),

          // Add reading button
          if (!isGuardian)
            SizedBox(
              width: double.infinity,
              height: 32,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentCyan.withOpacity(0.15),
                  foregroundColor: accentCyan,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: accentCyan.withOpacity(0.3)),
                  ),
                ),
                onPressed: () => _openAddVitalScreen(type),
                icon: const Icon(Icons.add, size: 14),
                label: const Text(
                  "Add Reading",
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildVitalFilterChips() {
    final filters = [
      {"label": "All Vitals", "type": "All"},
      {"label": "Blood Pressure", "type": "bloodPressure"},
      {"label": "Heart Rate", "type": "heartRate"},
      {"label": "Blood Sugar", "type": "sugar"},
      {"label": "Body Temp", "type": "temperature"},
    ];

    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final item = filters[index];
          final isSelected = _selectedVitalFilter == item["type"];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(item["label"]!),
              labelStyle: TextStyle(
                color: isSelected ? accentCyan : Colors.white60,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  setState(() => _selectedVitalFilter = item["type"]!);
                }
              },
              backgroundColor: surfaceColor,
              selectedColor: accentCyan.withOpacity(0.18),
              checkmarkColor: accentCyan,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: isSelected
                      ? accentCyan.withOpacity(0.5)
                      : Colors.white10,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCentralTrendChart(List<VitalsModel> records, String vitalType) {
    if (records.isEmpty) return const SizedBox();

    final chartRecords = records.take(10).toList().reversed.toList();
    List<FlSpot> mainSpots = [];
    List<FlSpot> secondarySpots = [];

    for (int i = 0; i < chartRecords.length; i++) {
      final r = chartRecords[i];
      switch (vitalType) {
        case "bloodPressure":
          if (r.systolic != null) {
            mainSpots.add(FlSpot(i.toDouble(), r.systolic!.toDouble()));
          }
          if (r.diastolic != null) {
            secondarySpots.add(FlSpot(i.toDouble(), r.diastolic!.toDouble()));
          }
          break;
        case "heartRate":
          if (r.heartRate != null) {
            mainSpots.add(FlSpot(i.toDouble(), r.heartRate!.toDouble()));
          }
          break;
        case "temperature":
          if (r.temperature != null) {
            mainSpots.add(FlSpot(i.toDouble(), r.temperature!));
          }
          break;
        case "sugar":
          if (r.sugarLevel != null) {
            mainSpots.add(FlSpot(i.toDouble(), r.sugarLevel!.toDouble()));
          }
          break;
      }
    }

    if (mainSpots.isEmpty) return const SizedBox();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "${_getVitalTitle(vitalType)} Trend",
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (vitalType == "bloodPressure")
                const Row(
                  children: [
                    Text("• Sys", style: TextStyle(color: accentCyan, fontSize: 11)),
                    SizedBox(width: 8),
                    Text("• Dia", style: TextStyle(color: Colors.white54, fontSize: 11)),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 160,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (val) => FlLine(
                    color: Colors.white.withOpacity(0.06),
                    strokeWidth: 1,
                  ),
                ),
                titlesData: FlTitlesData(
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 32,
                      getTitlesWidget: (val, meta) => Text(
                        val.toInt().toString(),
                        style: const TextStyle(color: Colors.white30, fontSize: 9),
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 20,
                      getTitlesWidget: (val, meta) {
                        final idx = val.toInt();
                        if (idx >= 0 && idx < chartRecords.length) {
                          final date = chartRecords[idx].recordedAt;
                          if (date != null) {
                            return Text(
                              DateFormat("dd/MM").format(date.toLocal()),
                              style: const TextStyle(color: Colors.white38, fontSize: 9),
                            );
                          }
                        }
                        return const SizedBox();
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: mainSpots,
                    isCurved: true,
                    color: accentCyan,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(
                      show: true,
                      color: accentCyan.withOpacity(0.12),
                    ),
                  ),
                  if (secondarySpots.isNotEmpty)
                    LineChartBarData(
                      spots: secondarySpots,
                      isCurved: true,
                      color: Colors.white54,
                      barWidth: 2,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: true),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUnifiedVitalRecordCard(VitalsModel record) {
    final title = _getVitalTitle(record.type);
    final valStr = _getVitalValueWithUnit(record);
    final status = _getVitalStatus(record);
    final icon = _getVitalIcon(record.type);
    final dateStr = record.recordedAt != null
        ? _formatRecordDate(record.recordedAt!)
        : "Recent";

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            height: 42,
            width: 42,
            decoration: BoxDecoration(
              color: accentCyan.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: accentCyan, size: 20),
          ),
          const SizedBox(width: 12),
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
                        color: Colors.white70,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      valStr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      dateStr,
                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                    ),
                    if (status.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: accentCyan.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          status,
                          style: const TextStyle(
                            color: accentCyan,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                if (record.notes != null && record.notes!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    "Note: ${record.notes}",
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 11,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatRecordDate(DateTime dt) {
    final local = dt.toLocal();
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final itemDate = DateTime(local.year, local.month, local.day);

    final time = DateFormat("hh:mm a").format(local);

    if (itemDate == today) {
      return "Today, $time";
    } else if (itemDate == today.subtract(const Duration(days: 1))) {
      return "Yesterday, $time";
    } else {
      return "${DateFormat('dd MMM yyyy').format(local)}, $time";
    }
  }

  // ================= 2. REPORTS TAB =================
  Widget _buildReportsTab() {
    final reportsAsync = ref.watch(getReportsProvider);

    return Column(
      children: [
        // Search bar
        _buildSearchBar(
          _reportSearchController,
          "Search reports by title or description...",
        ),

        // Horizontal filters
        _buildReportFilterChips(),

        Expanded(
          child: RefreshIndicator(
            color: accentCyan,
            backgroundColor: surfaceColor,
            onRefresh: () async {
              ref.invalidate(getReportsProvider);
            },
            child: reportsAsync.when(
              data: (responseData) {
                final List<MedicalReportModel> reports =
                    (responseData.data as List?)?.cast<MedicalReportModel>() ?? [];

                // Filter logic
                final filteredReports = reports.where((report) {
                  final matchesQuery = report.title
                          .toLowerCase()
                          .contains(_reportQuery) ||
                      (report.description?.toLowerCase().contains(_reportQuery) ??
                          false);

                  final matchesCondition = _selectedReportCondition == "All" ||
                      report.condition.toLowerCase() ==
                          _selectedReportCondition.toLowerCase();

                  final matchesType = _selectedReportType == "All" ||
                      report.type.toLowerCase() ==
                          _selectedReportType.toLowerCase();

                  return matchesQuery && matchesCondition && matchesType;
                }).toList();

                if (filteredReports.isEmpty) {
                  return _buildEmptyState(
                    icon: Icons.assignment_outlined,
                    title: "No Reports Found",
                    subtitle: "Try altering search terms or upload a new report.",
                  );
                }

                return ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: filteredReports.length,
                  itemBuilder: (context, index) {
                    final report = filteredReports[index];
                    return _buildReportCard(report);
                  },
                );
              },
              loading: () =>
                  const Center(child: CircularProgressIndicator(color: accentCyan)),
              error: (err, st) => _buildErrorState(err.toString()),
            ),
          ),
        ),
      ],
    );
  }

  // ================= 3. PRESCRIPTIONS TAB =================
  Widget _buildPrescriptionsTab() {
    final prescriptionsAsync = ref.watch(getPrescriptionsProvider);

    return Column(
      children: [
        // Search bar
        _buildSearchBar(
          _prescriptionSearchController,
          "Search by medicine or instructions...",
        ),

        // Filter chips
        _buildPrescriptionFilterChips(),

        Expanded(
          child: RefreshIndicator(
            color: accentCyan,
            backgroundColor: surfaceColor,
            onRefresh: () async {
              ref.invalidate(getPrescriptionsProvider);
            },
            child: prescriptionsAsync.when(
              data: (responseData) {
                final List<PrescriptionModel> prescriptions =
                    (responseData.data as List?)?.cast<PrescriptionModel>() ?? [];

                // Filter logic
                final filteredPrescriptions = prescriptions.where((p) {
                  final matchesQuery = p.medicineName
                          .toLowerCase()
                          .contains(_prescriptionQuery) ||
                      (p.dosageInstructions
                              ?.toLowerCase()
                              .contains(_prescriptionQuery) ??
                          false);

                  final hasReminders = p.reminders.any((r) => r.enabled);
                  final matchesReminder = _selectedPrescriptionReminder == "All" ||
                      (_selectedPrescriptionReminder == "Active" &&
                          hasReminders) ||
                      (_selectedPrescriptionReminder == "Disabled" &&
                          !hasReminders);

                  return matchesQuery && matchesReminder;
                }).toList();

                if (filteredPrescriptions.isEmpty) {
                  return _buildEmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: "No Prescriptions Found",
                    subtitle: "Try altering search terms or add a new prescription.",
                  );
                }

                return ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: filteredPrescriptions.length,
                  itemBuilder: (context, index) {
                    final prescription = filteredPrescriptions[index];
                    return _buildPrescriptionCard(prescription);
                  },
                );
              },
              loading: () =>
                  const Center(child: CircularProgressIndicator(color: accentCyan)),
              error: (err, st) => _buildErrorState(err.toString()),
            ),
          ),
        ),
      ],
    );
  }

  // ================= GENERAL UI COMPONENTS =================

  Widget _buildSearchBar(TextEditingController controller, String hint) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: TextField(
        controller: controller,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
          prefixIcon: const Icon(Icons.search, color: Colors.white54, size: 20),
          suffixIcon: controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Colors.white54, size: 18),
                  onPressed: () => controller.clear(),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }

  Widget _buildReportFilterChips() {
    final conditions = ["All", "Critical", "Moderate", "Normal"];
    return SizedBox(
      height: 44,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: conditions.length,
        itemBuilder: (context, index) {
          final cond = conditions[index];
          final isSelected = _selectedReportCondition == cond;
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              label: Text(cond),
              labelStyle: TextStyle(
                color: isSelected ? accentCyan : Colors.white60,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  setState(() => _selectedReportCondition = cond);
                }
              },
              backgroundColor: surfaceColor,
              selectedColor: accentCyan.withOpacity(0.18),
              checkmarkColor: accentCyan,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: isSelected
                      ? accentCyan.withOpacity(0.5)
                      : Colors.white10,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPrescriptionFilterChips() {
    final filters = ["All", "Active", "Disabled"];
    return SizedBox(
      height: 44,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filterName = filters[index];
          final isSelected = _selectedPrescriptionReminder == filterName;
          final displayName =
              filterName == "All" ? "All Reminders" : "$filterName Reminders";
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              label: Text(displayName),
              labelStyle: TextStyle(
                color: isSelected ? accentCyan : Colors.white60,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  setState(() => _selectedPrescriptionReminder = filterName);
                }
              },
              backgroundColor: surfaceColor,
              selectedColor: accentCyan.withOpacity(0.18),
              checkmarkColor: accentCyan,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: isSelected
                      ? accentCyan.withOpacity(0.5)
                      : Colors.white10,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildReportCard(MedicalReportModel report) {
    Color condColor;
    switch (report.condition.toLowerCase()) {
      case "critical":
        condColor = Colors.redAccent;
        break;
      case "moderate":
        condColor = Colors.orangeAccent;
        break;
      default:
        condColor = Colors.greenAccent;
    }

    final dateStr = DateFormat("dd MMM yyyy").format(report.date.toLocal());

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white10),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  MedicalReportDetailScreen(reportId: report.id),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                height: 42,
                width: 42,
                decoration: BoxDecoration(
                  color: accentCyan.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.description_outlined,
                  color: accentCyan,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      report.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "$dateStr  •  ${report.type.toUpperCase()}",
                      style: const TextStyle(color: Colors.white30, fontSize: 11),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Condition indicator
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: condColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                  border:
                      Border.all(color: condColor.withOpacity(0.2), width: 0.8),
                ),
                child: Text(
                  report.condition.toUpperCase(),
                  style: TextStyle(
                    color: condColor,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 4),

              // Quick Share Button
              if (report.fileUrl.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.share_outlined,
                      color: accentCyan, size: 18),
                  onPressed: () {
                    Share.share(
                      "Medical Report: ${report.title}\nAttachment: ${report.fileUrl}",
                      subject: report.title,
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPrescriptionCard(PrescriptionModel prescription) {
    final activeReminders =
        prescription.reminders.where((r) => r.enabled).toList();
    final timesStr = activeReminders.map((r) => r.time).join(", ");
    final hasAttachment =
        prescription.fileUrl != null && prescription.fileUrl!.isNotEmpty;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white10),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  PrescriptionDetailScreen(prescriptionId: prescription.id),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                height: 42,
                width: 42,
                decoration: BoxDecoration(
                  color: accentCyan.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.medication_outlined,
                  color: accentCyan,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      prescription.medicineName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      timesStr.isNotEmpty
                          ? "Reminders: $timesStr"
                          : "No reminders scheduled",
                      style: TextStyle(
                        color:
                            timesStr.isNotEmpty ? Colors.white54 : Colors.white24,
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Quick Share Button
              if (hasAttachment)
                IconButton(
                  icon: const Icon(Icons.share_outlined,
                      color: accentCyan, size: 18),
                  onPressed: () {
                    Share.share(
                      "Prescription: ${prescription.medicineName}\nFile: ${prescription.fileUrl}",
                      subject: prescription.medicineName,
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: Colors.white24),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(color: Colors.white30, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.redAccent, size: 44),
            const SizedBox(height: 12),
            const Text(
              "Something went wrong",
              style: TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              error,
              style: const TextStyle(color: Colors.white38, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
