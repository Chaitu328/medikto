import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/security/app_lock_manager.dart';
import 'package:medikto/features/auth/pin/pin_lock_screen.dart';

enum ChangePinStep {
  currentPin,
  newPin,
  confirmPin,
}

class ChangePinScreen extends StatefulWidget {
  const ChangePinScreen({super.key});

  @override
  State<ChangePinScreen> createState() => _ChangePinScreenState();
}

class _ChangePinScreenState extends State<ChangePinScreen> {
  ChangePinStep _currentStep = ChangePinStep.currentPin;
  String _enteredPin = "";
  String _newPin = "";
  String? _userId;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    _userId = await AppLockManager().getActiveUserId();
    if (mounted) setState(() {});
  }

  void _onDigitPressed(String digit) {
    if (_enteredPin.length < 4) {
      HapticFeedback.lightImpact();
      setState(() {
        _enteredPin += digit;
      });

      if (_enteredPin.length == 4) {
        _handlePinEntered();
      }
    }
  }

  void _onDeletePressed() {
    if (_enteredPin.isNotEmpty) {
      HapticFeedback.lightImpact();
      setState(() {
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
      });
    }
  }

  void _onClearPressed() {
    if (_enteredPin.isNotEmpty) {
      HapticFeedback.mediumImpact();
      setState(() {
        _enteredPin = "";
      });
    }
  }

  Future<void> _handlePinEntered() async {
    if (_userId == null || _userId!.isEmpty) {
      AppToasts.showError(context, "User session not found.");
      return;
    }

    if (_currentStep == ChangePinStep.currentPin) {
      setState(() => _isLoading = true);
      final isCurrentValid = await AppLockManager().verifyPin(_userId!, _enteredPin);
      setState(() => _isLoading = false);

      if (isCurrentValid) {
        HapticFeedback.mediumImpact();
        setState(() {
          _enteredPin = "";
          _currentStep = ChangePinStep.newPin;
        });
      } else {
        HapticFeedback.heavyImpact();
        AppToasts.showError(context, "Current PIN is incorrect.");
        await Future.delayed(const Duration(milliseconds: 300));
        setState(() {
          _enteredPin = "";
        });
      }
    } else if (_currentStep == ChangePinStep.newPin) {
      await Future.delayed(const Duration(milliseconds: 150));
      setState(() {
        _newPin = _enteredPin;
        _enteredPin = "";
        _currentStep = ChangePinStep.confirmPin;
      });
    } else if (_currentStep == ChangePinStep.confirmPin) {
      if (_enteredPin == _newPin) {
        setState(() => _isLoading = true);
        await AppLockManager().setPin(_userId!, _enteredPin);
        if (!mounted) return;

        AppToasts.showSuccess(context, "Medikto PIN changed successfully");
        Navigator.pop(context);
      } else {
        HapticFeedback.heavyImpact();
        AppToasts.showError(context, "New PINs do not match. Please re-enter.");
        await Future.delayed(const Duration(milliseconds: 300));
        setState(() {
          _enteredPin = "";
          _newPin = "";
          _currentStep = ChangePinStep.newPin;
        });
      }
    }
  }

  String get _title {
    switch (_currentStep) {
      case ChangePinStep.currentPin:
        return "Enter Current PIN";
      case ChangePinStep.newPin:
        return "Enter New 4-Digit PIN";
      case ChangePinStep.confirmPin:
        return "Confirm New PIN";
    }
  }

  String get _subtitle {
    switch (_currentStep) {
      case ChangePinStep.currentPin:
        return "Please enter your current 4-digit Medikto PIN to proceed";
      case ChangePinStep.newPin:
        return "Choose a new 4-digit PIN for your app security";
      case ChangePinStep.confirmPin:
        return "Re-enter your new 4-digit PIN to confirm";
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: AppBar(
        backgroundColor: colors.bg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: colors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Change App PIN",
          style: TextStyle(
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            children: [
              SizedBox(height: size.height * 0.02),

              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: colors.accentSubtle,
                  shape: BoxShape.circle,
                  border: Border.all(color: colors.accentBorder),
                ),
                child: Icon(
                  Icons.password_rounded,
                  color: colors.accentPrimary,
                  size: 30,
                ),
              ),

              const SizedBox(height: 20),

              Text(
                _title,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: colors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 8),

              Text(
                _subtitle,
                style: TextStyle(
                  fontSize: 14,
                  color: colors.textSecondary,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: size.height * 0.035),

              // PIN dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) {
                  final isFilled = index < _enteredPin.length;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 12),
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isFilled ? colors.accentPrimary : Colors.transparent,
                      border: Border.all(
                        color: isFilled ? colors.accentPrimary : colors.border,
                        width: 2,
                      ),
                    ),
                  );
                }),
              ),

              if (_isLoading) ...[
                const SizedBox(height: 16),
                Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
              ],

              if (_currentStep == ChangePinStep.currentPin) ...[
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const PinLockScreen(),
                      ),
                    );
                  },
                  child: Text(
                    "Forgot Current PIN?",
                    style: TextStyle(
                      color: colors.accentPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],

              const Spacer(),

              // Numeric Keypad
              _buildKeypad(colors),

              SizedBox(height: size.height * 0.02),
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
