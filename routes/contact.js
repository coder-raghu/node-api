var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const db = require('../database')(mysql);
const { body, validationResult, check } = require('express-validator');
const sendResponse = require('../config/response');
const { sendMail } = require('../config/mail');

// model
const contact = require('../models/contact')(db);

router.post('/', 

    body('name').isLength({ min: 3 }).withMessage("Please enter atleast 3 chat").notEmpty().withMessage("Please enter name"),
    body('email').isEmail().withMessage("Enter valid email address").notEmpty().withMessage("Please enter email"),
    body('mobile').isLength({ min: 10 }).withMessage("Enter valid mobile number").notEmpty().withMessage("Please enter mobile"),
    body('message').isLength({ min: 10 }).withMessage("Please enter atleast 10 char").notEmpty().withMessage("Please enter message"),
    
    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        
        const contactDetails = await contact.create({
            name : req.body.name,
            email :req.body.email,
            mobile :req.body.mobile,
            message : req.body.message,
        });
        if(contactDetails){
            // Send mail 
            const mailData = {
                from: 'raghu.prajapati@concettolabs.com',  // sender address
                to: 'raghu.concettolabs@gmail.com,'+req.body.email,   // list of receivers
                subject: 'Contact form submitted ' + req.body.name,
                html: `Name : ${req.body.name} <br>
                       Email : ${req.body.email} <br>
                       Mobile : ${req.body.mobile} <br>
                       Message : ${req.body.message}`,
                attachments: [
                    {
                        filename: "shiv.jpeg",
                        path: "http://127.0.0.1:5000/uploads/image-1649828604622.jpeg",
                        cid: "unique@nodemailer.com"
                    }
                ]
            };
            sendMail(mailData)

            res.send(sendResponse(true, 'success', contactDetails));
        } else {
            res.send(sendResponse(false, 'Oops! something went wrong'));
    }
});


module.exports = router;