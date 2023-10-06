const nodemailer = require("nodemailer");
const {
  HOST,
  SECURE,
  EMAIL_PORT,
  SERVICE,
  USERNAME,
  PASSWORD,
} = require("../config/serverConfig");
module.exports = async (email, subject, text) => {
  try {
    const trasporter = nodemailer.createTransport({
      host: HOST,
      service: SERVICE,
      port: Number(EMAIL_PORT),
      secure: Boolean(SECURE),
      auth: {
        user: USERNAME,
        pass: PASSWORD,
      },
    });

    await trasporter.sendMail({
      from: USERNAME,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email send successfully");
  } catch (error) {
    console.log("Something went wrong");
    console.log(error.message);
  }
};
