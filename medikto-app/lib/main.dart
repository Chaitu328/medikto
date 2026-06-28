import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/splash_screen.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() {
  // Ensure system overlays are set before the app runs
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness:
          Brightness.light, // White icons for dark background
      systemNavigationBarColor: Color(0xFF121212), // Match your darkBg
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(ProviderScope(child: const MyApp()));
}



class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Shared dark color constant
    const Color darkBg = Color(0xFF121212);

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Medikto',
      navigatorKey: navigatorKey,

      // 🔥 DARK THEME CONFIGURATION
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark, // Prevents the white flash globally
        fontFamily: 'Poppins',
        scaffoldBackgroundColor: darkBg,
        canvasColor: darkBg, // Fixes white flash in bottom sheets & menus
        
        // Ensure TextTheme remains legible
        textTheme: const TextTheme(
          bodyLarge: TextStyle(
            fontWeight: FontWeight.w400,
            color: Colors.white,
          ),
          bodyMedium: TextStyle(
            fontWeight: FontWeight.w400,
            color: Colors.white70,
          ),
          titleLarge: TextStyle(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
          titleMedium: TextStyle(
            fontWeight: FontWeight.w500,
            color: Colors.white70,
          ),
        ),

        // Optional: Smooth out page transitions
        pageTransitionsTheme: PageTransitionsTheme(
          builders: {
            TargetPlatform.android: ZoomPageTransitionsBuilder(),
            TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          },
        ),
      ),

      home: SplashScreen(),
    );
  }
}
