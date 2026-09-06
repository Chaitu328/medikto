import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/features/auth/data/providers/auth_providers.dart';
import 'package:pinput/pinput.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String? phoneNumber;
  final String verificationId;
  const OtpScreen({super.key, this.phoneNumber, required this.verificationId});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final TextEditingController _pinController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  bool _loading = false;
  String enteredOtp = "";
  late String _activeVerificationId;

  @override
  void initState() {
    super.initState();
    _activeVerificationId = widget.verificationId;
  }

  @override
  void dispose() {
    _pinController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _verifyOtp() async {
    if (_loading) return;

    if (_pinController.text.length != 6) {
      return;
    }

    setState(() => _loading = true);

    final response = await ref
        .read(authProvider)
        .verifyFirebaseOTP(verificationId: _activeVerificationId, smsCode: _pinController.text);

    setState(() => _loading = false);

    if (!mounted) return;

    if (response.status == ResponseStatus.SUCCESS) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const BaseBottomNavigationPage()),
        (route) => false,
      );
    } else {
      AppToasts.showError(context, response.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    final defaultPinTheme = PinTheme(
      width: size.width * 0.12,
      height: 56,
      textStyle: TextStyle(
        fontSize: 24,
        color: colors.textPrimary,
        fontWeight: FontWeight.bold,
      ),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.border),
      ),
    );

    final focusedPinTheme = defaultPinTheme.copyWith(
      decoration: defaultPinTheme.decoration!.copyWith(
        border: Border.all(color: colors.accentPrimary, width: 1.5),
      ),
    );

    return Scaffold(
      backgroundColor: colors.bg,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: size.height * 0.06),

              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Icon(
                  Icons.arrow_back_ios_new,
                  size: 22,
                  color: colors.iconColor,
                ),
              ),

              SizedBox(height: size.height * 0.02),

              Text(
                "6-digit code",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: colors.textPrimary,
                ),
              ),

              const SizedBox(height: 8),

              Text(
                "Code sent to ${widget.phoneNumber}. Please enter it below to verify.",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: colors.textSecondary,
                ),
              ),

              SizedBox(height: size.height * 0.04),

              ///🔹 OTP FIELD
              SizedBox(
                width: double.infinity,
                child: Pinput(
                  length: 6,
                  controller: _pinController,
                  focusNode: _focusNode,
                  keyboardType: TextInputType.number,
                  defaultPinTheme: defaultPinTheme,
                  focusedPinTheme: focusedPinTheme,
                  submittedPinTheme: defaultPinTheme,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  separatorBuilder: (index) => const SizedBox(width: 8),
                  onCompleted: (pin) => _verifyOtp(),
                  autofocus: true,
                  cursor: Container(width: 2, height: 24, color: colors.accentPrimary),
                ),
              ),

              SizedBox(height: size.height * 0.03),

              Row(
                children: [
                  Text(
                    "No code received? ",
                    style: TextStyle(color: colors.textMuted, fontSize: 14),
                  ),
                  GestureDetector(
                    onTap: () async {
                      if (_loading) return;
                      _pinController.clear();
                      setState(() => _loading = true);
                      try {
                        await ref.read(authProvider).sendFirebaseOTP(
                          phone: widget.phoneNumber ?? "",
                          onCodeSent: (newVerificationId, _) {
                            _pinController.clear();
                            setState(() {
                              _loading = false;
                              _activeVerificationId = newVerificationId;
                            });
                            AppToasts.showSuccess(context, "OTP code resent successfully");
                          },
                          onVerificationFailed: (FirebaseAuthException e) {
                            setState(() => _loading = false);
                            AppToasts.showError(context, e.message ?? "Resend failed");
                          },
                        );
                      } catch (e) {
                        setState(() => _loading = false);
                        AppToasts.showError(context, "Failed to resend code: $e");
                      }
                    },
                    child: Text(
                      "Resend Code",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: colors.accentMedium,
                      ),
                    ),
                  ),
                ],
              ),

              if (_loading) ...[
                SizedBox(height: size.height * 0.05),
                Center(
                  child: CircularProgressIndicator(color: colors.accentPrimary),
                ),
              ],

              SizedBox(height: size.height * 0.14),
            ],
          ),
        ),
      ),
    );
  }
}
