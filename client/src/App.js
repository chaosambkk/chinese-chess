import React, { useState } from 'react';
import ChessApp from './ChessApp';
import GomokuApp from './GomokuApp';
import './App.css';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame === null) {
    return (
      <div className="App">
        <div className="game-container">
          <div className="game-header">
            <h1>选择游戏</h1>
          </div>
          <div className="game-selection">
            <div className="game-option" onClick={() => setSelectedGame('chess')}>
              <div className="game-icon chess-icon">
                <span className="chess-piece red">帅</span>
                <span className="chess-piece black">将</span>
              </div>
              <h2>中国象棋</h2>
              <p>传统中国象棋游戏</p>
            </div>
            <div className="game-option" onClick={() => setSelectedGame('gomoku')}>
              <div className="game-icon">⚫</div>
              <h2>五子棋</h2>
              <p>五子连珠游戏</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedGame === 'chess') {
    return <ChessApp onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'gomoku') {
    return <GomokuApp onBack={() => setSelectedGame(null)} />;
  }

  return null;
}

export default App;
