import 'package:flutter/material.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  // Theme Colors consistent with your dashboard
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  // Mock Data
  final List<Map<String, dynamic>> notifications = [
    {
      "title": "Medication Reminder",
      "body": "It's time to take your Metformin 500mg dose.",
      "time": "Just now",
      "type": "medicine",
      "isRead": false,
    },
    {
      "title": "Report Uploaded",
      "body": "Your Blood Panel results from Diagnostics Center are now available.",
      "time": "2 hours ago",
      "type": "report",
      "isRead": false,
    },
    {
      "title": "Abnormal Pulse Detected",
      "body": "Your heart rate was slightly higher than normal (98 Bpm).",
      "time": "5 hours ago",
      "type": "alert",
      "isRead": true,
    },
    {
      "title": "Subscription Active",
      "body": "Welcome to Medikto Premium! Enjoy your exclusive features.",
      "time": "Yesterday",
      "type": "system",
      "isRead": true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      appBar: _buildAppBar(),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          const SliverToBoxAdapter(child: SizedBox(height: 10)),
          
          /// 🔹 Header Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Recent Updates",
                    style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text("Mark all as read", style: TextStyle(color: accentCyan, fontSize: 12)),
                  )
                ],
              ),
            ),
          ),

          /// 🔹 Notification List (Optimized with SliverList)
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final item = notifications[index];
                  return _NotificationTile(item: item);
                },
                childCount: notifications.length,
              ),
            ),
          ),
          
          const SliverToBoxAdapter(child: SizedBox(height: 50)),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: darkBg,
      elevation: 0,
      leading: IconButton(
        onPressed: () => Navigator.pop(context),
        icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
      ),
      title: const Text(
        "Notifications",
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
      ),
      actions: [
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.settings_outlined, color: Colors.white70),
        ),
        const SizedBox(width: 10),
      ],
    );
  }
}

/// ✅ High Performance Notification Tile
class _NotificationTile extends StatelessWidget {
  final Map<String, dynamic> item;
  const _NotificationTile({required this.item});

  @override
  Widget build(BuildContext context) {
    bool isRead = item['isRead'];

    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isRead ? const Color(0xFF1E1E1E) : const Color(0xFF252A2C),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isRead ? Colors.transparent : const Color(0xFF81DEEA).withOpacity(0.2),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon Container
            Container(
              height: 45,
              width: 45,
              decoration: BoxDecoration(
                color: _getIconColor(item['type']).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(_getIcon(item['type']), color: _getIconColor(item['type']), size: 22),
            ),
            const SizedBox(width: 15),
            
            // Text Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item['title'],
                          style: TextStyle(
                            color: isRead ? Colors.white70 : Colors.white,
                            fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      Text(
                        item['time'],
                        style: const TextStyle(color: Colors.white38, fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item['body'],
                    style: const TextStyle(color: Colors.white54, fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),
            
            // Unread Indicator Dot
            if (!isRead)
              Container(
                margin: const EdgeInsets.only(left: 10, top: 5),
                height: 8,
                width: 8,
                decoration: const BoxDecoration(color: Color(0xFF81DEEA), shape: BoxShape.circle),
              ),
          ],
        ),
      ),
    );
  }

  IconData _getIcon(String type) {
    switch (type) {
      case 'medicine': return Icons.medication_rounded;
      case 'report': return Icons.assignment_turned_in_rounded;
      case 'alert': return Icons.warning_amber_rounded;
      default: return Icons.notifications_active_rounded;
    }
  }

  Color _getIconColor(String type) {
    switch (type) {
      case 'medicine': return const Color(0xFF81DEEA); // Cyan
      case 'report': return const Color(0xFF81C784);   // Green
      case 'alert': return const Color(0xFFE57373);    // Red
      default: return Colors.white70;
    }
  }
}