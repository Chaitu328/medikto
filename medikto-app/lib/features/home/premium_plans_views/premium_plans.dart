import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/profile/data/profile_manager.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';

class PremiumPlansScreen extends ConsumerStatefulWidget {
  const PremiumPlansScreen({super.key});

  @override
  ConsumerState<PremiumPlansScreen> createState() => _PremiumPlansScreenState();
}

class _PremiumPlansScreenState extends ConsumerState<PremiumPlansScreen> {
  // Dark Mode Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Colors.white70;

  final ValueNotifier<int> _selectedPlanIndex = ValueNotifier<int>(0);

  final List<Map<String, dynamic>> plans = [
    {
      "title": "Basic plan",
      "price": "₹499",
      "icon": Icons.favorite,
      "iconBg": const Color(0xFF2D1F21), // Darker muted pink
      "iconColor": const Color(0xFFF28F8F),
      "badge": "assets/images/basic-plan.png",
      "features": [
        "🧾 Store up to 50 health reports",
        "💊 Manage up to 5 active medications",
        "🔔 Daily reminders for medications",
        "📸 Take photo & delete in 48 hours",
        "📁 Upload and view prescriptions anytime",
        "☁️ Secure cloud backup (limited space)",
      ],
    },
    {
      "title": "Premium Plan",
      "price": "₹2000",
      "icon": Icons.diamond_outlined,
      "iconBg": const Color(0xFF2D2A1F), // Darker muted gold
      "iconColor": accentCyan, // Switched to app accent
      "badge": "assets/images/premium-plan.png",
      "features": [
        "🧾 Store up to 250 health reports",
        "💊 Manage unlimited medications",
        "📸 Take photo & store indefinitely",
        "📈 Detailed AI health analytics",
        "☁️ Full cloud storage & sync across devices",
        "📤 Share as PDF, JPEG via Bluetooth/Email",
      ],
    }
  ];

  @override
  void dispose() {
    _selectedPlanIndex.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      appBar: _buildAppBar(),
      body: Stack(
        children: [
          ValueListenableBuilder(
            valueListenable: _selectedPlanIndex,
            builder: (context, selectedIndex, _) {
              return CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  const SliverToBoxAdapter(child: SizedBox(height: 16)),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: _PlanCard(
                            plan: plans[index],
                            isSelected: selectedIndex == index,
                            accentColor: accentCyan,
                            surfaceColor: surfaceColor,
                            onTap: () => _selectedPlanIndex.value = index,
                          ),
                        );
                      }, childCount: plans.length),
                    ),
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              );
            },
          ),
          _buildBottomButton(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: darkBg,
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new, color: textPrimary, size: 20),
        onPressed: () => Navigator.pop(context),
      ),
      title: const Text(
        "Our Plans",
        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: textPrimary),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.help_outline, color: textSecondary),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildBottomButton() {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
        decoration: BoxDecoration(
          color: darkBg,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 15, offset: const Offset(0, -5)),
          ],
        ),
        child: ValueListenableBuilder(
          valueListenable: _selectedPlanIndex,
          builder: (context, selectedIndex, child) {
            return ElevatedButton(
              onPressed: () async {
                final selectedPlan = selectedIndex == 0 ? "basic" : "premium";

                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (_) => const Center(
                    child: CircularProgressIndicator(color: accentCyan),
                  ),
                );

                final response = await ref
                    .read(profileProvider)
                    .updateSubscription(plan: selectedPlan);

                if (context.mounted) {
                  Navigator.pop(context);
                }

                if (response.status == ResponseStatus.SUCCESS) {
                  showDialog(
                    barrierColor: Colors.black54,
                    context: context,
                    barrierDismissible: false,
                    builder: (context) =>
                        const _SuccessDialog(surfaceColor: surfaceColor),
                  );

                  Future.delayed(const Duration(seconds: 2), () {
                    if (context.mounted) {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const BaseBottomNavigationPage(),
                        ),
                        (route) => false,
                      );
                    }
                  });
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(response.message),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: accentCyan,
                minimumSize: const Size(double.infinity, 54),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
                elevation: 0,
              ),
              child: Text(
                "Activate ${plans[selectedIndex]['title']}",
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            );
          },
),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final Map<String, dynamic> plan;
  final bool isSelected;
  final Color accentColor;
  final Color surfaceColor;
  final VoidCallback onTap;

  const _PlanCard({
    required this.plan,
    required this.isSelected,
    required this.accentColor,
    required this.surfaceColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        decoration: BoxDecoration(
          color: surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? accentColor : Colors.white10,
            width: 2,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: accentColor.withOpacity(0.1),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    height: 44,
                    width: 44,
                    decoration: BoxDecoration(color: plan['iconBg'], shape: BoxShape.circle),
                    child: Icon(plan['icon'], color: plan['iconColor'], size: 22),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    plan['title'],
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const Spacer(),
                  _buildRadioIcon(),
                ],
              ),
            ),
            const Divider(height: 1, thickness: 1, color: Colors.white10),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Opacity(
                    opacity: 0.9,
                    child: Image.asset(plan['badge'], width: 110, height: 32, fit: BoxFit.contain),
                  ),
                  const SizedBox(height: 12),
                  RichText(
                    text: TextSpan(
                      text: "${plan['price']}/ ",
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                      children: const [
                        TextSpan(
                          text: "per month",
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.normal, color: Colors.white54),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...plan['features'].map<Widget>((feature) => _buildFeatureItem(feature)).toList(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRadioIcon() {
    return Container(
      height: 24,
      width: 24,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: isSelected ? accentColor : Colors.white24, width: 2),
      ),
      child: isSelected
          ? Center(child: Icon(Icons.check_circle, size: 20, color: accentColor))
          : null,
    );
  }

  Widget _buildFeatureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        text,
        style: const TextStyle(fontSize: 14, height: 1.5, color: Colors.white70),
      ),
    );
  }
}

class _SuccessDialog extends StatelessWidget {
  final Color surfaceColor;
  const _SuccessDialog({required this.surfaceColor});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: surfaceColor,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset("assets/images/account-create-success.png", width: 120),
            const SizedBox(height: 20),
            const Text(
              "Plan Request Received",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              "Our team will get back to you soon.",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.white54),
            ),
          ],
        ),
      ),
    );
  }
}