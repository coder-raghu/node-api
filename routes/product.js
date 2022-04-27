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
router.get('/',  async function(req, res) {

    let options = ['id', 'ASC'];
    let whereData = {};
    
    if (Object.keys(req.query).length !== 0) {
       
        if (req.query.sort!=='') {
            options = ['price', req.query.sort]
        }
        if (req.query.newest=='DESC') {
            options = ['id', 'DESC']
        }
        if (req.query.search!=='') {
            whereSql = {
                [Op.or]: [{
                    title: {
                        [Op.like]: `%${req.query.search}%`
                    }
                }],
                [Op.or]: [{
                    title: {
                        [Op.like]: `%${req.query.search}%`
                    }
                }]
            }
            Object.assign(whereData, whereSql)
        }
        if (req.query.minPrice!=='') {
            console.log("enter in min")
            whereSql = {
                    price: {
                        [Op.lt]: [req.query.minPrice]
                    }
            }
            Object.assign(whereData, whereSql)
        }
        if (req.query.maxPrice!=='') {
            whereSql = {
                    price: {
                        [Op.gt]: [req.query.maxPrice]
                    }
            }
            Object.assign(whereData, whereSql)
        }
        if (req.query.maxPrice!=='' && req.query.minPrice!=='') {
            console.log("enter in both")
            whereSql = {
                    price: {
                        [Op.between]: [req.query.minPrice, req.query.maxPrice]
                    }
            }
            Object.assign(whereData, whereSql)
        }

        
    }
    
    const {count, rows} = await product.findAndCountAll({
        where: whereData,
        order: [options],
        offset: 0,
        limit: 3
    })
    
    // console.log("my pagination")
    // console.log(count)
    // console.log(rows)

    const getMinPrice = await product.min('price');
    const getMaxPrice = await product.max('price');

    // res.send(sendResponse(true, 'success', rows, '', {max:getMaxPrice, min:getMinPrice, totalRecord: count}));

    product.findAll({
        where: whereData,
        order: [options]
    }).then((products) => {
        res.send(sendResponse(true, 'success', products, '', {max:getMaxPrice, min:getMinPrice}));
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
        createdBy: req.userID,
    });
    console.log(productDetails)
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
        updatedBy: req.userID,
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