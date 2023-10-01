const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Directorio para almacenar las imágenes de perfil
const upload = multer({ dest: 'uploads/' });

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Almacenamiento temporal de usuarios en memoria (no persistente)
const users = {};

io.on('connection', function (socket) {
    console.log('Usuario conectado');

    // Manejar cuando un usuario se conecta
    socket.on('join chat', function (username) {
        users[socket.id] = username;
        socket.broadcast.emit('user joined', username);

        // Emitir la lista actualizada de usuarios a todos los clientes, incluido el nuevo usuario
        io.emit('user list', Object.values(users));
    });

    // Manejar cuando un usuario envía un mensaje
    socket.on('chat message', function (msg) {
        const username = users[socket.id];
        const timestamp = new Date().toLocaleTimeString();

        const message = {
            username: username,
            text: msg,
            timestamp: timestamp,
            align: 'right',
        };

        io.emit('chat message', message);
    });

    // Manejar cuando un usuario se desconecta
    socket.on('disconnect', function () {
        const username = users[socket.id];
        delete users[socket.id];
        socket.broadcast.emit('user left', username);

        // Emitir la lista actualizada de usuarios a todos los clientes
        io.emit('user list', Object.values(users));
        console.log('Usuario Desconectado');
    });
});

// Ruta para cargar imágenes de perfil
app.post('/upload', upload.single('profileImage'), function (req, res) {
    if (req.file) {
        // Mueve la imagen al directorio de imágenes de perfil
        const targetPath = `profile-images/${req.file.originalname}`;
        fs.renameSync(req.file.path, targetPath);
        res.status(200).json({ imagePath: targetPath });
    } else {
        res.status(400).json({ message: 'No se pudo cargar la imagen de perfil' });
    }
});

server.listen(3000, function () {
    console.log('Servidor escuchando en http://localhost:3000');
});