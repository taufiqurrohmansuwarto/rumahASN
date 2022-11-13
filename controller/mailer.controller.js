const nodemailer = require("nodemailer");
const User = require("../models/users.model");

const user = process.env.USERNAME_GMAIL;
const pass = process.env.PASSWORD_GMAIL;

const auth = {
  user,
  pass,
};

const sendMail = async (userId, message, subject) => {
  const currentUser = await User.query().findById(userId);

  // send message using nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth,
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
