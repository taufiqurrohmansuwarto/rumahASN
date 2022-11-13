const nodemailer = require("nodemailer");
const User = require("../models/users.model");

const user = process.env.USERNAME_GMAIL;
const password = process.env.PASSWORD_GMAIL;

const sendMail = async (userId, message, subject) => {
  const currentUser = await User.query().findById(userId);

  // send message using nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass: password,
    },
  });

  await transporter.sendMail({
    from: user,
    to: currentUser?.email,
    subject,
    text: message,
  });
};

module.exports = {
  sendMail,
};
