import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/core/security/app_lock_manager.dart';

class SetPinScreen extends StatefulWidget {
  final String? userId;
  final bool isResetMode;
  final String? targetDoseId;

  const SetPinScreen({
    super.key,
    this.userId,
    this.isResetMode = false,
    this.targetDoseId,
  });

  @override
  State<SetPinScreen> createState() => _SetPinScreenState();
}

class _SetPinScreenState extends State<SetPinScreen> {
  String _enteredPin = "";
  String _firstPin = "";
  bool _isConfirmStep = false;
  String? _resolvedUserId;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _resolveUserId();
  }

  Future<void> _resolveUserId() async {
    _resolvedUserId = widget.userId ?? await AppLockManager().getActiveUserId();
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
    if (!_isConfirmStep) {
      // Move to confirm step
      await Future.delayed(const Duration(milliseconds: 150));
      setState(() {
        _firstPin = _enteredPin;
        _enteredPin = "";
        _isConfirmStep = true;
      });
    } else {
      // Confirm step verification
      if (_enteredPin == _firstPin) {
        setState(() => _isLoading = true);
        final userId = _resolvedUserId ?? await AppLockManager().getActiveUserId();
        if (userId == null || userId.isEmpty) {
          if (mounted) {
            AppToasts.showError(context, "User session not found. Please log in again.");
            setState(() => _isLoading = false);
          }
          return;
        }

        await AppLockManager().setPin(userId, _enteredPin);
        if (!mounted) return;

        AppToasts.showSuccess(
          context,
          widget.isResetMode ? "Medikto PIN reset successfully" : "Medikto PIN created successfully",
        );

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
        AppToasts.showError(context, "PINs do not match. Please try again.");
        await Future.delayed(const Duration(milliseconds: 300));
        setState(() {
          _enteredPin = "";
          _firstPin = "";
          _isConfirmStep = false;
        });
      }
    }
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
              SizedBox(height: size.height * 0.03),

              // Header Icon
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: colors.accentSubtle,
                  shape: BoxShape.circle,
                  border: Border.all(color: colors.accentBorder),
                ),
                child: Icon(
                  Icons.lock_outline_rounded,
                  color: colors.accentPrimary,
                  size: 32,
                ),
              ),

              const SizedBox(height: 24),

              Text(
                _isConfirmStep ? "Confirm 4-Digit PIN" : (widget.isResetMode ? "Set New 4-Digit PIN" : "Create 4-Digit Medikto PIN"),
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: colors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 8),

              Text(
                _isConfirmStep
                    ? "Re-enter your 4-digit PIN to confirm"
                    : "This PIN will protect your medications and health records on this device",
                style: TextStyle(
                  fontSize: 14,
                  color: colors.textSecondary,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: size.height * 0.04),

              // 4 PIN Dots Indicator
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
                const SizedBox(height: 20),
                Center(child: CircularProgressIndicator(color: colors.accentPrimary)),
              ],

              const Spacer(),

              // Custom Numeric Keypad
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
