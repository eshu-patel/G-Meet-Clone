const express = require('express');
const app = express();
const server = require('http').Server(app);
const io=require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

const passport = require("passport");
const googleStratergy = require("passport-google-oauth20");
passport.use(new googleStratergy({
    clientID: "628412409662-7q1enniq3ah2q49g9rp320smmggv4uei.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    // console.log(accessToken);
    // console.log(refreshToken);
    // console.log(profile);
}))

// wb
connections=[];
// wb

const {ExpressPeerServer}=require('peer');
const peerServer=ExpressPeerServer(server,{
    debug:true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs',peerServer);



app.get("/", passport.authenticate("google", {
    scope: ["profile", "email"],}
    
))

app.get('/google/callback', (req, res) => {
    res.redirect(`/${uuidV4()}`);
})


app.get('/:room',(req,res)=>{
    res.render('room',{ roomId: req.params.room})
})

io.on('connection',socket=>{
    // wb
    connections.push(socket);
    // wb
    socket.on('join-room',(roomId,userId)=>{
        // console.log('joined room');
        socket.join(roomId);
        // socket.to(roomId).emit('user-connected',userId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
        socket.on('message',message=>{
            io.to(roomId).emit('createMessage',message);
        })

        socket.on('disconnect',()=>{
            // console.log(`${socket.id} is disconnected`);
            // connections=connections.filter((con)=>con.id!==socket.id)
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })

    // 

    socket.on('draw',(data)=>{
        connections.forEach(con=>{
            if(con.id!==socket.id){
                con.emit('ondraw',{x:data.x, y:data.y});
            }
        })
    })

    socket.on('down',(data)=>{
        connections.forEach(con=>{
            if(con.id!==socket.id){
                con.emit('ondown',{x:data.x,y:data.y});
            }
        })
    })

    

    // 
})

server.listen(3030);

// Whiteboard
