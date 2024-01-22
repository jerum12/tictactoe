import React from 'react';

function Square({ onSquareClick, value }) {
  return (
    <div>
      <button className="square" onClick={onSquareClick}>
        {value}
      </button>
    </div>
  );
}

export default Square;
