import 'package:flutter/material.dart';

class AppLockWrapper extends StatelessWidget {
  final Widget child;
  final GlobalKey<NavigatorState>? navigatorKey;

  const AppLockWrapper({
    super.key,
    required this.child,
    this.navigatorKey,
  });

  @override
  Widget build(BuildContext context) {
    return child;
  }
}
