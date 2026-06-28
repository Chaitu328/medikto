import 'package:flutter/material.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/home/add_reports/health_data/add_blood_pressure.dart';
import 'package:medikto/features/home/add_reports/health_data/add_body_temparature.dart';
import 'package:medikto/features/home/add_reports/health_data/add_heart_rate.dart';
import 'package:medikto/features/home/add_reports/health_data/add_sugar_levels.dart';
import 'package:medikto/features/home/add_reports/health_records/add_medicine_reports.dart';
import 'package:medikto/features/home/add_reports/health_records/add_prescription_file.dart';
import 'package:medikto/features/home/notifications/notification_screen.dart';
import 'package:medikto/features/home/widgets/health_data_card.dart';

class AddReportsScreen extends StatefulWidget {
  const AddReportsScreen({super.key});

  @override
  State<AddReportsScreen> createState() => _AddReportsScreenState();
}

class _AddReportsScreenState extends State<AddReportsScreen> {
  static const Color darkBg = Color(0xFF121212);

  // final List<Map<String, dynamic>> vitalsList = const [
  //   {"title": "Sugar Levels", "image": "assets/images/diabets-test.png"},
  //   {"title": "Heart Rate", "image": "assets/images/blood-pressure.png"},
  //   {"title": "Blood Sugar", "image": "assets/images/blood-drop.png"},
  //   {"title": "Body Temperature", "image": "assets/images/thermometer.png"},
  // ];

  // final List<Map<String, dynamic>> reportsList = const [
  //   {
  //     "title": "Total Reports",
  //     "image": "assets/images/profile.png",
  //     "count": 22,
  //   },
  //   {"title": "Reminders", "image": "assets/images/bell.png", "count": 4},
  //   {
  //     "title": "All Medications",
  //     "image": "assets/images/pills.png",
  //     "count": 23,
  //   },
  //   {
  //     "title": "All Lab Reports",
  //     "image": "assets/images/dna-tests.png",
  //     "count": 17,
  //   },
  // ];

  final ScrollController _controller = ScrollController();

  /// 🔹 Static data (const → better performance)
  final List<Map<String, String>> healthData = const [
    {"name": "Blood Pressure", "image": "assets/images/blood-drop.png"},
    {"name": "Heart Rate", "image": "assets/images/blood-pressure.png"},
    {"name": "Body Temperature", "image": "assets/images/thermometer.png"},
    {"name": "Sugar Levels", "image": "assets/images/diabets-test.png"},
  ];

  final List<Map<String, String>> healthRecords = const [
    {"name": "Medical Reports", "image": "assets/images/profile.png"},
    {"name": "Prescription", "image": "assets/images/diabets-test.png"},
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
        return const AddMedicalMedicationsScreen();
      case 1:
        return const AddPrescriptionFileScreen();
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

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Health Hub",
        backgroundColor: darkBg,
        titleStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
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
            icon: const Icon(Icons.notifications, color: Color(0xFF81DEEA)),
          ),

          const SizedBox(width: 10),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),

                /// 🔹 Health Data Header
                const Text(
                  "Health Data",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white, // White text for dark mode
                  ),
                ),
                SizedBox(height: size.height * 0.02),

                _buildGrid(healthData, true),

                SizedBox(height: size.height * 0.03),
        
                /// 🔹 Health Records Header
                const Text(
                  "Health Records",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white, // White text for dark mode
                  ),
                ),
                SizedBox(height: size.height * 0.02),
        
                _buildGrid(healthRecords, false),
        
                SizedBox(height: size.height * 0.04),
              ],
            ),
          ),
        ),
      )
      
    );
  }

  Widget _buildGrid(List<Map<String, String>> data, bool isHealthData) {
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
        return HealthDataCard(
          title: data[index]["name"]!,
          image: data[index]["image"]!,
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
