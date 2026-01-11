import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import GomokuBoard from './components/GomokuBoard';
import { INITIAL_BOARD, isValidMove, makeMove, isDraw, getCurrentPlayer } from './utils/gomokuRules';
import './App.css';

// 自动检测服务器地址
const getServerUrl = () => {
  if (process.env.REACT_APP_SERVER_URL) {
    return process.env.REACT_APP_SERVER_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  return 'http://localhost:3001';
};

const SERVER_URL = getServerUrl();

function GomokuApp({ onBack }) {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [playerColor, setPlayerColor] = useState(null);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [gameStatus, setGameStatus] = useState('connecting'); // connecting, choosing-color, waiting, playing, game-over
  const [message, setMessage] = useState('');
  const [lastMove, setLastMove] = useState(null);
  const [turn, setTurn] = useState(0); // 0 = 黑方先手
  const [availableColors, setAvailableColors] = useState(['black', 'white']);
  const [takenColors, setTakenColors] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // 连接服务器
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('已连接到服务器');
      setGameStatus('choosing-color');
      socketRef.current.emit('join-gomoku-game');
    });

    socketRef.current.on('choose-gomoku-color', ({ availableColors: avail, takenColors: taken }) => {
      setGameStatus('choosing-color');
      setAvailableColors(avail);
      setTakenColors(taken);
    });

    socketRef.current.on('colors-updated-gomoku', ({ takenColors: taken, availableColors: avail }) => {
      setTakenColors(taken);
      setAvailableColors(avail);
    });

    socketRef.current.on('color-taken-gomoku', ({ message: msg, availableColors: avail }) => {
      setMessage(msg);
      setAvailableColors(avail);
      setTakenColors(['black', 'white'].filter(c => !avail.includes(c)));
    });

    socketRef.current.on('color-chosen-gomoku', ({ color }) => {
      setPlayerColor(color);
      setMessage(`你选择了${color === 'black' ? '黑方' : '白方'}，等待对手选择...`);
    });

    socketRef.current.on('gomoku-game-started', ({ color, isYourTurn: turn }) => {
      setPlayerColor(color);
      setIsYourTurn(turn);
      setGameStatus('playing');
      setTurn(0);
      setMessage(turn ? `轮到你下棋（${color === 'black' ? '黑方' : '白方'}）` : `等待对手下棋（${color === 'black' ? '黑方' : '白方'}）`);
    });

    socketRef.current.on('opponent-choosing-gomoku', () => {
      setMessage('对手正在选择颜色...');
    });

    socketRef.current.on('gomoku-move-made', ({ row, col, playerColor: moveColor, nextTurn, winner }) => {
      setBoard(prevBoard => {
        const newBoard = makeMove(prevBoard, row, col, moveColor);
        
        // 检查是否获胜
        if (winner) {
          setTimeout(() => {
            setGameStatus('game-over');
            setMessage(`游戏结束！${winner === 'black' ? '黑方' : '白方'}获胜！`);
          }, 100);
        } else if (isDraw(newBoard)) {
          setTimeout(() => {
            setGameStatus('game-over');
            setMessage('游戏结束！平局！');
          }, 100);
        }
        
        return newBoard;
      });

      setLastMove({ row, col });
      setTurn(nextTurn);
      
      // 使用函数式更新确保使用最新的 playerColor 来判断是否是自己的回合
      setPlayerColor(prevColor => {
        if (prevColor) {
          const nextIsYourTurn = nextTurn % 2 === (prevColor === 'black' ? 0 : 1);
          setIsYourTurn(nextIsYourTurn);
          const currentPlayer = getCurrentPlayer(nextTurn);
          setMessage(nextIsYourTurn ? `轮到你下棋（${currentPlayer === 'black' ? '黑方' : '白方'}）` : `等待对手下棋...（当前：${currentPlayer === 'black' ? '黑方' : '白方'}）`);
        }
        return prevColor;
      });
    });

    socketRef.current.on('gomoku-game-reset', () => {
      setBoard(INITIAL_BOARD);
      setLastMove(null);
      setTurn(0);
      setIsYourTurn(playerColor === 'black');
      setGameStatus('playing');
      setMessage('游戏已重置');
    });

    socketRef.current.on('gomoku-opponent-disconnected', () => {
      setGameStatus('waiting');
      setMessage('对手已断开连接，等待重新连接...');
    });

    socketRef.current.on('gomoku-game-full', () => {
      setMessage('游戏已满，请稍后再试');
    });

    socketRef.current.on('error', ({ message: errorMsg }) => {
      setMessage(`错误: ${errorMsg}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCellClick = (row, col) => {
    if (gameStatus !== 'playing' || !isYourTurn || !playerColor) {
      if (!isYourTurn) {
        console.log('不是你的回合', { isYourTurn, playerColor, gameStatus, turn });
      }
      return;
    }

    if (!isValidMove(board, row, col)) {
      return;
    }

    // 发送移动（服务器端会验证是否是当前玩家的回合）
    socketRef.current.emit('gomoku-make-move', {
      row,
      col,
    });
  };

  const handleChooseColor = (color) => {
    if (socketRef.current && availableColors.includes(color)) {
      const timestamp = Date.now();
      socketRef.current.emit('choose-gomoku-color', { color, timestamp });
    }
  };

  const handleReset = () => {
    if (socketRef.current) {
      socketRef.current.emit('gomoku-reset-game');
    }
  };

  const currentPlayer = getCurrentPlayer(turn);

  // 颜色选择界面
  if (gameStatus === 'choosing-color') {
    return (
      <div className="App">
        <div className="game-container">
          <div className="game-header">
            <h1>五子棋</h1>
            <div className="status-message">{message}</div>
          </div>
          <div className="color-selection">
            <h2>选择你的颜色</h2>
            <div className="color-buttons">
              <button
                className={`color-button black ${!availableColors.includes('black') ? 'disabled' : ''} ${takenColors.includes('black') ? 'taken' : ''}`}
                onClick={() => handleChooseColor('black')}
                disabled={!availableColors.includes('black')}
              >
                <div className="color-preview black gomoku-preview-black"></div>
                <span>黑方（先手）</span>
                {takenColors.includes('black') && <span className="taken-label">已被选择</span>}
              </button>
              <button
                className={`color-button white ${!availableColors.includes('white') ? 'disabled' : ''} ${takenColors.includes('white') ? 'taken' : ''}`}
                onClick={() => handleChooseColor('white')}
                disabled={!availableColors.includes('white')}
              >
                <div className="color-preview white gomoku-preview-white"></div>
                <span>白方（后手）</span>
                {takenColors.includes('white') && <span className="taken-label">已被选择</span>}
              </button>
            </div>
          </div>
          {onBack && (
            <div className="game-controls">
              <button onClick={onBack} className="back-button">
                返回
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="game-container">
        <div className="game-header">
          <h1>五子棋</h1>
          <div className="game-info">
            <div className={`player-indicator ${playerColor}`}>
              {playerColor === 'black' ? '黑方' : playerColor === 'white' ? '白方' : '等待中...'}
            </div>
            <div className="turn-indicator">
              {isYourTurn ? '⚫ 轮到你' : '⚪ 等待对手'}
            </div>
          </div>
          <div className="status-message">{message}</div>
        </div>

        {gameStatus === 'playing' && (
          <GomokuBoard
            board={board}
            onCellClick={handleCellClick}
            isYourTurn={isYourTurn}
            currentPlayer={currentPlayer}
            lastMove={lastMove}
          />
        )}

        <div className="game-controls">
          {onBack && (
            <button onClick={onBack} className="back-button">
              返回
            </button>
          )}
          {gameStatus === 'playing' && (
            <button onClick={handleReset} className="reset-button">
              重新开始
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GomokuApp;

