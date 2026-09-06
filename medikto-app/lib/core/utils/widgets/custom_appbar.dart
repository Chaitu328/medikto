import 'package:flutter/material.dart';
import 'package:medikto/bottom_bar.dart';
import 'package:medikto/core/constants/app_themes.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool? showBackButton;
  final VoidCallback? onBack;
  final Color? backgroundColor;
  final TextStyle? titleStyle;
  final List<Widget>? actions;

  const CustomAppBar({
    super.key,
    required this.title,
    this.showBackButton = true,
    this.onBack,
    this.backgroundColor,
    this.titleStyle,
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;
    final effectiveBg = backgroundColor ?? colors.bg;
    final defaultTitleStyle = TextStyle(
      fontSize: 18,
      fontWeight: FontWeight.bold,
      color: colors.textPrimary,
    );

    return AppBar(
      toolbarHeight: 60,
      backgroundColor: effectiveBg,
      elevation: 0,
      scrolledUnderElevation: 0,
      titleSpacing: 0,
      leadingWidth: 56,
      leading: showBackButton == true
          ? InkWell(
              onTap: onBack ??
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
              child: Icon(
                Icons.arrow_back_ios_new,
                size: 20,
                color: colors.iconColor,
              ),
            )
          : null,
      title: showBackButton == false
          ? Padding(
              padding: const EdgeInsets.only(left: 20),
              child: Text(
                title ?? '',
                style: titleStyle ?? defaultTitleStyle,
              ),
            )
          : Text(
              title ?? '',
              style: titleStyle ?? defaultTitleStyle,
            ),
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
}
