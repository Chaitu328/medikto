import 'package:flutter/material.dart';

class _GenderOption extends StatelessWidget {
  final String text;
  final String value;
  final String groupValue;
  final ValueChanged<String> onChanged;

  const _GenderOption({
    required this.text,
    required this.value,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;

    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(20),
      child: Row(
        children: [
          /// 🔥 Custom Radio (same size)
          Container(
            height: 20,
            width: 20,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                width: 2,
                color: isSelected
                    ? Color(0xFF81DEEA) // 🔵 selected border
                    : const Color(0x8A555555),
              ),
            ),
            child: isSelected
                ? Center(
                    child: Container(
                      height: 10,
                      width: 10,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF81DEEA), // 🔵 inner dot
                      ),
                    ),
                  )
                : null,
          ),

          const SizedBox(width: 6),

          /// 🔹 Text (same style)
          Text(
            text,
            style: const TextStyle(fontSize: 16, color: Color(0x8A555555)),
          ),
        ],
      ),
    );
  }
}


class GenderSection extends StatelessWidget {
  final String selectedGender;
  final Function(String) onChanged;

  const GenderSection({
    super.key,
    required this.selectedGender,
    required this.onChanged,
  });

  static const Color accentCyan = Color(0xFF81DEEA);
  static const Color surfaceColor = Color(0xFF1E1E1E);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Gender",
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.white70,
          ),
        ),

        const SizedBox(height: 8),

        Row(
          children: [
            _genderTile("male"),
            const SizedBox(width: 10),
            _genderTile("female"),
          ],
        ),
      ],
    );
  }

  Widget _genderTile(String gender) {
    final bool isSelected = selectedGender == gender;

    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(gender),
        child: Container(
          height: 52,
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isSelected ? accentCyan : Colors.white10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isSelected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_off,
                color: isSelected ? accentCyan : Colors.white38,
                size: 20,
              ),

              const SizedBox(width: 6),

              Text(
                gender[0].toUpperCase() + gender.substring(1),
                style: TextStyle(
                  color: isSelected ? accentCyan : Colors.white70,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}