import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class AppLoader {
  static OverlayEntry? _overlayEntry;

  /// SHOW LOADER
  static void show(BuildContext context) {
    if (_overlayEntry != null) return;

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return const _LoaderOverlay();
      },
    );

    Overlay.of(context).insert(_overlayEntry!);
  }

  /// HIDE LOADER
  static void hide() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }
}

class _LoaderOverlay extends StatefulWidget {
  const _LoaderOverlay();

  @override
  State<_LoaderOverlay> createState() => _LoaderOverlayState();
}

class _LoaderOverlayState extends State<_LoaderOverlay> {
  // We don't need SingleTickerProviderStateMixin or a custom controller for flutter_spinkit

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withAlpha(40), // Dark overlay background
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 2, sigmaY: 2),
        child: Center(
          child: RepaintBoundary(
            child: Container(
              height: 80, // Adjust size to match image_0.png
              width: 80,
              decoration: BoxDecoration(
                // Use a non-transparent color for the box, matching the image
                color: const Color(
                  0xFF333333,
                ).withAlpha(240), // Slightly transparent dark grey
                borderRadius: BorderRadius.circular(15), // Rounded corners
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(80),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Center(
                child: SpinKitFadingCircle(
                  // This widget mimics the iOS-style spinner
                  color: Colors.white,
                  size: 40,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
