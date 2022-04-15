const nodemailer = require('nodemailer');
require('dotenv').config()

module.exports.sendMail = function(mailData){
    var transporter =  nodemailer.createTransport({
        port: process.env.MAIL_PORT,
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PWD,
        },
        secure: false,
    });

    transporter.sendMail(mailData, function (err, info) {
        if(err)
            console.log(err)
        else
            console.log(info)
    });

}