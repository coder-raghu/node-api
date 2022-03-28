const express = require('express'); //Import the express dependency
var mysql = require('mysql');
const db = require('./database')(mysql);
const sendResponse = require('./config/response');
var cors = require('cors')
var bodyParser = require('body-parser')
const moment =require('moment');
const bcrypt = require('bcrypt');

const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening

app.use(cors())

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Get products list
app.get('/products', function (req, res) {
    db.query("SELECT * FROM product", function (err, result) {
        if (err) throw err;
        res.send(sendResponse(true, 'success', result));
        
    });
});

// Save product
app.post('/product/store', jsonParser, function (req, res) {
    const {title, price,quantity,description} = req.body;
    const created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const sql = `INSERT INTO product (title, price, qty, image, description, created_at) VALUES ('${title}', ${price}, ${quantity}, NULL, '${description}', '${created_at}')`;
    db.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(sendResponse(true, 'success', result));
    });
});

// Save product
app.post('/product/update', jsonParser, function (req, res) {
    console.log(req.body)
    const {id,title,price,quantity,description} = req.body;
    const updated_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const sql = `UPDATE product SET title = '${title}', price=${price}, qty=${quantity}, description='${description}', updated_at='${updated_at}' WHERE id=${id}`;
    console.log(sql)
    db.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(sendResponse(true, 'success', result));
    });
});

// Save product
app.post('/product/show', jsonParser, function (req, res) {
    const { id } = req.body;
    const sql = `SELECT * FROM product where id=${id}`;
    db.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(sendResponse(true, 'success', result));
    });
});

// Save product
app.post('/product/delete', jsonParser, function (req, res) {
    const { id } = req.body;
    const sql = `DELETE FROM product where id=${id}`;
    db.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(sendResponse(true, 'success', result));
    });
});

// Save product
app.post('/user/save', jsonParser, function (req, res) {
    const {name,email,password} = req.body;

    bcrypt.hash(password, 10, function(err, hash){

        const created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        const sql = `INSERT INTO users (name,email,password,created_at) VALUES ('${name}', '${email}', '${hash}','${created_at}')`;
        console.log(sql)
        db.query(sql, function (err, result, fields) {
            if (err) throw err;
            res.send(sendResponse(true, 'success', result));
        });

    })

});

// Save product
app.post('/user/login', jsonParser, function (req, res) {
    
        const {email,password} = req.body;
    if (email && password ) {
        // var hash = bcrypt.compare(password, 10);
        const sql = `SELECT * FROM users where email='${email}'`;
        
        db.query(sql, function (err, result) {
            if (err) throw err;
            if (result.length > 0 ) {
                bcrypt.compare(password, result[0].password, function(err, data) {
                    res.send(sendResponse(true, 'success', result[0]));
                });
            } else {
                res.send(sendResponse(false, 'Incorrect Email or Password!', result));
            }           
        });
    } else {
        res.send(sendResponse(false, 'Please enter Username and Password!'));
    }
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});