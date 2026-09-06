import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/theme/theme_provider.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:medikto/features/home/notifications/notification_screen.dart';
import 'package:medikto/features/home/premium_plans_views/premium_plans.dart';
import 'package:medikto/features/profile/change_password_view/change_password_screen.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:medikto/features/profile/views/edit_profile.dart';
import 'package:medikto/features/profile/views/connected_hospitals_screen.dart';
import 'package:medikto/features/profile/views/manage_caretakers_screen.dart';
import 'package:medikto/features/profile/views/faq_screen.dart';
import 'package:medikto/features/profile/views/contact_support_screen.dart';
import 'package:medikto/features/profile/views/policies_and_terms_screen.dart';
import 'package:medikto/features/profile/views/report_issue_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool isSwitched = true;

  @override
  void initState() {
    super.initState();
    _loadNotificationPreference();
  }

  Future<void> _loadNotificationPreference() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      isSwitched = prefs.getBool(StorageKeys.notificationsEnabled) ?? true;
    });
  }

  void _showThemeSelectorDialog(BuildContext context) {
    final currentTheme = ref.read(themeNotifierProvider);
    final colors = context.themeColors;

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: colors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: colors.border),
          ),
          title: Text(
            "Select Theme",
            style: TextStyle(
              color: colors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<ThemeMode>(
                value: ThemeMode.dark,
                groupValue: currentTheme,
                activeColor: colors.accent,
                title: Text(
                  "Dark Theme (Default)",
                  style: TextStyle(
                    color: colors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                subtitle: Text(
                  "Sleek dark interface",
                  style: TextStyle(color: colors.textMuted, fontSize: 12),
                ),
                secondary: const Icon(Icons.dark_mode_outlined, color: Colors.blueAccent),
                onChanged: (mode) {
                  if (mode != null) {
                    ref.read(themeNotifierProvider.notifier).setTheme(mode);
                    Navigator.pop(ctx);
                  }
                },
              ),
              const SizedBox(height: 8),
              RadioListTile<ThemeMode>(
                value: ThemeMode.light,
                groupValue: currentTheme,
                activeColor: colors.accent,
                title: Text(
                  "Light Theme",
                  style: TextStyle(
                    color: colors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                subtitle: Text(
                  "Crisp, high-contrast light interface",
                  style: TextStyle(color: colors.textMuted, fontSize: 12),
                ),
                secondary: const Icon(Icons.light_mode_outlined, color: Colors.amber),
                onChanged: (mode) {
                  if (mode != null) {
                    ref.read(themeNotifierProvider.notifier).setTheme(mode);
                    Navigator.pop(ctx);
                  }
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                "Cancel",
                style: TextStyle(color: colors.textSecondary),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showLogoutDialog() {
    final colors = context.themeColors;

    showDialog(
      context: context,
      builder: (_) {
        return AlertDialog(
          backgroundColor: colors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: colors.border),
          ),
          title: Text("Logout", style: TextStyle(color: colors.textPrimary)),
          content: Text(
            "Are you sure you want to logout?",
            style: TextStyle(color: colors.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                "Cancel",
                style: TextStyle(color: colors.textMuted),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryAccent,
                foregroundColor: Colors.black,
              ),
              onPressed: () async {
                Navigator.pop(context);
                final prefs = await SharedPreferences.getInstance();

                await prefs.remove(StorageKeys.token);
                await prefs.remove(StorageKeys.refreshToken);
                await prefs.remove(StorageKeys.userId);

                AppToasts.showSuccess(context, "Logged out successfully");
                await Future.delayed(const Duration(milliseconds: 500));

                if (!mounted) return;

                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              },
              child: const Text("Logout"),
            ),
          ],
        );
      },
    );
  }

  void _showDeleteDialog() {
    final colors = context.themeColors;

    showDialog(
      context: context,
      builder: (_) {
        return AlertDialog(
          backgroundColor: colors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: colors.border),
          ),
          title: const Text(
            "Delete Account",
            style: TextStyle(color: AppColors.statusCritical),
          ),
          content: Text(
            "This action is permanent and cannot be undone.\n\nAre you sure you want to delete your account?",
            style: TextStyle(color: colors.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                "Cancel",
                style: TextStyle(color: colors.textMuted),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.statusCritical,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.pop(context);
                debugPrint("Account Deleted");
              },
              child: const Text("Delete"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final screenSize = MediaQuery.sizeOf(context);
    final profileAsync = ref.watch(getProfileProvider);
    final themeMode = ref.watch(themeNotifierProvider);

    final profile = profileAsync.value?.data is ProfileModel
        ? profileAsync.value!.data as ProfileModel
        : null;

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: CustomAppBar(
        title: "Profile",
        showBackButton: false,
        actions: [
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationScreen()),
              );
            },
            icon: const Icon(Icons.notifications, color: AppColors.primaryAccent),
          ),
          const SizedBox(width: 10),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              SizedBox(height: screenSize.height * 0.016),

              /// 🔹 Profile Card
              profileAsync.when(
                data: (response) {
                  if (response.status != ResponseStatus.SUCCESS) {
                    return const SizedBox();
                  }

                  final ProfileModel profile = response.data;
                  final isGuardian = profile.role == "guardian";

                  if (isGuardian) {
                    final hospitalName = profile.hospital != null
                        ? (profile.hospital!['name'] ?? "Unknown Hospital")
                        : "No Hospital Assigned";
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const EditProfileScreen(),
                          ),
                        );
                      },
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: colors.surface,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: colors.border),
                          boxShadow: [
                            BoxShadow(
                              color: colors.shadowColor,
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Stack(
                          children: [
                            Positioned(
                              right: 0,
                              top: 0,
                              child: Icon(
                                Icons.edit_outlined,
                                color: colors.accent,
                                size: 20,
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: colors.accentSubtle,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.shield_outlined,
                                        color: colors.accent,
                                        size: 28,
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            profile.firstName?.isNotEmpty == true
                                                ? profile.firstName!
                                                : "Guardian",
                                            style: TextStyle(
                                              color: colors.textPrimary,
                                              fontSize: 18,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 2,
                                            ),
                                            decoration: BoxDecoration(
                                              color: AppColors.caretakerPurple.withOpacity(0.15),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: const Text(
                                              "GUARDIAN ACCOUNT",
                                              style: TextStyle(
                                                color: AppColors.caretakerPurple,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                letterSpacing: 0.8,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),
                                Divider(color: colors.borderSubtle, height: 1),
                                const SizedBox(height: 16),
                                _buildDetailRow(
                                  Icons.phone_outlined,
                                  "Mobile Number",
                                  profile.phone ?? "Not provided",
                                  colors,
                                ),
                                const SizedBox(height: 16),
                                _buildDetailRow(
                                  Icons.local_hospital_outlined,
                                  "Assigned Hospital",
                                  hospitalName,
                                  colors,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const EditProfileScreen(),
                        ),
                      );
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: colors.border),
                        boxShadow: [
                          BoxShadow(
                            color: colors.shadowColor,
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          /// PROFILE IMAGE
                          Container(
                            height: 72,
                            width: 72,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: colors.accent.withOpacity(0.4),
                                width: 1.5,
                              ),
                              color: colors.cardSecondary,
                              image: profile.profilePic != null &&
                                      profile.profilePic!.isNotEmpty
                                  ? DecorationImage(
                                      image: CachedNetworkImageProvider(
                                        "${profile.profilePic!}?t=${DateTime.now().millisecondsSinceEpoch}",
                                      ),
                                      fit: BoxFit.cover,
                                    )
                                  : null,
                            ),
                            child: profile.profilePic == null ||
                                    profile.profilePic!.isEmpty
                                ? Icon(
                                    Icons.person,
                                    color: colors.accent,
                                    size: 34,
                                  )
                                : null,
                          ),
                          const SizedBox(width: 14),

                          /// DETAILS
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                /// NAME
                                Text(
                                  profile.firstName?.isNotEmpty == true
                                      ? profile.firstName!
                                      : "Medikto User",
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: colors.textPrimary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 6),

                                /// PHONE
                                Text(
                                  profile.phone ?? "--",
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: colors.textSecondary,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(height: 14),

                                /// BADGES
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: [
                                    /// VERIFIED
                                    if (profile.isVerified == true)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.statusNormal.withOpacity(0.12),
                                          borderRadius: BorderRadius.circular(30),
                                        ),
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Icons.verified,
                                              size: 14,
                                              color: AppColors.statusNormal,
                                            ),
                                            SizedBox(width: 4),
                                            Text(
                                              "Verified",
                                              style: TextStyle(
                                                color: AppColors.statusNormal,
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                    /// SUBSCRIPTION
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: profile.isPremium
                                            ? colors.accentSubtle
                                            : colors.cardSecondary,
                                        borderRadius: BorderRadius.circular(30),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            profile.isPremium
                                                ? Icons.workspace_premium
                                                : Icons.lock_outline,
                                            size: 14,
                                            color: profile.isPremium
                                                ? colors.accent
                                                : colors.textSecondary,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            profile.isTrial
                                                ? "PREMIUM TRIAL"
                                                : (profile.isPremium ? "PREMIUM" : "FREE"),
                                            style: TextStyle(
                                              color: profile.isPremium
                                                  ? colors.accent
                                                  : colors.textSecondary,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          /// EDIT BUTTON
                          InkWell(
                            borderRadius: BorderRadius.circular(14),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const EditProfileScreen(),
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: colors.cardSecondary,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                Icons.edit_outlined,
                                color: colors.accent,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
                loading: () => Center(
                  child: CircularProgressIndicator(color: colors.accent),
                ),
                error: (e, _) => const SizedBox(),
              ),

              if (profile?.role == "guardian") ...[
                SizedBox(height: screenSize.height * 0.02),
                _buildSection(
                  title: "Appearance",
                  colors: colors,
                  children: [
                    _ListItem(
                      icon: Icons.palette_outlined,
                      title: "Theme Mode",
                      subtitle: themeMode == ThemeMode.light ? "Light Theme" : "Dark Theme",
                      trailing: Icons.arrow_forward_ios,
                      onTap: () => _showThemeSelectorDialog(context),
                    ),
                  ],
                ),
                SizedBox(height: screenSize.height * 0.02),
                _buildSection(
                  title: "Password",
                  colors: colors,
                  children: [
                    _ListItem(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ChangePasswordScreen(),
                          ),
                        );
                      },
                      icon: Icons.key_outlined,
                      title: "Change Password",
                      trailing: Icons.arrow_forward_ios,
                    ),
                  ],
                ),
                SizedBox(height: screenSize.height * 0.02),
                _buildSection(
                  colors: colors,
                  children: [
                    _ListItem(
                      icon: Icons.logout,
                      title: "Logout",
                      color: colors.textSecondary,
                      onTap: _showLogoutDialog,
                    ),
                  ],
                ),
                const SizedBox(height: 100),
              ] else ...[
                if (profile?.isPremium != true) ...[
                  SizedBox(height: screenSize.height * 0.02),
                  _buildPremiumCard(colors),
                ],
                SizedBox(height: screenSize.height * 0.02),

                /// 🔹 Settings Section
                _buildSection(
                  title: "Settings",
                  colors: colors,
                  children: [
                    /// Theme Selector Item
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(
                        Icons.palette_outlined,
                        color: colors.textSecondary,
                      ),
                      title: Text(
                        "Appearance",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: colors.textPrimary,
                        ),
                      ),
                      subtitle: Text(
                        themeMode == ThemeMode.light ? "Light Theme" : "Dark Theme (Default)",
                        style: TextStyle(
                          fontSize: 12,
                          color: colors.textMuted,
                        ),
                      ),
                      trailing: Icon(
                        Icons.arrow_forward_ios,
                        size: 14,
                        color: colors.textMuted,
                      ),
                      onTap: () => _showThemeSelectorDialog(context),
                    ),
                    Divider(color: colors.borderSubtle, height: 1),

                    /// Notifications Toggle
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(
                        Icons.notifications_outlined,
                        color: colors.textSecondary,
                      ),
                      title: Text(
                        "Notifications",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: colors.textPrimary,
                        ),
                      ),
                      trailing: Transform.scale(
                        scale: 0.8,
                        child: Switch(
                          padding: EdgeInsets.zero,
                          value: isSwitched,
                          onChanged: (value) async {
                            if (!value) {
                              final shouldDisable = await showDialog<bool>(
                                context: context,
                                barrierDismissible: false,
                                builder: (ctx) => AlertDialog(
                                  backgroundColor: colors.surface,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                    side: BorderSide(color: colors.border),
                                  ),
                                  title: Row(
                                    children: [
                                      const Icon(
                                        Icons.warning_amber_rounded,
                                        color: Colors.amberAccent,
                                        size: 28,
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Text(
                                          "Disable Notifications?",
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
                                    "Switching off will stop critical notifications for the medicines.",
                                    style: TextStyle(
                                      color: colors.textSecondary,
                                      fontSize: 14,
                                      height: 1.4,
                                    ),
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(ctx, false),
                                      child: Text(
                                        "Keep Enabled",
                                        style: TextStyle(
                                          color: colors.accent,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.pop(ctx, true),
                                      child: const Text(
                                        "Turn Off",
                                        style: TextStyle(color: AppColors.statusCritical),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                              if (shouldDisable == true) {
                                final prefs = await SharedPreferences.getInstance();
                                await prefs.setBool(StorageKeys.notificationsEnabled, false);
                                setState(() => isSwitched = false);
                              }
                            } else {
                              final prefs = await SharedPreferences.getInstance();
                              await prefs.setBool(StorageKeys.notificationsEnabled, true);
                              setState(() => isSwitched = true);
                            }
                          },
                          activeTrackColor: colors.accent.withAlpha(140),
                          activeThumbColor: colors.accent,
                          inactiveThumbColor: Colors.grey,
                          inactiveTrackColor: colors.border,
                        ),
                      ),
                    ),
                  ],
                ),

                /// 🔹 Password (Only for accounts with password authentication)
                if (profile?.authProvider == "password") ...[
                  SizedBox(height: screenSize.height * 0.02),
                  _buildSection(
                    title: "Password",
                    colors: colors,
                    children: [
                      _ListItem(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const ChangePasswordScreen(),
                            ),
                          );
                        },
                        icon: Icons.key_outlined,
                        title: "Change Password",
                        trailing: Icons.arrow_forward_ios,
                      ),
                    ],
                  ),
                ],

                SizedBox(height: screenSize.height * 0.02),

                /// 🔹 Connected Hospitals
                _buildSection(
                  title: "Hospital Access",
                  colors: colors,
                  children: [
                    _ListItem(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ConnectedHospitalsScreen(),
                          ),
                        );
                      },
                      icon: Icons.local_hospital_outlined,
                      title: "Manage Hospital Access",
                      trailing: Icons.arrow_forward_ios,
                    ),
                  ],
                ),

                SizedBox(height: screenSize.height * 0.02),

                /// 🔹 Caretakers Access
                _buildSection(
                  title: "Caretaker Access",
                  colors: colors,
                  children: [
                    _ListItem(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ManageCaretakersScreen(),
                          ),
                        );
                      },
                      icon: Icons.people_outline_rounded,
                      title: "Manage Caretakers",
                      trailing: Icons.arrow_forward_ios,
                    ),
                  ],
                ),

                SizedBox(height: screenSize.height * 0.02),

                /// 🔹 Help
                _buildSection(
                  title: "Help & Support",
                  colors: colors,
                  children: [
                    _ListItem(
                      icon: Icons.info_outline,
                      title: "FAQs",
                      trailing: Icons.arrow_forward_ios,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const FaqScreen(),
                          ),
                        );
                      },
                    ),
                    _ListItem(
                      icon: Icons.phone_outlined,
                      title: "Contact Support",
                      subtitle: "User Query",
                      trailing: Icons.arrow_forward_ios,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ContactSupportScreen(),
                          ),
                        );
                      },
                    ),
                    _ListItem(
                      icon: Icons.security,
                      title: "Policies & Terms",
                      subtitle: "Service Terms & Conditions",
                      trailing: Icons.arrow_forward_ios,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PoliciesAndTermsScreen(),
                          ),
                        );
                      },
                    ),
                    _ListItem(
                      icon: Icons.report_outlined,
                      title: "Report an Issue",
                      trailing: Icons.arrow_forward_ios,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ReportIssueScreen(),
                          ),
                        );
                      },
                    ),
                  ],
                ),

                SizedBox(height: screenSize.height * 0.02),

                /// 🔹 Logout
                _buildSection(
                  colors: colors,
                  children: [
                    _ListItem(
                      icon: Icons.logout,
                      title: "Logout",
                      color: colors.textSecondary,
                      onTap: _showLogoutDialog,
                    ),
                  ],
                ),

                SizedBox(height: screenSize.height * 0.02),

                /// 🔹 Delete
                _buildSection(
                  colors: colors,
                  children: [
                    _ListItem(
                      icon: Icons.delete_outline,
                      title: "Delete Account",
                      color: AppColors.statusCritical,
                      onTap: _showDeleteDialog,
                    ),
                  ],
                ),

                const SizedBox(height: 100),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    IconData icon,
    String label,
    String value,
    AppThemeColors colors,
  ) {
    return Row(
      children: [
        Icon(icon, color: colors.accent, size: 20),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(color: colors.textMuted, fontSize: 11),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSection({
    String? title,
    required List<Widget> children,
    required AppThemeColors colors,
  }) {
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: colors.border),
          boxShadow: [
            BoxShadow(
              color: colors.shadowColor,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: colors.accent,
              ),
            ),
            const SizedBox(height: 6),
          ],
          ...children,
        ],
      ),
    ),
  );
}

  Widget _buildPremiumCard(AppThemeColors colors) {
    return _PremiumCard(
      colors: colors,
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const PremiumPlansScreen()),
        );
      },
    );
  }
}

class _ListItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final IconData? trailing;
  final Color? color;
  final GestureTapCallback? onTap;

  const _ListItem({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Material(
      color: Colors.transparent,
      child: ListTile(
        dense: true,
        contentPadding: EdgeInsets.zero,
        leading: Icon(icon, size: 22, color: color ?? colors.textSecondary),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: color ?? colors.textPrimary,
          ),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle!,
                style: TextStyle(fontSize: 12, color: colors.textMuted),
              )
            : null,
        trailing: trailing != null
            ? Icon(trailing, size: 14, color: colors.textMuted)
            : null,
        onTap: onTap,
      ),
    );
  }
}

class _PremiumCard extends StatelessWidget {
  final AppThemeColors colors;
  final VoidCallback onTap;

  const _PremiumCard({required this.colors, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: colors.accent.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: colors.shadowColor,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: colors.accentSubtle,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.workspace_premium,
                color: colors.accent,
                size: 24,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                "Upgrade to Premium",
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: colors.accent,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                "UPGRADE",
                style: TextStyle(
                  color: colors.onAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
