const nodemailer = require("nodemailer");

exports.sendEmail = async function (to, subject, body) {
    console.log('Enviando email');
    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

    let info = await transporter.sendMail({
    to: "bar@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>" // html body
    });
}