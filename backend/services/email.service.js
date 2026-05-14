const nodemailer = require("nodemailer");

function getVerificationEmailHtml({ firstName, verifyUrl }) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#1f1f1f;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e0c2;">
                <tr>
                  <td style="background:#111111;padding:28px 32px;border-bottom:4px solid #f6c744;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.25;">Golden Gatherings</h1>
                    <p style="margin:8px 0 0;color:#f6c744;font-size:12px;letter-spacing:2px;text-transform:uppercase;">University of Santo Tomas</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 12px;font-size:20px;color:#111111;">Verify your Thomasian account</h2>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">Hi ${firstName},</p>
                    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
                      Thank you for registering with Golden Gatherings. Please verify your UST email address to activate your account.
                    </p>
                    <p style="margin:0 0 28px;">
                      <a href="${verifyUrl}" style="display:inline-block;background:#f6c744;color:#111111;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:2px;letter-spacing:1px;text-transform:uppercase;font-size:12px;">
                        Verify Account
                      </a>
                    </p>
                    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#555555;">
                      This verification link expires in 1 hour. If the button does not work, copy this link into your browser:
                    </p>
                    <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.6;color:#7a5b00;">${verifyUrl}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px;background:#faf8ef;color:#6b6250;font-size:12px;line-height:1.5;">
                    If you did not create this account, you can safely ignore this message.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function createTransporter() {
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, "") : "";
  const hasEmailCredentials =
    process.env.EMAIL_USER &&
    emailPass &&
    process.env.EMAIL_USER !== "your-email@gmail.com" &&
    emailPass !== "your-app-password";

  if (!hasEmailCredentials) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASS must be set to real Gmail credentials. Use a 16-character Gmail App Password, not your normal Gmail password."
    );
  }

  if (emailPass.length !== 16) {
    throw new Error(
      "EMAIL_PASS must be a 16-character Gmail App Password after removing spaces. Do not use the normal Gmail account password."
    );
  }

  console.info("[email] Creating Gmail transporter", {
    user: process.env.EMAIL_USER,
    passLength: emailPass.length,
    appPasswordFormatLooksValid: emailPass.length === 16,
  });

  return nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: emailPass,
    },
  });
}

async function sendVerificationEmail({ to, firstName, token }) {
  const clientUrl = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email/${token}`;

  console.info("[email] Sending verification email started", { to });
  console.info("[email] Verification token:", token);
  console.info("[email] Verification URL:", verifyUrl);

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Golden Gatherings UST" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify your Golden Gatherings account",
      html: getVerificationEmailHtml({ firstName, verifyUrl }),
    });

    console.info("[email] Verification email sent successfully", {
      to,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    if (info.message) {
      console.info("[email] JSON transport message:", info.message);
    }

    return info;
  } catch (error) {
    console.error("[email] Verification email failed:", error);
    throw error;
  }
}

async function sendTestEmail({ to }) {
  console.info("[email] Sending test email started", { to });

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Golden Gatherings UST" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Golden Gatherings test email",
      text: "This is a test email from the Golden Gatherings backend.",
      html: "<p>This is a test email from the Golden Gatherings backend.</p>",
    });

    console.info("[email] Test email sent successfully", {
      to,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    if (info.message) {
      console.info("[email] JSON transport message:", info.message);
    }

    return info;
  } catch (error) {
    console.error("[email] Test email failed:", error);
    throw error;
  }
}

module.exports = {
  sendTestEmail,
  sendVerificationEmail,
};
