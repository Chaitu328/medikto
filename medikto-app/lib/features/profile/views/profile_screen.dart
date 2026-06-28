import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:medikto/features/auth/login_view/login_screen.dart';
import 'package:medikto/features/home/notifications/notification_screen.dart';
import 'package:medikto/features/home/premium_plans_views/premium_plans.dart';
import 'package:medikto/features/profile/change_password_view/change_password_screen.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:medikto/features/profile/views/edit_profile.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool isSwitched = false;

  // Theme Colors consistent with your other dark mode screens
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (_) {
        return AlertDialog(
          backgroundColor: surfaceColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text("Logout", style: TextStyle(color: Colors.white)),
          content: const Text(
            "Are you sure you want to logout?",
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                "Cancel",
                style: TextStyle(color: Colors.white54),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: accentCyan,
                foregroundColor: Colors.black,
              ),
              onPressed: () async {
                Navigator.pop(context);
                final prefs = await SharedPreferences.getInstance();

                /// CLEAR STORAGE
                await prefs.remove(StorageKeys.token);
                await prefs.remove(StorageKeys.refreshToken);
                await prefs.remove(StorageKeys.userId);

                AppToasts.showSuccess(context, "Logged out successfully");
                await Future.delayed(const Duration(milliseconds: 500));

                /// OPTIONAL
                /// If you want complete app storage clear except onboarding:
                ///
                // bool onboarding =
                //     prefs.getBool(StorageKeys.onboardingDone) ?? false;
                // await prefs.clear();
                // await prefs.setBool(StorageKeys.onboardingDone, onboarding);

                if (!mounted) return;

                /// GO TO LOGIN
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );

                debugPrint("User Logged Out");

                /// 🔥 TODO: Add your logout logic here
                debugPrint("User Logged Out");
              },
              child: const Text("Logout"),
            ),
          ],
        );
      },
    );
  }

  void _showDeleteDialog() {
    showDialog(
      context: context,
      builder: (_) {
        return AlertDialog(
          backgroundColor: surfaceColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text(
            "Delete Account",
            style: TextStyle(color: Colors.redAccent),
          ),
          content: const Text(
            "This action is permanent and cannot be undone.\n\nAre you sure you want to delete your account?",
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                "Cancel",
                style: TextStyle(color: Colors.white54),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFEF3235),
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.pop(context);

                /// 🔥 TODO: Add delete API call here
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
    final screenSize = MediaQuery.sizeOf(context);
    final profileAsync = ref.watch(getProfileProvider);

    final profile = profileAsync.value?.data is ProfileModel
        ? profileAsync.value!.data as ProfileModel
        : null;

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        title: "Profile",
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
            icon: const Icon(Icons.notifications, color: accentCyan),
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

              /// 🔹 Profile Card (Dark Mode)
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const EditProfileScreen(),
                    ),
                  );
                },
                child: profileAsync.when(
                  data: (response) {
                    if (response.status != ResponseStatus.SUCCESS) {
                      return const SizedBox();
                    }

                    final ProfileModel profile = response.data;

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
                          color: surfaceColor,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.05),
                          ),
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
                                  color: accentCyan.withOpacity(0.4),
                                  width: 1.5,
                                ),
                                color: Colors.white.withOpacity(0.04),

                                image:
                                    profile.profilePic != null &&
                                        profile.profilePic!.isNotEmpty
                                    ? DecorationImage(
                                        image: CachedNetworkImageProvider(
                                          "${profile.profilePic!}?t=${DateTime.now().millisecondsSinceEpoch}",
                                        ),
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                              ),

                              child:
                                  profile.profilePic == null ||
                                      profile.profilePic!.isEmpty
                                  ? const Icon(
                                      Icons.person,
                                      color: accentCyan,
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
                                    style: const TextStyle(
                                      color: Colors.white,
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
                                    style: const TextStyle(
                                      color: Colors.white60,
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
                                            color: Colors.green.withOpacity(
                                              0.12,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              30,
                                            ),
                                          ),
                                          child: const Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(
                                                Icons.verified,
                                                size: 14,
                                                color: Colors.greenAccent,
                                              ),
                                              SizedBox(width: 4),
                                              Text(
                                                "Verified",
                                                style: TextStyle(
                                                  color: Colors.greenAccent,
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
                                          color:
                                              (profile.subscription ?? "")
                                                      .toLowerCase() ==
                                                  "premium"
                                              ? accentCyan.withOpacity(0.14)
                                              : Colors.white.withOpacity(0.06),
                                          borderRadius: BorderRadius.circular(
                                            30,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              (profile.subscription ?? "")
                                                          .toLowerCase() ==
                                                      "premium"
                                                  ? Icons.workspace_premium
                                                  : Icons.lock_outline,
                                              size: 14,
                                              color:
                                                  (profile.subscription ?? "")
                                                          .toLowerCase() ==
                                                      "premium"
                                                  ? accentCyan
                                                  : Colors.white70,
                                            ),

                                            const SizedBox(width: 4),

                                            Text(
                                              ((profile.subscription ?? "free")
                                                  .toUpperCase()),
                                              style: TextStyle(
                                                color:
                                                    (profile.subscription ?? "")
                                                            .toLowerCase() ==
                                                        "premium"
                                                    ? accentCyan
                                                    : Colors.white70,
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
                                  color: Colors.white.withOpacity(0.05),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: const Icon(
                                  Icons.edit_outlined,
                                  color: accentCyan,
                                  size: 20,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },

                  loading: () => const Center(
                    child: CircularProgressIndicator(color: accentCyan),
                  ),

                  error: (e, _) => const SizedBox(),
                ),
              ),

              if ((profile?.subscription ?? "").toLowerCase() != "premium") ...[
                SizedBox(height: screenSize.height * 0.02),

                _buildPremiumCard(),
              ],
              SizedBox(height: screenSize.height * 0.02),

              /// 🔹 Settings Section
              _buildSection(
                title: "Settings",
                children: [
                  ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(
                      Icons.notifications_outlined,
                      color: Colors.white70,
                    ),
                    title: const Text(
                      "Notifications",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Colors.white,
                      ),
                    ),
                    trailing: Transform.scale(
                      scale: 0.8,
                      child: Switch(
                        padding: EdgeInsets.zero,
                        value: isSwitched,
                        onChanged: (value) =>
                            setState(() => isSwitched = value),
                        activeTrackColor: accentCyan.withAlpha(140),
                        activeThumbColor: accentCyan,
                        inactiveThumbColor: Colors.grey,
                        inactiveTrackColor: Colors.white10,
                        trackOutlineColor: WidgetStateProperty.all(
                          Colors.transparent,
                        ),
                      ),
                    ),
                  ),
                  const _ListItem(
                    icon: Icons.language,
                    title: "Language",
                    subtitle: "English",
                    trailing: Icons.arrow_forward_ios,
                  ),
                ],
              ),

              SizedBox(height: screenSize.height * 0.02),

              /// 🔹 Password
              _buildSection(
                title: "Password",
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

              /// 🔹 Help
              _buildSection(
                title: "Help & Support",
                children: const [
                  _ListItem(
                    icon: Icons.info_outline,
                    title: "FAQs",
                    trailing: Icons.keyboard_arrow_down,
                  ),
                  _ListItem(
                    icon: Icons.phone_outlined,
                    title: "Contact Support",
                    subtitle: "User Query",
                    trailing: Icons.keyboard_arrow_down,
                  ),
                  _ListItem(
                    icon: Icons.security,
                    title: "Policies & Terms",
                    subtitle: "Service Terms & Conditions",
                    trailing: Icons.keyboard_arrow_down,
                  ),
                  _ListItem(
                    icon: Icons.report_outlined,
                    title: "Report an Issue",
                  ),
                ],
              ),

              SizedBox(height: screenSize.height * 0.02),

              /// 🔹 Logout
              _buildSection(
                children: [
                  _ListItem(
                    icon: Icons.logout,
                    title: "Logout",
                    color: Colors.white70,
                    onTap: _showLogoutDialog, // 👈 ADD THIS,
                  ),
                ],
              ),

              SizedBox(height: screenSize.height * 0.02),

              /// 🔹 Delete
              _buildSection(
                children: [
                  _ListItem(
                    icon: Icons.delete_outline,
                    title: "Delete Account",
                    color: Color(0xFFEF3235),
                    onTap: _showDeleteDialog, // 👈 ADD THIS
                  ),
                ],
              ),

              const SizedBox(height: 100), // Space for bottom bar
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({String? title, required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      width: double.infinity,
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: accentCyan,
              ),
            ),
            const SizedBox(height: 6),
          ],
          ...children,
        ],
      ),
    );
  }

  Widget _buildPremiumCard() {
    return _PremiumCard(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const PremiumPlansScreen()),
        );
      },
    );
  }

  Widget _profileInfoTile({required String title, required String value}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            title,
            style: const TextStyle(color: Colors.white54, fontSize: 11),
          ),
        ],
      ),
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
    return ListTile(
      dense: true,
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, size: 22, color: color ?? Colors.white70),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: color ?? Colors.white,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: const TextStyle(fontSize: 12, color: Colors.white38),
            )
          : null,
      trailing: trailing != null
          ? Icon(trailing, size: 14, color: Colors.white24)
          : null,
      onTap: onTap,
    );
  }
}

class _PremiumCard extends StatelessWidget {
  final VoidCallback onTap;

  const _PremiumCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFF81DEEA).withOpacity(0.15)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF81DEEA).withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.workspace_premium,
                color: Color(0xFF81DEEA),
                size: 24,
              ),
            ),

            const SizedBox(width: 14),

            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Upgrade to Premium",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),

                  SizedBox(height: 4),

                  Text(
                    "Unlock smart reports & insights",
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 10),

            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF81DEEA),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                "UPGRADE",
                style: TextStyle(
                  color: Colors.black,
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
