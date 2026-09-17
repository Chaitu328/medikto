import 'package:flutter/material.dart';
import 'package:medikto/core/security/app_lock_manager.dart';
import 'package:medikto/features/auth/pin/pin_lock_screen.dart';

class AppLockWrapper extends StatefulWidget {
  final Widget child;
  final GlobalKey<NavigatorState>? navigatorKey;

  const AppLockWrapper({
    super.key,
    required this.child,
    this.navigatorKey,
  });

  @override
  State<AppLockWrapper> createState() => _AppLockWrapperState();
}

class _AppLockWrapperState extends State<AppLockWrapper> with WidgetsBindingObserver {
  bool _isLockScreenShowing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      AppLockManager().recordBackgrounded();
    } else if (state == AppLifecycleState.resumed) {
      _checkAndLockOnResume();
    }
  }

  Future<void> _checkAndLockOnResume() async {
    final lockManager = AppLockManager();
    if (!lockManager.shouldLockOnResume()) {
      return;
    }

    final userId = await lockManager.getActiveUserId();
    if (userId == null || userId.isEmpty) {
      return;
    }

    final hasPin = await lockManager.hasPin(userId);
    if (!hasPin) {
      return;
    }

    lockManager.lockApp();

    if (_isLockScreenShowing) {
      return;
    }

    final navState = widget.navigatorKey?.currentState ?? Navigator.maybeOf(context);
    if (navState == null) return;

    _isLockScreenShowing = true;

    await navState.push(
      MaterialPageRoute(
        builder: (_) => const PinLockScreen(),
        fullscreenDialog: true,
      ),
    );

    _isLockScreenShowing = false;
    lockManager.clearBackgroundedTimestamp();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
