import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/core/utils/storage_keys.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Notifier to manage and persist application ThemeMode (defaults to ThemeMode.dark)
class ThemeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    _loadThemeFromPrefs();
    return ThemeMode.dark;
  }

  Future<void> _loadThemeFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedTheme = prefs.getString(StorageKeys.themeMode);
      if (savedTheme == 'light') {
        state = ThemeMode.light;
      } else {
        state = ThemeMode.dark; // Default to dark theme
      }
    } catch (_) {
      state = ThemeMode.dark;
    }
  }

  Future<void> setTheme(ThemeMode mode) async {
    state = mode;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        StorageKeys.themeMode,
        mode == ThemeMode.light ? 'light' : 'dark',
      );
    } catch (_) {}
  }

  Future<void> toggleTheme() async {
    if (state == ThemeMode.light) {
      await setTheme(ThemeMode.dark);
    } else {
      await setTheme(ThemeMode.light);
    }
  }
}

/// Global Riverpod Provider for ThemeMode
final themeNotifierProvider =
    NotifierProvider<ThemeNotifier, ThemeMode>(ThemeNotifier.new);
