const nodemailer = require('nodemailer');
const dotenv =  require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,

    tls:{
        rejectUnauthorized: false
    },

    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
});


async function sendActivationEmail(email,message){

const mailOption = {
    from: `LEKAN <process.env.SMTP_USER>`,
    to: email,
    subject: "Activate your Account",
   // text: "this is my first email"
   html:message
};

return transporter.sendMail(mailOption);
}
module.exports.sendActivationEmail = sendActivationEmail;