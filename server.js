const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let players = {};

io.on('connection', (socket) => {
  console.log('Nowy telefon połączył się z serwerem!');

  socket.on('joinGame', (nickname) => {
    players[socket.id] = {
      nick: nickname,
      position: 0
    };
    console.log(nickname + ' dołączył do gry!');
    io.emit('updatePlayers', Object.values(players));
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('updatePlayers', Object.values(players));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Serwer Monopoly (Tyniec Mały) działa na porcie ' + PORT);
});
