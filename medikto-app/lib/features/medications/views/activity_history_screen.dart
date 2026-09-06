import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';

class ActivityHistoryScreen extends ConsumerWidget {
  const ActivityHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = context.themeColors;
    final historyAsync = ref.watch(getTodayScheduleProvider);

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
          final List<dynamic> historyData = response.data ?? [];

          if (historyData.isEmpty) {
            return Center(
              child: Text(
                "No History Found",
                style: TextStyle(color: theme.textSecondary),
              ),
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: RefreshIndicator(
                  color: theme.accentPrimary,
                  backgroundColor: theme.card,

                  onRefresh: () async {
                    ref.invalidate(getTodayScheduleProvider);

                    await ref.read(getTodayScheduleProvider.future);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    physics: const BouncingScrollPhysics(),
                    itemCount: historyData.length,
                    itemBuilder: (context, index) {
                      final item = historyData[index];
                  
                      final bool isTaken =
                          (item.status ?? "").toLowerCase() == "taken";

                      final Color statusColor = isTaken
                          ? AppColors.takenGreen
                          : AppColors.missedRed;
                  
                      return _buildActivityTile(
                        context,
                        item.name ?? "No Name",
                        "${item.time ?? ""} • ${item.verified == true ? "Verified" : "Not Verified"}",
                        (item.status ?? "").toUpperCase(),
                        statusColor,
                      );
                    },
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
    String name,
    String desc,
    String status,
    Color statusColor,
  ) {
    final theme = context.themeColors;
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

          const SizedBox(width: 15),

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

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: statusColor.withOpacity(0.4)),
            ),
            child: Row(
              children: [
                CircleAvatar(radius: 3, backgroundColor: statusColor),

                const SizedBox(width: 5),

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