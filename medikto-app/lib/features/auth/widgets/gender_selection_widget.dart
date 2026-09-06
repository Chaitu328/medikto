import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';

class GenderSection extends StatelessWidget {
  final String selectedGender;
  final Function(String) onChanged;

  const GenderSection({
    super.key,
    required this.selectedGender,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Gender",
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: colors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            _genderTile(context, "male"),
            const SizedBox(width: 10),
            _genderTile(context, "female"),
          ],
        ),
      ],
    );
  }

  Widget _genderTile(BuildContext context, String gender) {
    final colors = context.themeColors;
    final bool isSelected = selectedGender.toLowerCase() == gender.toLowerCase();

    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(gender[0].toUpperCase() + gender.substring(1)),
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? colors.accentPrimary : colors.border,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isSelected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_off,
                color: isSelected ? colors.accentPrimary : colors.textMuted,
                size: 20,
              ),
              const SizedBox(width: 8),
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    gender[0].toUpperCase() + gender.substring(1),
                    style: TextStyle(
                      color: isSelected ? colors.accentPrimary : colors.textSecondary,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}