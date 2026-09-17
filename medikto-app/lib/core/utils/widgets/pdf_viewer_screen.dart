import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/utils/file_share_helper.dart';
import 'package:medikto/core/utils/widgets/custom_appbar.dart';
import 'package:printing/printing.dart';

class PdfViewerScreen extends StatefulWidget {
  final String title;
  final String pdfUrl;
  final String? fileName;

  const PdfViewerScreen({
    super.key,
    required this.title,
    required this.pdfUrl,
    this.fileName,
  });

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  Uint8List? _pdfBytes;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchPdf();
  }

  Future<void> _fetchPdf() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final dio = Dio();
      final response = await dio.get<List<int>>(
        widget.pdfUrl,
        options: Options(
          responseType: ResponseType.bytes,
          followRedirects: true,
          validateStatus: (status) => status != null && status < 400,
        ),
      );

      if (response.data != null) {
        if (mounted) {
          setState(() {
            _pdfBytes = Uint8List.fromList(response.data!);
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _errorMessage = "Empty document received.";
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = "Unable to load PDF document.\nPlease check your connection or link validity.";
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: CustomAppBar(
        title: widget.title.isNotEmpty ? widget.title : "Document Viewer",
        backgroundColor: themeColors.bg,
        titleStyle: TextStyle(
          color: themeColors.textPrimary,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
        onBack: () => Navigator.pop(context),
        actions: [
          IconButton(
            icon: Icon(Icons.share_outlined, color: themeColors.accentPrimary),
            onPressed: () {
              FileShareHelper.shareFile(
                context: context,
                fileUrl: widget.pdfUrl,
                fallbackTitle: widget.title,
                customFileName: widget.fileName,
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _buildBody(themeColors),
    );
  }

  Widget _buildBody(AppThemeColors themeColors) {
    if (_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: themeColors.accentPrimary),
            const SizedBox(height: 16),
            Text(
              "Loading document...",
              style: TextStyle(color: themeColors.textSecondary, fontSize: 14),
            ),
          ],
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: AppColors.missedRed, size: 48),
              const SizedBox(height: 16),
              Text(
                "Document Error",
                style: TextStyle(
                  color: themeColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: TextStyle(color: themeColors.textMuted, fontSize: 13),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: themeColors.accentPrimary,
                  foregroundColor: themeColors.onAccentPrimary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                onPressed: _fetchPdf,
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text("Retry"),
              ),
            ],
          ),
        ),
      );
    }

    if (_pdfBytes != null) {
      return PdfPreview(
        build: (format) => _pdfBytes!,
        canChangeOrientation: false,
        canChangePageFormat: false,
        canDebug: false,
        allowPrinting: true,
        allowSharing: false, // We use the top app bar share button with PIN protection
        pdfFileName: widget.fileName ?? "document.pdf",
        loadingWidget: Center(
          child: CircularProgressIndicator(color: themeColors.accentPrimary),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
