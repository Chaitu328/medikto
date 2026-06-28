import 'package:cherry_toast/cherry_toast.dart';
import 'package:cherry_toast/resources/arrays.dart';
import 'package:flutter/material.dart';

class AppToasts {
  static void showError(BuildContext context, String message) {
    CherryToast.error(
      width: double.infinity,
      enableIconAnimation: true,
      title: const Text(
        "Error",
        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
      ),

      // ✅ show error icon
      displayIcon: true,
      

      // ✅ description only accepts Text
      description: Text(
        message,
        style: const TextStyle(
          fontSize: 13,
          color: Colors.white70,
          height: 1.5, // gives spacing
        ),
      ),

      animationType: AnimationType.fromTop,
      animationDuration: const Duration(milliseconds: 1000),
      autoDismiss: true,
      backgroundColor: const Color(0xFF1E1E1E),
      toastPosition: Position.top,
      borderRadius: 12,
      displayCloseButton: true,
      toastDuration: const Duration(seconds: 3),

      // ✅ internal padding
      titleDescriptionMargin: 4,
    ).show(context);
  }

  static void showSuccess(BuildContext context, String message) {
    CherryToast.success(
      enableIconAnimation: true,
      title: const Text(
        "Success",
        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
      ),

      // ✅ green checkmark icon
      displayIcon: true,

      description: Text(
        message,
        style: const TextStyle(
          fontSize: 13,
          color: Colors.white70,
          height: 1.5,
        ),
      ),

      animationType: AnimationType.fromTop,
      animationDuration: const Duration(milliseconds: 1000),
      backgroundColor: const Color(0xFF1E1E1E),
      toastPosition: Position.top,
      displayCloseButton: true,
      borderRadius: 12,
      toastDuration: const Duration(seconds: 3),

      // ✅ spacing around toast
      titleDescriptionMargin: 4,
    ).show(context);
  }
}
