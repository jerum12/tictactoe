const express = require('express');

const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3001;

app.use(express.static('public'));

let countPlayer = 0;
let currentPlayer = 0;
let players = [];
let board = Array(9).fill(null);

io.on('connection', (socket) => {
  console.log('A user connected');

  //socket.emit('board', board);
  io.to(socket.id).emit('board', { board, currentPlayer });

  if (players.length < 2) {
    console.log('---------------------');
    console.log(players.length + ' players.length');
    console.log('---------------------');
    let player = 'playerX';
    if (players.length === 0) player = 'playerX';
    else if (players.length === 1 && players[0] === 'playerX') {
      player = 'player0';
    } else if (players.length === 1 && players[0] === 'player0') {
      player = 'playerX';
    }

    players.push(player);

    //Inform the client about their player role
    socket.emit('player', player);

    console.log('Players initially', players);
    console.log(`Player ${player} connected`);
    //Inform all connected clients
    io.emit('players', players);

    socket.on('reset', () => {
      board = Array(9).fill(null);
      io.to(socket.id).emit('board', { board, currentPlayer: 0 });
    });

    //handle player move
    socket.on('move', (index) => {
      //Inform all/broadcast all connected clients

      if (board[index] === null && currentPlayer === 0) {
        board[index] = 'X';
      } else if (board[index] === null && currentPlayer === 1) {
        board[index] = '0';
      } else {
        //illegal move
        io.to(socket.id).emit('illegalMove');
      }

      //   board[index] = currentPlayer;
      //   currentPlayer = 1 - currentPlayer;
      const winner = calculateWinner();

      //io.emit('board', board);

      if (winner !== null) {
        io.emit('board', { board, currentPlayer });
        io.emit('gameOver', { winner, currentPlayer });
        console.log(winner, '-----------');
        board = Array(9).fill(null);
      } else {
        currentPlayer = 1 - currentPlayer;
        io.emit('board', { board, currentPlayer });
      }
      //players;

      //console.log(currentPlayer, 'from:move', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      players = players.filter((p) => p !== player);
      console.log('Players', players);
      io.emit('players', players);
    });
  } else {
    socket.emit('rejectPlayer', 'Game is full.');
    //socket.disconnect(true);
  }

  //   countPlayer++;
  //   //if countPlayer is more than 2
  //   console.log(`Player ${countPlayer} connected`);
  //   if (countPlayer > 2) {
  //     countPlayer = 2;
  //     console.log('countPlayer rejected');
  //     socket.emit('rejectPlayer');
  //     return;
  //   }

  //Assign a player number connectect to the client
  //socket.emit('playerNumber', countPlayer);
  //countCurrentPlayer = 1 - countCurrentPlayer;

  socket.on('disconnect', () => {
    //countPlayer--;
    console.log('User disconnected');
  });
});

const calculateWinner = () => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const co of lines) {
    const [a, b, c] = co;

    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  //   for (let i = 0; i < lines.length; i++) {
  //     const [a, b, c] = lines[i];
  //     if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
  //       return squares[a];
  //     }
  //   }
  return null;
};

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
