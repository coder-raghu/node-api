const express = require('express');
var cors = require('cors');
const path = require('path');

const http = require('http');
const mysql = require('mysql');
const db = require('./database')(mysql);
const message = require('./models/message')(db);


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


const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

const users = [];

io.on('connection', (socket) => {

    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            socketID: id,
            info: socket.handshake.auth,
        });
        // console.log(users)
        // socket.emit("liveUsers", users);
    }
    
    socket.on('sendChatToServer', async (data) => {

        const messageDetails = await message.create({
            sender_id: data.sender_id,
            receiver_id: data.receiver_id,
            message: data.message,
            is_read: 0,
            image: "",
        });

        if (messageDetails) {
            io.emit('sendChatToClient', messageDetails);
        } else{
            console.log("Something wrong")
        }

    
    });

    socket.on('disconnect', (socket) => {        
        console.log('Disconnect');
    });

});

//server starts & listening port: {port}
server.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});