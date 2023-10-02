const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('Usuario conectado');

    socket.on('chat message 1', function (msg) {
        console.log('Mensaje del chat 1:', msg);
        io.emit('chat message 1', msg);
    });

    socket.on('chat message 2', function (msg) {
        console.log('Mensaje del chat 2:', msg);
        io.emit('chat message 2', msg);
    });

    socket.on('disconnect', function () {
        console.log('Usuario desconectado');
    });
});

http.listen(3000, function () {
    console.log('Servidor escuchando en http://localhost:3000');
});
