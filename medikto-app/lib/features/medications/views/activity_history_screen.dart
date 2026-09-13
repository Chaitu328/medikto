import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';
import 'package:medikto/features/medications/models/dose_history_model.dart';
import 'package:medikto/features/medications/models/today_scheduled_model.dart';
import 'package:medikto/features/medications/views/medication_verification_screen.dart';

class ActivityHistoryScreen extends ConsumerWidget {
  const ActivityHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = context.themeColors;
    const query = DoseHistoryQuery(timeframe: 'month');
    final historyAsync = ref.watch(doseHistoryProvider(query));

    return Scaffold(
      backgroundColor: theme.bg,
      appBar: AppBar(
        titleSpacing: 0,
        backgroundColor: theme.bg,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: Icon(Icons.arrow_back, color: theme.iconColor),
        ),
        title: Text(
          "Activity History",
          style: TextStyle(
            color: theme.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: false,
      ),
      body: historyAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),

        error: (error, stack) => Center(
          child: Text(
            error.toString(),
            style: TextStyle(color: theme.textSecondary),
          ),
        ),

        data: (response) {
          if (response.status != ResponseStatus.SUCCESS || response.data == null) {
            return Center(
              child: Text(
                "No Activity History Found",
                style: TextStyle(color: theme.textSecondary),
              ),
            );
          }

          final DoseHistoryResponse historyResponse = response.data is DoseHistoryResponse
              ? response.data as DoseHistoryResponse
              : DoseHistoryResponse(summary: DoseHistorySummary());

          final List<TodayScheduleModel> historyData = historyResponse.schedules;

          if (historyData.isEmpty) {
            return Center(
              child: Text(
                "No Activity History Found",
                style: TextStyle(color: theme.textSecondary),
              ),
            );
          }

          final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
          final yesterdayStr = DateFormat('yyyy-MM-dd').format(DateTime.now().subtract(const Duration(days: 1)));

          final Map<String, List<TodayScheduleModel>> grouped = {};
          for (final item in historyData) {
            final dStr = item.date ?? '';
            String groupKey;
            if (dStr == todayStr) {
              groupKey = "Today";
            } else if (dStr == yesterdayStr) {
              groupKey = "Yesterday";
            } else if (dStr.isNotEmpty) {
              try {
                final dt = DateTime.parse(dStr);
                groupKey = DateFormat("d MMMM yyyy").format(dt);
              } catch (_) {
                groupKey = dStr;
              }
            } else {
              groupKey = "Earlier";
            }
            grouped.putIfAbsent(groupKey, () => []).add(item);
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: RefreshIndicator(
                  color: theme.accentPrimary,
                  backgroundColor: theme.card,

                  onRefresh: () async {
                    ref.invalidate(doseHistoryProvider(query));
                    await ref.read(doseHistoryProvider(query).future);
                  },
                  child: ListView(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    physics: const BouncingScrollPhysics(),
                    children: [
                      ...grouped.entries.map((entry) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8.0),
                              child: Text(
                                entry.key,
                                style: TextStyle(
                                  color: theme.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            ...entry.value.map((item) {
                              final statusLower = (item.status ?? "").toLowerCase();
                              final bool isTaken = statusLower == "taken";
                              final bool isMissed = statusLower == "missed";
                              final Color statusColor = isTaken
                                  ? AppColors.takenGreen
                                  : (isMissed ? AppColors.missedRed : AppColors.pendingAmber);

                              return _buildActivityTile(
                                context,
                                ref,
                                item,
                                statusColor,
                              );
                            }),
                          ],
                        );
                      }),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildActivityTile(
    BuildContext context,
    WidgetRef ref,
    TodayScheduleModel item,
    Color statusColor,
  ) {
    final theme = context.themeColors;
    final name = item.name ?? "No Name";
    final desc = "${item.time ?? ""} • ${item.verified == true ? "Verified" : "Not Verified"}";
    final status = (item.status ?? "").toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.borderSubtle),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: statusColor.withOpacity(0.12),
            child: Icon(
              name == "Omega-3" ? Icons.link : Icons.history,
              color: statusColor,
              size: 20,
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    color: theme.textPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),

                Text(
                  desc,
                  style: TextStyle(color: theme.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),

          const SizedBox(width: 6),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: statusColor.withOpacity(0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(radius: 3, backgroundColor: statusColor),

                const SizedBox(width: 4),

                Text(
                  status,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}