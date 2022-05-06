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
const rooms = [];

io.use((socket, next) => {
    const senderID = socket.handshake.auth.senderID;
    if (!senderID) {
      return next(new Error("invalid userID"));
    }
    socket.senderID = senderID;
    next();
});

io.on('connection', (socket) => {
    const userData = socket.handshake.auth;
    const isNotEmpty = Object.keys(userData).length !== 0;
    if(isNotEmpty){
        userData.id = socket.id;
        for(var i = 0; i < rooms.length; i++) {
            if(rooms[i].user_id == userData.senderID) {
                console.log("_________________________________________________________")
                console.log(rooms[i])
                console.log("_________________________________________________________")
                rooms.splice(i, 1);
                // break;
            }
        }
        createRoom(userData)

        console.log("Created room, total room : " + rooms.length)
        // console.log(rooms)
    }
    
    socket.on('sendChatToServer', async (data) => {
        // console.log("******************************************************************")
        // console.log(data)
        console.log("*******************Room Start***********************************************")
        console.log(rooms)
        console.log("*******************************ROOM End***********************************")
        const messageDetails = await message.create({
            sender_id: data.sender_id,
            receiver_id: data.receiver_id,
            message: data.message,
            is_read: 0,
            image: "",
        });
        
        if (messageDetails) {
            for(const room of rooms) {
                if(room.user_id===data.receiver_id){
                    var socketKey = room.socketID;
                    socket.to(socketKey).emit('sendChatToClient', messageDetails);
                    console.log("send message")
                }
            }
        } else{
            console.log("Something wrong")
        }
    });

    socket.on('disconnect', (socket) => {        
        console.log(socket);
        console.log('Disconnect');
    });

});

const createRoom = ( { name, senderID, id } ) =>{
    var obj = { name, user_id:senderID, socketID:id };
    console.log(obj)
    rooms.push(obj);
    io.emit('liveUsers', rooms);
}

//server starts & listening port: {port}
server.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});