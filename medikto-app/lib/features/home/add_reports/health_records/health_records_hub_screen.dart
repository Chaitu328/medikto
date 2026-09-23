import 'package:medikto/core/constants/app_themes.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/security/app_lock_manager.dart';
import 'package:medikto/core/utils/file_share_helper.dart';
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
import 'package:medikto/features/home/add_reports/utils/vitals_pdf_helper.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:medikto/features/vitals/models/vital_metric_type.dart';
import 'package:medikto/features/vitals/widgets/vitals_trend_card.dart';

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
  String _selectedReportType = "All"; // All, medical, prescription, test
  bool _showTrendChart = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 3,
      vsync: this,
      initialIndex: widget.initialTabIndex,
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

  Future<void> _shareAllVitals(List<VitalsModel> records) async {
    final authenticated = await AppLockManager().requestPinVerification(
      context,
      reason: "Enter PIN to share health records",
    );
    if (!authenticated) return;

    if (records.isEmpty) {
      AppToasts.showError(context, "No health readings recorded yet in Medikto.");
      return;
    }

    final profileAsync = ref.read(getProfileProvider);
    String? patientName;
    if (profileAsync.value?.data is ProfileModel) {
      final p = profileAsync.value!.data as ProfileModel;
      patientName = p.firstName;
    }

    await VitalsPdfHelper.generateAndShareVitalsPdf(
      records: records,
      patientName: patientName,
    );
  }

  Future<void> _deleteReport(MedicalReportModel report) async {
    final colors = context.themeColors;
    final shouldDelete = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: colors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.delete_outline, color: AppColors.missedRed, size: 26),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                "Delete Report?",
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          "Are you sure you want to delete this report?",
          style: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              "Cancel",
              style: TextStyle(color: colors.accentPrimary, fontWeight: FontWeight.bold),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.missedRed,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Delete"),
          ),
        ],
      ),
    );

    if (shouldDelete != true || !mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    final res = await ref.read(deleteReportProvider(report.id).future);

    if (mounted) {
      Navigator.of(context, rootNavigator: true).pop();
    }

    if (!mounted) return;

    if (res.status == ResponseStatus.SUCCESS) {
      AppToasts.showSuccess(context, "Report deleted successfully");
      ref.invalidate(getReportsProvider);
    } else {
      AppToasts.showError(
        context,
        res.message.isNotEmpty ? res.message : "Failed to delete report",
      );
    }
  }

  Future<void> _deletePrescription(PrescriptionModel prescription) async {
    final colors = context.themeColors;
    final shouldDelete = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: colors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.delete_outline, color: AppColors.missedRed, size: 26),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                "Delete Prescription?",
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          "Are you sure you want to delete this prescription?",
          style: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              "Cancel",
              style: TextStyle(color: colors.accentPrimary, fontWeight: FontWeight.bold),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.missedRed,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Delete"),
          ),
        ],
      ),
    );

    if (shouldDelete != true || !mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    final res = await ref.read(deletePrescriptionProvider(prescription.id).future);

    if (mounted) {
      Navigator.of(context, rootNavigator: true).pop();
    }

    if (!mounted) return;

    if (res.status == ResponseStatus.SUCCESS) {
      AppToasts.showSuccess(context, "Prescription deleted successfully");
      ref.invalidate(getPrescriptionsProvider);
    } else {
      AppToasts.showError(
        context,
        res.message.isNotEmpty ? res.message : "Failed to delete prescription",
      );
    }
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
    final themeColors = context.themeColors;
    final profileAsync = ref.watch(getProfileProvider);
    final isGuardian = profileAsync.value?.data is ProfileModel &&
        (profileAsync.value!.data as ProfileModel).role == 'guardian';

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: CustomAppBar(
        title: "Medical Documents Hub",
        backgroundColor: themeColors.bg,
        titleStyle: TextStyle(
          color: themeColors.textPrimary,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () => Navigator.pop(context),
      ),
      floatingActionButton: isGuardian
          ? null
          : _buildFloatingActionButton(themeColors),
      body: Column(
        children: [
          // Elegant, elderly-friendly TabBar container
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: themeColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: themeColors.border),
            ),
            child: TabBar(
              controller: _tabController,
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelPadding: const EdgeInsets.symmetric(horizontal: 2),
              indicator: BoxDecoration(
                color: themeColors.accentSubtle,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: themeColors.accentBorder),
              ),
              labelColor: themeColors.accentPrimary,
              unselectedLabelColor: themeColors.textMuted,
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

  Widget? _buildFloatingActionButton(AppThemeColors themeColors) {
    if (_tabController.index == 1) {
      return FloatingActionButton.extended(
        backgroundColor: themeColors.accentPrimary,
        foregroundColor: themeColors.onAccentPrimary,
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
        backgroundColor: themeColors.accentPrimary,
        foregroundColor: themeColors.onAccentPrimary,
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
    final themeColors = context.themeColors;
    final vitalsAsync = ref.watch(getVitalsProvider);

    return RefreshIndicator(
      color: themeColors.accentPrimary,
      backgroundColor: themeColors.surface,
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

              // Vitals Trend Graph Card (embedded inside Medical Documents Hub -> Vitals -> All Vitals & individual vital filters)
              VitalsTrendCard(
                key: ValueKey("vitals_trend_${_selectedVitalFilter}"),
                initialConfig: _selectedVitalFilter == "All"
                    ? VitalMetricRegistry.bloodPressure
                    : (VitalMetricRegistry.getConfigByKey(_selectedVitalFilter) ??
                        VitalMetricRegistry.bloodPressure),
                customRecords: allVitals,
              ),
              const SizedBox(height: 16),

              // Previous Readings Header + Share
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      _selectedVitalFilter == "All"
                          ? "ALL PREVIOUS READINGS"
                          : "${_getVitalTitle(_selectedVitalFilter).toUpperCase()} HISTORY",
                      style: TextStyle(
                        color: themeColors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (filteredRecords.isNotEmpty) ...[
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: () => _shareAllVitals(filteredRecords),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: themeColors.accentSubtle,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: themeColors.accentBorder),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.share_outlined, color: themeColors.accentMedium, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              "Share",
                              style: TextStyle(
                                color: themeColors.accentMedium,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
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
            Center(child: CircularProgressIndicator(color: themeColors.accentPrimary)),
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
    final themeColors = context.themeColors;
    final hasValue = value != "No reading";
    final timeStr = date != null ? _formatRecordDate(date) : "";

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: themeColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: themeColors.border),
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
                  Icon(icon, color: themeColors.accentMedium, size: 18),
                  const SizedBox(width: 6),
                  Text(
                    title,
                    style: TextStyle(
                      color: themeColors.textPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  color: hasValue ? themeColors.textPrimary : themeColors.textMuted,
                  fontSize: hasValue ? 16 : 13,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (timeStr.isNotEmpty)
                Text(
                  timeStr,
                  style: TextStyle(color: themeColors.textMuted, fontSize: 10),
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
                  backgroundColor: themeColors.accentSubtle,
                  foregroundColor: themeColors.accentMedium,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: themeColors.accentBorder),
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
    final themeColors = context.themeColors;
    final filters = [
      {"label": "All Vitals", "type": "All"},
      {"label": "Blood Pressure", "type": "bloodPressure"},
      {"label": "Heart Rate", "type": "heartRate"},
      {"label": "Blood Sugar", "type": "sugar"},
      {"label": "Body Temperature", "type": "temperature"},
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
                color: isSelected ? themeColors.accentPrimary : themeColors.textSecondary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  setState(() => _selectedVitalFilter = item["type"]!);
                }
              },
              backgroundColor: themeColors.surface,
              selectedColor: themeColors.accentSubtle,
              checkmarkColor: themeColors.accentPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: isSelected
                      ? themeColors.accentBorder
                      : themeColors.border,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCentralTrendChart(List<VitalsModel> records, String vitalType) {
    return VitalsTrendCard(
      initialConfig: VitalMetricRegistry.getConfigByKey(vitalType),
      customRecords: records,
    );
  }

  Widget _buildUnifiedVitalRecordCard(VitalsModel record) {
    final themeColors = context.themeColors;
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
        color: themeColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: themeColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            height: 42,
            width: 42,
            decoration: BoxDecoration(
              color: themeColors.accentSubtle,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: themeColors.accentMedium, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: TextStyle(
                          color: themeColors.textSecondary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      valStr,
                      style: TextStyle(
                        color: themeColors.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  dateStr,
                  style: TextStyle(color: themeColors.textMuted, fontSize: 11),
                ),
                if (record.notes != null && record.notes!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    "Note: ${record.notes}",
                    style: TextStyle(
                      color: themeColors.textSecondary,
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
    final themeColors = context.themeColors;
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
            color: themeColors.accentPrimary,
            backgroundColor: themeColors.surface,
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
                  Center(child: CircularProgressIndicator(color: themeColors.accentPrimary)),
              error: (err, st) => _buildErrorState(err.toString()),
            ),
          ),
        ),
      ],
    );
  }

  // ================= 3. PRESCRIPTIONS TAB =================
  Widget _buildPrescriptionsTab() {
    final themeColors = context.themeColors;
    final prescriptionsAsync = ref.watch(getPrescriptionsProvider);

    return Column(
      children: [
        // Search bar
        _buildSearchBar(
          _prescriptionSearchController,
          "Search by medicine or instructions...",
        ),

        const SizedBox(height: 8),

        Expanded(
          child: RefreshIndicator(
            color: themeColors.accentPrimary,
            backgroundColor: themeColors.surface,
            onRefresh: () async {
              ref.invalidate(getPrescriptionsProvider);
            },
            child: prescriptionsAsync.when(
              data: (responseData) {
                final List<PrescriptionModel> prescriptions =
                    (responseData.data as List?)?.cast<PrescriptionModel>() ?? [];

                // Filter logic
                final filteredPrescriptions = prescriptions.where((p) {
                  return p.medicineName
                          .toLowerCase()
                          .contains(_prescriptionQuery) ||
                      (p.dosageInstructions
                              ?.toLowerCase()
                              .contains(_prescriptionQuery) ??
                          false);
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
                  Center(child: CircularProgressIndicator(color: themeColors.accentPrimary)),
              error: (err, st) => _buildErrorState(err.toString()),
            ),
          ),
        ),
      ],
    );
  }

  // ================= GENERAL UI COMPONENTS =================

  Widget _buildSearchBar(TextEditingController controller, String hint) {
    final themeColors = context.themeColors;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      decoration: BoxDecoration(
        color: themeColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: themeColors.border),
      ),
      child: TextField(
        controller: controller,
        style: TextStyle(color: themeColors.textPrimary),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: themeColors.textMuted, fontSize: 13),
          prefixIcon: Icon(Icons.search, color: themeColors.textSecondary, size: 20),
          suffixIcon: controller.text.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear, color: themeColors.textSecondary, size: 18),
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
    final themeColors = context.themeColors;
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
                color: isSelected ? themeColors.accentPrimary : themeColors.textSecondary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  setState(() => _selectedReportCondition = cond);
                }
              },
              backgroundColor: themeColors.surface,
              selectedColor: themeColors.accentSubtle,
              checkmarkColor: themeColors.accentPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: isSelected
                      ? themeColors.accentBorder
                      : themeColors.border,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildReportCard(MedicalReportModel report) {
    final themeColors = context.themeColors;
    Color condColor;
    switch (report.condition.toLowerCase()) {
      case "critical":
        condColor = AppColors.missedRed;
        break;
      case "moderate":
        condColor = AppColors.pendingAmber;
        break;
      default:
        condColor = AppColors.takenGreen;
    }

    final dateStr = DateFormat("dd MMM yyyy").format(report.date.toLocal());

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: themeColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: themeColors.border),
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
                  color: themeColors.accentSubtle,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.description_outlined,
                  color: themeColors.accentMedium,
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
                      style: TextStyle(
                        color: themeColors.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "$dateStr  •  ${report.type.toUpperCase()}",
                      style: TextStyle(color: themeColors.textMuted, fontSize: 11),
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
                  icon: Icon(Icons.share_outlined,
                      color: themeColors.accentMedium, size: 18),
                  onPressed: () {
                    FileShareHelper.shareFile(
                      context: context,
                      fileUrl: report.fileUrl,
                      fallbackTitle: report.title,
                      customFileName: "medical_report_${report.id}.pdf",
                    );
                  },
                ),

              // Delete Button
              IconButton(
                icon: const Icon(Icons.delete_outline,
                    color: AppColors.missedRed, size: 18),
                onPressed: () => _deleteReport(report),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPrescriptionCard(PrescriptionModel prescription) {
    final themeColors = context.themeColors;
    final hasAttachment =
        prescription.fileUrl != null && prescription.fileUrl!.isNotEmpty;
    final dosageText = (prescription.dosageInstructions != null &&
            prescription.dosageInstructions!.trim().isNotEmpty)
        ? prescription.dosageInstructions!.trim()
        : "No instructions provided";

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: themeColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: themeColors.border),
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
                  color: themeColors.accentSubtle,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.medication_outlined,
                  color: themeColors.accentMedium,
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
                      style: TextStyle(
                        color: themeColors.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      dosageText,
                      style: TextStyle(
                        color: themeColors.textSecondary,
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
                  icon: Icon(Icons.share_outlined,
                      color: themeColors.accentMedium, size: 18),
                  onPressed: () {
                    FileShareHelper.shareFile(
                      context: context,
                      fileUrl: prescription.fileUrl!,
                      fallbackTitle: prescription.medicineName,
                      customFileName: "prescription_${prescription.id}.pdf",
                    );
                  },
                ),

              // Delete Button
              IconButton(
                icon: const Icon(Icons.delete_outline,
                    color: AppColors.missedRed, size: 18),
                onPressed: () => _deletePrescription(prescription),
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
    final themeColors = context.themeColors;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: themeColors.textMuted),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                color: themeColors.textPrimary,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(color: themeColors.textMuted, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String error) {
    final themeColors = context.themeColors;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: AppColors.missedRed, size: 44),
            const SizedBox(height: 12),
            Text(
              "Something went wrong",
              style: TextStyle(
                color: themeColors.textPrimary,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              error,
              style: TextStyle(color: themeColors.textMuted, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
