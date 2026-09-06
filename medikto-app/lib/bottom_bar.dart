import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/network/notification_manager.dart';
import 'package:medikto/features/home/home_view/home_screen.dart';
import 'package:medikto/features/profile/views/profile_screen.dart';
import 'package:medikto/features/medications/views/medications_screen.dart';
import 'package:medikto/features/vitals/views/vitals_screen.dart';

class BaseBottomNavigationPage extends StatefulWidget {
  final int? index;
  const BaseBottomNavigationPage({super.key, this.index});

  @override
  State<BaseBottomNavigationPage> createState() =>
      _BaseBottomNavigationPageState();
}

class _BaseBottomNavigationPageState extends State<BaseBottomNavigationPage> {
  int _currentIndex = 0;

  final List<Widget> _tabs = const [
    HomeScreen(),
    MedicationsScreen(),
    AddReportsScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.index ?? 0;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NotificationManager().registerFCMToken();
    });
  }

  void _onItemTapped(int index) {
    if (_currentIndex == index) return;
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final selectedColor = colors.navActive;
    final unselectedColor = colors.navInactive;

    Widget buildNavItem(int index, String activeAsset, String inactiveAsset, String label) {
      final isSelected = _currentIndex == index;
      return Padding(
        padding: const EdgeInsets.only(bottom: 2),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              isSelected ? activeAsset : inactiveAsset,
              width: 22,
              height: 22,
              color: isSelected ? selectedColor : unselectedColor,
            ),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: colors.bg,
      body: IndexedStack(index: _currentIndex, children: _tabs),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.only(top: 6, bottom: 6),
        decoration: BoxDecoration(
          color: colors.navBackground,
          border: Border(top: BorderSide(color: colors.border, width: 0.5)),
        ),
        child: Theme(
          data: Theme.of(context).copyWith(splashFactory: NoSplash.splashFactory),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: _onItemTapped,
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            backgroundColor: colors.navBackground,
            selectedItemColor: selectedColor,
            unselectedItemColor: unselectedColor,
            showSelectedLabels: true,
            showUnselectedLabels: true,
            selectedFontSize: 11,
            unselectedFontSize: 11,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
            landscapeLayout: BottomNavigationBarLandscapeLayout.linear,
            items: [
              BottomNavigationBarItem(
                icon: buildNavItem(0, "assets/images/item1_selected.png", "assets/images/item1.png", "Home"),
                label: "Home",
              ),
              BottomNavigationBarItem(
                icon: buildNavItem(1, "assets/images/item2-bg.png", "assets/images/item2-bg.png", "Medications"),
                label: "Medications",
              ),
              BottomNavigationBarItem(
                icon: buildNavItem(2, "assets/images/item3_selected.png", "assets/images/item3.png", "Add Reports"),
                label: "Add Reports",
              ),
              BottomNavigationBarItem(
                icon: buildNavItem(3, "assets/images/item4.png", "assets/images/item4.png", "Profile"),
                label: "Profile",
              ),
            ],
          ),
        ),
      ),
    );
  }
}
