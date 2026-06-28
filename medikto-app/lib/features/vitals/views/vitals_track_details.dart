import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';

class VitalsTrackDetailsScreen extends StatefulWidget {
  const VitalsTrackDetailsScreen({super.key});

  @override
  State<VitalsTrackDetailsScreen> createState() =>
      _VitalsTrackDetailsScreenState();
}

class _VitalsTrackDetailsScreenState extends State<VitalsTrackDetailsScreen> {
  int _selectedTab = 0; // 0: Today, 1: Weekly, 2: Monthly

  // Dark Mode Palette
  static const Color darkBg = Color(0xFF121212);
  static const Color surfaceColor = Color(0xFF1E1E1E);
  static const Color accentCyan = Color(0xFF81DEEA);

  final List<Map<String, dynamic>> reportsList = const [
    {
      "title": "Total Reports",
      "image": "assets/images/profile.png",
      "count": 22,
    },
    {"title": "Reminders", "image": "assets/images/bell.png", "count": 4},
    {
      "title": "All Medications",
      "image": "assets/images/pills.png",
      "count": 23,
    },
    {
      "title": "All Lab Reports",
      "image": "assets/images/dna-tests.png",
      "count": 17,
    },
  ];

  final ScrollController _controller = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: CustomAppBar(
        showBackButton: true,
        title: "Vitals",
        backgroundColor: darkBg,
        titleStyle: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
      body: CustomScrollView(
        controller: _controller,
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(child: SizedBox(height: size.height * 0.016)),

          /// 🔹 Graph Card (Dark Mode)
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverToBoxAdapter(
              child: Stack(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: surfaceColor,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Body Temperature",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const Text(
                          "°F",
                          style: TextStyle(color: Colors.white54),
                        ),
                        const SizedBox(height: 25),
                        SizedBox(height: 200, child: _buildHeartRateChart()),
                      ],
                    ),
                  ),
                  
                  // 🔥 STAMP (Adjusted for Dark Mode visibility)
                  Positioned(
                    top: 15,
                    right: 15,
                    child: Opacity(
                      opacity: 0.7,
                      child: Transform.rotate(
                        angle: -0.15,
                        child: const MediktoDigitalStamp(),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(child: SizedBox(height: size.height * 0.025)),

          /// 🔹 Custom Tab Toggle (Today/Weekly/Monthly)
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverToBoxAdapter(
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(20),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    _buildTabItem("Today", 0),
                    _buildTabItem("Weekly", 1),
                    _buildTabItem("Monthly", 2),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(child: SizedBox(height: size.height * 0.02)),

          /// 🔹 Reports Title
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverToBoxAdapter(
              child: const Text(
                "Reports Data",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(child: SizedBox(height: size.height * 0.02)),
          /// 🔹 Reports Grid
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverGrid(
              delegate: SliverChildBuilderDelegate((context, index) {
                final item = reportsList[index];

                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: surfaceColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 32,
                        width: 32,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Image.asset(
                            item["image"],
                            height: 16,
                            width: 16,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            /// ✅ Responsive Report Title
                            Text(
                              item["title"],
                              // maxLines: 1,
                              overflow: TextOverflow.clip,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: Colors.white54,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Align(
                              alignment: Alignment.center,
                              child: Text(
                                item["count"].toString(),
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }, childCount: reportsList.length),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.8, // Responsive height based on width
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildTabItem(String title, int index) {
    bool isSelected = _selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = index),
        child: Padding(
          padding: const EdgeInsets.only(top: 6, bottom: 6, left: 6, right: 6),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            // margin: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: isSelected ? accentCyan : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.black : Colors.white60,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeartRateChart() {
    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (value) =>
              FlLine(color: Colors.white.withOpacity(0.05), strokeWidth: 1),
        ),
        titlesData: FlTitlesData(
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 20,
              reservedSize: 30,
              getTitlesWidget: (value, meta) => Text(
                value.toInt().toString(),
                style: const TextStyle(color: Colors.white38, fontSize: 10),
              ),
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: const [
              FlSpot(0, 45),
              FlSpot(2, 50),
              FlSpot(4, 42),
              FlSpot(6, 65),
              FlSpot(8, 70),
              FlSpot(10, 75),
            ],
            isCurved: true,
            color: accentCyan,
            barWidth: 4,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  accentCyan.withOpacity(0.2),
                  accentCyan.withOpacity(0.0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipColor: (touchedSpot) => surfaceColor,
            getTooltipItems: (spots) => spots
                .map(
                  (s) => LineTooltipItem(
                    '${s.y.toInt()}°F',
                    const TextStyle(
                      color: accentCyan,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )
                .toList(),
          ),
        ),
      ),
    );
  }
}

class MediktoDigitalStamp extends StatelessWidget {
  final DateTime? dateTime;
  const MediktoDigitalStamp({super.key, this.dateTime});

  @override
  Widget build(BuildContext context) {
    final now = dateTime ?? DateTime.now();
    return Container(
      width: 85,
      height: 85,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: const Color(0xFF81DEEA).withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          const _CircularBranding(text: "MEDIKTO • "),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "${now.hour % 12 == 0 ? 12 : now.hour % 12}:${now.minute.toString().padLeft(2, '0')} ${now.hour >= 12 ? 'PM' : 'AM'}",
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                "${now.day} ${_getMonth(now.month)} ${now.year}",
                style: const TextStyle(fontSize: 7, color: Colors.white38),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getMonth(int month) => [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][month - 1];
}

class _CircularBranding extends StatelessWidget {
  final String text;
  const _CircularBranding({required this.text});

  @override
  Widget build(BuildContext context) {
    String fullCircleText = text * 6;
    return LayoutBuilder(
      builder: (context, constraints) {
        final double radius = (constraints.maxWidth / 2) - 5;
        return Stack(
          children: List.generate(fullCircleText.length, (index) {
            double angle = (index * 2 * math.pi) / fullCircleText.length;
            return Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..translate(radius * math.cos(angle), radius * math.sin(angle))
                ..rotateZ(angle + (math.pi / 2)),
              child: Text(
                fullCircleText[index],
                style: const TextStyle(
                  fontSize: 6,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF81DEEA),
                  fontFamily: 'Courier',
                ),
              ),
            );
          }),
        );
      },
    );
  }
}
