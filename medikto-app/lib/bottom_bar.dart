import 'package:flutter/material.dart';
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
    AddReportsScreen(), // Renamed from Vitals
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.index ?? 0;
  }

  void _onItemTapped(int index) {
    if (_currentIndex == index) return;
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: IndexedStack(index: _currentIndex, children: _tabs),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.only(top: 5), // Space below the bar
        decoration: const BoxDecoration(
          color: Color(0xFF121212),
          // Adding a very slight top border or shadow can help define the bar if needed
          border: Border(top: BorderSide(color: Colors.white10, width: 0.5)),
        ),
        child: Theme(
        
          data: Theme.of(
            context,
          ).copyWith(splashFactory: NoSplash.splashFactory),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: _onItemTapped,
            type: BottomNavigationBarType.fixed,

            elevation: 0,
            backgroundColor: const Color(0xFF121212),
            selectedItemColor: const Color(0xFF76eafd),
            unselectedItemColor: const Color(0xFF445767),
            showSelectedLabels: true,
            showUnselectedLabels: true,
            // 🔹 1. Reduce font size to give labels more room
            selectedFontSize: 10,
            unselectedFontSize: 10,
            // 🔹 2. Ensure items are spread across the full width
            landscapeLayout: BottomNavigationBarLandscapeLayout.linear,
            items: [
              BottomNavigationBarItem(
                icon: Padding(
                  padding: const EdgeInsets.only(
                    bottom: 5,
                  ), // Space between icon and text
                  child: Image.asset(
                    _currentIndex == 0
                        ? "assets/images/item1_selected.png"
                        : "assets/images/item1.png",
                    width:
                        22, // Slightly larger icons often look better with smaller text
                    color: _currentIndex == 0 ? const Color(0xFF5ce5f9) : null,
                  ),
                ),
                label: "Home",
              ),
              BottomNavigationBarItem(
                icon: Padding(
                  padding: const EdgeInsets.only(bottom: 5),
                  child: Image.asset(
                    "assets/images/item2-bg.png",
                    width: 22,
                    color: _currentIndex == 1
                        ? const Color(0xFF5ce5f9)
                        : const Color(0xFF445767),
                  ),
                ),
                label: "Medications",
              ),
              BottomNavigationBarItem(
                icon: Padding(
                  padding: const EdgeInsets.only(bottom: 5),
                  child: Image.asset(
                    _currentIndex == 2
                        ? "assets/images/item3_selected.png"
                        : "assets/images/item3.png",
                    width: 22,
                    color: _currentIndex == 2
                        ? const Color(0xFF5ce5f9)
                        : const Color(0xFF445767),
                  ),
                ),
                label: "Add Reports",
              ),
              BottomNavigationBarItem(
                icon: Padding(
                  padding: const EdgeInsets.only(bottom: 5),
                  child: Image.asset(
                    "assets/images/item4.png",
                    width: 22,
                    color: _currentIndex == 3
                        ? const Color(0xFF5ce5f9)
                        : const Color(0xFF445767),
                  ),
                ),
                label: "Profile",
              ),
            ],
          ),
        ),
      ),
    );
  }
}



