import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/widgets/custom_button.dart';
import 'package:medikto/core/utils/widgets/custom_textfields.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';

class ManageCaretakersScreen extends ConsumerStatefulWidget {
  const ManageCaretakersScreen({super.key});

  @override
  ConsumerState<ManageCaretakersScreen> createState() => _ManageCaretakersScreenState();
}

class _ManageCaretakersScreenState extends ConsumerState<ManageCaretakersScreen> {
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  List<dynamic> caretakers = [];
  List<dynamic> pendingInvites = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCaretakers();
  }

  Future<void> _fetchCaretakers() async {
    setState(() => isLoading = true);
    try {
      final response = await ref.read(profileProvider).getCaretakers();
      if (response.status == ResponseStatus.SUCCESS && response.data is Map) {
        setState(() {
          caretakers = response.data['caretakers'] as List? ?? [];
          pendingInvites = response.data['pendingInvites'] as List? ?? [];
        });
      }
    } catch (e) {
      debugPrint("Error fetching caretakers: $e");
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _handleDelete(String id, bool isInvite) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: accentCyan),
      ),
    );

    try {
      final response = await ref.read(profileProvider).deleteCaretaker(id);
      if (mounted) {
        Navigator.pop(context); // Close loader
      }

      if (response.status == ResponseStatus.SUCCESS) {
        if (mounted) {
          AppToasts.showSuccess(context, response.message);
          _fetchCaretakers();
        }
      } else {
        if (mounted) {
          AppToasts.showError(context, response.message);
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        AppToasts.showError(context, "Error: $e");
      }
    }
  }

  void _showInviteBottomSheet() {
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
    String selectedRelation = "Father";
    final relations = ["Father", "Mother", "Brother", "Sister", "Friend", "Doctor", "Guardian", "Other"];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
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
                      "Invite Caretaker",
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white54),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                AppTextFormFieldTitled(
                  title: "Caretaker Email",
                  hintText: "email@example.com",
                  controller: emailController,
                  focusColor: accentCyan,
                  fillColor: darkBg,
                  color: Colors.white,
                  borderColor: Colors.white.withOpacity(0.1),
                ),
                const SizedBox(height: 16),
                AppTextFormFieldTitled(
                  title: "Caretaker Phone (Optional)",
                  hintText: "Enter mobile number",
                  controller: phoneController,
                  focusColor: accentCyan,
                  fillColor: darkBg,
                  color: Colors.white,
                  borderColor: Colors.white.withOpacity(0.1),
                ),
                const SizedBox(height: 16),
                const Text(
                  "Relation",
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white70),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: darkBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedRelation,
                      dropdownColor: surfaceColor,
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                      icon: const Icon(Icons.arrow_drop_down, color: accentCyan),
                      onChanged: (val) {
                        if (val != null) {
                          setModalState(() {
                            selectedRelation = val;
                          });
                        }
                      },
                      items: relations.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                CustomButton(
                  buttonText: "Send Invitation",
                  buttonColor: accentCyan,
                  textStyle: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                  onPressed: () async {
                    final email = emailController.text.trim();
                    if (email.isEmpty) {
                      AppToasts.showError(context, "Email is required");
                      return;
                    }

                    Navigator.pop(context); // Close bottom sheet

                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => const Center(
                        child: CircularProgressIndicator(color: accentCyan),
                      ),
                    );

                    try {
                      final response = await ref.read(profileProvider).inviteCaretaker(
                            email: email,
                            relation: selectedRelation,
                            phone: phoneController.text.trim().isNotEmpty ? phoneController.text.trim() : null,
                          );

                      if (mounted) {
                        Navigator.pop(context); // Close loader
                      }

                      if (response.status == ResponseStatus.SUCCESS) {
                        if (mounted) {
                          AppToasts.showSuccess(context, response.message);
                          _fetchCaretakers();
                        }
                      } else {
                        if (mounted) {
                          AppToasts.showError(context, response.message);
                        }
                      }
                    } catch (e) {
                      if (mounted) {
                        Navigator.pop(context);
                        AppToasts.showError(context, "Error inviting caretaker: $e");
                      }
                    }
                  },
                ),
              ],
            ),
          ),
        ),
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
          "Caretaker Access",
          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: accentCyan))
          : Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: ListView(
                physics: const BouncingScrollPhysics(),
                children: [
                  const SizedBox(height: 10),
                  const Text(
                    "Connected Caretakers",
                    style: TextStyle(color: accentCyan, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  if (caretakers.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: surfaceColor,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withOpacity(0.05)),
                      ),
                      child: const Text(
                        "No connected caretakers. Invite one to let them monitor your health data.",
                        style: TextStyle(color: Colors.white54, fontSize: 14),
                      ),
                    )
                  else
                    ...caretakers.map((c) => _buildCaretakerTile(c, false)),
                  const SizedBox(height: 24),
                  const Text(
                    "Pending Invitations",
                    style: TextStyle(color: accentCyan, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  if (pendingInvites.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: surfaceColor,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withOpacity(0.05)),
                      ),
                      child: const Text(
                        "No pending caretaker invitations.",
                        style: TextStyle(color: Colors.white54, fontSize: 14),
                      ),
                    )
                  else
                    ...pendingInvites.map((c) => _buildCaretakerTile(c, true)),
                  const SizedBox(height: 40),
                  CustomButton(
                    buttonText: "Add / Invite Caretaker",
                    buttonColor: accentCyan,
                    textStyle: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                    onPressed: _showInviteBottomSheet,
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildCaretakerTile(dynamic c, bool isInvite) {
    final name = isInvite ? (c['email'] ?? "") : (c['firstName'] ?? "Caretaker");
    final detail = isInvite ? "Pending Invitation (${c['relation'] ?? 'Guardian'})" : (c['phone'] ?? "No Phone");
    final id = c['_id'] as String;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: accentCyan.withOpacity(0.1),
            child: const Icon(Icons.person_outline, color: accentCyan),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  detail,
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: surfaceColor,
                  title: Text(isInvite ? "Cancel Invitation" : "Remove Caretaker"),
                  content: Text(
                    isInvite
                        ? "Are you sure you want to cancel the invitation for $name?"
                        : "Are you sure you want to revoke access for $name? They will no longer be able to view your data.",
                    style: const TextStyle(color: Colors.white70),
                  ),
                  actions: [
                    TextButton(
                      child: const Text("Cancel", style: TextStyle(color: Colors.white54)),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                    TextButton(
                      child: const Text("Remove", style: TextStyle(color: Colors.redAccent)),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _handleDelete(id, isInvite);
                      },
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
