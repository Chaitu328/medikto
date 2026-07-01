import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/features/home/notifications/notification_model.dart';
import 'package:medikto/features/home/notifications/notification_provider.dart';

class NotificationScreen extends ConsumerStatefulWidget {
  const NotificationScreen({super.key});

  @override
  ConsumerState<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends ConsumerState<NotificationScreen> {
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  String _getTimeAgo(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime.toLocal());
    if (diff.inDays > 7) {
      return DateFormat("dd MMM").format(dateTime.toLocal());
    } else if (diff.inDays >= 1) {
      return "${diff.inDays} day${diff.inDays > 1 ? 's' : ''} ago";
    } else if (diff.inHours >= 1) {
      return "${diff.inHours} hour${diff.inHours > 1 ? 's' : ''} ago";
    } else if (diff.inMinutes >= 1) {
      return "${diff.inMinutes} minute${diff.inMinutes > 1 ? 's' : ''} ago";
    } else {
      return "Just now";
    }
  }

  Future<void> _markAllAsRead() async {
    final response = await ref.read(notificationManagerProvider).markAllNotificationsAsRead();
    if (response.status == ResponseStatus.SUCCESS) {
      ref.invalidate(getNotificationsProvider);
      if (mounted) {
        AppToasts.showSuccess(context, "All notifications marked as read");
      }
    } else {
      if (mounted) {
        AppToasts.showError(context, response.message);
      }
    }
  }

  Future<void> _markAsRead(String id) async {
    final response = await ref.read(notificationManagerProvider).markNotificationAsRead(id);
    if (response.status == ResponseStatus.SUCCESS) {
      ref.invalidate(getNotificationsProvider);
    }
  }

  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(getNotificationsProvider);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: _buildAppBar(),
      body: RefreshIndicator(
        color: accentCyan,
        backgroundColor: surfaceColor,
        onRefresh: () async {
          ref.invalidate(getNotificationsProvider);
        },
        child: notificationsAsync.when(
          data: (responseData) {
            final List<AppNotificationModel> list =
                (responseData.data as List?)?.cast<AppNotificationModel>() ?? [];

            if (list.isEmpty) {
              return CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.notifications_off_outlined, size: 56, color: Colors.white24),
                          SizedBox(height: 16),
                          Text(
                            "No Notifications Yet",
                            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 6),
                          Text(
                            "You will see your medication alerts and report updates here.",
                            style: TextStyle(color: Colors.white30, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            }

            return CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
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
                          onPressed: _markAllAsRead,
                          child: const Text("Mark all as read", style: TextStyle(color: accentCyan, fontSize: 12)),
                        )
                      ],
                    ),
                  ),
                ),

                /// 🔹 Notification List
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final item = list[index];
                        return _NotificationTile(
                          item: item,
                          timeAgo: _getTimeAgo(item.createdAt),
                          onTap: () => _markAsRead(item.id),
                        );
                      },
                      childCount: list.length,
                    ),
                  ),
                ),
                
                const SliverToBoxAdapter(child: SizedBox(height: 50)),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator(color: accentCyan)),
          error: (err, st) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
                const SizedBox(height: 16),
                const Text(
                  "Unable to load notifications",
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(err.toString(), style: const TextStyle(color: Colors.white38, fontSize: 12)),
              ],
            ),
          ),
        ),
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
      actions: const [
        SizedBox(width: 10),
      ],
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final AppNotificationModel item;
  final String timeAgo;
  final VoidCallback onTap;

  const _NotificationTile({
    required this.item,
    required this.timeAgo,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    bool isRead = item.isRead;

    return InkWell(
      onTap: isRead ? null : onTap,
      borderRadius: BorderRadius.circular(16),
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
                color: _getIconColor(item.type).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(_getIcon(item.type), color: _getIconColor(item.type), size: 22),
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
                          item.title,
                          style: TextStyle(
                            color: isRead ? Colors.white70 : Colors.white,
                            fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      Text(
                        timeAgo,
                        style: const TextStyle(color: Colors.white38, fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.body,
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