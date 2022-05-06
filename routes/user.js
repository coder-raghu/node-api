var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const db = require('../database')(mysql);
const sendResponse = require('../config/response');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config()


// model
const user = require('../models/user')(db);


// get all users
router.get('/',  async function(req, res) {

    const users = user.findAll()
    .then((users) => {
        res.send(sendResponse(true, 'success', users));
    }).catch((error) => {
        res.send(sendResponse(false, error.message, 'Oops! something went wrong'));
    })
});

// Register user
router.post('/save', async function(req, res) {

    const { password } = req.body;
    await bcrypt.hash(password, 10, function(err, hash) {
        const userData = user.create({
            name: req.body.name,
            email: req.body.email,
            password: hash
        });
        if (userData) {
            res.send(sendResponse(true, 'success', userData));
        } else {
            res.send(sendResponse(false, 'Oops! something went wrong'));
        }
    })
});

// User login
router.post('/login', async function(req, res) {

    const { email, password } = req.body;
    if (email && password) {
        const userDetails = await user.findOne({ where: { email } });
        if (userDetails) {
            const passwordStatus = await bcrypt.compare(password, userDetails.password);
            if (passwordStatus) {
                var token = await jwt.sign( userDetails.id, process.env.JWT_SECRET);
                res.send(sendResponse(true, 'success', userDetails, token));
            } else {
                res.send(sendResponse(false, 'Incorrect Email or Password!', userDetails));
            }
        } else {
            res.send(sendResponse(false, 'Incorrect Email or Password!'));
        }
    } else {
        res.send(sendResponse(false, 'Please enter Username and Password!'));
    }
});

// check email exists
router.post('/checkEmail', async function(req, res) {

    const { email } = req.body;
    if (email) {
        const userDetails = await user.findOne({ where: { email } });
        if (userDetails) {
            res.send(sendResponse(false, 'Email already exists'));
        } else {
            res.send(sendResponse(true, 'success'));
        }
    } else {
        res.send(sendResponse(false, 'Please enter email address'));
    }
});

//export this router to use in our index.js
module.exports = router;