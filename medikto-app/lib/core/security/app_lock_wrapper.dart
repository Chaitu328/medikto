import 'package:flutter/material.dart';
import 'package:medikto/core/widgets/push_token_debug_widget.dart';

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
    return Stack(
      children: [
        child,
        const Positioned(
          bottom: 24,
          left: 16,
          right: 16,
          child: PushTokenDebugWidget(),
        ),
      ],
    );
  }
}
