import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:medikto/core/constants/app_themes.dart';

class AppTextFormFieldTitled extends StatelessWidget {
  final String? title;
  final TextStyle? titleTextStyle;
  final String? hintText;
  final IconData? suffixIcon;
  final IconData? prefixIcon;
  final GestureTapCallback? suffixIconOnTap;
  final String? Function(String?)? validator;
  final Color? color;
  final Color? focusColor;
  final Color? fillColor;
  final Color? borderColor;
  final TextEditingController? controller;
  final bool? enabled;
  final TextInputType? textInputType;
  final TextCapitalization? textCapitalization;
  final bool? obscureText;
  final Function(dynamic)? onChanged;
  final List<TextInputFormatter>? inputFormatters;
  final EdgeInsets? inputDecorationPadding;
  final ImageIcon? imageIcon;
  final bool? readOnly;
  final TextStyle? hintStyle;
  final TextStyle? textStyle;
  final double? width;
  final double? height;
  final Widget? suffix;
  final Widget? prefix;
  final int? maxLines;
  final int? minLines;
  final bool? expands;
  final bool isRequired;
  final VoidCallback? onTap;

  const AppTextFormFieldTitled({
    super.key,
    this.title,
    this.titleTextStyle,
    this.hintText,
    this.suffixIcon,
    this.prefixIcon,
    this.suffixIconOnTap,
    this.validator,
    this.color,
    this.focusColor,
    this.controller,
    this.enabled,
    this.textInputType,
    this.textCapitalization,
    this.inputFormatters,
    this.borderColor,
    this.fillColor,
    this.obscureText,
    this.onChanged,
    this.onTap,
    this.inputDecorationPadding,
    this.readOnly,
    this.imageIcon,
    this.hintStyle,
    this.textStyle,
    this.width,
    this.height,
    this.suffix,
    this.prefix,
    this.maxLines,
    this.minLines,
    this.expands,
    this.isRequired = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.themeColors;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Align(
        alignment: Alignment.topCenter,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (title != null)
              RichText(
                text: TextSpan(
                  text: title,
                  style: titleTextStyle ??
                      TextStyle(
                        color: color ?? colors.textPrimary,
                        fontWeight: FontWeight.w500,
                        fontSize: 13,
                        fontFamily: 'Poppins',
                      ),
                  children: [
                    if (isRequired)
                      const TextSpan(
                        text: " *",
                        style: TextStyle(
                          color: Color(0xFFFF8A80),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                  ],
                ),
              ),
            if (title != null) const SizedBox(height: 10),
            SizedBox(
              width: width ?? MediaQuery.of(context).size.width,
              child: TextFormField(
                onTap: onTap,
                maxLines: expands == true ? null : (maxLines ?? 1),
                minLines: expands == true ? null : minLines,
                expands: expands ?? false,
                textCapitalization:
                    textCapitalization ?? TextCapitalization.words,
                readOnly: readOnly ?? false,
                onChanged: onChanged,
                obscureText: obscureText ?? false,
                inputFormatters: inputFormatters ?? [],
                keyboardType: textInputType ?? TextInputType.text,
                enabled: enabled ?? true,
                controller: controller,
                validator: validator,
                cursorColor: focusColor ?? AppColors.primaryAccent,
                style: textStyle ??
                    TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: colors.textPrimary,
                      fontFamily: 'Poppins',
                    ),
                decoration: InputDecoration(
                  contentPadding: inputDecorationPadding ??
                      const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  prefixIcon: prefix != null
                      ? Padding(
                          padding: const EdgeInsets.all(12),
                          child: prefix,
                        )
                      : null,
                  suffixIcon: suffix != null
                      ? Padding(
                          padding: const EdgeInsets.all(12),
                          child: GestureDetector(
                            onTap: suffixIconOnTap,
                            child: suffix,
                          ),
                        )
                      : null,
                  suffixIconColor: color ?? colors.iconColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(
                      color: borderColor ?? colors.border,
                    ),
                  ),
                  hintStyle: hintStyle ??
                      TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: colors.textMuted,
                        fontFamily: 'Poppins',
                      ),
                  hintText: hintText ?? title,
                  filled: true,
                  fillColor: fillColor ?? colors.inputFill,
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                      color: AppColors.statusCritical,
                    ),
                  ),
                  disabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(
                      color: borderColor ?? colors.borderSubtle,
                    ),
                  ),
                  focusedErrorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                      color: AppColors.statusCritical,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(
                      color: borderColor ?? colors.border,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(
                      color: focusColor ?? AppColors.primaryAccent,
                      width: 1.5,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
