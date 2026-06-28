import 'package:flutter/material.dart';
import 'package:medikto/features/medications/widgets/reports_action_sheet.dart';

class ReportCard extends StatelessWidget {
  const ReportCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 16, left: 10, right: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFCCCCCC).withOpacity(0.3),
            blurRadius: 6,
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            height: 80,
            width: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFECF4FF),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Image.asset(
              "assets/images/item2.png",
              color: const Color(0xFF213598),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  "Prescription",
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF263238),
                  ),
                ),
              ),
              InkWell(
                onTap: () => _showBottomSheet(context),
                child: Icon(Icons.more_horiz, size: 18),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showBottomSheet(BuildContext context) {
    showModalBottomSheet(
      backgroundColor: Colors.white,
      constraints: BoxConstraints(maxWidth: double.infinity),
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => ReportActionsSheet(
        actions: [
          {"icon": Icons.download, "title": "Download"},
          {"icon": Icons.link, "title": "Copy Link"},
          {"icon": Icons.share, "title": "Share"},
          {"icon": Icons.delete, "title": "Delete"},
        ],
      ),
    );
  }

}
