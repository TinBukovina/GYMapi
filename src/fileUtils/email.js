const nodemailer = require("nodemailer");
const catchAsync = require("./catchAsync");

const sendEmail = catchAsync(async (options) => {
  // 1) Creating a transporter (service that will send the email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // If using gmail, you need to activate in gmail "less secure app" option
  });

  // 2) Define the email options
  const mailOptions = {
    from: "Tin Bukovina <buksa@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
