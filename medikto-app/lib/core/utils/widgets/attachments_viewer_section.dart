import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:medikto/core/constants/app_themes.dart';
import 'package:medikto/core/utils/file_share_helper.dart';
import 'package:medikto/core/utils/widgets/pdf_viewer_screen.dart';

/// A robust, zero-overflow attachment viewer widget built to support
/// single or multiple images, PDFs, and documents seamlessly.
class AttachmentsViewerSection extends StatelessWidget {
  /// Single file URL or comma/newline separated string of URLs
  final String? singleUrl;

  /// Optional list of file URLs (for future multi-upload support)
  final List<String>? fileUrls;

  /// Title for fallback sharing / document header
  final String title;

  /// Prefix used for downloaded/shared file names (e.g. "prescription", "report")
  final String filePrefix;

  /// Optional section header title
  final String? sectionTitle;

  const AttachmentsViewerSection({
    super.key,
    this.singleUrl,
    this.fileUrls,
    required this.title,
    this.filePrefix = "document",
    this.sectionTitle,
  });

  /// Extracts and cleans all file URLs from either list or string
  List<String> get resolvedUrls {
    final List<String> result = [];
    if (fileUrls != null && fileUrls!.isNotEmpty) {
      for (final u in fileUrls!) {
        final trimmed = u.trim();
        if (trimmed.isNotEmpty) result.add(trimmed);
      }
    } else if (singleUrl != null && singleUrl!.trim().isNotEmpty) {
      // Split in case of comma, semicolon or newline separated URLs
      final parts = singleUrl!.split(RegExp(r'[,;\n]'));
      for (final p in parts) {
        final trimmed = p.trim();
        if (trimmed.isNotEmpty) result.add(trimmed);
      }
    }
    return result;
  }

  static bool isImageFile(String url) {
    final cleanUrl = url.split('?').first.toLowerCase();
    return cleanUrl.endsWith('.jpg') ||
        cleanUrl.endsWith('.jpeg') ||
        cleanUrl.endsWith('.png') ||
        cleanUrl.endsWith('.webp') ||
        cleanUrl.endsWith('.gif') ||
        cleanUrl.contains("cloudinary.com");
  }

  @override
  Widget build(BuildContext context) {
    final urls = resolvedUrls;
    if (urls.isEmpty) return const SizedBox.shrink();

    final themeColors = context.themeColors;
    final headerText = sectionTitle ??
        (urls.length > 1
            ? "ATTACHMENTS (${urls.length})"
            : "ATTACHMENT");

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          headerText,
          style: TextStyle(
            color: themeColors.textMuted,
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 10),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: urls.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final url = urls[index];
            final itemNumber = urls.length > 1 ? " #${index + 1}" : "";
            final isImg = isImageFile(url);

            if (isImg) {
              return _ImageAttachmentCard(
                url: url,
                title: "$title$itemNumber",
                fileName: "${filePrefix}_${index + 1}.jpg",
                allImageUrls: urls.where(isImageFile).toList(),
                initialIndex: urls.where(isImageFile).toList().indexOf(url),
              );
            } else {
              return _PdfAttachmentCard(
                url: url,
                title: "$title$itemNumber",
                fileName: "${filePrefix}_${index + 1}.pdf",
              );
            }
          },
        ),
      ],
    );
  }
}

class _ImageAttachmentCard extends StatelessWidget {
  final String url;
  final String title;
  final String fileName;
  final List<String> allImageUrls;
  final int initialIndex;

  const _ImageAttachmentCard({
    required this.url,
    required this.title,
    required this.fileName,
    required this.allImageUrls,
    required this.initialIndex,
  });

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;
    final isDark = context.isDarkMode;

