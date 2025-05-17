const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailer = (message) => {
  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log("Ошибка отправки email:", err);
    } else {
      console.log("Email отправлен:", info.response);
    }
  });
};

module.exports = mailer;