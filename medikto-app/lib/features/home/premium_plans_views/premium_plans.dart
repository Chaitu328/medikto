import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/data/subscription_provider.dart';
import 'package:medikto/features/profile/models/subscription_model.dart';

class PremiumPlansScreen extends ConsumerStatefulWidget {
  const PremiumPlansScreen({super.key});

  @override
  ConsumerState<PremiumPlansScreen> createState() => _PremiumPlansScreenState();
}

class _PremiumPlansScreenState extends ConsumerState<PremiumPlansScreen> {
  final ValueNotifier<int> _selectedPlanIndex = ValueNotifier<int>(1); // Default select Premium

  @override
  void dispose() {
    _selectedPlanIndex.dispose();
    super.dispose();
  }

  Future<void> _handleStartFreeTrial(AppThemeColors colors) async {
    final shouldProceed = await showDialog<bool>(
      context: context,
      barrierColor: Colors.black54,
      builder: (ctx) => _TrialConfirmationDialog(colors: colors),
    );

    if (shouldProceed != true) return;

    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Center(
        child: CircularProgressIndicator(color: colors.accentPrimary),
      ),
    );

    final response = await ref.read(profileProvider).startFreeTrial();

    if (mounted) {
      Navigator.pop(context); // Pop loading spinner
    }

