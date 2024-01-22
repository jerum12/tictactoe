import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Board from './Board';
const socket = io('http://localhost:3001', { transports: ['websocket'] });

function Game() {
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);

  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];

  const [player, setPlayer] = useState(null);
  const [reject, setReject] = useState(false);
  const [players, setPlayers] = useState([]);

  const [board, setBoard] = useState([Array(9).fill(null)]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [illegalMove, setIllegalMove] = useState(false);
  useEffect(() => {
    //socket.on('connection', () => {});

    socket.on('board', ({ board, currentPlayer }) => {
      console.log(board, currentPlayer);
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      setWinner(null);
      setIllegalMove(false); //
    });

    socket.on('gameOver', ({ winner, currentPlayer }) => {
      setWinner(winner);
      console.log(currentPlayer);
      setMessage(`Player ${winner} wins!`);
    });

    socket.on('illegalMove', () => {
      setIllegalMove(true);
    });

    socket.on('player', (n) => {
      setPlayer(n);
    });

    socket.on('players', (n) => {
      setPlayers(n);
    });

    socket.on('rejectPlayer', () => {
      setReject(true);
    });

    socket.on('move', (data) => {
      handlePlay(data.nextSquares, data.xIsNext);
    });
  }, []);

  const reset = () => {
    setMessage('');
    setIllegalMove(false);
    socket.emit('reset');
  };
  function handlePlay(n) {
    console.log('n', n);

    if (winner !== null) {
      setMessage('Game over, Please start a new game!');
      return;
    }
    const lastMoveIndex = board.lastIndexOf(currentPlayer == 0 ? 'X' : '0');
    if (lastMoveIndex >= 0 && Math.abs(lastMoveIndex - n) === 1) {
      setIllegalMove(true);
      return;
    }

    socket.emit('move', n);
    // const nextHistory = [...history.slice(0, currentMove + 1), n];
    // setHistory(nextHistory);
    // setCurrentMove(nextHistory.length - 1);
    // setXIsNext(!x);
  }

  //   function jumpTo(nextMove) {
  //     setCurrentMove(nextMove);
  //     setXIsNext(nextMove % 2 === 0);
  //   }

  //   const moves = history.map((squares, move) => {
  //     let description;
  //     if (move > 0) {
  //       description = 'Go to move #' + move;
  //     } else {
  //       description = 'Go to game start';
  //     }
  //     return (
  //       <li key={move}>
  //         <button onClick={() => jumpTo(move)}>{description}</button>
  //       </li>
  //     );
  //   });

  if (reject) {
    return <div>Game is full. Please wait for the reset!</div>;
  }

  return (
    <div className="game">
      <div className="game-board">
        <div>
          Welcome <span className="playerName">{player}</span>!
        </div>
        <div>{message && <p>{message}</p>}</div>
        <div>{winner && <p>Winner: {winner}</p>}</div>
        <div>{illegalMove && <p>Illegal Move! Try Again!</p>}</div>
        <button onClick={reset}>Reset</button>
        <Board
          xIsNext={xIsNext}
          player={player}
          squares={board}
          onPlay={handlePlay}
          socket={socket}
        />
      </div>
      {/* <div className="game-info">
        <ol>{moves}</ol>
      </div> */}
    </div>
  );
}

export default Game;
