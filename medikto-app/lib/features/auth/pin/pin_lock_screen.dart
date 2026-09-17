import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/security/app_lock_manager.dart';
import 'package:medikto/features/auth/data/managers/auth_manager.dart';
import 'package:medikto/features/auth/pin/set_pin_screen.dart';
import 'package:medikto/features/profile/data/profile_manager.dart';

class PinLockScreen extends StatefulWidget {
  final String? userId;
  final String? targetDoseId;

  const PinLockScreen({
    super.key,
    this.userId,
    this.targetDoseId,
  });

  @override
  State<PinLockScreen> createState() => _PinLockScreenState();
}

class _PinLockScreenState extends State<PinLockScreen> with SingleTickerProviderStateMixin {
  String _enteredPin = "";
  String? _resolvedUserId;
  bool _isVerifying = false;
  String? _errorMessage;
  int _failedAttempts = 0;
  DateTime? _lockoutUntil;
  late AnimationController _shakeController;

  @override
  void initState() {
    super.initState();
    _shakeController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _resolveUserId();
  }

  @override
  void dispose() {
    _shakeController.dispose();
    super.dispose();
  }

  Future<void> _resolveUserId() async {
    _resolvedUserId = widget.userId ?? await AppLockManager().getActiveUserId();
    if (mounted) setState(() {});
  }

  bool _isLockedOut() {
    if (_lockoutUntil == null) return false;
    if (DateTime.now().isBefore(_lockoutUntil!)) {
      return true;
    }
    _lockoutUntil = null;
    return false;
  }

  void _onDigitPressed(String digit) {
    if (_isLockedOut()) {
      final remaining = _lockoutUntil!.difference(DateTime.now()).inSeconds;
      AppToasts.showError(context, "Too many failed attempts. Please wait $remaining seconds.");
      return;
    }

    if (_enteredPin.length < 4 && !_isVerifying) {
      HapticFeedback.lightImpact();
      setState(() {
        _errorMessage = null;
        _enteredPin += digit;
      });

      if (_enteredPin.length == 4) {
        _verifyEnteredPin();
      }
    }
  }

  void _onDeletePressed() {
    if (_enteredPin.isNotEmpty && !_isVerifying) {
      HapticFeedback.lightImpact();
      setState(() {
        _errorMessage = null;
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
      });
    }
  }

  void _onClearPressed() {
    if (_enteredPin.isNotEmpty && !_isVerifying) {
      HapticFeedback.mediumImpact();
      setState(() {
        _errorMessage = null;
        _enteredPin = "";
      });
    }
  }

