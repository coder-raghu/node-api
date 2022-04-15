const express = require('express'); //Import the express dependency
var mysql = require('mysql');
const db = require('./database')(mysql);
const sendResponse = require('./config/response');
var cors = require('cors')
var bodyParser = require('body-parser')
const moment =require('moment');
const bcrypt = require('bcrypt');
const multer  = require('multer')
const path  = require('path')
const fs = require('fs')
const { body } = require('express-validator');

// send mail 
// const nodemailer = require('nodemailer');
// const { sendMail } = require('./config/mail')    ;

const product = require('./models/product')(db);
const user = require('./models/user')(db);


// const unlinkAsync = promisify(fs.unlink)

const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now()+ '.' +extension)
    }
})
var upload = multer({ storage: storage });
// path registry.


app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

app.use(cors())

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Get products list
app.get('/products', function (req, res) {

    // Send mail 
    // const mailData = {
    //     from: 'raghu.prajapati@concettolabs.com',  // sender address
    //     to: 'raghu.concettolabs@gmail.com',   // list of receivers
    //     subject: 'Updated code with read status',
    //     text: 'That was easy!',
    //     html: `<b>Hey Raghu </b> <br> This is our first message sent with Nodemailer<br/>`,
    //     attachments: [
    //         {
    //             filename: "shiv.jpeg",
    //             path: "http://127.0.0.1:5000/uploads/image-1649828604622.jpeg",
    //             cid: "unique@nodemailer.com"
    //         }
    //     ],
    //     dsn: {
    //         id: 'lskdfmn23oriu2309rklfjioejrfwelf',
    //         return: 'headers',
    //         notify: ['failure', 'delay', 'success'],
    //         recipient: 'raghu.prajapati@concettolabs.com'
    //     }
    // };
    // sendMail(mailData)

    

    let options = ['id', 'ASC'];
    if(req.query.sort!=null){
        options = ['price', req.query.sort]
    }
    if(req.query.newest!=null){
        options = ['id', 'DESC']
    }
   
    product.findAll({
        order: [options]
    }).then((products) => {
        res.send(sendResponse(true,'success',products));
    }).catch((err) => {
        res.send(sendResponse(false, 'error', 'Oops! something went wrong'));
    })
});

// Save product
app.post('/product/store', upload.single('image'), async function (req, res) {
    
    const productDetails = await product.create({
        title : req.body.title,
        price :req.body.price,
        qty :req.body.quantity,
        description : req.body.description,
        category :req.body.category,
        status :req.body.status,
        image: req.file ? req.file.path : '',
    });
    if(productDetails){ 
        res.send(sendResponse(true, 'success', productDetails));
    } else {
        res.send(sendResponse(false, 'Oops! something went wrong'));
    }
});

// Update product
app.post('/product/update',upload.single('image'), async function (req, res) {

    const productDetails = await product.update({
        title : req.body.title,
        price :req.body.price,
        qty :req.body.quantity,
        description : req.body.description,
        category :req.body.category,
        status :req.body.status,
        image: req.file ? req.file.path : '',
    }, { where: { id: req.body.id }});

    if(productDetails){ 
        res.send(sendResponse(true, 'success', productDetails));
    } else {
        res.send(sendResponse(false, 'Oops! something went wrong'));
    }
});

// get product details
app.post('/product/show', jsonParser, async function (req, res) {
    const { id } = req.body;
    const productDetails = await product.findByPk(id);
    if(productDetails){
        res.send(sendResponse(true, 'success', productDetails));
    } else {
        res.send(sendResponse(false, 'Oops! something went wrong'));
    }
});

const getCategories = async () => {
    let myPromise = new Promise(function(resolve) {
        db.query("SELECT * FROM categories", function (err, result) {
            if (err) throw err;
            console.log("first")
            console.log(result)
            resolve(result);
        })
    })
    return await myPromise;
}

// Save product
app.post('/product/delete', jsonParser, function (req, res) {
    const { id } = req.body;
    const getData = `SELECT * FROM products where id=${id}`;
    db.query(getData, function (err, result) {
        if (err) throw err;
        if(result[0].image){
            fs.unlinkSync(result[0].image, function(err){
                if(err) throw err;
                console.log("file deleted");
            });
        }
    });
    const sql = `DELETE FROM products where id=${id}`;
    db.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(sendResponse(true, 'success', result));
    });
});

// Save product
app.post('/user/save', jsonParser, async function (req, res) {

    const { password } = req.body;
    bcrypt.hash(password, 10, function(err, hash){
        const userData = user.create({
            name : req.body.name,
            email : req.body.email,
            password : hash
        });
        if(userData){ 
            res.send(sendResponse(true, 'success', userData));
        } else {
            res.send(sendResponse(false, 'Oops! something went wrong'));
        }
    })
});

// Save product
app.post('/user/login', jsonParser, async function (req, res) {
    
    const { email,password } = req.body;
    if ( email && password ) {
        const userDetails = await user.findOne({ where : { email } });
        if (userDetails) {
            bcrypt.compare(password, userDetails.password, function(err, data) {
                if(data){
                    res.send(sendResponse(true, 'success', userDetails));
                } else {
                    res.send(sendResponse(false, 'Incorrect Email or Password!', userDetails));
                }
            });
        } else {
            res.send(sendResponse(false, 'Incorrect Email or Password!'));
        }
    } else {
        res.send(sendResponse(false, 'Please enter Username and Password!'));
    }
});

// Save product
app.post('/user/emailexists', jsonParser, function (req, res) {
    
    const { email } = req.body;
    if (email) {
        const sql = `SELECT * FROM users where email='${email}'`;
        db.query(sql, function (err, result) {
            if (err) throw err;
            if (result.length > 0 ) {
                res.send(sendResponse(false, 'Email already exists'));
            } else {
                res.send(sendResponse(true, 'success'));
            }           
        });
    } else {
        res.send(sendResponse(false, 'Please enter email address'));
    }
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});