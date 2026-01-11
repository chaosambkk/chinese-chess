import React, { useState, useEffect } from 'react';
import './GomokuBoard.css';
import { BOARD_SIZE } from '../utils/gomokuRules';

function GomokuBoard({ board, onCellClick, isYourTurn, currentPlayer, lastMove }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [boardSize, setBoardSize] = useState({ width: 600, height: 600 });

  // 响应式计算棋盘尺寸
  useEffect(() => {
    const updateSize = () => {
      const boardElement = document.querySelector('.gomoku-board');
      if (boardElement) {
        const actualWidth = boardElement.clientWidth || boardElement.offsetWidth;
        const actualHeight = boardElement.clientHeight || boardElement.offsetHeight;
        setBoardSize({ width: actualWidth, height: actualHeight });
      }
    };

    const timer = setTimeout(updateSize, 0);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // 计算单元格大小
  const cellSize = boardSize.width / (BOARD_SIZE + 1);
  const boardWidth = BOARD_SIZE * cellSize;
  const boardHeight = BOARD_SIZE * cellSize;
  const startX = cellSize / 2;
  const startY = cellSize / 2;

  // 渲染棋盘
  const renderBoard = () => {
    const cells = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
        const isLastMove = lastMove && lastMove.row === row && lastMove.col === col;
        
        const left = startX + col * cellSize;
        const top = startY + row * cellSize;

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`gomoku-cell ${piece || ''} ${isHovered ? 'hovered' : ''} ${isLastMove ? 'last-move' : ''}`}
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
            }}
            onClick={() => onCellClick(row, col)}
            onMouseEnter={() => setHoveredCell({ row, col })}
            onMouseLeave={() => setHoveredCell(null)}
          >
            {piece && (
              <div className={`gomoku-piece ${piece}`}></div>
            )}
            {isHovered && !piece && isYourTurn && (
              <div className={`gomoku-preview ${currentPlayer}`}></div>
            )}
          </div>
        );
      }
    }
    
    return cells;
  };

  return (
    <div className="gomoku-board-container">
      <div className="gomoku-board">
        {/* 绘制棋盘网格线 */}
        <svg 
          className="board-lines" 
          viewBox={`0 0 ${boardWidth} ${boardHeight}`} 
          preserveAspectRatio="none" 
          style={{ 
            width: `${boardWidth}px`, 
            height: `${boardHeight}px`, 
            left: `${startX}px`, 
            top: `${startY}px` 
          }}
        >
          {/* 横线 */}
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * cellSize}
              x2={boardWidth}
              y2={i * cellSize}
              stroke="#8b4513"
              strokeWidth="1.5"
            />
          ))}
          {/* 竖线 */}
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={i * cellSize}
              y1="0"
              x2={i * cellSize}
              y2={boardHeight}
              stroke="#8b4513"
              strokeWidth="1.5"
            />
          ))}
          {/* 天元和星位标记 */}
          {[
            [3, 3], [3, 11], [11, 3], [11, 11], [7, 7]
          ].map(([r, c], idx) => (
            <circle
              key={`star-${idx}`}
              cx={c * cellSize}
              cy={r * cellSize}
              r="4"
              fill="#8b4513"
            />
          ))}
        </svg>

        {renderBoard()}
      </div>
    </div>
  );
}

export default GomokuBoard;

