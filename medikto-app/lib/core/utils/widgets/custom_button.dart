import 'package:flutter/material.dart';

class CustomButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final String? buttonText;
  final Color? buttonColor;
  final TextStyle? textStyle;
  final double? width;
  final double? height;
  final Border? border;
  final BorderRadius? radius;

  final bool isLoading;

  const CustomButton({
    super.key,
    this.onPressed,
    this.buttonText,
    this.buttonColor,
    this.textStyle,
    this.width,
    this.height,
    this.border,
    this.radius,
    this.isLoading = false,
  });

  @override
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton> {
  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      ignoring: widget.isLoading,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: widget.isLoading ? 0.8 : 1,
        child: GestureDetector(
          onTap: widget.onPressed,
          child: Container(
            width: widget.width ?? double.infinity,
            height: widget.height ?? 52,
            decoration: BoxDecoration(
              color: widget.buttonColor ?? const Color(0xFF213598),
              border: widget.border,
              borderRadius: widget.radius ?? BorderRadius.circular(34),
            ),
            child: Center(
              child: widget.isLoading
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                      ),
                    )
                  : Text(
                      widget.buttonText ?? "",
                      style:
                          widget.textStyle ??
                          const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w400,
                            color: Colors.white,
                          ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
