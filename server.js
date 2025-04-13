
const { createServer } = require("http");
const { Server } = require("socket.io")

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: "http://localhost:5174/",
});

const allUsers = {};

io.on("connection", (socket) => {
    allUsers[socket.id] = 
    {
        socket: socket,
        online: true,
        playerName: null,
    }

    console.log(socket.id)
    socket.on("request_to_play", (data) => {
        const currentUser = allUsers[socket.id]
        currentUser.playerName = data.playerName;

        console.log(`${currentUser.playerName} has requeseted to play`);
        
        
        let opponentPlayer = null;

        for (const key in allUsers) {
            const user = allUsers[key];
            
            if (user.online && !user.playing && socket.id !== key && user.playerName !== null) {
              opponentPlayer = user;
              console.log('opponent assigned for '+ currentUser.playerName + "" +opponentPlayer.playerName)
              break;
            }
        }

       
        
        if (opponentPlayer != null){
            opponentPlayer.socket.emit("OpponentFound", {
                opponentName: currentUser.playerName
            });
            currentUser.socket.emit("OpponentFound", {
                opponentName: opponentPlayer.playerName
            });
            // console.log(opponentPlayer);
            
        }
        else{
            currentUser.socket.emit("OpponentNotFound");            
        }
        
    })
    socket.on("disconnect", function () { 
        // console.log(`User disconnected: ${socket.id}`);
        // delete allUsers[socket.id];
        const currentUser = allUsers[socket.id];
        currentUser.online = false;  
    });
});

httpServer.listen(3000, () => {
    console.log('Server is listening on port 3000');
});