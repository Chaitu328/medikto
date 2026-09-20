import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/network/notification_manager.dart';

class PushTokenDebugWidget extends StatefulWidget {
  const PushTokenDebugWidget({super.key});

  @override
  State<PushTokenDebugWidget> createState() => _PushTokenDebugWidgetState();
}

class _PushTokenDebugWidgetState extends State<PushTokenDebugWidget> {
  bool _isExpanded = true;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: NotificationManager.tokenUpdateNotifier,
      builder: (context, _, __) {
        final apns = NotificationManager.apnsToken;
        final fcm = NotificationManager.fcmToken;
        final perm = NotificationManager.permissionStatus ?? 'Pending / Unknown';

        return Material(
            elevation: 8,
            borderRadius: BorderRadius.circular(16),
            color: const Color(0xFF1E1E2C),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: (apns != null && fcm != null)
                      ? Colors.greenAccent
                      : Colors.orangeAccent,
                  width: 1.5,
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        (apns != null && fcm != null)
                            ? Icons.check_circle_rounded
                            : Icons.warning_amber_rounded,
                        color: (apns != null && fcm != null)
                            ? Colors.greenAccent
                            : Colors.orangeAccent,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          "iOS Push Diagnostic (Ad Hoc Debug)",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        icon: Icon(
                          _isExpanded
                              ? Icons.keyboard_arrow_down
                              : Icons.keyboard_arrow_up,
                          color: Colors.white70,
                        ),
                        onPressed: () {
                          setState(() {
                            _isExpanded = !_isExpanded;
                          });
                        },
                      ),
                    ],
                  ),
                  if (_isExpanded) ...[
                    const SizedBox(height: 10),
                    _buildField(
                      label: "1. iOS Permission:",
                      value: perm,
                      color: perm.contains('authorized') || perm.contains('provisional')
                          ? Colors.greenAccent
                          : Colors.amberAccent,
                    ),
                    const SizedBox(height: 8),
                    _buildField(
                      label: "2. APNs Token (from Apple):",
                      value: apns ?? "NULL (iOS failed to issue APNs token)",
                      color: apns != null ? Colors.white : Colors.redAccent,
                      copyable: apns,
                    ),
                    const SizedBox(height: 8),
                    _buildField(
                      label: "3. FCM Token (from Firebase):",
                      value: fcm ?? "NULL (FCM registration pending/failed)",
                      color: fcm != null ? Colors.white : Colors.redAccent,
                      copyable: fcm,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton.icon(
                          onPressed: () {
                            NotificationManager().registerFCMToken();
                          },
                          icon: const Icon(Icons.refresh, size: 16, color: Colors.cyanAccent),
                          label: const Text(
                            "Re-fetch Tokens",
                            style: TextStyle(color: Colors.cyanAccent, fontSize: 12),
                          ),
                        ),
                        const SizedBox(width: 8),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _isExpanded = false;
                            });
                          },
                          child: const Text(
                            "Minimize",
                            style: TextStyle(color: Colors.white60, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          );
      },
    );
  }

  Widget _buildField({
    required String label,
    required String value,
    required Color color,
    String? copyable,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (copyable != null && copyable.isNotEmpty)
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: copyable));
                  ScaffoldMessenger.maybeOf(context)?.showSnackBar(
                    SnackBar(
                      content: Text("Copied: ${copyable.substring(0, copyable.length > 20 ? 20 : copyable.length)}..."),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                child: const Row(
                  children: [
                    Icon(Icons.copy, size: 13, color: Colors.cyanAccent),
                    SizedBox(width: 4),
                    Text(
                      "Copy",
                      style: TextStyle(color: Colors.cyanAccent, fontSize: 11),
                    ),
                  ],
                ),
              ),
          ],
        ),
        const SizedBox(height: 2),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.black45,
            borderRadius: BorderRadius.circular(6),
          ),
          child: SelectableText(
            value,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontFamily: 'monospace',
            ),
          ),
        ),
      ],
    );
  }
}
