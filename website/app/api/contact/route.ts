import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, description } = body;

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: 'Name, Contact Number, and Email are required.' },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER || 'healthreportsapp7@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'cqvxqlydhbgteeau';
    const supportEmail = 'shahmedikto@gmail.com';

    const emailSubject = `[Medikto Public Inquiry] New Message from ${name}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${emailSubject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 24px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #006591 0%, #0ea5e9 100%); padding: 32px 28px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Medikto Health Platform</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">New Public Website Contact Form Submission</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Inquiry Details</h2>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569; width: 140px; font-size: 13px;">Full Name</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; font-size: 14px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569; font-size: 13px;">Contact Number</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #006591; font-weight: 600; font-size: 14px;">
                    <a href="tel:${phone}" style="color: #006591; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569; font-size: 13px;">Email Address</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #006591; font-weight: 600; font-size: 14px;">
                    <a href="mailto:${email}" style="color: #006591; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; font-size: 13px;">Submitted At</td>
                  <td style="padding: 12px 16px; color: #64748b; font-size: 13px;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST</td>
                </tr>
              </table>

              <h3 style="color: #0f172a; margin: 0 0 8px 0; font-size: 15px; font-weight: 700;">Message / Description</h3>
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; color: #0369a1; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                ${description && description.trim() ? description : '<em>No additional description provided.</em>'}
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
              © 2026 Medikto Health Platform. This message was submitted via the official public website contact form.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Initialize transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send email to support and primary admin
    await transporter.sendMail({
      from: `"Medikto Web Inquiry" <${smtpUser}>`,
      to: `${supportEmail}, ${smtpUser}`,
      replyTo: email,
      subject: emailSubject,
      html: htmlContent,
    });

    console.log(`[CONTACT FORM] Email successfully dispatched for ${name} (${email}, ${phone})`);

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Our team will contact you shortly.',
    });
  } catch (error: any) {
    console.error('[CONTACT API ERROR]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send your inquiry. Please try again or reach out to support directly.' },
      { status: 500 }
    );
  }
}
