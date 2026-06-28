import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';

// import your provider file
// import 'package:your_project/providers/medication_provider.dart';

class ActivityHistoryScreen extends ConsumerWidget {
  const ActivityHistoryScreen({super.key});

  // Colors consistent with your App Theme
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF00E5FF);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(getTodayScheduleProvider);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: AppBar(
        titleSpacing: 0,
        backgroundColor: darkBg,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        title: const Text(
          "Activity History",
          style: TextStyle(
            color: Colors.white,
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
            style: const TextStyle(color: Colors.white),
          ),
        ),

        data: (response) {
          final List<dynamic> historyData = response.data ?? [];

          if (historyData.isEmpty) {
            return const Center(
              child: Text(
                "No History Found",
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              

              Expanded(
                child: RefreshIndicator(
                  color: accentCyan,
                  backgroundColor: surfaceColor,

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
                          ? Colors.teal
                          : Colors.redAccent;
                  
                      return _buildActivityTile(
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

  // Same UI unchanged
  Widget _buildActivityTile(
    String name,
    String desc,
    String status,
    Color statusColor,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: statusColor.withOpacity(0.1),
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
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),

                Text(
                  desc,
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
          ),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: statusColor.withOpacity(0.5)),
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