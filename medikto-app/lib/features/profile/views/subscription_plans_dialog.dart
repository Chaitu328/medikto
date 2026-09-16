import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/features/profile/data/profile_provider.dart';
import 'package:medikto/features/profile/models/profile_model.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:cherry_toast/cherry_toast.dart';

class SubscriptionPlansDialog extends ConsumerStatefulWidget {
  final ProfileModel profile;

  const SubscriptionPlansDialog({
    super.key,
    required this.profile,
  });

  static Future<void> show(BuildContext context, ProfileModel profile) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SubscriptionPlansDialog(profile: profile),
    );
  }

  @override
  ConsumerState<SubscriptionPlansDialog> createState() => _SubscriptionPlansDialogState();
}

class _SubscriptionPlansDialogState extends ConsumerState<SubscriptionPlansDialog> {
  late Razorpay _razorpay;
  bool _isLoading = false;
  String? _currentOrderId;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    setState(() => _isLoading = true);

    try {
      final verifyRes = await ref.read(profileProvider).verifyPaymentSignature(
            orderId: response.orderId ?? _currentOrderId ?? "",
            paymentId: response.paymentId ?? "",
            signature: response.signature ?? "",
            plan: "premium",
          );

      if (mounted) {
        setState(() => _isLoading = false);

        if (verifyRes.status == ResponseStatus.SUCCESS) {
          ref.invalidate(profileProvider);

          Navigator.pop(context); // Close sheet

          CherryToast.success(
            title: const Text("Premium Activated!"),
            description: const Text("Thank you for upgrading to Medikto Premium."),
          ).show(context);
        } else {
          CherryToast.error(
            title: const Text("Verification Failed"),
            description: Text(verifyRes.message),
          ).show(context);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        CherryToast.error(
          title: const Text("Error"),
          description: Text("Verification error: $e"),
        ).show(context);
      }
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    if (mounted) {
      setState(() => _isLoading = false);
      CherryToast.error(
        title: const Text("Payment Failed / Cancelled"),
        description: Text(response.message ?? "Transaction was not completed."),
      ).show(context);
    }
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    if (mounted) {
      CherryToast.info(
        title: const Text("External Wallet Selected"),
        description: Text("Wallet: ${response.walletName}"),
      ).show(context);
    }
  }

  Future<void> _startPayment() async {
    setState(() => _isLoading = true);

    try {
      final orderRes = await ref.read(profileProvider).createPaymentOrder(
            amount: 50000, // ₹500 in paise
            plan: "premium",
          );

      if (orderRes.status != ResponseStatus.SUCCESS || orderRes.data == null) {
        if (mounted) {
          setState(() => _isLoading = false);
          CherryToast.error(
            title: const Text("Order Creation Failed"),
            description: Text(orderRes.message),
          ).show(context);
        }
        return;
      }

      final orderData = orderRes.data;
      _currentOrderId = orderData['order_id'] ?? orderData['id'];

      final options = {
        'key': orderData['key_id'] ?? 'rzp_test_Tcayw2QOeSxMyh',
        'amount': orderData['amount'] ?? 50000,
        'name': 'Medikto Health Platform',
        'order_id': _currentOrderId,
        'description': 'Medikto Premium Subscription (1 Month)',
        'timeout': 300,
        'prefill': {
          'contact': widget.profile.phone ?? '',
          'email': widget.profile.email ?? '',
        },
        'theme': {
          'color': '#0284C7',
        },
      };

      _razorpay.open(options);
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        CherryToast.error(
          title: const Text("Payment Error"),
          description: Text("Unable to open checkout: $e"),
        ).show(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Container(
      padding: const EdgeInsets.only(top: 16, left: 20, right: 20, bottom: 32),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag Handle
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: colors.borderSubtle,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: colors.accentSubtle,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(Icons.workspace_premium, color: colors.accent, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Medikto Premium",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: colors.textPrimary,
                      ),
                    ),
                    Text(
                      "Unlock unlimited health management",
                      style: TextStyle(
                        fontSize: 13,
                        color: colors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Premium Offer Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  colors.accent.withValues(alpha: 0.12),
                  colors.accent.withValues(alpha: 0.04),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: colors.accent.withValues(alpha: 0.3), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Monthly Plan",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: colors.textPrimary,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: colors.accent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        "50% OFF",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      "₹500",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: colors.accent,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      "/ month",
                      style: TextStyle(
                        fontSize: 14,
                        color: colors.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "₹1000",
                      style: TextStyle(
                        fontSize: 14,
                        color: colors.textSecondary,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(height: 1),
                const SizedBox(height: 14),

                // Features
                _buildFeatureRow(Icons.check_circle, "Unlimited medication reminders", colors),
                _buildFeatureRow(Icons.check_circle, "Store up to 250 medical reports", colors),
                _buildFeatureRow(Icons.check_circle, "Indefinite dose selfie proof vault", colors),
                _buildFeatureRow(Icons.check_circle, "Detailed AI adherence analytics", colors),
                _buildFeatureRow(Icons.check_circle, "Secure multi-device cloud backup", colors),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Upgrade Button
          ElevatedButton(
            onPressed: _isLoading ? null : _startPayment,
            style: ElevatedButton.styleFrom(
              backgroundColor: colors.accent,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.payment, size: 20),
                      SizedBox(width: 8),
                      Text(
                        "Pay with Razorpay (₹500)",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(IconData icon, String text, AppThemeColors colors) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: colors.accent),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13,
                color: colors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
