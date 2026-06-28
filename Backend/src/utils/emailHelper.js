const nodemailer = require("nodemailer");

/**
 * Sends a caretaker invitation email using nodemailer (or fallback console logger).
 * 
 * @param {string} to Email address of the caretaker (relative).
 * @param {string} patientName Full name of the patient inviter.
 * @param {string} relation Relationship of the caretaker to the patient.
 */
exports.sendInviteEmail = async (to, patientName, relation) => {
  try {
    const isSmtpConfigured = 
      process.env.SMTP_HOST && 
      process.env.SMTP_PORT && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS;

    const emailSubject = `Medikto Access Invite from ${patientName}`;
    const emailBody = `
      <h3>Hello,</h3>
      <p><strong>${patientName}</strong> has invited you as their caretaker/relative (<strong>${relation}</strong>) to monitor their health records on the <strong>Medikto</strong> application.</p>
      <p>As an observer, you will have secure, view-only access to monitor their daily medications compliance, vitals logs, prescriptions, and health reports from your own device.</p>
      <p>To accept this invitation and get started:</p>
      <ol>
        <li>Download the <strong>Medikto</strong> mobile application.</li>
        <li>Register a new account using this email address: <strong>${to}</strong>.</li>
        <li>Once registered, your account will automatically connect to ${patientName}'s dashboard.</li>
      </ol>
      <br/>
      <p>Best regards,<br/>The Medikto Team</p>
    `;

    if (isSmtpConfigured) {
      console.log(`Sending invite email to ${to} via SMTP...`);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
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

    // Dev Fallback console logging
    console.log(`\n======================================================`);
    console.log(`[DEV EMAIL LOG] Invitation dispatch:`);
    console.log(`[DEV EMAIL LOG] To: ${to}`);
    console.log(`[DEV EMAIL LOG] Subject: ${emailSubject}`);
    console.log(`[DEV EMAIL LOG] Content: ${patientName} invited you as a ${relation}.`);
    console.log(`======================================================\n`);
    return { success: true, provider: "mock" };

  } catch (err) {
    console.error("Email Dispatch Helper Error:", err.message);
    // Do not crash the parent process if email fails, return error details
    return { success: false, error: err.message };
  }
};
