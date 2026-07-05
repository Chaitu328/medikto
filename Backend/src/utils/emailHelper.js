const nodemailer = require("nodemailer");

/**
 * ===========================================
 * MEDIKTO EMAIL TEMPLATE SYSTEM
 * Premium Healthcare Email Templates
 * Table-based layout with inline CSS only
 * Compatible with Gmail, Outlook, Yahoo, Apple Mail
 * ===========================================
 */

/**
 * Generates the reusable Medikto email template wrapper.
 * All emails share the same design, only content changes.
 * 
 * @param {string} headerTitle - "Welcome to Medikto"
 * @param {string} headerSubtitle - Dynamic subtitle
 * @param {string} greetingName - "Hello {{NAME}}"
 * @param {string} bodyParagraph - Main body paragraph
 * @param {string} infoCardHtml - Info card HTML (patient/relation or hospital info)
 * @param {string} credentialsCardHtml - Credentials or invitation steps card
 * @param {string} nextStepsHtml - Next steps checklist
 * @param {string} ctaButtonHtml - Primary CTA button
 * @param {string} footerNote - Optional footer note (e.g. invitation-specific)
 */
const generateEmailTemplate = (headerTitle, headerSubtitle, greetingName, bodyParagraph, infoCardHtml, credentialsCardHtml, nextStepsHtml, ctaButtonHtml, footerNote = "") => {
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
<body style="margin:0; padding:0; background-color:#F4F6F9; font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background-color:#F4F6F9;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="border-collapse:collapse; width:600px; max-width:600px; background-color:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header / Hero Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); background-color:#2563EB; padding:0; text-align:center; border-radius:16px 16px 0 0;">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:180px;" fillcolor="#2563EB">
                <v:fill type="gradient" color="#2563EB" color2="#1E40AF" angle="135"/>
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td align="center" style="padding:36px 32px 28px 32px;">
                    <!-- Logo Circle -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; margin:0 auto;">
                      <tr>
                        <td style="width:72px; height:72px; background-color:#FFFFFF; border-radius:50%; text-align:center; vertical-align:middle; box-shadow:0 4px 16px rgba(0,0,0,0.12);">
                          <img src="{{LOGO_URL}}" alt="Medikto" width="40" height="40" style="display:block; border:0; outline:none; text-decoration:none; margin:0 auto;" />
                        </td>
                      </tr>
                    </table>
                    <!-- Header Title -->
                    <h1 style="margin:20px 0 6px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:26px; font-weight:700; color:#FFFFFF; letter-spacing:-0.3px; line-height:1.2;">${headerTitle}</h1>
                    <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:400; color:rgba(255,255,255,0.85); line-height:1.5;">${headerSubtitle}</p>
                  </td>
                </tr>
              </table>
              <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 40px 0 40px;">
              <!-- Greeting -->
              <h2 style="margin:0 0 12px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:22px; font-weight:700; color:#1E293B; letter-spacing:-0.3px; line-height:1.3;">${greetingName}</h2>
              <p style="margin:0 0 28px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:400; color:#475569; line-height:1.7;">${bodyParagraph}</p>

              <!-- Info Card -->
              ${infoCardHtml}

              <!-- Credentials / Invitation Card -->
              ${credentialsCardHtml}

              <!-- Next Steps -->
              ${nextStepsHtml}

              <!-- CTA Button -->
              ${ctaButtonHtml}

              <!-- Footer Note -->
              ${footerNote}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px 24px 40px; background-color:#F8FAFC; border-top:1px solid #E2E8F0; border-radius:0 0 16px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding-bottom:16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding-right:8px; vertical-align:middle;">
                          <img src="{{LOGO_URL}}" alt="Medikto" width="28" height="28" style="display:block; border:0;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; font-weight:700; color:#2563EB; letter-spacing:-0.2px;">Medikto</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:400; color:#94A3B8; line-height:1.6;">
                      &copy; 2026 Medikto Healthcare Platform. All rights reserved.<br/>
                      This is an automated email. Please do not reply to this message.<br/>
                      Need help? Contact us at <a href="mailto:support@medikto.com" style="color:#2563EB; text-decoration:none; font-weight:500;">support@medikto.com</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding-right:12px;">
                          <a href="#" style="display:inline-block; width:28px; height:28px; background-color:#E2E8F0; border-radius:50%; text-align:center; vertical-align:middle; text-decoration:none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="14" height="14" style="display:inline-block; border:0; margin-top:7px;" />
                          </a>
                        </td>
                        <td style="padding-right:12px;">
                          <a href="#" style="display:inline-block; width:28px; height:28px; background-color:#E2E8F0; border-radius:50%; text-align:center; vertical-align:middle; text-decoration:none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="14" height="14" style="display:inline-block; border:0; margin-top:7px;" />
                          </a>
                        </td>
                        <td>
                          <a href="#" style="display:inline-block; width:28px; height:28px; background-color:#E2E8F0; border-radius:50%; text-align:center; vertical-align:middle; text-decoration:none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn" width="14" height="14" style="display:inline-block; border:0; margin-top:7px;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Main Container -->
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * ===========================================
 * 1. GUARDIAN CREDENTIALS EMAIL
 * ===========================================
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

    const emailSubject = "Your Medikto Guardian Account";

    const infoCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 24px 0; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="width:50%; padding-right:12px; vertical-align:top;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:40px; height:40px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Patient" width="20" height="20" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">Patient</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:700; color:#1E293B;">${patientName}</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="width:50%; padding-left:12px; vertical-align:top; border-left:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:40px; height:40px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/681/681494.png" alt="Relation" width="20" height="20" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">Relation</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:700; color:#1E293B;">${relation}</p>
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

    const credentialsCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 24px 0; background-color:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr>
          <td style="padding:20px 24px 16px 24px; border-bottom:1px solid #E2E8F0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px; vertical-align:middle;">
                  <img src="https://cdn-icons-png.flaticon.com/512/2889/2889676.png" alt="Lock" width="18" height="18" style="display:block; border:0;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; color:#2563EB; letter-spacing:-0.2px;">Login Credentials</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding-bottom:16px; border-bottom:1px solid #F1F5F9;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:14px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:36px; height:36px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/542/542689.png" alt="Email" width="16" height="16" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8;">Email</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:600; color:#1E293B;">${to}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:14px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:36px; height:36px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/2889/2889676.png" alt="Password" width="16" height="16" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8;">Temporary Password</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:20px; font-weight:700; color:#2563EB; letter-spacing:1px;">${temporaryPassword}</p>
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

    const nextStepsHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 28px 0;">
        <tr>
          <td style="padding-bottom:12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px; vertical-align:middle;">
                  <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Check" width="18" height="18" style="display:block; border:0;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; color:#2563EB; letter-spacing:-0.2px;">Next Steps</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden;">
              <tr>
                <td style="padding:14px 20px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">Login to your Medikto Guardian Account</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">Change your temporary password for security</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">Start monitoring the patient's medications, vitals, reports and prescriptions</p>
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

    const ctaButtonHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 8px 0;">
        <tr>
          <td align="center" style="padding:0 0 32px 0;">
            <a href="#" style="display:inline-block; padding:14px 40px; background:linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); background-color:#2563EB; color:#FFFFFF; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:600; text-decoration:none; border-radius:10px; box-shadow:0 4px 14px rgba(37,99,235,0.3); letter-spacing:0.2px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding-right:8px; vertical-align:middle;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1828/1828817.png" alt="Open" width="16" height="16" style="display:block; border:0;" />
                  </td>
                  <td style="vertical-align:middle;">Open Medikto</td>
                </tr>
              </table>
            </a>
          </td>
        </tr>
      </table>
    `;

    const emailBody = generateEmailTemplate(
      "Welcome to Medikto",
      "Your Guardian Account is Ready",
      `Hello ${guardianName},`,
      `Your guardian account has been successfully created. You now have secure access to monitor your patient's health information through the Medikto platform.`,
      infoCardHtml,
      credentialsCardHtml,
      nextStepsHtml,
      ctaButtonHtml
    );

    if (isSmtpConfigured) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: `"Medikto" <${process.env.SMTP_USER}>`,
        to,
        subject: emailSubject,
        html: emailBody
      });
    } else {
      console.log("Guardian Email");
      console.log(emailBody);
    }

    return { success: true };

  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * ===========================================
 * 2. HOSPITAL ADMIN CREDENTIALS EMAIL
 * ===========================================
 */
