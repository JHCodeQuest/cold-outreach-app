const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, body, from }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: from || process.env.SMTP_USER,
    to,
    subject,
    text: body,
    html: `<p>${body.replace(/\n/g, '<br>')}</p>`
  };
  
  return await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
