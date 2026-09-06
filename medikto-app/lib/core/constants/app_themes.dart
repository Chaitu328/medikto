import 'package:flutter/material.dart';

/// Client-approved brand and semantic colors (consistent across both Dark & Light themes).
class AppColors {
  // Brand Accents
  static const Color primaryAccent = Color(0xFF81DEEA); // Main Cyan (Dark Mode)
  static const Color cyanAccent = Color(0xFF81DEEA); // Brand Cyan alias
  static const Color cyan = Color(0xFF81DEEA); // Brand Cyan alias
  static const Color primaryAccentDark = Color(0xFF00ACC1); // Deeper Cyan
  static const Color secondaryAccent = Color(0xFF5CE5F9);
  static const Color navAccent = Color(0xFF76EAFD);
  
  // Royal Medical Blue for Light Theme
  static const Color royalBlue = Color(0xFF0052CC); // Rich Royal Blue (Light Mode Brand)
  static const Color royalBlueDark = Color(0xFF0040A8);
  static const Color iceBlue = Color(0xFFEBF3FB); // Soft Ice Blue Badge
  
  // Text Colors
  static const Color lightTextPrimary = Color(0xFF111827);
  static const Color darkTextPrimary = Colors.white;
  
  // Medical & Semantic Status Colors
  static const Color statusTaken = Color(0xFF10B981); // Emerald Green
  static const Color takenGreen = Color(0xFF10B981); // Alias
  static const Color statusNormal = Color(0xFF10B981);
  static const Color statusMissed = Color(0xFFEF3235); // Crimson Red
  static const Color missedRed = Color(0xFFEF3235); // Alias
  static const Color statusCritical = Color(0xFFEF3235);
  static const Color statusPending = Color(0xFFFF9800); // Amber Orange
  static const Color pendingAmber = Color(0xFFFF9800); // Alias
  static const Color statusModerate = Color(0xFFFFB74D);
  static const Color statusUpcoming = Color(0xFF29B6F6); // Sky Blue
  static const Color statusInfo = Color(0xFF2196F3);
  static const Color caretakerPurple = Color(0xFFBA68C8);
  
  // Vital Specific Accents
  static const Color bloodPressure = Color(0xFFFF5252);
  static const Color heartRate = Color(0xFFFF4081);
  static const Color bloodSugar = Color(0xFF42A5F5);
  static const Color temperature = Color(0xFFFFB74D);
}

/// Dynamic theme palette for surface, background, border, typography, and accent tokens.
class AppThemeColors extends ThemeExtension<AppThemeColors> {
  // Surfaces & Layout
  final Color bg;
  final Color surface;
  final Color card;
  final Color cardSecondary;
  final Color inputFill;
  final Color border;
  final Color borderSubtle;
  final Color shadowColor;
  final Color dialogBg;
  final Color navBackground;
  final Color chartGrid;

  // Typography & Standard Icons
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color iconColor;

  // Blue Accent Hierarchy (Theme-Aware)
  final Color accentPrimary;
  final Color onAccentPrimary;
  final Color accentMedium;
  final Color accentMetric;
  final Color accentSubtle;
  final Color accentBorder;

  // Component-Specific Semantic Tokens
  final Color nextDoseBoxBg;
  final Color nextDoseBoxIcon;
  final Color nextDoseTag;
  final Color scheduleActiveBg;
  final Color scheduleActiveText;
  final Color scheduleInactiveText;
  final Color navActive;
  final Color navInactive;
  final Color ringTrack;
  final Color ringProgress;
  final Color ringBackground;

  // Status Pairs (Foreground & Background)
  final Color statusSuccessFg;
  final Color statusSuccessBg;
  final Color statusWarningFg;
  final Color statusWarningBg;
  final Color statusErrorFg;
  final Color statusErrorBg;
  final Color statusPoorFg;
  final Color statusPoorBg;

  // Backwards-Compatible Convenience Getters
  Color get accent => accentPrimary;
  Color get onAccent => onAccentPrimary;
  Color get nextDoseBg => nextDoseBoxBg;
  Color get nextDoseIcon => nextDoseBoxIcon;

