import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/features/vitals/models/vital_chart_point.dart';

/// FlChart LineChart renderer supporting single & dual vital series with grid, axes, and medical tooltips.
class VitalChartView extends StatelessWidget {
  final ProcessedVitalChartData chartData;
  final double height;

  const VitalChartView({
    super.key,
    required this.chartData,
    this.height = 200,
  });

  @override
  Widget build(BuildContext context) {
    final theme = context.themeColors;
    final config = chartData.config;
    final points = chartData.points;

    if (points.isEmpty) {
      return const SizedBox.shrink();
    }

    final int pointCount = points.length;
    final double maxX = math.max((pointCount - 1).toDouble(), 1.0);

    // Calculate bottom label step to prevent label collision
    final int labelStep = pointCount > 7 ? (pointCount / 4).ceil() : 1;

    // Dual or Single line bar data setup
    final List<LineChartBarData> lineBarsData = [];

    // 1. Primary Series (e.g. Glucose, Heart Rate, Temperature, or BP Systolic)
    lineBarsData.add(
      LineChartBarData(
        spots: chartData.primarySpots,
        isCurved: pointCount > 1,
        curveSmoothness: 0.35,
        color: config.primaryColor,
        barWidth: 3.2,
        isStrokeCapRound: true,
        dotData: FlDotData(
          show: true,
          getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
            radius: pointCount > 15 ? 2.5 : 4.0,
            color: config.primaryColor,
            strokeWidth: 2,
            strokeColor: theme.card,
          ),
        ),
        belowBarData: BarAreaData(
          show: true,
          gradient: LinearGradient(
            colors: [
              config.primaryColor.withValues(alpha: 0.22),
              config.primaryColor.withValues(alpha: 0.0),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
      ),
    );

    // 2. Secondary Series (BP Diastolic)
    if (config.isMultiSeries && chartData.secondarySpots.isNotEmpty) {
      final secondaryColor = config.secondaryColor ?? const Color(0xFFBA68C8);

      lineBarsData.add(
        LineChartBarData(
          spots: chartData.secondarySpots,
          isCurved: pointCount > 1,
          curveSmoothness: 0.35,
          color: secondaryColor,
          barWidth: 3.0,
          isStrokeCapRound: true,
          dotData: FlDotData(
            show: true,
            getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
              radius: pointCount > 15 ? 2.5 : 4.0,
              color: secondaryColor,
              strokeWidth: 2,
              strokeColor: theme.card,
            ),
          ),
          belowBarData: BarAreaData(
            show: true,
            gradient: LinearGradient(
              colors: [
                secondaryColor.withValues(alpha: 0.15),
                secondaryColor.withValues(alpha: 0.0),
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),
      );
    }

    return SizedBox(
      height: height,
      child: LineChart(
        LineChartData(
          minX: 0,
          maxX: maxX,
          minY: chartData.minY,
          maxY: chartData.maxY,
          clipData: const FlClipData.none(),

          // 🔹 Grid Lines
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            drawHorizontalLine: true,
            horizontalInterval: chartData.yInterval,
            getDrawingHorizontalLine: (value) => FlLine(
              color: theme.chartGrid,
              strokeWidth: 1.0,
            ),
          ),

          // 🔹 Axis Titles
          titlesData: FlTitlesData(
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: chartData.yInterval,
                reservedSize: 38,
                getTitlesWidget: (value, meta) {
                  // Hide min and max labels if they overlap graph margins
                  if (value < chartData.minY || value > chartData.maxY) {
                    return const SizedBox.shrink();
                  }
                  String label;
                  if (config.decimalPrecision > 0) {
                    label = value.toStringAsFixed(config.decimalPrecision);
                  } else {
                    label = value.toInt().toString();
                  }
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: Text(
                      label,
                      textAlign: TextAlign.right,
                      style: TextStyle(
                        color: theme.textMuted,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  );
                },
              ),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 24,
                interval: 1,
                getTitlesWidget: (value, meta) {
                  final int index = value.toInt();
                  if (index < 0 || index >= points.length) {
                    return const SizedBox.shrink();
                  }

                  // Render selective labels based on step interval
                  final bool isFirst = index == 0;
                  final bool isLast = index == points.length - 1;
                  final bool isStep = index % labelStep == 0;

                  if (!isFirst && !isLast && !isStep) {
                    return const SizedBox.shrink();
                  }

                  final date = points[index].timestamp;
                  final label = VitalChartDataProcessor.formatXAxisLabel(
                    date,
                    chartData.period,
                  );

                  return Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      label,
                      style: TextStyle(
                        color: theme.textMuted,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          borderData: FlBorderData(show: false),
          lineBarsData: lineBarsData,

          // 🔹 Interactive Medical Tooltips
          lineTouchData: LineTouchData(
            enabled: true,
            handleBuiltInTouches: true,
            touchTooltipData: LineTouchTooltipData(
              getTooltipColor: (touchedSpot) => theme.surface,
              tooltipPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              tooltipBorder: BorderSide(
                color: theme.borderSubtle,
                width: 1.0,
              ),
              fitInsideHorizontally: true,
              fitInsideVertically: true,
              getTooltipItems: (List<LineBarSpot> touchedSpots) {
                if (touchedSpots.isEmpty) return [];

                final int spotIndex = touchedSpots.first.spotIndex;
                if (spotIndex < 0 || spotIndex >= points.length) {
                  return [];
                }

                final point = points[spotIndex];
                final dateStr = DateFormat("dd MMM yyyy, hh:mm a")
                    .format(point.timestamp.toLocal());

                if (config.isMultiSeries) {
                  return touchedSpots.map((spot) {
                    final bool isSystolic = spot.barIndex == 0;
                    final String seriesName = isSystolic ? "Systolic" : "Diastolic";
                    final Color color = isSystolic
                        ? config.primaryColor
                        : (config.secondaryColor ?? const Color(0xFFBA68C8));

                    if (isSystolic) {
                      return LineTooltipItem(
                        "$dateStr\n",
                        TextStyle(
                          color: theme.textSecondary,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                        children: [
                          TextSpan(
                            text: "$seriesName: ",
                            style: TextStyle(
                              color: color,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(
                            text: "${spot.y.toInt()} ${config.unit}",
                            style: TextStyle(
                              color: theme.textPrimary,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      );
                    } else {
                      return LineTooltipItem(
                        "$seriesName: ",
                        TextStyle(
                          color: color,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                        children: [
                          TextSpan(
                            text: "${spot.y.toInt()} ${config.unit}",
                            style: TextStyle(
                              color: theme.textPrimary,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      );
                    }
                  }).toList();
                }

                // Single series tooltip
                return [
                  LineTooltipItem(
                    "$dateStr\n",
                    TextStyle(
                      color: theme.textSecondary,
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                    children: [
                      TextSpan(
                        text: "${config.displayName}: ",
                        style: TextStyle(
                          color: config.primaryColor,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextSpan(
                        text: config.formatValue(point.primaryValue),
                        style: TextStyle(
                          color: theme.textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ];
              },
            ),
          ),
        ),
      ),
    );
  }
}
