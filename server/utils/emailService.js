import nodemailer from 'nodemailer'

/**
 * Create a Nodemailer transporter using Gmail SMTP
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in .env
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })
}

/**
 * Send a password reset email with a styled HTML template
 * @param {string} toEmail - Recipient email address
 * @param {string} resetUrl - Full reset link URL
 * @param {string} userName - Recipient's display name
 */
export const sendPasswordResetEmail = async (toEmail, resetUrl, userName) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: `"Key Craft Shop" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🔑 รีเซ็ตรหัสผ่าน Key Craft Shop',
    html: `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:36px 32px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">⌨️</div>
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Key Craft Shop</h1>
              <p style="color:#e9d5ff;margin:6px 0 0;font-size:13px;">รีเซ็ตรหัสผ่านของคุณ</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="color:#1e1b4b;font-size:15px;font-weight:700;margin:0 0 8px;">สวัสดี, ${userName}!</p>
              <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 24px;">
                เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ<br/>
                คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:28px 0;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;padding:14px 36px;border-radius:999px;box-shadow:0 4px 16px rgba(124,58,237,0.30);">
                  🔑 ตั้งรหัสผ่านใหม่
                </a>
              </div>

              <!-- Warning box -->
              <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:12px;padding:14px 18px;margin:24px 0;">
                <p style="color:#92400e;font-size:12px;margin:0;font-weight:600;">
                  ⚠️ ลิงก์นี้จะหมดอายุใน <strong>1 ชั่วโมง</strong><br/>
                  หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยต่ออีเมลนี้
                </p>
              </div>

              <!-- Fallback link -->
              <p style="color:#94a3b8;font-size:11px;margin:16px 0 0;">
                หากปุ่มด้านบนไม่ทำงาน ให้คัดลอกลิงก์นี้:<br/>
                <a href="${resetUrl}" style="color:#7c3aed;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f5ff;padding:20px 32px;text-align:center;border-top:1px solid #ede9fe;">
              <p style="color:#a78bfa;font-size:11px;margin:0;">
                © 2026 Key Craft Shop · อีเมลนี้ส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  await transporter.sendMail(mailOptions)
  console.log(`📧 [Password Reset Email Sent]: ${toEmail}`)
}