  const AppThemeColors({
    required this.bg,
    required this.surface,
    required this.card,
    required this.cardSecondary,
    required this.inputFill,
    required this.border,
    required this.borderSubtle,
    required this.shadowColor,
    required this.dialogBg,
    required this.navBackground,
    required this.chartGrid,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.iconColor,
    required this.accentPrimary,
    required this.onAccentPrimary,
    required this.accentMedium,
    required this.accentMetric,
    required this.accentSubtle,
    required this.accentBorder,
    required this.nextDoseBoxBg,
    required this.nextDoseBoxIcon,
    required this.nextDoseTag,
    required this.scheduleActiveBg,
    required this.scheduleActiveText,
    required this.scheduleInactiveText,
    required this.navActive,
    required this.navInactive,
    required this.ringTrack,
    required this.ringProgress,
    required this.ringBackground,
    required this.statusSuccessFg,
    required this.statusSuccessBg,
    required this.statusWarningFg,
    required this.statusWarningBg,
    required this.statusErrorFg,
    required this.statusErrorBg,
    required this.statusPoorFg,
    required this.statusPoorBg,
  });

  @override
  AppThemeColors copyWith({
    Color? bg,
    Color? surface,
    Color? card,
    Color? cardSecondary,
    Color? inputFill,
    Color? border,
    Color? borderSubtle,
    Color? shadowColor,
    Color? dialogBg,
    Color? navBackground,
    Color? chartGrid,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? iconColor,
    Color? accentPrimary,
    Color? onAccentPrimary,
    Color? accentMedium,
    Color? accentMetric,
    Color? accentSubtle,
    Color? accentBorder,
    Color? nextDoseBoxBg,
    Color? nextDoseBoxIcon,
    Color? nextDoseTag,
    Color? scheduleActiveBg,
    Color? scheduleActiveText,
    Color? scheduleInactiveText,
    Color? navActive,
    Color? navInactive,
    Color? ringTrack,
    Color? ringProgress,
    Color? ringBackground,
    Color? statusSuccessFg,
    Color? statusSuccessBg,
    Color? statusWarningFg,
    Color? statusWarningBg,
    Color? statusErrorFg,
    Color? statusErrorBg,
    Color? statusPoorFg,
    Color? statusPoorBg,
  }) {
    return AppThemeColors(
      bg: bg ?? this.bg,
      surface: surface ?? this.surface,
      card: card ?? this.card,
      cardSecondary: cardSecondary ?? this.cardSecondary,
      inputFill: inputFill ?? this.inputFill,
      border: border ?? this.border,
      borderSubtle: borderSubtle ?? this.borderSubtle,
      shadowColor: shadowColor ?? this.shadowColor,
      dialogBg: dialogBg ?? this.dialogBg,
      navBackground: navBackground ?? this.navBackground,
      chartGrid: chartGrid ?? this.chartGrid,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      iconColor: iconColor ?? this.iconColor,
      accentPrimary: accentPrimary ?? this.accentPrimary,
      onAccentPrimary: onAccentPrimary ?? this.onAccentPrimary,
      accentMedium: accentMedium ?? this.accentMedium,
      accentMetric: accentMetric ?? this.accentMetric,
      accentSubtle: accentSubtle ?? this.accentSubtle,
      accentBorder: accentBorder ?? this.accentBorder,
      nextDoseBoxBg: nextDoseBoxBg ?? this.nextDoseBoxBg,
      nextDoseBoxIcon: nextDoseBoxIcon ?? this.nextDoseBoxIcon,
      nextDoseTag: nextDoseTag ?? this.nextDoseTag,
      scheduleActiveBg: scheduleActiveBg ?? this.scheduleActiveBg,
      scheduleActiveText: scheduleActiveText ?? this.scheduleActiveText,
      scheduleInactiveText: scheduleInactiveText ?? this.scheduleInactiveText,
      navActive: navActive ?? this.navActive,
      navInactive: navInactive ?? this.navInactive,
      ringTrack: ringTrack ?? this.ringTrack,
      ringProgress: ringProgress ?? this.ringProgress,
      ringBackground: ringBackground ?? this.ringBackground,
      statusSuccessFg: statusSuccessFg ?? this.statusSuccessFg,
      statusSuccessBg: statusSuccessBg ?? this.statusSuccessBg,
      statusWarningFg: statusWarningFg ?? this.statusWarningFg,
      statusWarningBg: statusWarningBg ?? this.statusWarningBg,
      statusErrorFg: statusErrorFg ?? this.statusErrorFg,
      statusErrorBg: statusErrorBg ?? this.statusErrorBg,
      statusPoorFg: statusPoorFg ?? this.statusPoorFg,
      statusPoorBg: statusPoorBg ?? this.statusPoorBg,
    );
  }

