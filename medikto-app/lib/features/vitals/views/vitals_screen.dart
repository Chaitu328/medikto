import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/health_data/add_blood_pressure.dart';
import 'package:medikto/features/home/add_reports/health_data/add_body_temparature.dart';
import 'package:medikto/features/home/add_reports/health_data/add_heart_rate.dart';
import 'package:medikto/features/home/add_reports/health_data/add_sugar_levels.dart';
import 'package:medikto/features/home/notifications/notification_screen.dart';
import 'package:medikto/features/home/widgets/health_data_card.dart';
import 'package:medikto/features/home/add_reports/health_records/health_records_hub_screen.dart';
import 'package:medikto/features/home/add_reports/data/providers/reports_provider.dart';
import 'package:medikto/features/home/add_reports/models/vitals_model.dart';

class AddReportsScreen extends ConsumerStatefulWidget {
  const AddReportsScreen({super.key});

  @override
  ConsumerState<AddReportsScreen> createState() => _AddReportsScreenState();
}

class _AddReportsScreenState extends ConsumerState<AddReportsScreen> {
  static const Color darkBg = Color(0xFF121212);
  static const Color accentCyan = Color(0xFF81DEEA);

  final ScrollController _controller = ScrollController();

  /// Static data for quick actions
  final List<Map<String, String>> healthData = const [
    {"name": "Blood Pressure", "image": "assets/images/blood-drop.png"},
    {"name": "Heart Rate", "image": "assets/images/blood-pressure.png"},
    {"name": "Body Temperature", "image": "assets/images/thermometer.png"},
    {"name": "Sugar Levels", "image": "assets/images/diabets-test.png"},
  ];

  final List<Map<String, String>> healthRecords = const [
    {"name": "Medical Reports", "image": "assets/images/profile.png"},
    {"name": "Prescriptions", "image": "assets/images/diabets-test.png"},
  ];

  Widget _getHealthDataScreen(int index) {
    switch (index) {
      case 0:
        return const AddBloodPressureScreen();
      case 1:
        return const AddHeartRateScreen();
      case 2:
        return const AddBodyTemparatureScreen();
      case 3:
        return const AddSugarLevelsScreen();
      default:
        return const SizedBox();
    }
  }

  Widget _getHealthRecordScreen(int index) {
    switch (index) {
      case 0:
        return const HealthRecordsHubScreen(initialTabIndex: 1);
      case 1:
        return const HealthRecordsHubScreen(initialTabIndex: 2);
      default:
        return const SizedBox();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final vitalsAsync = ref.watch(getVitalsProvider);

    // Extract latest values
    String latestBP = "";
    String latestHR = "";
    String latestTemp = "";
    String latestSugar = "";

    vitalsAsync.whenData((responseData) {
      final List<VitalsModel> vitals =
          (responseData.data as List?)?.cast<VitalsModel>() ?? [];

      try {
        final bp = vitals.firstWhere((e) => e.type == "bloodPressure");
        if (bp.systolic != null && bp.diastolic != null) {
          latestBP = "${bp.systolic}/${bp.diastolic} mmHg";
        }
      } catch (_) {}

      try {
        final hr = vitals.firstWhere((e) => e.type == "heartRate");
        if (hr.heartRate != null) {
          latestHR = "${hr.heartRate} BPM";
        }
      } catch (_) {}

      try {
        final temp = vitals.firstWhere((e) => e.type == "temperature");
        if (temp.temperature != null) {
          latestTemp = "${temp.temperature} °F";
        }
      } catch (_) {}

      try {
        final sugar = vitals.firstWhere((e) => e.type == "sugar");
        if (sugar.sugarLevel != null) {
          latestSugar = "${sugar.sugarLevel} mg/dL";
        }
      } catch (_) {}
    });

    final Map<int, String> latestValues = {
      0: latestBP,
      1: latestHR,
      2: latestTemp,
      3: latestSugar,
    };

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Health Hub",
        backgroundColor: darkBg,
        titleStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () {},
        showBackButton: false,
        actions: [
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationScreen()),
              );
            },
            icon: const Icon(Icons.notifications, color: accentCyan),
          ),
          const SizedBox(width: 10),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: SingleChildScrollView(
          controller: _controller,
          physics: const BouncingScrollPhysics(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 14),

                // Health Data Quick Add Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Health Data",
                      style: TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const HealthRecordsHubScreen(initialTabIndex: 0),
                          ),
                        );
                      },
                      child: const Text(
                        "View History",
                        style: TextStyle(
                          color: accentCyan,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: size.height * 0.015),

                _buildGrid(healthData, true, latestValues),

                SizedBox(height: size.height * 0.03),

                // Health Records Section
                const Text(
                  "Health Records",
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: size.height * 0.015),

                _buildGrid(healthRecords, false),

                SizedBox(height: size.height * 0.03),

                // Prominent Medical Documents Hub Destination Card (at bottom)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1E2A38), Color(0xFF141F2C)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: accentCyan.withOpacity(0.3)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        height: 52,
                        width: 52,
                        decoration: BoxDecoration(
                          color: accentCyan.withOpacity(0.14),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.folder_shared_outlined,
                          color: accentCyan,
                          size: 26,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Medical Documents Hub",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              "View your complete vitals history, medical reports & prescriptions.",
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 10),
                            InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const HealthRecordsHubScreen(),
                                  ),
                                );
                              },
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    "Open Documents Hub",
                                    style: TextStyle(
                                      color: accentCyan,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  SizedBox(width: 4),
                                  Icon(
                                    Icons.arrow_forward,
                                    color: accentCyan,
                                    size: 14,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: size.height * 0.05),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGrid(
    List<Map<String, String>> data,
    bool isHealthData, [
    Map<int, String>? values,
  ]) {
    return GridView.builder(
      itemCount: data.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        mainAxisExtent: 90,
      ),
      itemBuilder: (context, index) {
        final String? val =
            isHealthData && values != null ? values[index] : null;
        return HealthDataCard(
          title: data[index]["name"]!,
          image: data[index]["image"]!,
          value: val,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => isHealthData
                    ? _getHealthDataScreen(index)
                    : _getHealthRecordScreen(index),
              ),
            );
          },
        );
      },
    );
  }
}
