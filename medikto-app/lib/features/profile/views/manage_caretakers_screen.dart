import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
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
    final themeColors = context.themeColors;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Center(
        child: CircularProgressIndicator(color: themeColors.accentPrimary),
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
    final themeColors = context.themeColors;
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
    final passwordController = TextEditingController();
    String selectedRelation = "Father";
    final relations = ["Father", "Mother", "Brother", "Sister", "Friend", "Doctor", "Guardian", "Other"];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: themeColors.surface,
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
                    Text(
                      "Invite Caretaker",
                      style: TextStyle(color: themeColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: Icon(Icons.close, color: themeColors.textSecondary),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                AppTextFormFieldTitled(
                  title: "Caretaker Name",
                  hintText: "Enter full name",
                  controller: nameController,
                  focusColor: themeColors.accentPrimary,
                  fillColor: themeColors.bg,
                  color: themeColors.textPrimary,
                  borderColor: themeColors.border,
                ),
                const SizedBox(height: 16),
                AppTextFormFieldTitled(
                  title: "Caretaker Email",
                  hintText: "email@example.com",
                  controller: emailController,
                  focusColor: themeColors.accentPrimary,
                  fillColor: themeColors.bg,
                  color: themeColors.textPrimary,
                  borderColor: themeColors.border,
                  textInputType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16),
                AppTextFormFieldTitled(
                  title: "Caretaker Phone",
                  hintText: "Enter mobile number",
                  controller: phoneController,
                  focusColor: themeColors.accentPrimary,
                  fillColor: themeColors.bg,
                  color: themeColors.textPrimary,
                  borderColor: themeColors.border,
                  textInputType: TextInputType.phone,
                ),
                const SizedBox(height: 16),
                AppTextFormFieldTitled(
                  title: "Caretaker Password",
                  hintText: "Enter password",
                  controller: passwordController,
                  focusColor: themeColors.accentPrimary,
                  fillColor: themeColors.bg,
                  color: themeColors.textPrimary,
                  borderColor: themeColors.border,
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                Text(
                  "Relation",
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: themeColors.textSecondary),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: themeColors.bg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: themeColors.border),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedRelation,
                      dropdownColor: themeColors.surface,
                      isExpanded: true,
                      style: TextStyle(color: themeColors.textPrimary, fontSize: 16),
                      icon: Icon(Icons.arrow_drop_down, color: themeColors.accentPrimary),
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
                  buttonColor: themeColors.accentPrimary,
                  textStyle: TextStyle(color: themeColors.onAccentPrimary, fontWeight: FontWeight.bold),
                  onPressed: () async {
                    final name = nameController.text.trim();
                    final email = emailController.text.trim();
                    final phone = phoneController.text.trim();
                    final password = passwordController.text.trim();

                    if (name.isEmpty) {
                      AppToasts.showError(context, "Name is required");
                      return;
                    }
                    if (email.isEmpty) {
                      AppToasts.showError(context, "Email is required");
                      return;
                    }
                    if (phone.isEmpty) {
                      AppToasts.showError(context, "Phone number is required");
                      return;
                    }
                    if (password.isEmpty) {
                      AppToasts.showError(context, "Password is required");
                      return;
                    }

                    Navigator.pop(context); // Close bottom sheet

                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => Center(
                        child: CircularProgressIndicator(color: themeColors.accentPrimary),
                      ),
                    );

                    try {
                      final response = await ref.read(profileProvider).inviteCaretaker(
                            name: name,
                            email: email,
                            relation: selectedRelation,
                            phone: phone,
                            password: password,
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
          "Caretaker Access",
          style: TextStyle(color: themeColors.textPrimary, fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator(color: themeColors.accentPrimary))
          : Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: ListView(
                physics: const BouncingScrollPhysics(),
                children: [
                  const SizedBox(height: 10),
                  Text(
                    "Connected Caretakers",
                    style: TextStyle(color: themeColors.accentPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  if (caretakers.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: themeColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: themeColors.border),
                      ),
                      child: Text(
                        "No connected caretakers. Invite one to let them monitor your health data.",
                        style: TextStyle(color: themeColors.textSecondary, fontSize: 14),
                      ),
                    )
                  else
                    ...caretakers.map((c) => _buildCaretakerTile(c, false)),
                  const SizedBox(height: 24),
                  Text(
                    "Pending Invitations",
                    style: TextStyle(color: themeColors.accentPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  if (pendingInvites.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: themeColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: themeColors.border),
                      ),
                      child: Text(
                        "No pending caretaker invitations.",
                        style: TextStyle(color: themeColors.textSecondary, fontSize: 14),
                      ),
                    )
                  else
                    ...pendingInvites.map((c) => _buildCaretakerTile(c, true)),
                  const SizedBox(height: 40),
                  CustomButton(
                    buttonText: "Add / Invite Caretaker",
                    buttonColor: themeColors.accentPrimary,
                    textStyle: TextStyle(color: themeColors.onAccentPrimary, fontWeight: FontWeight.bold),
                    onPressed: _showInviteBottomSheet,
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildCaretakerTile(dynamic c, bool isInvite) {
    final themeColors = context.themeColors;
    final name = isInvite ? (c['email'] ?? "") : (c['firstName'] ?? "Caretaker");
    final detail = isInvite ? "Pending Invitation (${c['relation'] ?? 'Guardian'})" : (c['phone'] ?? "No Phone");
    final id = c['_id'] as String;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: themeColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: themeColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: themeColors.accentSubtle,
            child: Icon(Icons.person_outline, color: themeColors.accentPrimary),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(color: themeColors.textPrimary, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  detail,
                  style: TextStyle(color: themeColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.missedRed),
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: themeColors.surface,
                  title: Text(
                    isInvite ? "Cancel Invitation" : "Remove Caretaker",
                    style: TextStyle(color: themeColors.textPrimary),
                  ),
                  content: Text(
                    isInvite
                        ? "Are you sure you want to cancel the invitation for $name?"
                        : "Are you sure you want to revoke access for $name? They will no longer be able to view your data.",
                    style: TextStyle(color: themeColors.textSecondary),
                  ),
                  actions: [
                    TextButton(
                      child: Text("Cancel", style: TextStyle(color: themeColors.textSecondary)),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                    TextButton(
                      child: const Text("Remove", style: TextStyle(color: AppColors.missedRed)),
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
