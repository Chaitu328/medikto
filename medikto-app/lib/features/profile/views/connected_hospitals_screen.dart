import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/profile/data/profile_manager.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';

class ConnectedHospitalsScreen extends ConsumerStatefulWidget {
  const ConnectedHospitalsScreen({super.key});

  @override
  ConsumerState<ConnectedHospitalsScreen> createState() => _ConnectedHospitalsScreenState();
}

class _ConnectedHospitalsScreenState extends ConsumerState<ConnectedHospitalsScreen> {
  static const Color alertRed = AppColors.missedRed;

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
    final themeColors = context.themeColors;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: themeColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text("Revoke Access?", style: TextStyle(color: themeColors.textPrimary)),
        content: Text(
          "Are you sure you want to disconnect from $hospitalName? They will immediately lose access to monitor your health reports, vitals, and prescriptions.",
          style: TextStyle(color: themeColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text("Cancel", style: TextStyle(color: themeColors.textMuted)),
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
        builder: (_) => Center(child: CircularProgressIndicator(color: themeColors.accentPrimary)),
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

  void _showConnectHospitalBottomSheet() {
    final themeColors = context.themeColors;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: themeColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: themeColors.accentSubtle,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.local_hospital_rounded,
                          color: themeColors.accentPrimary,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        "How to Connect",
                        style: TextStyle(
                          color: themeColors.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: Icon(Icons.close, color: themeColors.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                "Hospital connections are initiated by your clinic staff for privacy and clinical security.",
                style: TextStyle(
                  fontSize: 13,
                  color: themeColors.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),
              _buildStepItem(
                stepNumber: "1",
                title: "Visit Clinic or Reception",
                description:
                    "Provide your registered Medikto mobile number to your hospital reception or doctor.",
                icon: Icons.person_search_outlined,
                themeColors: themeColors,
              ),
              const SizedBox(height: 14),
              _buildStepItem(
                stepNumber: "2",
                title: "Receive 6-Digit Code",
                description:
                    "A push notification with a secure 6-digit verification code will appear on this device.",
                icon: Icons.notifications_active_outlined,
                themeColors: themeColors,
              ),
              const SizedBox(height: 14),
              _buildStepItem(
                stepNumber: "3",
                title: "Share Code to Authorize",
                description:
                    "Read the code to the clinic staff. Once entered in their portal, your profile will be securely connected.",
                icon: Icons.verified_user_outlined,
                themeColors: themeColors,
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: themeColors.accentPrimary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: themeColors.accentPrimary.withOpacity(0.2),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.shield_outlined,
                      size: 20,
                      color: themeColors.accentPrimary,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        "Once connected, your clinical team can view your prescribed medicines, adherence records, and vitals to coordinate your care.",
                        style: TextStyle(
                          fontSize: 12,
                          color: themeColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              CustomButton(
                buttonText: "Got It",
                buttonColor: themeColors.accentPrimary,
                textStyle: TextStyle(
                  color: themeColors.onAccentPrimary,
                  fontWeight: FontWeight.bold,
                ),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepItem({
    required String stepNumber,
    required String title,
    required String description,
    required IconData icon,
    required dynamic themeColors,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: themeColors.bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: themeColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: themeColors.accentPrimary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                stepNumber,
                style: TextStyle(
                  color: themeColors.onAccentPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(icon, size: 16, color: themeColors.accentPrimary),
                    const SizedBox(width: 6),
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: themeColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    color: themeColors.textMuted,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;
    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: AppBar(
        titleSpacing: 0,
        backgroundColor: themeColors.bg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: themeColors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Hospital Connections",
          style: TextStyle(color: themeColors.textPrimary, fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator(color: themeColors.accentPrimary))
          : Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  Expanded(
                    child: RefreshIndicator(
                      color: themeColors.accentPrimary,
                      backgroundColor: themeColors.surface,
                      onRefresh: fetchHospitals,
                      child: connectedHospitals.isEmpty
                          ? ListView(
                              children: [
                                SizedBox(height: MediaQuery.sizeOf(context).height * 0.15),
                                Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(20),
                                        decoration: BoxDecoration(
                                          color: themeColors.surface,
                                          shape: BoxShape.circle,
                                          border: Border.all(color: themeColors.border),
                                        ),
                                        child: Icon(
                                          Icons.local_hospital_outlined,
                                          size: 64,
                                          color: themeColors.textMuted,
                                        ),
                                      ),
                                      const SizedBox(height: 24),
                                      Text(
                                        "No Connected Hospitals",
                                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: themeColors.textPrimary),
                                      ),
                                      const SizedBox(height: 8),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 40),
                                        child: Text(
                                          "You aren't connected to any hospitals yet. Select a hospital using the button below to initiate connection.",
                                          textAlign: TextAlign.center,
                                          style: TextStyle(fontSize: 14, color: themeColors.textMuted),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            )
                          : ListView.builder(
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
                                    color: themeColors.surface,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: themeColors.border),
                                    boxShadow: [
                                      BoxShadow(
                                        color: context.isDarkMode
                                            ? Colors.black.withOpacity(0.2)
                                            : Colors.black.withOpacity(0.04),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      )
                                    ],
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: themeColors.accentSubtle,
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(
                                          Icons.local_hospital,
                                          color: themeColors.accentPrimary,
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
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                color: themeColors.textPrimary,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              address,
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: themeColors.textMuted,
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
                    ),
                  ),
                  const SizedBox(height: 16),
                  CustomButton(
                    buttonText: "Connect a Hospital",
                    buttonColor: themeColors.accentPrimary,
                    textStyle: TextStyle(color: themeColors.onAccentPrimary, fontWeight: FontWeight.bold),
                    onPressed: _showConnectHospitalBottomSheet,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }
}
