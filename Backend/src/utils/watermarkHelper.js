const sharp = require("sharp");

// Restrict Sharp memory consumption to stay safely inside the 512 MB container limit
sharp.cache({ memory: 32, files: 0, items: 10 });
sharp.concurrency(1);

/**
 * Escapes XML/SVG special characters.
 */
const escapeXml = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/**
 * Applies a lightweight timestamp watermark overlay to an image buffer.
 *
 * @param {Buffer} inputBuffer - Original image buffer.
 * @param {Date} timestamp - Date and time of verification (defaults to now).
 * @returns {Promise<Buffer>} - Processed JPEG buffer.
 */
const applySelfieWatermark = async (inputBuffer, timestamp = new Date()) => {
  const timeStr = timestamp.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateStr = timestamp.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const text = `Medikto | ${timeStr} | ${dateStr}`;
  const safeText = escapeXml(text);

  // Resize image first to get target dimensions (max width 800)
  const image = sharp(inputBuffer).resize({
    width: 800,
    withoutEnlargement: true,
  });

  const metadata = await image.metadata();
  const imgWidth = metadata.width || 800;
  const imgHeight = metadata.height || 600;

  // Calculate overlay dimensions
  const badgeHeight = Math.max(36, Math.round(imgHeight * 0.06));
  const fontSize = Math.max(16, Math.round(badgeHeight * 0.5));
  const badgeWidth = Math.min(imgWidth - 20, Math.round(text.length * (fontSize * 0.65) + 32));

  // Construct SVG badge with semi-transparent background and clear white text
  const svgOverlay = Buffer.from(`
    <svg width="${badgeWidth}" height="${badgeHeight}">
      <rect x="0" y="0" width="${badgeWidth}" height="${badgeHeight}" rx="6" ry="6" fill="rgba(0, 0, 0, 0.6)" />
      <text x="14" y="${Math.round(badgeHeight / 2 + fontSize / 3)}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}px" font-weight="bold" fill="#FFFFFF">
        ${safeText}
      </text>
    </svg>
  `);

  // Composite SVG watermark into the bottom-left corner with 16px padding
  return await image
    .composite([
      {
        input: svgOverlay,
        top: Math.max(0, imgHeight - badgeHeight - 16),
        left: 16,
      },
    ])
    .jpeg({ quality: 85 })
    .toBuffer();
};

module.exports = {
  applySelfieWatermark,
};
