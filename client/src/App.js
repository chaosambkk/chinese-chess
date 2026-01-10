import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChessBoard from './components/ChessBoard';
import { INITIAL_BOARD, isValidMove, makeMove, isCheckmate, isInCheck } from './utils/chessRules';
import { playCheckSound, playNotificationSound, playMoveSound, playCaptureSound, initSpeechSynthesis } from './utils/sound';
import './App.css';

// 自动检测服务器地址：生产环境使用当前域名，开发环境使用 localhost
const getServerUrl = () => {
  if (process.env.REACT_APP_SERVER_URL) {
    return process.env.REACT_APP_SERVER_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    // 生产环境：使用当前域名（Railway 会自动设置）
    return window.location.origin;
  }
  // 开发环境：使用 localhost
  return 'http://localhost:3001';
};

const SERVER_URL = getServerUrl();

function App() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [playerColor, setPlayerColor] = useState(null);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [gameStatus, setGameStatus] = useState('connecting'); // connecting, choosing-color, waiting, playing, game-over
  const [message, setMessage] = useState('');
  const [availableColors, setAvailableColors] = useState(['red', 'black']);
  const [takenColors, setTakenColors] = useState([]);
  const [isInCheckState, setIsInCheckState] = useState({ red: false, black: false });
  const [lastMove, setLastMove] = useState(null); // 记录最后移动的棋子位置 { fromRow, fromCol, toRow, toCol }
  const socketRef = useRef(null);
  const playerColorRef = useRef(null);

  useEffect(() => {
    // 初始化语音合成
    initSpeechSynthesis();
    
    // 连接服务器
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('已连接到服务器');
      setGameStatus('choosing-color');
      setMessage('');
      socketRef.current.emit('join-game');
    });

    socketRef.current.on('choose-color', ({ availableColors: avail, takenColors: taken, players }) => {
      setGameStatus('choosing-color');
      setAvailableColors(avail);
      setTakenColors(taken);
      setMessage('');
    });

    socketRef.current.on('colors-updated', ({ takenColors: taken, availableColors: avail }) => {
      setTakenColors(taken);
      setAvailableColors(avail);
    });

    socketRef.current.on('color-taken', ({ message, availableColors: avail }) => {
      setMessage(message);
      setAvailableColors(avail);
      setTakenColors(['red', 'black'].filter(c => !avail.includes(c)));
    });

    socketRef.current.on('color-chosen', ({ color }) => {
      setPlayerColor(color);
      playerColorRef.current = color;
      setMessage(`你选择了${color === 'red' ? '红方' : '黑方'}，等待对手选择...`);
    });

    socketRef.current.on('game-started', ({ color, isYourTurn: turn }) => {
      setPlayerColor(color);
      playerColorRef.current = color;
      setIsYourTurn(turn);
      setGameStatus('playing');
      setMessage(turn ? `轮到你下棋（${color === 'red' ? '红方' : '黑方'}）` : `等待对手下棋（${color === 'red' ? '红方' : '黑方'}）`);
      // 重置将军状态
      setIsInCheckState({ red: false, black: false });
    });

    socketRef.current.on('opponent-choosing', () => {
      setMessage('对手正在选择颜色...');
    });

    socketRef.current.on('already-joined', ({ color }) => {
      setPlayerColor(color);
      playerColorRef.current = color;
      setMessage(`你已经是${color === 'red' ? '红方' : '黑方'}，等待游戏开始...`);
    });

    socketRef.current.on('move-made', ({ move, playerColor: moveColor, nextTurn }) => {
      const { fromRow, fromCol, toRow, toCol } = move;
      console.log('收到移动:', move, '移动玩家:', moveColor, '下一回合:', nextTurn, '我的颜色:', playerColorRef.current);
      
      // 更新最后移动的位置（目标位置，即棋子现在的位置）
      setLastMove({ fromRow, fromCol, toRow, toCol });
      
      setBoard(prevBoard => {
        console.log('更新棋盘前:', prevBoard[fromRow][fromCol], '->', prevBoard[toRow][toCol]);
        
        // 检查是否是吃子（目标位置有对方棋子）
        const capturedPiece = prevBoard[toRow][toCol];
        const isCapture = capturedPiece !== null && capturedPiece !== undefined;
        
        const newBoard = makeMove(prevBoard, fromRow, fromCol, toRow, toCol);
        console.log('更新棋盘后:', newBoard[fromRow][fromCol], '->', newBoard[toRow][toCol]);
        
        // 检查双方的将军状态
        const opponentColor = moveColor === 'red' ? 'black' : 'red';
        const isMoverInCheck = isInCheck(newBoard, moveColor);
        const isOpponentInCheck = isInCheck(newBoard, opponentColor);
        
        // 更新双方的将军状态（立即更新，确保组件能获取到最新状态）
        const redInCheck = isInCheck(newBoard, 'red');
        const blackInCheck = isInCheck(newBoard, 'black');
        console.log('更新将军状态:', { red: redInCheck, black: blackInCheck, playerColor: playerColorRef.current, moveColor });
        
        // 使用函数式更新确保状态正确
        setIsInCheckState(prev => {
          const newState = {
            red: redInCheck,
            black: blackInCheck
          };
          console.log('设置将军状态:', newState);
          return newState;
        });
        
        // 优先检查是否将死
        const isOpponentCheckmate = isCheckmate(newBoard, opponentColor);
        const isMoverCheckmate = isCheckmate(newBoard, moveColor);
        
        // 音效播放逻辑：优先播放将军音，如果没将军再根据是否是吃子播放相应音效
        if (isOpponentCheckmate || isMoverCheckmate || isOpponentInCheck) {
          // 如果将军或将死，只播放"将军"，不播放"吃"或移动音
          if (isOpponentCheckmate) {
            // 对手被将死，移动方获胜
            setTimeout(() => {
              setGameStatus('game-over');
              setIsYourTurn(false); // 游戏结束，不能再下棋
              const winnerColor = moveColor === 'red' ? '红方' : '黑方';
              const loserColor = opponentColor === 'red' ? '红方' : '黑方';
              setMessage(`🎉 游戏结束！${winnerColor}获胜！${loserColor}被将死！`);
              playCheckSound(); // 播放"将军"语音
              // 通知服务器游戏已结束
              if (socketRef.current) {
                socketRef.current.emit('game-ended');
              }
            }, 200);
          } else if (isMoverCheckmate) {
            // 移动方被将死，对手获胜（这种情况理论上不应该发生，因为isValidMove会阻止）
            setTimeout(() => {
              setGameStatus('game-over');
              setIsYourTurn(false);
              const winnerColor = opponentColor === 'red' ? '红方' : '黑方';
              const loserColor = moveColor === 'red' ? '红方' : '黑方';
              setMessage(`🎉 游戏结束！${winnerColor}获胜！${loserColor}被将死！`);
              playCheckSound();
              // 通知服务器游戏已结束
              if (socketRef.current) {
                socketRef.current.emit('game-ended');
              }
            }, 200);
          } else if (isOpponentInCheck) {
            // 对手被将军但未将死
            setTimeout(() => {
              setMessage(`⚠️ 将军！${opponentColor === 'red' ? '红方' : '黑方'}被将军！`);
              playCheckSound(); // 播放"将军"语音
            }, 150);
          }
        } else {
          // 如果没有将军，根据是否是吃子播放相应的音效
          if (isCapture) {
            setTimeout(() => {
              playCaptureSound();
            }, 50);
          } else {
            setTimeout(() => {
              playMoveSound();
            }, 50);
          }
        }
        
        // 如果移动方不再被将军，显示解除提示
        if (!isMoverInCheck && prevBoard) {
          const wasMoverInCheck = isInCheck(prevBoard, moveColor);
          if (wasMoverInCheck) {
            setTimeout(() => {
              setMessage(`✅ ${moveColor === 'red' ? '红方' : '黑方'}已解除将军`);
            }, 150);
          }
        }
        
        return newBoard;
      });

      // 使用函数式更新，确保使用最新的 playerColor 来判断是否是自己的回合
      setPlayerColor(currentColor => {
        if (currentColor) {
          const isMyTurn = nextTurn === currentColor;
          setIsYourTurn(isMyTurn);
          
          // 延迟更新消息，避免覆盖将军提示（延迟时间要长于将军提示的延迟）
          setTimeout(() => {
            // 使用最新的 board 和 isInCheckState 来判断
            setBoard(currentBoard => {
              setIsInCheckState(prev => {
                const myCheckStatus = prev[currentColor];
                const opponentColor = currentColor === 'red' ? 'black' : 'red';
                
                // 检查是否将死
                const isMyCheckmate = isCheckmate(currentBoard, currentColor);
                const isOpponentCheckmate = isCheckmate(currentBoard, opponentColor);
                
                if (isMyCheckmate) {
                  // 自己被将死，对手获胜
                  setGameStatus('game-over');
                  setIsYourTurn(false);
                  const winnerColor = opponentColor === 'red' ? '红方' : '黑方';
                  const loserColor = currentColor === 'red' ? '红方' : '黑方';
                  setMessage(`🎉 游戏结束！${winnerColor}获胜！${loserColor}被将死！`);
                  playCheckSound();
                  // 通知服务器游戏已结束
                  if (socketRef.current) {
                    socketRef.current.emit('game-ended');
                  }
                } else if (isOpponentCheckmate) {
                  // 对手被将死，自己获胜
                  setGameStatus('game-over');
                  setIsYourTurn(false);
                  const winnerColor = currentColor === 'red' ? '红方' : '黑方';
                  const loserColor = opponentColor === 'red' ? '红方' : '黑方';
                  setMessage(`🎉 游戏结束！${winnerColor}获胜！${loserColor}被将死！`);
                  playCheckSound();
                  // 通知服务器游戏已结束
                  if (socketRef.current) {
                    socketRef.current.emit('game-ended');
                  }
                } else if (myCheckStatus) {
                  // 被将军但未将死
                  setMessage(`⚠️ 你被将军了！请尽快应对！`);
                  playCheckSound(); // 播放"将军"语音
                } else if (isMyTurn) {
                  setMessage(`轮到你下棋（${currentColor === 'red' ? '红方' : '黑方'}）`);
                  playNotificationSound(); // 播放提示音
                } else {
                  setMessage(`等待对手下棋...`);
                }
                return prev; // 不修改状态，只是读取
              });
              return currentBoard; // 不修改棋盘，只是读取
            });
          }, 400);
        }
        return currentColor;
      });
      setSelectedCell(null);
    });

    socketRef.current.on('game-reset', () => {
      setBoard(INITIAL_BOARD);
      setSelectedCell(null);
      setLastMove(null); // 重置最后移动位置
      setIsYourTurn(playerColorRef.current === 'red');
      setGameStatus('playing');
      setMessage('游戏已重置');
      // 重置将军状态
      setIsInCheckState({ red: false, black: false });
    });

    socketRef.current.on('opponent-disconnected', () => {
      // 如果游戏已结束，显示不同的消息
      setGameStatus(prevStatus => {
        if (prevStatus === 'game-over') {
          setMessage('对手已退出，请等待对手完全退出后才能开始新游戏...');
          return 'game-over';
        } else {
          setMessage('对手已断开连接，等待重新连接...');
          return 'waiting';
        }
      });
    });

    socketRef.current.on('game-ended-waiting', ({ message }) => {
      setGameStatus('waiting');
      setMessage(message || '游戏已结束，请等待所有玩家退出后才能开始新游戏');
    });

    socketRef.current.on('game-full', () => {
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
  }, []);

  const handleCellClick = (row, col) => {
    if (gameStatus !== 'playing' || !isYourTurn || !playerColor) {
      if (!isYourTurn) {
        console.log('不是你的回合', { isYourTurn, playerColor, gameStatus });
      }
      return;
    }

    const piece = board[row][col];
    const pieceColor = piece ? (piece === piece.toUpperCase() ? 'red' : 'black') : null;

    // 如果点击了己方棋子，选中它
    if (pieceColor === playerColor) {
      setSelectedCell({ row, col });
      playNotificationSound(); // 播放选择提示音
      return;
    }

    // 如果已经选中了棋子，尝试移动
    if (selectedCell) {
      // 检查当前是否被将军
      const currentlyInCheck = isInCheckState[playerColor] || false;
      
      if (isValidMove(board, selectedCell.row, selectedCell.col, row, col, playerColor, currentlyInCheck)) {
        // 发送移动
        socketRef.current.emit('make-move', {
          fromRow: selectedCell.row,
          fromCol: selectedCell.col,
          toRow: row,
          toCol: col,
        });
        
        // 音效统一在 move-made 事件中播放，避免重复播放
        // 移除这里的音效播放逻辑
        
        setSelectedCell(null);
      } else {
        // 如果移动不合法，显示错误提示
        if (currentlyInCheck) {
          setMessage('⚠️ 被将军时，只能走能够解除将军的棋！');
        } else {
          // 检查是否是因为送将而不合法
          const testBoard = makeMove(board, selectedCell.row, selectedCell.col, row, col);
          if (isInCheck(testBoard, playerColor)) {
            setMessage('⚠️ 不能送将！这步棋会让自己的将/帅被将军！');
          }
        }
        // 取消选择或选择新棋子
        if (pieceColor === playerColor) {
          setSelectedCell({ row, col });
        } else {
          setSelectedCell(null);
        }
      }
    }
  };


  const handleChooseColor = (color) => {
    if (socketRef.current && availableColors.includes(color)) {
      // 发送UTC时间戳
      const timestamp = Date.now();
      socketRef.current.emit('choose-color', { color, timestamp });
    }
  };

  return (
    <div className="App">
      <div className="game-container">
        <div className="game-header">
          <h1>中国象棋</h1>
          <div className="status-message">{message}</div>
        </div>

        {/* 颜色选择界面 */}
        {gameStatus === 'choosing-color' && (
          <div className="color-selection">
            <div className="color-buttons">
              <button
                className={`color-button red ${!availableColors.includes('red') ? 'disabled' : ''} ${takenColors.includes('red') ? 'taken' : ''}`}
                onClick={() => handleChooseColor('red')}
                disabled={!availableColors.includes('red')}
              >
                <span className="color-preview red">帅</span>
                <span>红方（先手）</span>
                {takenColors.includes('red') && <span className="taken-label">已被选择</span>}
              </button>
              <button
                className={`color-button black ${!availableColors.includes('black') ? 'disabled' : ''} ${takenColors.includes('black') ? 'taken' : ''}`}
                onClick={() => handleChooseColor('black')}
                disabled={!availableColors.includes('black')}
              >
                <span className="color-preview black">将</span>
                <span>黑方（后手）</span>
                {takenColors.includes('black') && <span className="taken-label">已被选择</span>}
              </button>
            </div>
          </div>
        )}

        {gameStatus !== 'choosing-color' && (
          <ChessBoard
            board={board}
            playerColor={playerColor}
            onMove={handleCellClick}
            isYourTurn={isYourTurn}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            isInCheck={isInCheckState[playerColor] || false}
            isInCheckState={isInCheckState}
            lastMove={lastMove}
          />
        )}

      </div>
    </div>
  );
}

export default App;

