const express = require('express');
const http = require('http');
const socketio = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
    console.log("Client connected with ID:", socket.id);

    socket.on("send-location", (data) => {
        console.log(`Received location from ${socket.id}: Latitude: ${data.latitude}, Longitude: ${data.longitude}`);
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected with ID: ${socket.id}`);
        io.emit("user-disconnected", socket.id);
    });
});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    console.log('Rendering index page');
    res.render('index');
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
