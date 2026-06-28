import 'package:flutter/material.dart';
import 'package:medikto/bottom_bar.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool? showBackButton;
  final VoidCallback? onBack;
  final Color? backgroundColor;
  final TextStyle? titleStyle;

  /// ✅ ADD THIS
  final List<Widget>? actions;

  const CustomAppBar({
    super.key,
    required this.title,
    this.showBackButton = true,
    this.onBack,
    this.backgroundColor,
    this.titleStyle,

    /// ✅ ADD THIS
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 80,
      backgroundColor: backgroundColor ?? Colors.white,
      titleSpacing: 0,
      leadingWidth: 56,

      leading: showBackButton == true
          ? InkWell(
              onTap:
                  onBack ??
                  () {
                    if (Navigator.canPop(context)) {
                      Navigator.pop(context);
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const BaseBottomNavigationPage(),
                        ),
                      );
                    }
                  },
              child: const Icon(
                size: 20,
                Icons.arrow_back_ios_new,
                color: Color(0xFFffffff),
              ),
            )
          : null,

      title: showBackButton == false
          ? Padding(
              padding: const EdgeInsets.only(left: 20),
              child: Text(
                title ?? '',
                style:
                    titleStyle ??
                    const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFFffffff),
                    ),
              ),
            )
          : Text(
              title ?? '',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w500,
                color: Color(0xFFffffff),
              ),
            ),

      /// ✅ ADD THIS
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
}
