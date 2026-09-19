const nodemailer = require("nodemailer");

/**
 * ===========================================
 * MEDIKTO EMAIL TEMPLATE SYSTEM
 * Bulletproof, Zero-External-Image Dependencies
 * Compatible with Gmail, Outlook, Yahoo, Apple Mail
 * High Deliverability & Spam-Filter Optimized
 * ===========================================
 */

// Helper to get configured sender address
const getSenderEmail = () => {
  return process.env.SMTP_USER || "healthreportsapp7@gmail.com";
};

// Helper to create Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: parseInt(process.env.SMTP_PORT || "587") === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Generates the master Medikto email wrapper.
 * Uses 100% inline CSS and pure HTML elements so it never relies on fragile external icon CDNs.
 */
const generateEmailTemplate = ({
  headerBadge = "MEDIKTO HEALTHCARE",
  headerTitle = "Welcome to Medikto",
  headerSubtitle = "Healthcare Management Platform",
  greetingName = "Hello",
  bodyParagraph = "",
  infoCardHtml = "",
  credentialsCardHtml = "",
  nextStepsHtml = "",
  ctaButtonHtml = "",
  footerNote = ""
}) => {
  const supportEmail = getSenderEmail();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${headerTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#F1F5F9; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background-color:#F1F5F9; padding:24px 0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <!-- Main Email Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; max-width:580px; width:100%; background-color:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(15,23,42,0.08); border:1px solid #E2E8F0;">

          <!-- Header / Hero Banner -->
          <tr>
            <td style="background-color:#2563EB; background:linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding:36px 32px 32px 32px; text-align:center; color:#FFFFFF;">
              
              <!-- Brand Emblem (Pure CSS - Never Breaks) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 16px auto;">
                <tr>
                  <td align="center" style="width:54px; height:54px; background-color:#FFFFFF; border-radius:14px; text-align:center; vertical-align:middle; box-shadow:0 4px 12px rgba(0,0,0,0.12);">
                    <span style="font-family:'Segoe UI', Arial, sans-serif; font-size:28px; font-weight:800; color:#2563EB; line-height:54px; display:inline-block;">+</span>
                  </td>
                </tr>
              </table>

              <!-- Badge -->
              <div style="display:inline-block; padding:4px 12px; background-color:rgba(255,255,255,0.18); border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#FFFFFF; margin-bottom:12px;">
                ${headerBadge}
              </div>

              <!-- Header Title & Subtitle -->
              <h1 style="margin:0 0 8px 0; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size:24px; font-weight:700; color:#FFFFFF; line-height:1.3; letter-spacing:-0.4px;">
                ${headerTitle}
              </h1>
              <p style="margin:0; font-family:'Segoe UI', Arial, sans-serif; font-size:14px; font-weight:400; color:#DBEAFE; line-height:1.5;">
                ${headerSubtitle}
              </p>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding:32px 32px 24px 32px; background-color:#FFFFFF;">
              
              <!-- Greeting & Body Text -->
              <h2 style="margin:0 0 10px 0; font-family:'Segoe UI', -apple-system, Arial, sans-serif; font-size:19px; font-weight:700; color:#0F172A; letter-spacing:-0.2px;">
                ${greetingName}
              </h2>
              <p style="margin:0 0 24px 0; font-family:'Segoe UI', Arial, sans-serif; font-size:15px; font-weight:400; color:#475569; line-height:1.65;">
                ${bodyParagraph}
              </p>

              <!-- Optional Cards & Sections -->
              ${infoCardHtml}
              ${credentialsCardHtml}
              ${nextStepsHtml}
              ${ctaButtonHtml}
              ${footerNote}

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="padding:24px 32px; background-color:#F8FAFC; border-top:1px solid #E2E8F0; text-align:center;">
              <p style="margin:0 0 8px 0; font-family:'Segoe UI', Arial, sans-serif; font-size:13px; font-weight:600; color:#334155;">
                Medikto Health Platform
              </p>
              <p style="margin:0 0 12px 0; font-family:'Segoe UI', Arial, sans-serif; font-size:12px; font-weight:400; color:#94A3B8; line-height:1.6;">
                This is a secure automated notification regarding your Medikto account.<br/>
                If you have questions or did not expect this message, contact us at
                <a href="mailto:${supportEmail}" style="color:#2563EB; text-decoration:none; font-weight:500;">${supportEmail}</a>
              </p>
              <p style="margin:0; font-family:'Segoe UI', Arial, sans-serif; font-size:11px; font-weight:400; color:#CBD5E1;">
                &copy; ${new Date().getFullYear()} Medikto. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- End Main Email Container -->
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * =========================================================================
 * 1. GUARDIAN WEB PORTAL CREDENTIALS EMAIL
 * =========================================================================
 */
exports.sendGuardianCredentials = async (
  to,
  guardianName,
  patientName,
  temporaryPassword,
  relation
) => {
  try {
    const isSmtpConfigured =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    const emailSubject = "Your Medikto Caretaker Portal Login Details";
    const senderEmail = getSenderEmail();
    const cleanRelation = relation || "Caretaker";
    const cleanPatient = patientName || "Patient";
    const portalUrl =
      process.env.GUARDIAN_PORTAL_URL ||
      (process.env.ADMIN_URL
        ? `${process.env.ADMIN_URL}/guardian/login`
        : "https://admin.medikto.com/guardian/login");

    // Info Card: Patient & Relation
    const infoCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:20px; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px;">
        <tr>
          <td style="padding:16px 20px; width:50%; vertical-align:top; border-right:1px solid #E2E8F0;">
            <span style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748B; margin-bottom:4px;">
              PATIENT
            </span>
            <span style="display:block; font-size:16px; font-weight:700; color:#0F172A;">
              ${cleanPatient}
            </span>
          </td>
          <td style="padding:16px 20px; width:50%; vertical-align:top;">
            <span style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748B; margin-bottom:4px;">
              RELATIONSHIP
            </span>
            <span style="display:inline-block; padding:2px 10px; background-color:#EFF6FF; border:1px solid #DBEAFE; border-radius:6px; font-size:14px; font-weight:700; color:#1D4ED8;">
              ${cleanRelation}
            </span>
          </td>
        </tr>
      </table>
    `;

    // Credentials & Portal Link Card
    const credentialsCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:24px; background-color:#FFFFFF; border:1px solid #BFDBFE; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="padding:12px 20px; background-color:#EFF6FF; border-bottom:1px solid #DBEAFE;">
            <span style="font-size:12px; font-weight:700; color:#1E40AF; text-transform:uppercase; letter-spacing:0.5px;">
              &#128274; Web Portal Login Details
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding-bottom:14px; border-bottom:1px solid #F1F5F9;">
                  <span style="display:block; font-size:12px; color:#64748B; margin-bottom:3px;">Portal Link</span>
                  <a href="${portalUrl}" target="_blank" style="font-size:14px; font-weight:600; color:#2563EB; text-decoration:underline; word-break:break-all;">
                    ${portalUrl}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding-top:14px; padding-bottom:14px; border-bottom:1px solid #F1F5F9;">
                  <span style="display:block; font-size:12px; color:#64748B; margin-bottom:3px;">Login Email</span>
                  <span style="display:block; font-size:15px; font-weight:600; color:#0F172A;">${to}</span>
                </td>
              </tr>
              <tr>
                <td style="padding-top:14px;">
                  <span style="display:block; font-size:12px; color:#64748B; margin-bottom:6px;">Temporary Password</span>
                  <div style="display:inline-block; padding:8px 18px; background-color:#F8FAFC; border:1px dashed #2563EB; border-radius:8px;">
                    <span style="font-family:'Courier New', Courier, monospace; font-size:20px; font-weight:800; color:#1D4ED8; letter-spacing:1.5px;">
                      ${temporaryPassword}
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    // CTA Button to Open Web Portal
    const ctaButtonHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px auto;">
        <tr>
          <td align="center">
            <a href="${portalUrl}" target="_blank" style="display:inline-block; padding:14px 36px; background-color:#2563EB; color:#FFFFFF; font-family:'Segoe UI', Arial, sans-serif; font-size:15px; font-weight:700; text-decoration:none; border-radius:10px; box-shadow:0 4px 14px rgba(37,99,235,0.25);">
              Open Caretaker Web Portal &rarr;
            </a>
          </td>
        </tr>
      </table>
    `;

    // Next Steps Checklist for Web Portal
    const nextStepsHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:24px;">
        <tr>
          <td style="padding-bottom:10px;">
            <span style="font-size:13px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.5px;">
              How to Access Your Portal
            </span>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px;">
              <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="width:24px; vertical-align:middle; text-align:center; padding-right:12px;">
                        <span style="display:inline-block; width:22px; height:22px; background-color:#2563EB; color:#FFFFFF; border-radius:50%; font-size:12px; font-weight:700; line-height:22px; text-align:center;">1</span>
                      </td>
                      <td style="vertical-align:middle; font-size:14px; font-weight:500; color:#334155;">
                        Click the portal link above: <strong>${portalUrl}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="width:24px; vertical-align:middle; text-align:center; padding-right:12px;">
                        <span style="display:inline-block; width:22px; height:22px; background-color:#2563EB; color:#FFFFFF; border-radius:50%; font-size:12px; font-weight:700; line-height:22px; text-align:center;">2</span>
                      </td>
                      <td style="vertical-align:middle; font-size:14px; font-weight:500; color:#334155;">
                        Log in with your email (<strong>${to}</strong>) and temporary password
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="width:24px; vertical-align:middle; text-align:center; padding-right:12px;">
                        <span style="display:inline-block; width:22px; height:22px; background-color:#2563EB; color:#FFFFFF; border-radius:50%; font-size:12px; font-weight:700; line-height:22px; text-align:center;">3</span>
                      </td>
                      <td style="vertical-align:middle; font-size:14px; font-weight:500; color:#334155;">
                        Create your own permanent password upon first login
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="width:24px; vertical-align:middle; text-align:center; padding-right:12px;">
                        <span style="display:inline-block; width:22px; height:22px; background-color:#2563EB; color:#FFFFFF; border-radius:50%; font-size:12px; font-weight:700; line-height:22px; text-align:center;">4</span>
                      </td>
                      <td style="vertical-align:middle; font-size:14px; font-weight:500; color:#334155;">
                        View ${cleanPatient}'s medications, vitals, prescriptions, and health reports
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const emailBodyHtml = generateEmailTemplate({
      headerBadge: "CARETAKER PORTAL ACCESS",
      headerTitle: "Welcome to Medikto",
      headerSubtitle: "Your Caretaker Portal Account is Ready",
      greetingName: `Hello ${guardianName || "Caretaker"},`,
      bodyParagraph: `You have been added as a health caretaker for <strong>${cleanPatient}</strong>. You now have secure, view-only web access to monitor their health records on the Medikto portal.`,
      infoCardHtml,
      credentialsCardHtml,
      ctaButtonHtml,
      nextStepsHtml
    });

    // Clean Plaintext Fallback
    const emailBodyText = `Welcome to Medikto, ${guardianName || "Caretaker"}!

You have been added as a caretaker for: ${cleanPatient} (${cleanRelation}).

Your Web Portal Login Details:
Portal Link: ${portalUrl}
Email: ${to}
Temporary Password: ${temporaryPassword}

How to Access:
1. Open the portal link: ${portalUrl}
2. Log in with your email and temporary password.
3. Update your temporary password upon first login.
4. View ${cleanPatient}'s medications, vitals, and health reports.

Need assistance? Contact support at: ${senderEmail}
`;

    if (isSmtpConfigured) {
      const transporter = createTransporter();

      const info = await transporter.sendMail({
        from: `"Medikto Healthcare" <${senderEmail}>`,
        replyTo: senderEmail,
        to,
        subject: emailSubject,
        text: emailBodyText,
        html: emailBodyHtml
      });

      console.log(`[Email] Guardian web credentials dispatched to ${to}. ID:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[DEV EMAIL MOCK] Guardian web credentials for ${to}: Link: ${portalUrl}, Password: ${temporaryPassword}`);
      return { success: true, provider: "mock" };
    }
  } catch (err) {
    console.error("[Email Error] sendGuardianCredentials:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * =========================================================================
 * 1B. GUARDIAN ACCESS RE-GRANTED / CONNECTED EMAIL (FOR EXISTING USERS)
 * =========================================================================
 */
exports.sendGuardianAccessGrantedEmail = async (
  to,
  guardianName,
  patientName,
  relation
) => {
  try {
    const isSmtpConfigured =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    const cleanPatient = patientName || "Patient";
    const cleanRelation = relation || "Guardian";
    const emailSubject = `Access Granted - Connected to ${cleanPatient} on Medikto`;
    const senderEmail = getSenderEmail();

    const infoCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:20px; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px;">
        <tr>
          <td style="padding:16px 20px; width:50%; vertical-align:top; border-right:1px solid #E2E8F0;">
            <span style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748B; margin-bottom:4px;">
              CONNECTED PATIENT
            </span>
            <span style="display:block; font-size:16px; font-weight:700; color:#0F172A;">
              ${cleanPatient}
            </span>
          </td>
          <td style="padding:16px 20px; width:50%; vertical-align:top;">
            <span style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748B; margin-bottom:4px;">
              RELATIONSHIP
            </span>
            <span style="display:inline-block; padding:2px 10px; background-color:#EFF6FF; border:1px solid #DBEAFE; border-radius:6px; font-size:14px; font-weight:700; color:#1D4ED8;">
              ${cleanRelation}
            </span>
          </td>
        </tr>
      </table>
    `;

    const credentialsNoticeHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:24px; background-color:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="padding:16px 20px;">
            <span style="display:block; font-size:13px; font-weight:700; color:#166534; margin-bottom:4px;">
              &#10003; Existing Account Active
            </span>
            <p style="margin:0; font-size:14px; color:#14532D; line-height:1.5;">
              You can log in to the Medikto mobile app with your registered email (<strong>${to}</strong>) and your <strong>existing password</strong>.
            </p>
          </td>
        </tr>
      </table>
    `;

    const nextStepsHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:24px;">
        <tr>
          <td style="padding-bottom:10px;">
            <span style="font-size:13px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.5px;">
              Next Steps
            </span>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px;">
              <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="width:24px; vertical-align:middle; text-align:center; padding-right:12px;">
                        <span style="display:inline-block; width:22px; height:22px; background-color:#2563EB; color:#FFFFFF; border-radius:50%; font-size:12px; font-weight:700; line-height:22px; text-align:center;">1</span>
                      </td>
                      <td style="vertical-align:middle; font-size:14px; font-weight:500; color:#334155;">
                        Open the Medikto mobile app
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="width:24px; vertical-align:middle; text-align:center; padding-right:12px;">
                        <span style="display:inline-block; width:22px; height:22px; background-color:#2563EB; color:#FFFFFF; border-radius:50%; font-size:12px; font-weight:700; line-height:22px; text-align:center;">2</span>
                      </td>
                      <td style="vertical-align:middle; font-size:14px; font-weight:500; color:#334155;">
                        Log in using your existing email and password
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="width:24px; vertical-align:middle; text-align:center; padding-right:12px;">
                        <span style="display:inline-block; width:22px; height:22px; background-color:#2563EB; color:#FFFFFF; border-radius:50%; font-size:12px; font-weight:700; line-height:22px; text-align:center;">3</span>
                      </td>
                      <td style="vertical-align:middle; font-size:14px; font-weight:500; color:#334155;">
                        View ${cleanPatient}'s medication schedule, vital signs, and health updates
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const emailBodyHtml = generateEmailTemplate({
      headerBadge: "CARETAKER ACCESS",
      headerTitle: "Access Connected",
      headerSubtitle: `You are connected to ${cleanPatient}'s profile`,
      greetingName: `Hello ${guardianName || "Guardian"},`,
      bodyParagraph: `<strong>${cleanPatient}</strong> has connected you as their <strong>${cleanRelation}</strong> on the Medikto platform. You have secure, view-only access to monitor their health records.`,
      infoCardHtml,
      credentialsCardHtml: credentialsNoticeHtml,
      nextStepsHtml,
      ctaButtonHtml: ""
    });

    const emailBodyText = `Hello ${guardianName || "Guardian"},

${cleanPatient} has connected you as their ${cleanRelation} on Medikto.

You can log in to the Medikto mobile application using your registered email (${to}) and your existing password.

Next Steps:
1. Open the Medikto mobile app.
2. Log in with your existing password.
3. Access ${cleanPatient}'s permitted health records and updates.

Need help? Contact support at: ${senderEmail}
`;

    if (isSmtpConfigured) {
      const transporter = createTransporter();

      const info = await transporter.sendMail({
        from: `"Medikto Healthcare" <${senderEmail}>`,
        replyTo: senderEmail,
        to,
        subject: emailSubject,
        text: emailBodyText,
        html: emailBodyHtml
      });

      console.log(`[Email] Guardian access re-granted notice sent to ${to}. ID:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[DEV EMAIL MOCK] Guardian access re-granted notice for ${to}`);
      return { success: true, provider: "mock" };
    }
  } catch (err) {
    console.error("[Email Error] sendGuardianAccessGrantedEmail:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * =========================================================================
 * 2. HOSPITAL ADMIN CREDENTIALS EMAIL
 * =========================================================================
 */
exports.sendHospitalAdminCredentials = async (
  to,
  adminName,
  hospitalName,
  temporaryPassword
) => {
  try {
    const isSmtpConfigured =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    const emailSubject = `Your Medikto Hospital Admin Account - ${hospitalName}`;
    const senderEmail = getSenderEmail();
    const adminPortalUrl = process.env.ADMIN_URL || "https://admin.medikto.com";

    const infoCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:20px; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px;">
        <tr>
          <td style="padding:16px 20px; width:50%; vertical-align:top; border-right:1px solid #E2E8F0;">
            <span style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748B; margin-bottom:4px;">
              HOSPITAL / CLINIC
            </span>
            <span style="display:block; font-size:16px; font-weight:700; color:#0F172A;">
              ${hospitalName}
            </span>
          </td>
          <td style="padding:16px 20px; width:50%; vertical-align:top;">
            <span style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748B; margin-bottom:4px;">
              ADMINISTRATOR
            </span>
            <span style="display:block; font-size:15px; font-weight:700; color:#0F172A;">
              ${adminName}
            </span>
          </td>
        </tr>
      </table>
    `;

    const credentialsCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:24px; background-color:#FFFFFF; border:1px solid #BFDBFE; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="padding:12px 20px; background-color:#EFF6FF; border-bottom:1px solid #DBEAFE;">
            <span style="font-size:12px; font-weight:700; color:#1E40AF; text-transform:uppercase; letter-spacing:0.5px;">
              &#128274; Portal Credentials
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding-bottom:14px; border-bottom:1px solid #F1F5F9;">
                  <span style="display:block; font-size:12px; color:#64748B; margin-bottom:3px;">Portal Email</span>
                  <span style="display:block; font-size:15px; font-weight:600; color:#0F172A;">${to}</span>
                </td>
              </tr>
              <tr>
                <td style="padding-top:14px;">
                  <span style="display:block; font-size:12px; color:#64748B; margin-bottom:6px;">Temporary Password</span>
                  <div style="display:inline-block; padding:8px 18px; background-color:#F8FAFC; border:1px dashed #2563EB; border-radius:8px;">
                    <span style="font-family:'Courier New', Courier, monospace; font-size:20px; font-weight:800; color:#1D4ED8; letter-spacing:1.5px;">
                      ${temporaryPassword}
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const ctaButtonHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px auto;">
        <tr>
          <td align="center">
            <a href="${adminPortalUrl}" target="_blank" style="display:inline-block; padding:12px 32px; background-color:#2563EB; color:#FFFFFF; font-family:'Segoe UI', Arial, sans-serif; font-size:15px; font-weight:700; text-decoration:none; border-radius:8px;">
              Open Admin Portal
            </a>
          </td>
        </tr>
      </table>
    `;

    const emailBodyHtml = generateEmailTemplate({
      headerBadge: "HOSPITAL ADMIN",
      headerTitle: "Welcome to Medikto",
      headerSubtitle: "Your Hospital Admin Account is Ready",
      greetingName: `Hello ${adminName},`,
      bodyParagraph: `Your hospital administrator account for <strong>${hospitalName}</strong> has been configured. You can now log in to the admin portal to manage patients, staff, and medical records.`,
      infoCardHtml,
      credentialsCardHtml,
      nextStepsHtml: "",
      ctaButtonHtml
    });

    const emailBodyText = `Welcome to Medikto, ${adminName}!

Your hospital admin account for ${hospitalName} is ready.

Login Credentials:
Portal URL: ${adminPortalUrl}
Email: ${to}
Temporary Password: ${temporaryPassword}

Please log in and update your password immediately.
Support: ${senderEmail}
`;

    if (isSmtpConfigured) {
      const transporter = createTransporter();

      const info = await transporter.sendMail({
        from: `"Medikto Healthcare" <${senderEmail}>`,
        replyTo: senderEmail,
        to,
        subject: emailSubject,
        text: emailBodyText,
        html: emailBodyHtml
      });

      console.log(`[Email] Hospital admin credentials sent to ${to}. ID:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[DEV EMAIL MOCK] Hospital admin credentials for ${to}`);
      return { success: true, provider: "mock" };
    }
  } catch (err) {
    console.error("[Email Error] sendHospitalAdminCredentials:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * =========================================================================
 * 3. CARETAKER INVITATION EMAIL
 * =========================================================================
 */
exports.sendInviteEmail = async (to, patientName, relation) => {
  try {
    const isSmtpConfigured =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    const emailSubject = `Medikto Access Invite from ${patientName || "Patient"}`;
    const senderEmail = getSenderEmail();
    const cleanPatient = patientName || "A patient";
    const cleanRelation = relation || "Caretaker";

    const infoCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:24px; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px;">
        <tr>
          <td style="padding:16px 20px; width:50%; vertical-align:top; border-right:1px solid #E2E8F0;">
            <span style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748B; margin-bottom:4px;">
              INVITING PATIENT
            </span>
            <span style="display:block; font-size:16px; font-weight:700; color:#0F172A;">
              ${cleanPatient}
            </span>
          </td>
          <td style="padding:16px 20px; width:50%; vertical-align:top;">
            <span style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748B; margin-bottom:4px;">
              RELATIONSHIP
            </span>
            <span style="display:inline-block; padding:2px 10px; background-color:#EFF6FF; border:1px solid #DBEAFE; border-radius:6px; font-size:14px; font-weight:700; color:#1D4ED8;">
              ${cleanRelation}
            </span>
          </td>
        </tr>
      </table>
    `;

    const emailBodyHtml = generateEmailTemplate({
      headerBadge: "CARETAKER INVITATION",
      headerTitle: "Medikto Access Invitation",
      headerSubtitle: "Connect to Patient Health Records",
      greetingName: "Hello,",
      bodyParagraph: `<strong>${cleanPatient}</strong> has invited you as their <strong>${cleanRelation}</strong> on the Medikto health platform. You will be able to stay informed about their health updates, medications, and wellness records.`,
      infoCardHtml,
      credentialsCardHtml: "",
      nextStepsHtml: `
        <div style="padding:16px; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; margin-bottom:20px; font-size:14px; color:#475569; line-height:1.6;">
          Download the Medikto mobile app and register or log in using <strong>${to}</strong> to automatically connect to ${cleanPatient}'s profile.
        </div>
      `,
      ctaButtonHtml: ""
    });

    const emailBodyText = `Hello,

${cleanPatient} has invited you as their ${cleanRelation} to monitor their health records on the Medikto mobile application.

To get started:
1. Download the Medikto app on your smartphone.
2. Sign up or log in using this email address: ${to}
3. You will have view-only access to help support their healthcare journey.

Need help? Contact: ${senderEmail}
`;

    if (isSmtpConfigured) {
      const transporter = createTransporter();

      const info = await transporter.sendMail({
        from: `"Medikto Healthcare" <${senderEmail}>`,
        replyTo: senderEmail,
        to,
        subject: emailSubject,
        text: emailBodyText,
        html: emailBodyHtml
      });

      console.log(`[Email] Caretaker invite sent to ${to}. ID:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[DEV EMAIL MOCK] Caretaker invite for ${to}`);
      return { success: true, provider: "mock" };
    }
  } catch (err) {
    console.error("[Email Error] sendInviteEmail:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * =========================================================================
 * 4. SEND ISSUE REPORT EMAIL TO SUPPORT
 * =========================================================================
 */
exports.sendIssueReportEmail = async ({
  userId,
  userName,
  userEmail,
  userPhone,
  userRole,
  category,
  description,
  appVersion,
  platform
}) => {
  try {
    const supportDestination = "shahmedikto@gmail.com";
    const emailSubject = `[Medikto Support Issue] - ${category || "General Inquiry"} - ${userName || "User"}`;
    const senderEmail = getSenderEmail();

    const infoCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:16px; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 10px 0; font-size:14px; font-weight:700; color:#0F172A;">User & Device Details:</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; font-size:13px; color:#475569;">
              <tr><td style="padding:4px 0; width:130px; font-weight:600;">Name:</td><td style="padding:4px 0;">${userName || "N/A"}</td></tr>
              <tr><td style="padding:4px 0; font-weight:600;">User ID:</td><td style="padding:4px 0;">${userId || "N/A"}</td></tr>
              <tr><td style="padding:4px 0; font-weight:600;">Email:</td><td style="padding:4px 0;">${userEmail || "N/A"}</td></tr>
              <tr><td style="padding:4px 0; font-weight:600;">Phone:</td><td style="padding:4px 0;">${userPhone || "N/A"}</td></tr>
              <tr><td style="padding:4px 0; font-weight:600;">Role:</td><td style="padding:4px 0;">${userRole || "patient"}</td></tr>
              <tr><td style="padding:4px 0; font-weight:600;">Category:</td><td style="padding:4px 0; color:#2563EB; font-weight:600;">${category || "General"}</td></tr>
              <tr><td style="padding:4px 0; font-weight:600;">Platform / App:</td><td style="padding:4px 0;">${platform || "Mobile"} / v${appVersion || "1.0.0"}</td></tr>
              <tr><td style="padding:4px 0; font-weight:600;">Submitted:</td><td style="padding:4px 0;">${new Date().toISOString()}</td></tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const descriptionCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-bottom:20px; background-color:#EFF6FF; border:1px solid #BFDBFE; border-radius:12px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 6px 0; font-size:13px; font-weight:700; color:#1E40AF;">Issue Description:</p>
            <p style="margin:0; font-size:14px; color:#0F172A; line-height:1.6; white-space:pre-wrap;">${description || "No description provided."}</p>
          </td>
        </tr>
      </table>
    `;

    const emailBodyHtml = generateEmailTemplate({
      headerBadge: "USER REPORT",
      headerTitle: "Support Issue Ticket",
      headerSubtitle: "New inquiry from Medikto App",
      greetingName: "Support Team,",
      bodyParagraph: `A user has submitted an issue report from the mobile application. Full details are attached below:`,
      infoCardHtml,
      credentialsCardHtml: descriptionCardHtml,
      nextStepsHtml: "",
      ctaButtonHtml: ""
    });

    const emailBodyText = `New Support Ticket from ${userName || "User"}:
Category: ${category || "General"}
User Email: ${userEmail || "N/A"}
Phone: ${userPhone || "N/A"}
Role: ${userRole || "patient"}
Platform: ${platform || "Mobile"} v${appVersion || "1.0.0"}

Description:
${description}
`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = createTransporter();

      const info = await transporter.sendMail({
        from: `"Medikto App Support" <${senderEmail}>`,
        replyTo: userEmail || senderEmail,
        to: supportDestination,
        subject: emailSubject,
        text: emailBodyText,
        html: emailBodyHtml
      });

      console.log(`[Email] Support ticket dispatched. ID:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[DEV EMAIL MOCK] Support issue ticket for ${supportDestination}`);
      return { success: true, provider: "mock" };
    }
  } catch (err) {
    console.error("[Email Error] sendIssueReportEmail:", err.message);
    return { success: false, error: err.message };
  }
};