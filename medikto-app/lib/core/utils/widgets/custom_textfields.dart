import 'package:flutter/material.dart';
import 'package:flutter/services.dart';


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
  final TextStyle? hintStyle; // Hint style for placeholder text
  final TextStyle? textStyle; // Text style for entered/selected text
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
    this.textStyle, // Add textStyle parameter
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
                  style:
                      titleTextStyle ??
                      TextStyle(
                        color: color ?? const Color(0xFF000000),
                        fontWeight: FontWeight.w500,
                        fontSize: 12,
                      ),
                  children: [
                    if (isRequired)
                      const TextSpan(
                        text: " *",
                        style: TextStyle(
                          color: Color(0xFFFF8A80), // 🔴 RED STAR
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
                
                // ✅ IMPORTANT PART
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
                cursorColor: focusColor ?? Color(0xFFffffff),
                style:
                    textStyle ??
                    TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFFffffff),
                      // color: Color(0xFF000000),
                    ), // Apply textStyle for the input text
                decoration: InputDecoration(
                  contentPadding:
                      inputDecorationPadding ??
                      EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  // ✅ USE WIDGET DIRECTLY
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
                  suffixIconColor: color ?? Color(0xFF000000),
                  // ✅ IMPORTANT: Remove InputBorder.none
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide(
                      color: borderColor ?? Colors.transparent,
                    ),
                  ),
                  hintStyle:
                      hintStyle ??
                      TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: Colors.grey,
                      ), // Use dynamic hintStyle
                  hintText: hintText ?? title,
                  filled: true,
                  fillColor: fillColor ?? Colors.grey.shade100,

                  errorBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                  disabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: borderColor ?? Colors.transparent,
                    ),
                  ),
                  focusedErrorBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: borderColor ?? Colors.black),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: focusColor ?? Colors.transparent,
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
