const express = require('express');
var cors = require('cors');
const path  = require('path');

// init express app
const app = express();
app.use(express.json());
const port = 5000;

app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

app.use(cors())

// Routes
const productRoute = require('./routes/product');
const userRoute = require('./routes/user');
const contactRoute = require('./routes/contact');
app.use('/products', productRoute);
app.use('/users', userRoute);
app.use('/contacts', contactRoute);

//server starts & listening port: {port}
app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});