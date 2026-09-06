import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/toast_utils.dart';
import 'package:medikto/features/medications/data/medication_provider.dart';
import 'package:medikto/features/medications/models/today_scheduled_model.dart';
import 'package:medikto/features/medications/views/medication_verification_screen.dart';

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
                      final rawItem = historyData[index];
                      final TodayScheduleModel item = rawItem is TodayScheduleModel
                          ? rawItem
                          : TodayScheduleModel.fromJson(rawItem);
                  
                      final bool isTaken =
                          (item.status ?? "").toLowerCase() == "taken";

                      final Color statusColor = isTaken
                          ? AppColors.takenGreen
                          : AppColors.missedRed;
                  
                      return _buildActivityTile(
                        context,
                        ref,
                        item,
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

  void _onEditMedication(
    BuildContext context,
    WidgetRef ref,
    TodayScheduleModel item,
  ) async {
    final med = item.medication;
    final medId = item.medicationId ?? med?.id;

    if (med != null) {
      final updated = await Navigator.push<bool>(
        context,
        MaterialPageRoute(
          builder: (context) => MedicationVerificationScreen(
            isEdit: true,
            medication: med,
            id: medId,
          ),
        ),
      );

      if (updated == true) {
        ref.invalidate(getMedicationsProvider);
        ref.invalidate(getTodayScheduleProvider);
      }
    } else {
      AppToasts.showError(context, "Parent medication information unavailable");
    }
  }

  void _onDeleteMedication(
    BuildContext context,
    WidgetRef ref,
    TodayScheduleModel item,
  ) async {
    final theme = context.themeColors;
    final medId = item.medicationId ?? item.medication?.id;

    if (medId == null || medId.isEmpty) {
      AppToasts.showError(context, "Parent medication ID unavailable");
      return;
    }

    final shouldDelete = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.delete_forever_outlined, color: AppColors.missedRed, size: 28),
            const SizedBox(width: 10),
            const Expanded(
              child: Text(
                "Delete Medication?",
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Text(
          "Are you sure you want to delete \"${item.name ?? 'this medication'}\"?\n\nPast medication history will be preserved, but future scheduled doses and reminders will be cancelled.",
          style: TextStyle(color: theme.textSecondary, fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              "Cancel",
              style: TextStyle(color: theme.accentPrimary, fontWeight: FontWeight.bold),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.missedRed,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Delete"),
          ),
        ],
      ),
    );

    if (shouldDelete == true) {
      try {
        final res = await ref.read(deleteMedicationProvider(medId).future);

        if (res.status == ResponseStatus.SUCCESS) {
          ref.invalidate(getMedicationsProvider);
          ref.invalidate(getTodayScheduleProvider);
          AppToasts.showSuccess(context, res.message.isNotEmpty ? res.message : "Medication deleted successfully");
        } else {
          AppToasts.showError(context, res.message);
        }
      } catch (e) {
        AppToasts.showError(context, "Failed to delete medication: $e");
      }
    }
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

          const SizedBox(width: 6),

          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () => _onEditMedication(context, ref, item),
                child: Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: Icon(
                    Icons.edit_outlined,
                    size: 18,
                    color: theme.textSecondary,
                  ),
                ),
              ),
              const SizedBox(width: 2),
              InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () => _onDeleteMedication(context, ref, item),
                child: Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: Icon(
                    Icons.delete_outline,
                    size: 18,
                    color: AppColors.missedRed,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}