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
let playerOrder = [];
let currentTurn = 0;
let gameStarted = false;

io.on('connection', (socket) => {
  console.log('Nowy telefon połączył się z serwerem!');

  socket.on('joinGame', (nickname) => {
    if (gameStarted) return;
    
    players[socket.id] = {
      nick: nickname,
      position: 0
    };
    console.log(nickname + ' dołączył do gry!');
    io.emit('updatePlayers', Object.values(players));
  });

  socket.on('startGame', () => {
    // ZABEZPIECZENIE: Nie startuj, jeśli brak graczy lub gra trwa
    if (gameStarted || Object.keys(players).length === 0) return;
    
    gameStarted = true;
    playerOrder = Object.keys(players);
    currentTurn = 0;
    
    io.emit('gameStarted', {
      players: Object.values(players),
      turn: players[playerOrder[currentTurn]].nick
    });
  });

  socket.on('rollDice', () => {
    if (!gameStarted || playerOrder[currentTurn] !== socket.id) return;
    
    const roll = Math.floor(Math.random() * 12) + 1;
    players[socket.id].position = (players[socket.id].position + roll) % 40;
    
    currentTurn = (currentTurn + 1) % playerOrder.length;
    const nextTurn = players[playerOrder[currentTurn]].nick;
    
    io.emit('diceRolled', {
      roller: players[socket.id].nick,
      roll: roll,
      players: Object.values(players),
      nextTurn: nextTurn
    });
  });

  socket.on('disconnect', () => {
    console.log('Gracz rozłączył się');
    delete players[socket.id];
    io.emit('updatePlayers', Object.values(players));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Serwer GRB Monopoly działa na porcie ' + PORT);
});
