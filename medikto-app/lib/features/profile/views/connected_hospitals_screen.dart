import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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

  void _showConnectHospitalBottomSheet() {
    final profileAsync = ref.read(getProfileProvider);
    final profile = profileAsync.value?.data as ProfileModel?;
    final String patientPhone = profile?.phone ?? "";

    if (patientPhone.isEmpty) {
      AppToasts.showError(context, "Please complete your profile and contact number first.");
      return;
    }

    List<dynamic> allHospitals = [];
    bool isLoadingHospitals = true;
    String? selectedHospitalId;
    bool isOtpSent = false;
    bool isActionLoading = false;
    final otpController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          // Fetch hospitals list once when sheet opens
          if (isLoadingHospitals && allHospitals.isEmpty) {
            ProfileManager().getAllHospitals().then((response) {
              setModalState(() {
                if (response.status == ResponseStatus.SUCCESS) {
                  allHospitals = response.data as List<dynamic>;
                }
                isLoadingHospitals = false;
              });
            });
          }

          return Padding(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Connect a Hospital",
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white54),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (isLoadingHospitals)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20.0),
                        child: CircularProgressIndicator(color: accentCyan),
                      ),
                    )
                  else if (allHospitals.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text(
                        "No hospitals available to connect.",
                        style: TextStyle(color: Colors.white54),
                      ),
                    )
                  else ...[
                    const Text(
                      "Select Hospital",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white70),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: darkBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedHospitalId,
                          dropdownColor: surfaceColor,
                          isExpanded: true,
                          hint: const Text("Choose a hospital", style: TextStyle(color: Colors.white38)),
                          style: const TextStyle(color: Colors.white, fontSize: 16),
                          icon: const Icon(Icons.arrow_drop_down, color: accentCyan),
                          onChanged: isOtpSent
                              ? null // Disable changing hospital after OTP is sent
                              : (val) {
                                  setModalState(() {
                                    selectedHospitalId = val;
                                  });
                                },
                          items: allHospitals.map((h) {
                            return DropdownMenuItem<String>(
                              value: h['_id'] as String,
                              child: Text(h['name'] ?? "Unknown Hospital"),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                    if (isOtpSent) ...[
                      const SizedBox(height: 20),
                      AppTextFormFieldTitled(
                        title: "Verification Code (OTP)",
                        hintText: "Enter 6-digit OTP",
                        controller: otpController,
                        focusColor: accentCyan,
                        fillColor: darkBg,
                        color: Colors.white,
                        borderColor: Colors.white.withOpacity(0.1),
                        textInputType: TextInputType.number,
                      ),
                      const SizedBox(height: 10),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: isActionLoading
                              ? null
                              : () async {
                                  setModalState(() => isActionLoading = true);
                                  final res = await ProfileManager().requestHospitalOTP(
                                    phone: patientPhone,
                                    hospitalId: selectedHospitalId!,
                                  );
                                  setModalState(() => isActionLoading = false);
                                  if (res.status == ResponseStatus.SUCCESS) {
                                    AppToasts.showSuccess(context, "Verification code resent successfully");
                                  } else {
                                    AppToasts.showError(context, res.message);
                                  }
                                },
                          child: const Text("Resend Code", style: TextStyle(color: accentCyan)),
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    CustomButton(
                      buttonText: isOtpSent ? "Verify & Connect" : "Request Connection Code",
                      buttonColor: accentCyan,
                      isLoading: isActionLoading,
                      textStyle: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                      onPressed: () async {
                        if (selectedHospitalId == null) {
                          AppToasts.showError(context, "Please select a hospital");
                          return;
                        }

                        if (!isOtpSent) {
                          // Request OTP
                          setModalState(() => isActionLoading = true);
                          final res = await ProfileManager().requestHospitalOTP(
                            phone: patientPhone,
                            hospitalId: selectedHospitalId!,
                          );
                          setModalState(() => isActionLoading = false);
                          if (res.status == ResponseStatus.SUCCESS) {
                            AppToasts.showSuccess(context, "Connection code sent successfully");
                            setModalState(() => isOtpSent = true);
                          } else {
                            AppToasts.showError(context, res.message);
                          }
                        } else {
                          // Verify OTP
                          final otp = otpController.text.trim();
                          if (otp.length < 4) {
                            AppToasts.showError(context, "Please enter a valid OTP code");
                            return;
                          }
                          setModalState(() => isActionLoading = true);
                          final res = await ProfileManager().verifyHospitalOTP(
                            phone: patientPhone,
                            otp: otp,
                            hospitalId: selectedHospitalId!,
                          );
                          setModalState(() => isActionLoading = false);
                          if (res.status == ResponseStatus.SUCCESS) {
                            AppToasts.showSuccess(context, "Successfully connected to hospital");
                            Navigator.pop(ctx); // Close sheet
                            fetchHospitals(); // Refresh list
                          } else {
                            AppToasts.showError(context, res.message);
                          }
                        }
                      },
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      appBar: AppBar(
        titleSpacing: 0,
        backgroundColor: darkBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Hospital Connections",
          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: accentCyan))
          : Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  Expanded(
                    child: RefreshIndicator(
                      color: accentCyan,
                      backgroundColor: surfaceColor,
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
                                          "You aren't connected to any hospitals yet. Select a hospital using the button below to initiate connection.",
                                          textAlign: TextAlign.center,
                                          style: TextStyle(fontSize: 14, color: Colors.white38),
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
                                    color: surfaceColor,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.2),
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
                    ),
                  ),
                  const SizedBox(height: 16),
                  CustomButton(
                    buttonText: "Connect a Hospital",
                    buttonColor: accentCyan,
                    textStyle: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                    onPressed: _showConnectHospitalBottomSheet,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }
}