    return Container(
      decoration: BoxDecoration(
        color: themeColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: themeColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Tappable Image Preview
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => FullScreenGalleryViewer(
                    imageUrls: allImageUrls.isNotEmpty ? allImageUrls : [url],
                    initialIndex: initialIndex >= 0 ? initialIndex : 0,
                    title: title,
                  ),
                ),
              );
            },
            child: Stack(
              alignment: Alignment.bottomRight,
              children: [
                Hero(
                  tag: url,
                  child: CachedNetworkImage(
                    imageUrl: url,
                    height: 220,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => SizedBox(
                      height: 220,
                      child: Center(
                        child: CircularProgressIndicator(
                          color: themeColors.accentPrimary,
                        ),
                      ),
                    ),
                    errorWidget: (context, url, error) => SizedBox(
                      height: 220,
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.broken_image_outlined,
                              color: themeColors.textMuted,
                              size: 40,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Unable to load image",
                              style: TextStyle(
                                color: themeColors.textMuted,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                // Tap to expand indicator badge
                Container(
                  margin: const EdgeInsets.all(10),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.65),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.fullscreen, color: Colors.white, size: 14),
                      SizedBox(width: 4),
                      Text(
                        "TAP TO EXPAND",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Info & Action Bar with Zero Overflow
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            color: isDark ? Colors.black26 : Colors.grey.withValues(alpha: 0.08),
            child: Row(
              children: [
                Icon(
                  Icons.image_outlined,
                  color: themeColors.accentMedium,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      color: themeColors.textPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                  icon: Icon(
                    Icons.share_outlined,
                    color: themeColors.accentMedium,
                    size: 20,
                  ),
                  tooltip: "Share Image",
                  onPressed: () {
                    FileShareHelper.shareFile(
                      context: context,
                      fileUrl: url,
                      fallbackTitle: title,
                      customFileName: fileName,
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PdfAttachmentCard extends StatelessWidget {
  final String url;
  final String title;
  final String fileName;

  const _PdfAttachmentCard({
    required this.url,
    required this.title,
    required this.fileName,
  });

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;
    final displayName = url.split('/').last.split('?').first;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PdfViewerScreen(
                title: title,
                pdfUrl: url,
                fileName: fileName,
              ),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: themeColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: themeColors.border),
          ),
          child: Row(
            children: [
              // PDF Icon Badge
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.missedRed.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.picture_as_pdf,
                  color: AppColors.missedRed,
                  size: 26,
                ),
              ),
              const SizedBox(width: 12),

              // Title and File Subtitle - Safe from overflow
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            title,
                            style: TextStyle(
                              color: themeColors.textPrimary,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: themeColors.accentSubtle,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            "PDF",
                            style: TextStyle(
                              color: themeColors.accentMedium,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      displayName.isNotEmpty ? displayName : "Tap to view document",
                      style: TextStyle(
                        color: themeColors.textMuted,
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Share Action Button
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                icon: Icon(
                  Icons.share_outlined,
                  color: themeColors.accentMedium,
                  size: 20,
                ),
                tooltip: "Share Document",
                onPressed: () {
                  FileShareHelper.shareFile(
                    context: context,
                    fileUrl: url,
                    fallbackTitle: title,
                    customFileName: fileName,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Full-screen interactive image viewer with pinch-to-zoom and multi-image swipe
class FullScreenGalleryViewer extends StatefulWidget {
  final List<String> imageUrls;
  final int initialIndex;
  final String title;

  const FullScreenGalleryViewer({
    super.key,
    required this.imageUrls,
    this.initialIndex = 0,
    required this.title,
  });

  @override
  State<FullScreenGalleryViewer> createState() => _FullScreenGalleryViewerState();
}

class _FullScreenGalleryViewerState extends State<FullScreenGalleryViewer> {
  late final PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentUrl = widget.imageUrls[_currentIndex];

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (widget.imageUrls.length > 1)
              Text(
                "${_currentIndex + 1} of ${widget.imageUrls.length}",
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: Colors.white),
            onPressed: () {
              FileShareHelper.shareFile(
                context: context,
                fileUrl: currentUrl,
                fallbackTitle: widget.title,
                customFileName: "image_${_currentIndex + 1}.jpg",
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: widget.imageUrls.length,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        itemBuilder: (context, index) {
          final imgUrl = widget.imageUrls[index];
          return Center(
            child: InteractiveViewer(
              minScale: 0.8,
              maxScale: 4.0,
              child: Hero(
                tag: imgUrl,
                child: CachedNetworkImage(
                  imageUrl: imgUrl,
                  fit: BoxFit.contain,
                  placeholder: (_, __) => const Center(
                    child: CircularProgressIndicator(color: Colors.white),
                  ),
                  errorWidget: (_, __, ___) => const Center(
                    child: Icon(Icons.broken_image, color: Colors.white54, size: 64),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