exports.sendHospitalAdminCredentials = async (to, adminName, hospitalName, temporaryPassword) => {
  try {
    const isSmtpConfigured = 
      process.env.SMTP_HOST && 
      process.env.SMTP_PORT && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS;

    const emailSubject = `Your Medikto Hospital Admin Account - ${hospitalName}`;

    const infoCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 24px 0; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="width:50%; padding-right:12px; vertical-align:top;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:40px; height:40px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/2964/2964514.png" alt="Hospital" width="20" height="20" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">Hospital</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:700; color:#1E293B;">${hospitalName}</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="width:50%; padding-left:12px; vertical-align:top; border-left:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:40px; height:40px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Admin" width="20" height="20" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">Admin</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:700; color:#1E293B;">${adminName}</p>
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

    const credentialsCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 24px 0; background-color:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr>
          <td style="padding:20px 24px 16px 24px; border-bottom:1px solid #E2E8F0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px; vertical-align:middle;">
                  <img src="https://cdn-icons-png.flaticon.com/512/2889/2889676.png" alt="Lock" width="18" height="18" style="display:block; border:0;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; color:#2563EB; letter-spacing:-0.2px;">Login Credentials</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding-bottom:16px; border-bottom:1px solid #F1F5F9;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:14px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:36px; height:36px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/542/542689.png" alt="Email" width="16" height="16" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8;">Email</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:600; color:#1E293B;">${to}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:14px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:36px; height:36px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/2889/2889676.png" alt="Password" width="16" height="16" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8;">Temporary Password</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:20px; font-weight:700; color:#2563EB; letter-spacing:1px;">${temporaryPassword}</p>
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

    const nextStepsHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 28px 0;">
        <tr>
          <td style="padding-bottom:12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px; vertical-align:middle;">
                  <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Check" width="18" height="18" style="display:block; border:0;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; color:#2563EB; letter-spacing:-0.2px;">Next Steps</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden;">
              <tr>
                <td style="padding:14px 20px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">Log in to your admin portal using the credentials above</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">Change your temporary password immediately for security</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">Set up your hospital profile and manage hospital operations</p>
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

    const ctaButtonHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 8px 0;">
        <tr>
          <td align="center" style="padding:0 0 32px 0;">
            <a href="#" style="display:inline-block; padding:14px 40px; background:linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); background-color:#2563EB; color:#FFFFFF; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:600; text-decoration:none; border-radius:10px; box-shadow:0 4px 14px rgba(37,99,235,0.3); letter-spacing:0.2px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding-right:8px; vertical-align:middle;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1828/1828817.png" alt="Open" width="16" height="16" style="display:block; border:0;" />
                  </td>
                  <td style="vertical-align:middle;">Open Admin Portal</td>
                </tr>
              </table>
            </a>
          </td>
        </tr>
      </table>
    `;

    const emailBody = generateEmailTemplate(
      "Welcome to Medikto",
      "Your Hospital Admin Account is Ready",
      `Hello ${adminName},`,
      `Your hospital admin account has been successfully created for <strong style="color:#1E293B;">${hospitalName}</strong>. You now have secure access to manage hospital operations, staff, and patient records through the Medikto platform.`,
      infoCardHtml,
      credentialsCardHtml,
      nextStepsHtml,
      ctaButtonHtml
    );

    if (isSmtpConfigured) {
      console.log(`Sending hospital admin credentials email to ${to} via SMTP...`);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: `"Medikto Care" <${process.env.SMTP_USER}>`,
        to: to,
        subject: emailSubject,
        html: emailBody
      });

      console.log("Hospital admin credentials email sent successfully. Message ID:", info.messageId);
      return { success: true, provider: "smtp", messageId: info.messageId };
    }

    console.log(`\n======================================================`);
    console.log(`[DEV EMAIL LOG] Hospital Admin Credentials dispatch:`);
    console.log(`[DEV EMAIL LOG] To: ${to}`);
    console.log(`[DEV EMAIL LOG] Subject: ${emailSubject}`);
    console.log(`[DEV EMAIL LOG] Admin Name: ${adminName}`);
    console.log(`[DEV EMAIL LOG] Hospital: ${hospitalName}`);
    console.log(`[DEV EMAIL LOG] Temporary Password: ${temporaryPassword}`);
    console.log(`======================================================\n`);
    return { success: true, provider: "mock" };

  } catch (err) {
    console.error("Email Dispatch Helper Error:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * ===========================================
 * 3. CARETAKER INVITATION EMAIL
 * ===========================================
 */
exports.sendInviteEmail = async (to, patientName, relation) => {
  try {
    const isSmtpConfigured = 
      process.env.SMTP_HOST && 
      process.env.SMTP_PORT && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS;

    const emailSubject = `Medikto Access Invite from ${patientName}`;

    const infoCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 24px 0; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="width:50%; padding-right:12px; vertical-align:top;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:40px; height:40px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Patient" width="20" height="20" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">Patient</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:700; color:#1E293B;">${patientName}</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="width:50%; padding-left:12px; vertical-align:top; border-left:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:40px; height:40px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/681/681494.png" alt="Relation" width="20" height="20" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">Relation</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:700; color:#1E293B;">${relation}</p>
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

    const credentialsCardHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 24px 0; background-color:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr>
          <td style="padding:20px 24px 16px 24px; border-bottom:1px solid #E2E8F0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px; vertical-align:middle;">
                  <img src="https://cdn-icons-png.flaticon.com/512/2964/2964514.png" alt="App" width="18" height="18" style="display:block; border:0;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; color:#2563EB; letter-spacing:-0.2px;">Get Started with Medikto</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding-bottom:16px; border-bottom:1px solid #F1F5F9;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:14px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:36px; height:36px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/2926/2926319.png" alt="Download" width="16" height="16" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8;">Step 1</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:600; color:#1E293B;">Download the Medikto App</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px; border-bottom:1px solid #F1F5F9;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:14px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:36px; height:36px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/542/542689.png" alt="Email" width="16" height="16" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8;">Step 2</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:600; color:#1E293B;">Register using <strong style="color:#2563EB;">${to}</strong></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:14px; vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:36px; height:36px; background-color:#EFF6FF; border-radius:50%; text-align:center;">
                          <tr>
                            <td style="vertical-align:middle; text-align:center;">
                              <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Accept" width="16" height="16" style="display:inline-block; border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 2px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; color:#94A3B8;">Step 3</p>
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:600; color:#1E293B;">Accept the invitation automatically</p>
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

    const nextStepsHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 28px 0;">
        <tr>
          <td style="padding-bottom:12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px; vertical-align:middle;">
                  <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Check" width="18" height="18" style="display:block; border:0;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; color:#2563EB; letter-spacing:-0.2px;">What You'll Get Access To</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden;">
              <tr>
                <td style="padding:14px 20px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">View-only access to daily medications compliance</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px; border-bottom:1px solid #E2E8F0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">Monitor vitals logs and health trends in real-time</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px; vertical-align:middle;">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Done" width="18" height="18" style="display:block; border:0;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; font-weight:500; color:#334155;">Access prescriptions and health reports securely</p>
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

    const ctaButtonHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 8px 0;">
        <tr>
          <td align="center" style="padding:0 0 32px 0;">
            <a href="#" style="display:inline-block; padding:14px 40px; background:linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); background-color:#2563EB; color:#FFFFFF; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; font-weight:600; text-decoration:none; border-radius:10px; box-shadow:0 4px 14px rgba(37,99,235,0.3); letter-spacing:0.2px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding-right:8px; vertical-align:middle;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2926/2926319.png" alt="Download" width="16" height="16" style="display:block; border:0;" />
                  </td>
                  <td style="vertical-align:middle;">Download Medikto</td>
                </tr>
              </table>
            </a>
          </td>
        </tr>
      </table>
    `;

    const footerNote = `
      <p style="margin:0 0 8px 0; font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:13px; font-weight:400; color:#64748B; line-height:1.6; text-align:center;">
        As an observer, you will have secure, view-only access to monitor health records from your own device.
      </p>
    `;

    const emailBody = generateEmailTemplate(
      "Welcome to Medikto",
      "You Have Been Invited",
      "Hello,",
      `<strong style="color:#1E293B;">${patientName}</strong> has invited you as their caretaker/relative (<strong style="color:#1E293B;">${relation}</strong>) to monitor their health records on the <strong style="color:#1E293B;">Medikto</strong> platform.`,
      infoCardHtml,
      credentialsCardHtml,
      nextStepsHtml,
      ctaButtonHtml,
      footerNote
    );

    if (isSmtpConfigured) {
      console.log(`Sending invite email to ${to} via SMTP...`);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: `"Medikto Care" <${process.env.SMTP_USER}>`,
        to: to,
        subject: emailSubject,
        html: emailBody
      });

      console.log("Email invitation sent successfully. Message ID:", info.messageId);
      return { success: true, provider: "smtp", messageId: info.messageId };
    }

    console.log(`\n======================================================`);
    console.log(`[DEV EMAIL LOG] Invitation dispatch:`);
    console.log(`[DEV EMAIL LOG] To: ${to}`);
    console.log(`[DEV EMAIL LOG] Subject: ${emailSubject}`);
    console.log(`[DEV EMAIL LOG] Content: ${patientName} invited you as a ${relation}.`);
    console.log(`======================================================\n`);
    return { success: true, provider: "mock" };

  } catch (err) {
    console.error("Email Dispatch Helper Error:", err.message);
    return { success: false, error: err.message };
  }
};