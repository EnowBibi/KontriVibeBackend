import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to, code) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // smtp.gmail.com
    port: process.env.SMTP_PORT, // 587
    secure: false, // Gmail SMTP over TLS uses false for port 587
    auth: {
      user: process.env.SMTP_USER, // your gmail
      pass: process.env.SMTP_PASS, // app password
    },
  });

  const mailOptions = {
    from: `KontriVibe <${process.env.SMTP_USER}>`,
    to,
    subject: "Your KontriVibe Verification Code",
    text: `Your verification code is ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
        <p>Your verification code is</p>
        <h2 style="letter-spacing: 4px;">${code}</h2>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
