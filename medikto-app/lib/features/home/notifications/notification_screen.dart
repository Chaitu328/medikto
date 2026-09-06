import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/app_themes.dart';
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
    final colors = context.themeColors;
    final notificationsAsync = ref.watch(getNotificationsProvider);

    return Scaffold(
      backgroundColor: colors.bg,
      appBar: _buildAppBar(colors),
      body: RefreshIndicator(
        color: AppColors.cyan,
        backgroundColor: colors.surface,
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
                        children: [
                          Icon(Icons.notifications_off_outlined, size: 56, color: colors.textMuted),
                          const SizedBox(height: 16),
                          Text(
                            "No Notifications Yet",
                            style: TextStyle(color: colors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            "You will see your medication alerts and report updates here.",
                            style: TextStyle(color: colors.textSecondary, fontSize: 12),
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
                        Text(
                          "Recent Updates",
                          style: TextStyle(color: colors.textSecondary, fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                        TextButton(
                          onPressed: _markAllAsRead,
                          child: Text("Mark all as read", style: TextStyle(color: colors.accent, fontSize: 12, fontWeight: FontWeight.bold)),
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
          loading: () => Center(child: CircularProgressIndicator(color: colors.accent)),
          error: (err, st) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
                const SizedBox(height: 16),
                Text(
                  "Unable to load notifications",
                  style: TextStyle(color: colors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(err.toString(), style: TextStyle(color: colors.textMuted, fontSize: 12)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(AppThemeColors colors) {
    return AppBar(
      backgroundColor: colors.bg,
      elevation: 0,
      leading: IconButton(
        onPressed: () => Navigator.pop(context),
        icon: Icon(Icons.arrow_back_ios_new, color: colors.textPrimary, size: 20),
      ),
      title: Text(
        "Notifications",
        style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 20),
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
    final colors = context.themeColors;
    bool isRead = item.isRead;

    return InkWell(
      onTap: isRead ? null : onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isRead ? colors.card : colors.cardSecondary,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isRead ? colors.borderSubtle : colors.accent.withOpacity(0.3),
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
                color: _getIconColor(item.type, colors).withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(_getIcon(item.type), color: _getIconColor(item.type, colors), size: 22),
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
                            color: isRead ? colors.textSecondary : colors.textPrimary,
                            fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      Text(
                        timeAgo,
                        style: TextStyle(color: colors.textMuted, fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.body,
                    style: TextStyle(color: colors.textSecondary, fontSize: 13, height: 1.4),
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
                decoration: BoxDecoration(color: colors.accent, shape: BoxShape.circle),
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

  Color _getIconColor(String type, AppThemeColors colors) {
    switch (type) {
      case 'medicine': return colors.accent;
      case 'report': return const Color(0xFF10B981);   // Green
      case 'alert': return const Color(0xFFEF3235);    // Red
      default: return Colors.blueGrey;
    }
  }
}