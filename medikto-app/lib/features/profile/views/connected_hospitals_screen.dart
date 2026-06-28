import 'package:flutter/material.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/profile/data/profile_manager.dart';

class ConnectedHospitalsScreen extends StatefulWidget {
  const ConnectedHospitalsScreen({super.key});

  @override
  State<ConnectedHospitalsScreen> createState() => _ConnectedHospitalsScreenState();
}

class _ConnectedHospitalsScreenState extends State<ConnectedHospitalsScreen> {
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);
  static const Color alertRed = Color(0xFFFF5252);

  List<dynamic> connectedHospitals = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchHospitals();
  }

  Future<void> fetchHospitals() async {
    setState(() => isLoading = true);
    final response = await ProfileManager().getConnectedHospitals();
    if (mounted) {
      if (response.status == ResponseStatus.SUCCESS) {
        setState(() {
          connectedHospitals = response.data as List<dynamic>;
          isLoading = false;
        });
      } else {
        setState(() => isLoading = false);
        AppToasts.showError(context, response.message);
      }
    }
  }

  Future<void> handleDisconnect(String hospitalId, String hospitalName) async {
    // Show confirmation Dialog
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: surfaceColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text("Revoke Access?", style: TextStyle(color: Colors.white)),
        content: Text(
          "Are you sure you want to disconnect from $hospitalName? They will immediately lose access to monitor your health reports, vitals, and prescriptions.",
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Cancel", style: TextStyle(color: Colors.white38)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: alertRed,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Disconnect", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator(color: accentCyan)),
      );

      final response = await ProfileManager().disconnectHospital(hospitalId);
      
      if (!mounted) return;
      Navigator.pop(context); // Pop loading
      if (response.status == ResponseStatus.SUCCESS) {
        AppToasts.showSuccess(context, "Successfully disconnected from $hospitalName");
        fetchHospitals(); // Refresh
      } else {
        AppToasts.showError(context, response.message);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      appBar: const CustomAppBar(title: "Hospital Connections"),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: accentCyan))
          : RefreshIndicator(
              color: accentCyan,
              backgroundColor: surfaceColor,
              onRefresh: fetchHospitals,
              child: connectedHospitals.isEmpty
                  ? _buildEmptyState()
                  : _buildHospitalsList(),
            ),
    );
  }

  Widget _buildEmptyState() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(height: MediaQuery.sizeOf(context).height * 0.22),
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: surfaceColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: const Icon(
                  Icons.local_hospital_outlined,
                  size: 64,
                  color: Colors.white38,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                "No Connected Hospitals",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 8),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  "You aren't connected to any hospitals yet. Provide your phone number to a hospital admin to receive a secure linking OTP request.",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.white38),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHospitalsList() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: connectedHospitals.length,
        itemBuilder: (context, index) {
          final hospital = connectedHospitals[index];
          final String name = hospital['name'] ?? "Unknown Hospital";
          final String address = hospital['address'] ?? "No address listed";
          final String id = hospital['_id'] ?? "";

          return Container(
            margin: const EdgeInsets.only(top: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ]
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: accentCyan.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.local_hospital,
                    color: accentCyan,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        address,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white38,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => handleDisconnect(id, name),
                  icon: const Icon(
                    Icons.delete_outline,
                    color: alertRed,
                    size: 24,
                  ),
                  tooltip: "Remove Connection",
                )
              ],
            ),
          );
        },
      ),
    );
  }
}
