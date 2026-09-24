const PDFDocument = require("pdfkit");

/**
 * Format vital type to human readable title
 */
const getVitalTitle = (type) => {
  switch (type) {
    case "bloodPressure":
      return "Blood Pressure";
    case "heartRate":
      return "Heart Rate";
    case "temperature":
      return "Body Temperature";
    case "sugar":
      return "Blood Sugar";
    default:
      return type || "Vital Reading";
  }
};

/**
 * Format recorded value with unit
 */
const getVitalValueWithUnit = (vital) => {
  switch (vital.type) {
    case "bloodPressure":
      if (vital.bloodPressure && vital.bloodPressure.systolic != null && vital.bloodPressure.diastolic != null) {
        return `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg`;
      }
      return "N/A";
    case "heartRate":
      return vital.heartRate != null ? `${vital.heartRate} BPM` : "N/A";
    case "temperature":
      return vital.temperature != null ? `${vital.temperature} °F` : "N/A";
    case "sugar":
      return vital.sugarLevel != null ? `${vital.sugarLevel} mg/dL` : "N/A";
    default:
      return "N/A";
  }
};

/**
 * Format status string
 */
const getVitalStatus = (vital) => {
  switch (vital.type) {
    case "bloodPressure":
      return vital.bloodPressure?.status || "Normal";
    case "heartRate":
      return vital.heartRateStatus || "Normal";
    case "temperature":
      return vital.temperatureStatus || "Normal";
    case "sugar":
      return vital.sugarStatus || "Normal";
    default:
      return "-";
  }
};

/**
 * Streams a medical vitals PDF report directly to the HTTP response stream.
 * @param {Array} vitals - Array of Vitals documents
 * @param {Object} patient - Patient user object (firstName, lastName, email, phone)
 * @param {Object} res - Express response stream
 */
const generateVitalsPdfStream = (vitals, patient, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
  });

  // Pipe directly to HTTP response
  doc.pipe(res);

  const primaryTeal = "#0D9488";
  const darkSlate = "#0F172A";
  const textMuted = "#64748B";
  const borderGrey = "#E2E8F0";
  const rowAltBg = "#F8FAFC";

  // --- HEADER ---
  doc
    .rect(40, 40, 515, 60)
    .fill(primaryTeal);

  doc
    .fillColor("#FFFFFF")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("MEDIKTO", 55, 55);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("SECURE HEALTH RECORDS SUMMARY", 55, 80);

  const formattedNow = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(`Generated: ${formattedNow}`, 350, 65, { align: "right", width: 190 });

  doc.moveDown(3);

  // --- PATIENT INFO BOX ---
  const patientName = patient
    ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Patient Record"
    : "Patient Record";

  const infoTop = 115;
  doc
    .roundedRect(40, infoTop, 515, 55, 6)
    .fillAndStroke(rowAltBg, borderGrey);

  doc
    .fillColor(textMuted)
    .fontSize(8)
    .font("Helvetica-Bold")
    .text("PATIENT NAME", 55, infoTop + 12);

  doc
    .fillColor(darkSlate)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(patientName, 55, infoTop + 26);

  doc
    .fillColor(textMuted)
    .fontSize(8)
    .font("Helvetica-Bold")
    .text("TOTAL READINGS", 400, infoTop + 12, { align: "right", width: 140 });

  doc
    .fillColor(primaryTeal)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(String(vitals.length), 400, infoTop + 26, { align: "right", width: 140 });

  // --- SECTION TITLE ---
  const tableTitleTop = 185;
  doc
    .fillColor(primaryTeal)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("RECORDED VITAL MEASUREMENTS", 40, tableTitleTop);

  // --- TABLE HEADER ---
  const tableHeaderTop = 205;
  doc
    .rect(40, tableHeaderTop, 515, 24)
    .fill(primaryTeal);

  doc
    .fillColor("#FFFFFF")
    .fontSize(9)
    .font("Helvetica-Bold");

  doc.text("Vital Sign", 50, tableHeaderTop + 7, { width: 105 });
  doc.text("Measurement", 160, tableHeaderTop + 7, { width: 105 });
  doc.text("Status", 270, tableHeaderTop + 7, { width: 75 });
  doc.text("Date & Time", 350, tableHeaderTop + 7, { width: 105 });
  doc.text("Notes", 460, tableHeaderTop + 7, { width: 90 });

  // --- TABLE ROWS ---
  let currentY = tableHeaderTop + 24;
  const rowHeight = 26;
  const maxY = 740;

  vitals.forEach((vital, index) => {
    // Page overflow check
    if (currentY + rowHeight > maxY) {
      doc.addPage();
      currentY = 40;

      // Repeat Table Header on new page
      doc
        .rect(40, currentY, 515, 24)
        .fill(primaryTeal);

      doc
        .fillColor("#FFFFFF")
        .fontSize(9)
        .font("Helvetica-Bold");

      doc.text("Vital Sign", 50, currentY + 7, { width: 105 });
      doc.text("Measurement", 160, currentY + 7, { width: 105 });
      doc.text("Status", 270, currentY + 7, { width: 75 });
      doc.text("Date & Time", 350, currentY + 7, { width: 105 });
      doc.text("Notes", 460, currentY + 7, { width: 90 });

      currentY += 24;
    }

    // Row Background
    if (index % 2 === 1) {
      doc
        .rect(40, currentY, 515, rowHeight)
        .fill(rowAltBg);
    }

    // Bottom border
    doc
      .moveTo(40, currentY + rowHeight)
      .lineTo(555, currentY + rowHeight)
      .strokeColor(borderGrey)
      .lineWidth(0.5)
      .stroke();

    const title = getVitalTitle(vital.type);
    const value = getVitalValueWithUnit(vital);
    const status = getVitalStatus(vital);
    const dateStr = vital.recordedAt
      ? new Date(vital.recordedAt).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";
    const notes = vital.notes && vital.notes.trim().length > 0 ? vital.notes.trim() : "-";

    doc
      .fillColor(darkSlate)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(title, 50, currentY + 8, { width: 105, ellipsis: true });

    doc
      .font("Helvetica")
      .text(value, 160, currentY + 8, { width: 105, ellipsis: true });

    doc
      .fillColor(status.toLowerCase().includes("high") || status.toLowerCase().includes("stage") || status.toLowerCase().includes("fever") ? "#E11D48" : primaryTeal)
      .font("Helvetica-Bold")
      .text(status, 270, currentY + 8, { width: 75, ellipsis: true });

    doc
      .fillColor(darkSlate)
      .font("Helvetica")
      .text(dateStr, 350, currentY + 8, { width: 105, ellipsis: true });

    doc
      .fillColor(textMuted)
      .text(notes, 460, currentY + 8, { width: 90, ellipsis: true });

    currentY += rowHeight;
  });

  // --- FOOTER FOR ALL PAGES ---
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    // Footer divider
    doc
      .moveTo(40, 780)
      .lineTo(555, 780)
      .strokeColor(borderGrey)
      .lineWidth(0.8)
      .stroke();

    // Footer text
    doc
      .fillColor(textMuted)
      .fontSize(8)
      .font("Helvetica")
      .text(
        "Notice: This document contains strictly factual health measurements recorded in Medikto and is not a medical diagnosis.",
        40,
        790,
        { width: 380 }
      );

    doc.text(`Page ${i + 1} of ${pages.count}`, 430, 790, {
      align: "right",
      width: 125,
    });
  }

  doc.end();
};

module.exports = {
  generateVitalsPdfStream,
};
