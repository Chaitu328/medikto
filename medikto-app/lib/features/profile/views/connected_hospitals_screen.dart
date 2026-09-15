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

  Future<void> _showConnectHospitalBottomSheet() async {
    final themeColors = context.themeColors;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: themeColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _HospitalPickerSheet(
        themeColors: themeColors,
        onConnected: () {
          fetchHospitals(); // Refresh the connected list after request sent
        },
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

// ═══════════════════════════════════════════════════════════════════════════
// HOSPITAL PICKER BOTTOM SHEET
// Fetches all hospitals, lets patient select one, sends connection request
// ═══════════════════════════════════════════════════════════════════════════
class _HospitalPickerSheet extends StatefulWidget {
  final dynamic themeColors;
  final VoidCallback onConnected;

  const _HospitalPickerSheet({
    required this.themeColors,
    required this.onConnected,
  });

  @override
  State<_HospitalPickerSheet> createState() => _HospitalPickerSheetState();
}

class _HospitalPickerSheetState extends State<_HospitalPickerSheet> {
  List<dynamic> hospitals = [];
  bool isLoading = true;
  String? errorMessage;
  Map<String, dynamic>? selectedHospital;
  bool isSending = false;

  @override
  void initState() {
    super.initState();
    _fetchHospitals();
  }

  Future<void> _fetchHospitals() async {
    final response = await ProfileManager().getAllHospitals();
    if (mounted) {
      if (response.status == ResponseStatus.SUCCESS) {
        setState(() {
          hospitals = (response.data as List<dynamic>?) ?? [];
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = response.message;
          isLoading = false;
        });
      }
    }
  }

  Future<void> _sendRequest() async {
    if (selectedHospital == null) return;
    setState(() => isSending = true);

    final response = await ProfileManager().requestHospitalLink(
      hospitalId: selectedHospital!['_id'] as String,
    );

    if (!mounted) return;
    setState(() => isSending = false);

    if (response.status == ResponseStatus.SUCCESS) {
      Navigator.pop(context);
      widget.onConnected();
      AppToasts.showSuccess(
        context,
        response.message,
      );
    } else {
      AppToasts.showError(context, response.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tc = widget.themeColors;
    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      expand: false,
      builder: (_, scrollController) => Column(
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: tc.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Title row
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 12, 0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: tc.accentSubtle,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.local_hospital_rounded, color: tc.accentPrimary, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Connect a Hospital',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: tc.textPrimary),
                      ),
                      Text(
                        'Select a clinic to send a connection request',
                        style: TextStyle(fontSize: 12, color: tc.textMuted),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.close, color: tc.textSecondary, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),
          Divider(color: tc.border, height: 1),

          // Hospital list
          Expanded(
            child: isLoading
                ? Center(child: CircularProgressIndicator(color: tc.accentPrimary))
                : errorMessage != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(errorMessage!, textAlign: TextAlign.center,
                              style: TextStyle(color: tc.textMuted)),
                        ),
                      )
                    : hospitals.isEmpty
                        ? Center(
                            child: Text(
                              'No hospitals available.',
                              style: TextStyle(color: tc.textMuted),
                            ),
                          )
                        : ListView.separated(
                            controller: scrollController,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            itemCount: hospitals.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (_, i) {
                              final h = hospitals[i] as Map<String, dynamic>;
                              final isSelected =
                                  selectedHospital?['_id'] == h['_id'];
                              return GestureDetector(
                                onTap: () => setState(() => selectedHospital = h),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 180),
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? tc.accentPrimary.withOpacity(0.08)
                                        : tc.surface,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: isSelected
                                          ? tc.accentPrimary
                                          : tc.border,
                                      width: isSelected ? 1.5 : 1,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: isSelected
                                              ? tc.accentPrimary.withOpacity(0.15)
                                              : tc.bg,
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(
                                          Icons.local_hospital,
                                          color: isSelected
                                              ? tc.accentPrimary
                                              : tc.textMuted,
                                          size: 20,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              h['name'] ?? 'Unknown',
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w600,
                                                color: tc.textPrimary,
                                              ),
                                            ),
                                            if ((h['address'] as String?)?.isNotEmpty == true) ...
                                              [
                                                const SizedBox(height: 2),
                                                Text(
                                                  h['address'] as String,
                                                  style: TextStyle(fontSize: 12, color: tc.textMuted),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                          ],
                                        ),
                                      ),
                                      if (isSelected)
                                        Icon(Icons.check_circle, color: tc.accentPrimary, size: 20),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
          ),

          // Send button
          Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, MediaQuery.of(context).viewInsets.bottom + 20),
            child: Column(
              children: [
                if (selectedHospital != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      'Connecting to: ${selectedHospital!['name']}',
                      style: TextStyle(
                        fontSize: 12,
                        color: tc.accentPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: selectedHospital != null && !isSending ? _sendRequest : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: tc.accentPrimary,
                      disabledBackgroundColor: tc.accentPrimary.withOpacity(0.4),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: isSending
                        ? SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(tc.onAccentPrimary),
                            ),
                          )
                        : Text(
                            'Send Connection Request',
                            style: TextStyle(
                              color: tc.onAccentPrimary,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