    if (response.status == ResponseStatus.SUCCESS) {
      // Refresh providers
      ref.invalidate(subscriptionStatusProvider);
      ref.invalidate(getProfileProvider);

      if (mounted) {
        showDialog(
          barrierColor: Colors.black54,
          context: context,
          barrierDismissible: false,
          builder: (context) => _SuccessDialog(
            surfaceColor: colors.card,
            title: "Free Trial Activated!",
            subtitle: "You now have 30 days of free Premium access.",
          ),
        );

        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(
                builder: (_) => const BaseBottomNavigationPage(),
              ),
              (route) => false,
            );
          }
        });
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: AppColors.statusCritical,
          ),
        );
      }
    }
  }

  Future<void> _handleUpdateSubscription(String plan, AppThemeColors colors) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Center(
        child: CircularProgressIndicator(color: colors.accentPrimary),
      ),
    );

    final response = await ref.read(profileProvider).updateSubscription(plan: plan);

    if (mounted) {
      Navigator.pop(context);
    }

    if (response.status == ResponseStatus.SUCCESS) {
      ref.invalidate(subscriptionStatusProvider);
      ref.invalidate(getProfileProvider);

      if (mounted) {
        showDialog(
          barrierColor: Colors.black54,
          context: context,
          barrierDismissible: false,
          builder: (context) => _SuccessDialog(
            surfaceColor: colors.card,
            title: "Plan Updated",
            subtitle: "Your subscription is now updated to ${plan.toUpperCase()}.",
          ),
        );

        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(
                builder: (_) => const BaseBottomNavigationPage(),
              ),
              (route) => false,
            );
          }
        });
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: AppColors.statusCritical,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final plansAsync = ref.watch(subscriptionPlansProvider);
    final statusAsync = ref.watch(subscriptionStatusProvider);

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: _buildAppBar(colors),
      body: plansAsync.when(
        data: (plans) {
          final status = statusAsync.value ?? SubscriptionStatusModel.defaultBasic();

          return Stack(
            children: [
              ValueListenableBuilder<int>(
                valueListenable: _selectedPlanIndex,
                builder: (context, selectedIndex, _) {
                  return CustomScrollView(
                    physics: const BouncingScrollPhysics(),
                    slivers: [
                      const SliverToBoxAdapter(child: SizedBox(height: 12)),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate((context, index) {
                            final plan = plans[index];
                            final isPlanSelected = selectedIndex == index;
                            final isCurrentPlan = status.plan == plan.id;

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _PlanCard(
                                plan: plan,
                                isSelected: isPlanSelected,
                                isCurrentPlan: isCurrentPlan,
                                status: status,
                                accentColor: colors.accentPrimary,
                                surfaceColor: colors.card,
                                onTap: () => _selectedPlanIndex.value = index,
                              ),
                            );
                          }, childCount: plans.length),
                        ),
                      ),
                      const SliverToBoxAdapter(child: SizedBox(height: 120)),
                    ],
                  );
                },
              ),
              _buildBottomButton(colors, plans, status),
            ],
          );
        },
        loading: () => Center(
          child: CircularProgressIndicator(color: colors.accentPrimary),
        ),
        error: (e, _) => Center(
          child: Text(
            "Failed to load plans",
            style: TextStyle(color: colors.textSecondary),
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(AppThemeColors colors) {
    return AppBar(
      backgroundColor: colors.bg,
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: IconButton(
        icon: Icon(Icons.arrow_back_ios_new, color: colors.textPrimary, size: 20),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(
        "Our Plans",
        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: colors.textPrimary),
      ),
    );
  }

  Widget _buildBottomButton(
    AppThemeColors colors,
    List<PlanOfferingModel> plans,
    SubscriptionStatusModel status,
  ) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
        decoration: BoxDecoration(
          color: colors.bg,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 15,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ValueListenableBuilder<int>(
          valueListenable: _selectedPlanIndex,
          builder: (context, selectedIndex, child) {
            final selectedPlan = selectedIndex < plans.length ? plans[selectedIndex] : plans[0];
            final isSelectingBasic = selectedPlan.id == "basic";
            final isSelectingPremium = selectedPlan.id == "premium";

            String buttonText = "SELECT PLAN";
            bool isCurrent = false;
            VoidCallback? onPressed;

            if (isSelectingBasic) {
              if (status.plan == "basic" && !status.isPremium) {
                buttonText = "CURRENT PLAN";
                isCurrent = true;
                onPressed = null;
              } else {
                buttonText = "Switch to Basic";
                onPressed = () => _handleUpdateSubscription("basic", colors);
              }
            } else if (isSelectingPremium) {
              if (status.status == "trial" && status.isPremium) {
                final days = status.remainingTrialDays;
                buttonText = days > 0 ? "Premium Trial Active ($days days left)" : "Premium Trial Active";
                isCurrent = true;
                onPressed = null;
              } else if (status.isPremium && status.status == "active") {
                buttonText = "Premium Active";
                isCurrent = true;
                onPressed = null;
              } else if (status.canClaimTrial) {
                buttonText = "Start 1 Month Free Trial";
                onPressed = () => _handleStartFreeTrial(colors);
              } else {
                buttonText = "Upgrade to Premium (${selectedPlan.priceText})";
                onPressed = () => _handleUpdateSubscription("premium", colors);
              }
            }

            return ElevatedButton(
              onPressed: onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: isCurrent ? colors.cardSecondary : colors.accentPrimary,
                disabledBackgroundColor: colors.cardSecondary,
                minimumSize: const Size(double.infinity, 54),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                  side: isCurrent
                      ? BorderSide(color: colors.border)
                      : BorderSide.none,
                ),
                elevation: isCurrent ? 0 : 2,
              ),
              child: Text(
                buttonText,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isCurrent ? colors.textSecondary : colors.onAccentPrimary,
                  letterSpacing: 0.3,
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
  final PlanOfferingModel plan;
  final bool isSelected;
  final bool isCurrentPlan;
  final SubscriptionStatusModel status;
  final Color accentColor;
  final Color surfaceColor;
  final VoidCallback onTap;

  const _PlanCard({
    required this.plan,
    required this.isSelected,
    required this.isCurrentPlan,
    required this.status,
    required this.accentColor,
    required this.surfaceColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final isPremium = plan.id == "premium";

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        decoration: BoxDecoration(
          color: surfaceColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isSelected ? accentColor : colors.borderSubtle,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: accentColor.withOpacity(0.12),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    height: 44,
                    width: 44,
                    decoration: BoxDecoration(
                      color: isPremium ? const Color(0xFF2D2A1F) : const Color(0xFF2D1F21),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isPremium ? Icons.diamond_outlined : Icons.favorite,
                      color: isPremium ? colors.accentPrimary : const Color(0xFFF28F8F),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      plan.title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: colors.textPrimary,
                      ),
                    ),
                  ),
                  _buildRadioIcon(colors),
                ],
              ),
            ),
            Divider(height: 1, thickness: 1, color: colors.borderSubtle),

            // Content Area
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (plan.badge.isNotEmpty) ...[
                    Opacity(
                      opacity: 0.95,
                      child: Image.asset(
                        plan.badge,
                        width: 110,
                        height: 30,
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],

                  // Pricing Display
                  if (!isPremium) ...[
                    // Basic Plan Pricing
                    Text(
                      "FREE",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: colors.textPrimary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ] else ...[
                    // Premium Plan Pricing
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Struck-through Regular Price
                        Text(
                          "₹2,000/month",
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: colors.textMuted,
                            decoration: TextDecoration.lineThrough,
                            decorationColor: colors.textMuted,
                            decorationThickness: 2,
                          ),
                        ),
                        const SizedBox(width: 10),
                        // 50% OFF Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.redAccent.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.redAccent.withOpacity(0.4)),
                          ),
                          child: const Text(
                            "50% OFF",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.redAccent,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    // ₹1,000 / per month
                    RichText(
                      text: TextSpan(
                        text: "₹1,000/ ",
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: colors.textPrimary,
                        ),
                        children: [
                          TextSpan(
                            text: "per month",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.normal,
                              color: colors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),

                    // 1 MONTH FREE TRIAL Highlight
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: colors.accentPrimary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: colors.accentPrimary.withOpacity(0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.auto_awesome,
                            color: colors.accentPrimary,
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            "1 MONTH FREE TRIAL",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: colors.accentPrimary,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Feature List
                  ...plan.features.map<Widget>((feature) => _buildFeatureItem(feature, colors)).toList(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRadioIcon(AppThemeColors colors) {
    return Container(
      height: 24,
      width: 24,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: isSelected ? accentColor : colors.border,
          width: 2,
        ),
      ),
      child: isSelected
          ? Center(
              child: Icon(Icons.check_circle, size: 20, color: accentColor),
            )
          : null,
    );
  }

  Widget _buildFeatureItem(String text, AppThemeColors colors) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 14,
          height: 1.5,
          color: colors.textSecondary,
        ),
      ),
    );
  }
}

class _TrialConfirmationDialog extends StatelessWidget {
  final AppThemeColors colors;
  const _TrialConfirmationDialog({required this.colors});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: colors.card,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: colors.borderSubtle),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 26, horizontal: 22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: colors.accentPrimary.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.workspace_premium,
                color: colors.accentPrimary,
                size: 36,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              "Premium Plan",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: colors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: colors.accentPrimary.withOpacity(0.2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                "1 Month FREE Trial",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: colors.accentPrimary,
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              "Then ₹1,000/month\n50% OFF regular ₹2,000/month",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                height: 1.4,
                color: colors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context, false),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: colors.border),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(
                      "Cancel",
                      style: TextStyle(color: colors.textSecondary),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colors.accentPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      elevation: 0,
                    ),
                    child: Text(
                      "Start Free Trial",
                      style: TextStyle(
                        color: colors.onAccentPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SuccessDialog extends StatelessWidget {
  final Color surfaceColor;
  final String title;
  final String subtitle;

  const _SuccessDialog({
    required this.surfaceColor,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Dialog(
      backgroundColor: surfaceColor,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: colors.borderSubtle),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset("assets/images/account-create-success.png", width: 120),
            const SizedBox(height: 20),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: colors.textPrimary),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: colors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}