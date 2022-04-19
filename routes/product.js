var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const db = require('../database')(mysql);
const sendResponse = require('../config/response');
const fs = require('fs')
const multer = require('multer')
const { Op } = require("sequelize");
const verifyToken = require('../middleware/auth')

// model
const product = require('../models/product')(db);

// Upload folder
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension)
    }
})
var upload = multer({ storage: storage });


// Get products list
router.get('/', function(req, res) {

    let options = ['id', 'ASC'];
    let whereData = '';
    if (req.query.sort != null) {
        options = ['price', req.query.sort]
    }
    if (req.query.newest != null) {
        options = ['id', 'DESC']
    }
    if (req.query.search != null) {
        whereData = {
            [Op.or]: [{
                title: {
                    [Op.substring]: req.query.search
                }
            }],
            [Op.or]: [{
                title: {
                    [Op.substring]: req.query.search
                }
            }]
        }
    }

    product.findAll({
        where: whereData,
        order: [options]
    }).then((products) => {
        res.send(sendResponse(true, 'success', products));
    }).catch((error) => {
        res.send(sendResponse(false, error.message, 'Oops! something went wrong'));
    })
});
// sequelize.sync({ logging: console.log })

// Save product
router.post('/store', verifyToken ,upload.single('image'), async function(req, res) {

    const productDetails = await product.create({
        title: req.body.title,
        price: req.body.price,
        qty: req.body.quantity,
        description: req.body.description,
        category: req.body.category,
        status: req.body.status,
        image: req.file ? req.file.path : '',
    });
    if (productDetails) {
        res.send(sendResponse(true, 'success', productDetails));
    } else {
        res.send(sendResponse(false, 'Oops! something went wrong'));
    }
});

// Update product
router.post('/update', verifyToken, upload.single('image'), async function(req, res) {

    const productDetails = await product.update({
        title: req.body.title,
        price: req.body.price,
        qty: req.body.quantity,
        description: req.body.description,
        category: req.body.category,
        status: req.body.status,
        image: req.file ? req.file.path : '',
    }, { where: { id: req.body.id } });

    if (productDetails) {
        res.send(sendResponse(true, 'success', productDetails));
    } else {
        res.send(sendResponse(false, 'Oops! something went wrong'));
    }
});

// get product details
router.post('/show', async function(req, res) {
    const { id } = req.body;
    const productDetails = await product.findByPk(id);
    if (productDetails) {
        res.send(sendResponse(true, 'success', productDetails));
    } else {
        res.send(sendResponse(false, 'Oops! something went wrong'));
    }
});


// Save product
router.post('/delete', async function(req, res) {
    const { id } = req.body;
    const productDetails = await product.findByPk(id);
    if (productDetails) {
        const productDeleted = await product.destroy({
            where: { id }
        });
        if (productDetails.image) {
            fs.unlinkSync(productDetails.image, function(err) {
                if (err) throw err;
                console.log("file deleted");
            });
        }
        if (productDeleted) {
            res.send(sendResponse(true, 'success', productDetails));
        } else {
            res.send(sendResponse(false, 'Oops! something went wrong'));
        }
    } else {
        res.send(sendResponse(false, 'Please pass valid data'));
    }
});

//export this router to use in our index.js
module.exports = router;