  Future<void> _verifyEnteredPin() async {
    setState(() => _isVerifying = true);

    final userId = _resolvedUserId ?? await AppLockManager().getActiveUserId();
    if (userId == null || userId.isEmpty) {
      setState(() => _isVerifying = false);
      if (mounted) {
        AppToasts.showError(context, "User session not found.");
      }
      return;
    }

    final isValid = await AppLockManager().verifyPin(userId, _enteredPin);

    if (isValid) {
      HapticFeedback.mediumImpact();
      AppLockManager().unlockApp();

      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (_) => BaseBottomNavigationPage(
            index: widget.targetDoseId != null ? 1 : 0,
            pendingDoseId: widget.targetDoseId,
          ),
        ),
        (route) => false,
      );
    } else {
      HapticFeedback.heavyImpact();
      _shakeController.forward(from: 0.0);
      _failedAttempts++;

      if (_failedAttempts >= 5) {
        _lockoutUntil = DateTime.now().add(const Duration(seconds: 30));
        _failedAttempts = 0;
      }

      setState(() {
        _isVerifying = false;
        _errorMessage = "Incorrect PIN. Please try again.";
        _enteredPin = "";
      });
    }
  }

  Future<void> _handleForgotPin() async {
    final colors = context.themeColors;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
    );

    try {
      final profileResp = await ProfileManager().getProfile();
      if (!mounted) return;
      Navigator.pop(context); // close loader

      String? phone;
      if (profileResp.status == ResponseStatus.SUCCESS && profileResp.data != null) {
        phone = profileResp.data.phone;
      }

      if (phone == null || phone.isEmpty) {
        AppToasts.showError(context, "Registered phone number not found. Please log in again.");
        return;
      }

      _showForgotPinOtpFlow(phone);
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        AppToasts.showError(context, "Failed to initiate PIN reset: $e");
      }
    }
  }

  void _showForgotPinOtpFlow(String phone) {
    final colors = context.themeColors;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
    );

    authManager.sendFirebaseOTP(
      phone: phone,
      onCodeSent: (verificationId, resendToken) {
        if (mounted) {
          Navigator.pop(context); // close loading
          _showOtpDialog(phone, verificationId);
        }
      },
      onVerificationFailed: (FirebaseAuthException e) {
        if (mounted) {
          Navigator.pop(context);
          AppToasts.showError(context, e.message ?? "Failed to send verification code");
        }
      },
    );
  }

  void _showOtpDialog(String phone, String verificationId) {
    final colors = context.themeColors;
    final pinController = TextEditingController();
    bool dialogLoading = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: colors.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: colors.border),
              ),
              title: Text(
                "Reset App PIN",
                style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "Enter the 6-digit code sent to $phone to reset your Medikto PIN.",
                    style: TextStyle(color: colors.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: pinController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    style: TextStyle(
                      color: colors.textPrimary,
                      letterSpacing: 8,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                    decoration: InputDecoration(
                      hintText: "------",
                      hintStyle: TextStyle(color: colors.textMuted),
                      filled: true,
                      fillColor: colors.inputFill,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: colors.border),
                      ),
                    ),
                  ),
                  if (dialogLoading)
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: CircularProgressIndicator(color: colors.accentPrimary),
                    ),
                ],
              ),
              actions: [
                if (!dialogLoading) ...[
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text("Cancel", style: TextStyle(color: colors.textMuted)),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colors.accentPrimary,
                      foregroundColor: colors.onAccentPrimary,
                    ),
                    onPressed: () async {
                      if (pinController.text.length != 6) return;
                      setDialogState(() => dialogLoading = true);

                      try {
                        final credential = PhoneAuthProvider.credential(
                          verificationId: verificationId,
                          smsCode: pinController.text,
                        );
                        await FirebaseAuth.instance.signInWithCredential(credential);

                        if (!mounted) return;
                        Navigator.pop(dialogCtx); // close dialog

                        // Route to SetPinScreen in reset mode
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => SetPinScreen(
                              userId: _resolvedUserId,
                              isResetMode: true,
                              targetDoseId: widget.targetDoseId,
                            ),
                          ),
                        );
                      } catch (e) {
                        setDialogState(() => dialogLoading = false);
                        AppToasts.showError(context, "Invalid OTP code. Please try again.");
                      }
                    },
                    child: const Text("Verify & Reset"),
                  ),
                ],
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: colors.bg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            children: [
              SizedBox(height: size.height * 0.04),

              // Lock Icon
              Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  color: colors.accentSubtle,
                  shape: BoxShape.circle,
                  border: Border.all(color: colors.accentBorder),
                ),
                child: Icon(
                  Icons.lock_rounded,
                  color: colors.accentPrimary,
                  size: 34,
                ),
              ),

              const SizedBox(height: 24),

              Text(
                "Enter Medikto PIN",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: colors.textPrimary,
                ),
              ),

              const SizedBox(height: 8),

              Text(
                "Enter your 4-digit PIN to access your account",
                style: TextStyle(
                  fontSize: 14,
                  color: colors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: size.height * 0.04),

              // Animated Shake Dots
              AnimatedBuilder(
                animation: _shakeController,
                builder: (context, child) {
                  final offset = 10.0 * (1.0 - _shakeController.value) * (sin(_shakeController.value * 3.14159 * 4));
                  return Transform.translate(
                    offset: Offset(offset, 0),
                    child: child,
                  );
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(4, (index) {
                    final isFilled = index < _enteredPin.length;
                    final hasError = _errorMessage != null;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      margin: const EdgeInsets.symmetric(horizontal: 12),
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isFilled
                            ? (hasError ? AppColors.statusMissed : colors.accentPrimary)
                            : Colors.transparent,
                        border: Border.all(
                          color: hasError
                              ? AppColors.statusMissed
                              : (isFilled ? colors.accentPrimary : colors.border),
                          width: 2,
                        ),
                      ),
                    );
                  }),
                ),
              ),

              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  style: const TextStyle(
                    color: AppColors.statusMissed,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],

              if (_isVerifying) ...[
                const SizedBox(height: 16),
                Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
              ],

              const Spacer(),

              // Numeric Keypad
              _buildKeypad(colors),

              const SizedBox(height: 16),

              TextButton(
                onPressed: _handleForgotPin,
                child: Text(
                  "Forgot PIN?",
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: colors.accentMedium,
                  ),
                ),
              ),

              SizedBox(height: size.height * 0.01),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKeypad(AppThemeColors colors) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildKeypadButton("1", colors),
            _buildKeypadButton("2", colors),
            _buildKeypadButton("3", colors),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildKeypadButton("4", colors),
            _buildKeypadButton("5", colors),
            _buildKeypadButton("6", colors),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildKeypadButton("7", colors),
            _buildKeypadButton("8", colors),
            _buildKeypadButton("9", colors),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildActionKey(
              icon: Icons.refresh,
              onTap: _onClearPressed,
              colors: colors,
            ),
            _buildKeypadButton("0", colors),
            _buildActionKey(
              icon: Icons.backspace_outlined,
              onTap: _onDeletePressed,
              colors: colors,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKeypadButton(String digit, AppThemeColors colors) {
    return InkWell(
      onTap: () => _onDigitPressed(digit),
      borderRadius: BorderRadius.circular(40),
      child: Container(
        width: 72,
        height: 72,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: colors.card,
          border: Border.all(color: colors.borderSubtle),
          boxShadow: [
            BoxShadow(
              color: colors.shadowColor,
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          digit,
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w600,
            color: colors.textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildActionKey({
    required IconData icon,
    required VoidCallback onTap,
    required AppThemeColors colors,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(40),
      child: Container(
        width: 72,
        height: 72,
        alignment: Alignment.center,
        child: Icon(
          icon,
          color: colors.textSecondary,
          size: 26,
        ),
      ),
    );
  }
}

/// Modal sheet for inline 4-digit PIN verification before sensitive actions (e.g. sharing)
class PinVerificationModal extends StatefulWidget {
  final String userId;
  final String reason;

  const PinVerificationModal({
    super.key,
    required this.userId,
    required this.reason,
  });

  @override
  State<PinVerificationModal> createState() => _PinVerificationModalState();
}

class _PinVerificationModalState extends State<PinVerificationModal> {
  String _enteredPin = "";
  String? _errorMessage;
  bool _isVerifying = false;

  void _onDigit(String d) {
    if (_enteredPin.length < 4 && !_isVerifying) {
      HapticFeedback.lightImpact();
      setState(() {
        _errorMessage = null;
        _enteredPin += d;
      });

      if (_enteredPin.length == 4) {
        _verify();
      }
    }
  }

  void _onDelete() {
    if (_enteredPin.isNotEmpty && !_isVerifying) {
      HapticFeedback.lightImpact();
      setState(() {
        _errorMessage = null;
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
      });
    }
  }

  Future<void> _verify() async {
    setState(() => _isVerifying = true);
    final isValid = await AppLockManager().verifyPin(widget.userId, _enteredPin);
    if (isValid) {
      HapticFeedback.mediumImpact();
      if (!mounted) return;
      Navigator.pop(context, true);
    } else {
      HapticFeedback.heavyImpact();
      setState(() {
        _isVerifying = false;
        _errorMessage = "Incorrect PIN";
        _enteredPin = "";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "App Security Check",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: colors.textPrimary,
                ),
              ),
              IconButton(
                icon: Icon(Icons.close, color: colors.textMuted),
                onPressed: () => Navigator.pop(context, false),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            widget.reason,
            style: TextStyle(fontSize: 13, color: colors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (i) {
              final filled = i < _enteredPin.length;
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 10),
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: filled ? colors.accentPrimary : Colors.transparent,
                  border: Border.all(
                    color: _errorMessage != null ? AppColors.statusMissed : colors.accentPrimary,
                    width: 2,
                  ),
                ),
              );
            }),
          ),
          if (_errorMessage != null) ...[
            const SizedBox(height: 10),
            Text(
              _errorMessage!,
              style: const TextStyle(color: AppColors.statusMissed, fontSize: 12),
            ),
          ],
          const SizedBox(height: 20),
          // Compact Keypad
          _buildCompactKeypad(colors),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _buildCompactKeypad(AppThemeColors colors) {
    return Column(
      children: [
        for (var row in [
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
        ]) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: row.map((d) => _compactKey(d, colors)).toList(),
          ),
          const SizedBox(height: 10),
        ],
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            const SizedBox(width: 60, height: 60),
            _compactKey("0", colors),
            InkWell(
              onTap: _onDelete,
              borderRadius: BorderRadius.circular(30),
              child: SizedBox(
                width: 60,
                height: 60,
                child: Icon(Icons.backspace_outlined, color: colors.textSecondary, size: 22),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _compactKey(String d, AppThemeColors colors) {
    return InkWell(
      onTap: () => _onDigit(d),
      borderRadius: BorderRadius.circular(30),
      child: Container(
        width: 60,
        height: 60,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: colors.card,
          border: Border.all(color: colors.borderSubtle),
        ),
        child: Text(
          d,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, color: colors.textPrimary),
        ),
      ),
    );
  }
}
