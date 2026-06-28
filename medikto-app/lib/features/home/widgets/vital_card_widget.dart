import 'package:flutter/material.dart';

class VitalCard extends StatelessWidget {
  final String title;
  final String value;
  final String? unit;
  final String iconPath;

  final String? statusText; // e.g. Normal / High / Low
  final Color? statusColor;
  final bool showStatusContainer; // 👈 optional container

  const VitalCard({
    super.key,
    required this.title,
    required this.value,
    required this.iconPath,
    this.unit,
    this.statusText,
    this.statusColor,
    this.showStatusContainer = true, // default true
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 20, left: 20, right: 20),
      height: 86,
      width: 180,
      decoration: BoxDecoration(
        color: const Color(0xFFFFFFFF),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFCCCCCC).withAlpha(50),
            blurRadius: 2,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Image.asset(iconPath, height: 24, width: 24),
          SizedBox(width: MediaQuery.sizeOf(context).height * 0.01),

          // 🔹 Right Content
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF263238),
                ),
              ),

              Row(
                children: [
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF213598),
                    ),
                  ),
                  if (unit != null)
                    Text(
                      " $unit",
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFF263238),
                      ),
                    ),
                ],
              ),

              SizedBox(height: MediaQuery.sizeOf(context).height * 0.01),

              // 🔹 Status Row (Optional)
              if (statusText != null)
                Row(
                  children: [
                    const Text(
                      "Status",
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFF263238),
                      ),
                    ),
                    SizedBox(width: MediaQuery.sizeOf(context).height * 0.02),

                    // 🔥 Optional Container
                    showStatusContainer
                        ? Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: (statusColor ?? Colors.green).withOpacity(
                                0.1,
                              ),
                              border: Border.all(
                                color: statusColor ?? Colors.green,
                              ),
                              borderRadius: BorderRadius.circular(100),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.done,
                                  size: 10,
                                  color: statusColor ?? Colors.green,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  statusText!,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w400,
                                    color: Color(0xFF213598),
                                  ),
                                ),
                              ],
                            ),
                          )
                        : Text(
                            statusText!,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w400,
                              color: statusColor ?? Colors.green,
                            ),
                          ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}