  @override
  AppThemeColors lerp(ThemeExtension<AppThemeColors>? other, double t) {
    if (other is! AppThemeColors) return this;
    return AppThemeColors(
      bg: Color.lerp(bg, other.bg, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      card: Color.lerp(card, other.card, t)!,
      cardSecondary: Color.lerp(cardSecondary, other.cardSecondary, t)!,
      inputFill: Color.lerp(inputFill, other.inputFill, t)!,
      border: Color.lerp(border, other.border, t)!,
      borderSubtle: Color.lerp(borderSubtle, other.borderSubtle, t)!,
      shadowColor: Color.lerp(shadowColor, other.shadowColor, t)!,
      dialogBg: Color.lerp(dialogBg, other.dialogBg, t)!,
      navBackground: Color.lerp(navBackground, other.navBackground, t)!,
      chartGrid: Color.lerp(chartGrid, other.chartGrid, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      iconColor: Color.lerp(iconColor, other.iconColor, t)!,
      accentPrimary: Color.lerp(accentPrimary, other.accentPrimary, t)!,
      onAccentPrimary: Color.lerp(onAccentPrimary, other.onAccentPrimary, t)!,
      accentMedium: Color.lerp(accentMedium, other.accentMedium, t)!,
      accentMetric: Color.lerp(accentMetric, other.accentMetric, t)!,
      accentSubtle: Color.lerp(accentSubtle, other.accentSubtle, t)!,
      accentBorder: Color.lerp(accentBorder, other.accentBorder, t)!,
      nextDoseBoxBg: Color.lerp(nextDoseBoxBg, other.nextDoseBoxBg, t)!,
      nextDoseBoxIcon: Color.lerp(nextDoseBoxIcon, other.nextDoseBoxIcon, t)!,
      nextDoseTag: Color.lerp(nextDoseTag, other.nextDoseTag, t)!,
      scheduleActiveBg: Color.lerp(scheduleActiveBg, other.scheduleActiveBg, t)!,
      scheduleActiveText: Color.lerp(scheduleActiveText, other.scheduleActiveText, t)!,
      scheduleInactiveText: Color.lerp(scheduleInactiveText, other.scheduleInactiveText, t)!,
      navActive: Color.lerp(navActive, other.navActive, t)!,
      navInactive: Color.lerp(navInactive, other.navInactive, t)!,
      ringTrack: Color.lerp(ringTrack, other.ringTrack, t)!,
      ringProgress: Color.lerp(ringProgress, other.ringProgress, t)!,
      ringBackground: Color.lerp(ringBackground, other.ringBackground, t)!,
      statusSuccessFg: Color.lerp(statusSuccessFg, other.statusSuccessFg, t)!,
      statusSuccessBg: Color.lerp(statusSuccessBg, other.statusSuccessBg, t)!,
      statusWarningFg: Color.lerp(statusWarningFg, other.statusWarningFg, t)!,
      statusWarningBg: Color.lerp(statusWarningBg, other.statusWarningBg, t)!,
      statusErrorFg: Color.lerp(statusErrorFg, other.statusErrorFg, t)!,
      statusErrorBg: Color.lerp(statusErrorBg, other.statusErrorBg, t)!,
      statusPoorFg: Color.lerp(statusPoorFg, other.statusPoorFg, t)!,
      statusPoorBg: Color.lerp(statusPoorBg, other.statusPoorBg, t)!,
    );
  }
}

/// Centralized ThemeData definitions and helpers.
class AppThemes {
  // Dark Theme Palette Constants (Approved OLED Cyan)
  static const AppThemeColors darkColors = AppThemeColors(
    bg: Color(0xFF121212),
    surface: Color(0xFF1E1E1E),
    card: Color(0xFF181818),
    cardSecondary: Color(0xFF252525),
    inputFill: Color(0xFF1E1E1E),
    border: Colors.white10,
    borderSubtle: Colors.white12,
    shadowColor: Colors.black54,
    dialogBg: Color(0xFF1E1E1E),
    navBackground: Color(0xFF121212),
    chartGrid: Colors.white10,
    textPrimary: Colors.white,
    textSecondary: Color(0xFFB0B0B0),
    textMuted: Color(0xFF757575),
    iconColor: Colors.white,
    accentPrimary: Color(0xFF81DEEA), // Cyan
    onAccentPrimary: Colors.black,
    accentMedium: Color(0xFF81DEEA),
    accentMetric: Color(0xFF81DEEA),
    accentSubtle: Color(0x2681DEEA),
    accentBorder: Color(0x4081DEEA),
    nextDoseBoxBg: Color(0x2681DEEA),
    nextDoseBoxIcon: Color(0xFF81DEEA),
    nextDoseTag: Color(0xFF81DEEA),
    scheduleActiveBg: Color(0xFF81DEEA),
    scheduleActiveText: Colors.black,
    scheduleInactiveText: Color(0xFFB0B0B0),
    navActive: Color(0xFF5CE5F9),
    navInactive: Color(0xFF757575),
    ringTrack: Colors.white10,
    ringProgress: Color(0xFF81DEEA),
    ringBackground: Colors.white10,
    statusSuccessFg: Color(0xFF10B981),
    statusSuccessBg: Color(0x2610B981),
    statusWarningFg: Color(0xFFFF9800),
    statusWarningBg: Color(0x26FF9800),
    statusErrorFg: Color(0xFFEF3235),
    statusErrorBg: Color(0x26EF3235),
    statusPoorFg: Color(0xFFEF3235),
    statusPoorBg: Color(0x26EF3235),
  );

  // Light Theme Palette Constants (Reference Design Blue Hierarchy)
  static const AppThemeColors lightColors = AppThemeColors(
    bg: Color(0xFFF8F9FA),
    surface: Color(0xFFFFFFFF),
    card: Color(0xFFFFFFFF),
    cardSecondary: Color(0xFFF1F5F9),
    inputFill: Color(0xFFF8FAFC),
    border: Color(0xFFE2E8F0),
    borderSubtle: Color(0xFFEDF2F7),
    shadowColor: Color(0x0A000000),
    dialogBg: Color(0xFFFFFFFF),
    navBackground: Color(0xFFFFFFFF),
    chartGrid: Color(0xFFE2E8F0),
    textPrimary: Color(0xFF0F172A), // Deep Slate Navy for Main Headings
    textSecondary: Color(0xFF64748B), // Slate Grey for Descriptions
    textMuted: Color(0xFF94A3B8), // Timestamps & Secondary Metadata
    iconColor: Color(0xFF334155),
    accentPrimary: Color(0xFF0057B8), // Medium-Rich Royal Blue for Active Controls / CTAs
    onAccentPrimary: Colors.white,
    accentMedium: Color(0xFF0066CC), // Medium Blue for Tags & Action Links
    accentMetric: Color(0xFF0A2540), // Deep Sapphire Navy for Large Key Metrics
    accentSubtle: Color(0xFFEFF6FF), // Soft Tinted Container / Inner Badge
    accentBorder: Color(0xFFDBEAFE),
    nextDoseBoxBg: Color(0xFF0057B8), // Solid Blue Box
    nextDoseBoxIcon: Colors.white, // White Pill/Icon
    nextDoseTag: Color(0xFF0066CC),
    scheduleActiveBg: Color(0xFF0057B8), // Solid Active Period Tab
    scheduleActiveText: Colors.white,
    scheduleInactiveText: Color(0xFF64748B),
    navActive: Color(0xFF0057B8),
    navInactive: Color(0xFF64748B),
    ringTrack: Color(0xFFEAECF0), // Subtle Background Ring
    ringProgress: Color(0xFF0057B8), // Deep Blue Active Arc
    ringBackground: Color(0xFFEAECF0),
    statusSuccessFg: Color(0xFF10B981),
    statusSuccessBg: Color(0xFFDEF7EC),
    statusWarningFg: Color(0xFFF59E0B),
    statusWarningBg: Color(0xFFFEF3C7),
    statusErrorFg: Color(0xFFEF4444),
    statusErrorBg: Color(0xFFFEE2E2),
    statusPoorFg: Color(0xFFD92D20), // Reference "Poor" Adherence Text
    statusPoorBg: Color(0xFFFEE4E2), // Reference "Poor" Adherence Background
  );

  /// Dark ThemeData
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: 'Poppins',
      scaffoldBackgroundColor: darkColors.bg,
      canvasColor: darkColors.bg,
      dialogBackgroundColor: darkColors.dialogBg,
      cardColor: darkColors.card,
      dividerColor: darkColors.border,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryAccent,
        secondary: AppColors.secondaryAccent,
        surface: Color(0xFF1E1E1E),
        error: Color(0xFFEF3235),
        onPrimary: Colors.black,
        onSecondary: Colors.black,
        onSurface: Colors.white,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF121212),
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
        titleTextStyle: TextStyle(
          fontFamily: 'Poppins',
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      cardTheme: CardThemeData(
        color: darkColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Colors.white10),
        ),
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(fontWeight: FontWeight.w400, color: Colors.white),
        bodyMedium: TextStyle(fontWeight: FontWeight.w400, color: Color(0xFFB0B0B0)),
        titleLarge: TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
        titleMedium: TextStyle(fontWeight: FontWeight.w500, color: Color(0xFFB0B0B0)),
      ),
      extensions: const [darkColors],
    );
  }

  /// Light ThemeData
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      fontFamily: 'Poppins',
      scaffoldBackgroundColor: lightColors.bg,
      canvasColor: lightColors.bg,
      dialogBackgroundColor: lightColors.dialogBg,
      cardColor: lightColors.card,
      dividerColor: lightColors.border,
      colorScheme: const ColorScheme.light(
        primary: AppColors.royalBlue,
        secondary: AppColors.royalBlue,
        surface: Color(0xFFFFFFFF),
        error: Color(0xFFEF3235),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Color(0xFF0F172A),
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFFFFFFFF),
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: Color(0xFF0F172A)),
        titleTextStyle: TextStyle(
          fontFamily: 'Poppins',
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Color(0xFF0F172A),
        ),
      ),
      cardTheme: CardThemeData(
        color: lightColors.card,
        elevation: 1,
        shadowColor: lightColors.shadowColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(fontWeight: FontWeight.w400, color: Color(0xFF0F172A)),
        bodyMedium: TextStyle(fontWeight: FontWeight.w400, color: Color(0xFF64748B)),
        titleLarge: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
        titleMedium: TextStyle(fontWeight: FontWeight.w500, color: Color(0xFF64748B)),
      ),
      extensions: const [lightColors],
    );
  }
}

/// Extension on BuildContext for quick, ergonomic access to theme-aware colors.
extension AppThemeContextExtension on BuildContext {
  AppThemeColors get themeColors =>
      Theme.of(this).extension<AppThemeColors>() ??
      (isDarkMode ? AppThemes.darkColors : AppThemes.lightColors);

  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
}
