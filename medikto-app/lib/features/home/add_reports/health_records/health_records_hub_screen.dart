import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/medical_report_model.dart';
import 'package:medikto/features/home/add_reports/models/prescription_model.dart';
import 'package:medikto/features/home/add_reports/health_records/medical_report_detail_screen.dart';
import 'package:medikto/features/home/add_reports/health_records/prescription_detail_screen.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';

class HealthRecordsHubScreen extends ConsumerStatefulWidget {
  const HealthRecordsHubScreen({super.key});

  @override
  ConsumerState<HealthRecordsHubScreen> createState() => _HealthRecordsHubScreenState();
}

class _HealthRecordsHubScreenState extends ConsumerState<HealthRecordsHubScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // Search controllers
  final TextEditingController _reportSearchController = TextEditingController();
  final TextEditingController _prescriptionSearchController = TextEditingController();

  // Search state
  String _reportQuery = "";
  String _prescriptionQuery = "";

  // Filter state
  String _selectedReportCondition = "All"; // All, Critical, Moderate, Normal
  String _selectedReportType = "All"; // All, Medical, Lab, Vaccination, Prescription
  String _selectedPrescriptionReminder = "All"; // All, Reminders Enabled, Reminders Disabled

  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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
    _reportSearchController.dispose();
    _prescriptionSearchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
      body: Column(
        children: [
          // Elegant TabBar container
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white10),
            ),
            child: TabBar(
              controller: _tabController,
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              indicator: BoxDecoration(
                color: accentCyan.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: accentCyan.withOpacity(0.3)),
              ),
              labelColor: accentCyan,
              unselectedLabelColor: Colors.white38,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 14),
              tabs: const [
                Tab(text: "Medical Reports"),
                Tab(text: "Prescriptions"),
              ],
            ),
          ),
          
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildReportsTab(),
                _buildPrescriptionsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ================= REPORTS TAB =================
  Widget _buildReportsTab() {
    final reportsAsync = ref.watch(getReportsProvider);

    return Column(
      children: [
        // Search bar
        _buildSearchBar(_reportSearchController, "Search reports by title or description..."),
        
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
                  final matchesQuery = report.title.toLowerCase().contains(_reportQuery) ||
                      (report.description?.toLowerCase().contains(_reportQuery) ?? false);
                  
                  final matchesCondition = _selectedReportCondition == "All" ||
                      report.condition.toLowerCase() == _selectedReportCondition.toLowerCase();
                  
                  final matchesType = _selectedReportType == "All" ||
                      report.type.toLowerCase() == _selectedReportType.toLowerCase();

                  return matchesQuery && matchesCondition && matchesType;
                }).toList();

                if (filteredReports.isEmpty) {
                  return _buildEmptyState(
                    icon: Icons.assignment_outlined,
                    title: "No Reports Found",
                    subtitle: "Try altering search terms or filters.",
                  );
                }

                return ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  itemCount: filteredReports.length,
                  itemBuilder: (context, index) {
                    final report = filteredReports[index];
                    return _buildReportCard(report);
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: accentCyan)),
              error: (err, st) => _buildErrorState(err.toString()),
            ),
          ),
        ),
      ],
    );
  }

  // ================= PRESCRIPTIONS TAB =================
  Widget _buildPrescriptionsTab() {
    final prescriptionsAsync = ref.watch(getPrescriptionsProvider);

    return Column(
      children: [
        // Search bar
        _buildSearchBar(_prescriptionSearchController, "Search by medicine or instructions..."),

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
                  final matchesQuery = p.medicineName.toLowerCase().contains(_prescriptionQuery) ||
                      (p.dosageInstructions?.toLowerCase().contains(_prescriptionQuery) ?? false);

                  final hasReminders = p.reminders.any((r) => r.enabled);
                  final matchesReminder = _selectedPrescriptionReminder == "All" ||
                      (_selectedPrescriptionReminder == "Active" && hasReminders) ||
                      (_selectedPrescriptionReminder == "Disabled" && !hasReminders);

                  return matchesQuery && matchesReminder;
                }).toList();

                if (filteredPrescriptions.isEmpty) {
                  return _buildEmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: "No Prescriptions Found",
                    subtitle: "Try altering search terms or filters.",
                  );
                }

                return ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  itemCount: filteredPrescriptions.length,
                  itemBuilder: (context, index) {
                    final prescription = filteredPrescriptions[index];
                    return _buildPrescriptionCard(prescription);
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: accentCyan)),
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
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
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
          hintStyle: const TextStyle(color: Colors.white24, fontSize: 14),
          prefixIcon: const Icon(Icons.search, color: Colors.white54, size: 20),
          suffixIcon: controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Colors.white54, size: 18),
                  onPressed: () => controller.clear(),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  Widget _buildReportFilterChips() {
    final conditions = ["All", "Critical", "Moderate", "Normal"];
    return SizedBox(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
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
              ),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  setState(() => _selectedReportCondition = cond);
                }
              },
              backgroundColor: surfaceColor,
              selectedColor: accentCyan.withOpacity(0.2),
              checkmarkColor: accentCyan,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: isSelected ? accentCyan.withOpacity(0.5) : Colors.white10),
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
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filterName = filters[index];
          final isSelected = _selectedPrescriptionReminder == filterName;
          final displayName = filterName == "All" ? "All Reminders" : "$filterName Reminders";
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              label: Text(displayName),
              labelStyle: TextStyle(
                color: isSelected ? accentCyan : Colors.white60,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  setState(() => _selectedPrescriptionReminder = filterName);
                }
              },
              backgroundColor: surfaceColor,
              selectedColor: accentCyan.withOpacity(0.2),
              checkmarkColor: accentCyan,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: isSelected ? accentCyan.withOpacity(0.5) : Colors.white10),
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
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => MedicalReportDetailScreen(reportId: report.id),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                height: 44,
                width: 44,
                decoration: BoxDecoration(
                  color: accentCyan.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.description_outlined, color: accentCyan, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      report.title,
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 5),
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
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: condColor.withOpacity(0.2), width: 0.8),
                ),
                child: Text(
                  report.condition.toUpperCase(),
                  style: TextStyle(color: condColor, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 8),

              // Quick Share Button
              if (report.fileUrl.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.share_outlined, color: accentCyan, size: 20),
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
    final activeReminders = prescription.reminders.where((r) => r.enabled).toList();
    final timesStr = activeReminders.map((r) => r.time).join(", ");
    final hasAttachment = prescription.fileUrl != null && prescription.fileUrl!.isNotEmpty;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PrescriptionDetailScreen(prescriptionId: prescription.id),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                height: 44,
                width: 44,
                decoration: BoxDecoration(
                  color: accentCyan.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.medication_outlined, color: accentCyan, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      prescription.medicineName,
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 5),
                    Text(
                      timesStr.isNotEmpty ? "Reminders: $timesStr" : "No reminders scheduled",
                      style: TextStyle(
                        color: timesStr.isNotEmpty ? Colors.white54 : Colors.white24,
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
                  icon: const Icon(Icons.share_outlined, color: accentCyan, size: 20),
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

  Widget _buildEmptyState({required IconData icon, required String title, required String subtitle}) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 56, color: Colors.white24),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(subtitle, style: const TextStyle(color: Colors.white30, fontSize: 13)),
        ],
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
            const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
            const SizedBox(height: 16),
            const Text(
              "Something went wrong",
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(error, style: const TextStyle(color: Colors.white38, fontSize: 12), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
