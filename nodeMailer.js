const nodemailer = require("nodemailer");
require('dotenv').config();

const sendEmail = async (subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.ADMIN_MAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.GOOGLE_TOKEN,
    },
  });

  const mailOptions = {
    from: process.env.ADMIN_MAIL,
    to: process.env.ADMIN_MAIL,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail
};
