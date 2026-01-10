import React, { useState, useEffect } from 'react';
import './ChessBoard.css';
import { getPieceColor } from '../utils/chessRules';

const PIECE_NAMES = {
  // 红方（大写）
  'R': '車',  // 红方车
  'N': '馬',  // 红方马
  'B': '相',  // 红方象
  'A': '士',  // 红方士
  'K': '帅',  // 红方帅
  'C': '炮',  // 红方炮
  'P': '兵',  // 红方兵
  // 黑方（小写）
  'r': '车',  // 黑方车
  'n': '马',  // 黑方马
  'b': '象',  // 黑方象
  'a': '士',  // 黑方士
  'k': '将',  // 黑方将
  'c': '炮',  // 黑方炮
  'p': '卒',  // 黑方卒
};

function ChessBoard({ board, playerColor, onMove, isYourTurn, selectedCell, onCellClick, isInCheck, isInCheckState, lastMove }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [boardSize, setBoardSize] = useState({ width: 540, height: 600 });
  const [riverTextStyle, setRiverTextStyle] = useState({ left: {}, right: {} });

  // 响应式计算棋盘尺寸和楚河汉界位置
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.chess-board-container');
      if (container) {
        const containerWidth = container.clientWidth - 20; // 减去 padding
        const maxWidth = Math.min(540, containerWidth);
        const maxHeight = (maxWidth / 9) * 10; // 保持 9:10 比例
        setBoardSize({ width: maxWidth, height: maxHeight });
        
        // 计算楚河汉界位置：应该在棋盘两侧，距离边缘约15%
        const riverLeft = maxWidth * 0.15;
        const riverRight = maxWidth * 0.15;
        // 根据棋盘大小调整字体大小
        const fontSize = Math.max(20, Math.min(42, maxWidth * 0.078));
        
        setRiverTextStyle({
          left: { left: `${riverLeft}px`, fontSize: `${fontSize}px` },
          right: { right: `${riverRight}px`, fontSize: `${fontSize}px` }
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 根据实际棋盘尺寸计算 cellSize
  // 使用固定的比例，但根据容器大小调整
  const baseCellSize = 60;
  const scale = boardSize.width / 540; // 相对于标准尺寸的缩放比例
  const cellSize = baseCellSize * scale;
  const startX = (boardSize.width - 8 * cellSize) / 2; // 居中
  const startY = (boardSize.height - 9 * cellSize) / 2; // 居中
  const boardWidth = 8 * cellSize; // 9条竖线，8个间隔
  const boardHeight = 9 * cellSize; // 10条横线，9个间隔
  
  // 如果玩家选择黑色，需要将红黑棋子对调显示
  const isBlackPlayer = playerColor === 'black';
  
  // 坐标转换函数：将显示坐标转换为实际棋盘坐标
  const toBoardCoord = (displayRow, displayCol) => {
    if (isBlackPlayer) {
      return { row: 9 - displayRow, col: 8 - displayCol };
    }
    return { row: displayRow, col: displayCol };
  };
  
  // 坐标转换函数：将实际棋盘坐标转换为显示坐标
  const toDisplayCoord = (boardRow, boardCol) => {
    if (isBlackPlayer) {
      return { row: 9 - boardRow, col: 8 - boardCol };
    }
    return { row: boardRow, col: boardCol };
  };

  // 渲染棋盘交叉点
  const renderBoard = () => {
    const cells = [];
    
    // 调试：检查将军状态
    if (isInCheckState && playerColor) {
      const checkStatus = isInCheckState[playerColor];
      if (checkStatus) {
        console.log('ChessBoard: 当前玩家被将军', { playerColor, isInCheckState });
      }
    }
    
    for (let displayRow = 0; displayRow < 10; displayRow++) {
      for (let displayCol = 0; displayCol < 9; displayCol++) {
        // 转换为实际棋盘坐标
        const { row, col } = toBoardCoord(displayRow, displayCol);
        const piece = board[row][col];
        const pieceColor = piece ? getPieceColor(piece) : null;
        
        // 转换 selectedCell 和 hoveredCell 坐标进行比较
        const selectedDisplay = selectedCell ? toDisplayCoord(selectedCell.row, selectedCell.col) : null;
        const hoveredDisplay = hoveredCell ? toDisplayCoord(hoveredCell.row, hoveredCell.col) : null;
        
        const isSelected = selectedDisplay && selectedDisplay.row === displayRow && selectedDisplay.col === displayCol;
        const isHovered = hoveredDisplay && hoveredDisplay.row === displayRow && hoveredDisplay.col === displayCol;
        
        // 检查当前是否被将军
        const currentlyInCheck = isInCheckState && playerColor ? (isInCheckState[playerColor] || false) : false;

        // 检查是否是自己的将/帅且被将军
        const isKingInCheck = currentlyInCheck && piece && 
          ((playerColor === 'red' && piece === 'K') || (playerColor === 'black' && piece === 'k'));

        // 检查是否是最后移动的棋子（目标位置）
        const isLastMoved = lastMove && lastMove.toRow === row && lastMove.toCol === col;

        // 计算显示位置（始终使用显示坐标）
        const left = startX + displayCol * cellSize;
        const top = startY + displayRow * cellSize;

        cells.push(
          <div
            key={`${displayRow}-${displayCol}`}
            className={`cell ${pieceColor || ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isKingInCheck ? 'in-check' : ''} ${isLastMoved ? 'last-moved' : ''}`}
            style={{ 
              left: `${left}px`, 
              top: `${top}px`,
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
            onClick={() => onCellClick(row, col)}
            onMouseEnter={() => setHoveredCell({ row, col })}
            onMouseLeave={() => setHoveredCell(null)}
          >
            {piece && (
              <span 
                className={`piece ${pieceColor} ${isKingInCheck ? 'piece-in-check' : ''} ${(isSelected || isHovered) ? 'selected-piece' : ''}`} 
                style={{
                  transform: pieceColor === playerColor 
                    ? 'translateY(2px)' // 自己的棋子：正向显示
                    : 'translateY(2px) rotate(180deg)', // 对方的棋子：倒着显示（旋转180度）
                  zIndex: 10000,
                  position: 'relative',
                  display: 'flex',
                  opacity: 1,
                  visibility: 'visible',
                  pointerEvents: 'auto',
                  // 确保棋子位置固定，不受角标记影响
                  margin: 0,
                  padding: 0,
                  flexShrink: 0,
                  flexGrow: 0,
                  alignSelf: 'center'
                }}
              >
                {PIECE_NAMES[piece]}
              </span>
            )}
            {/* 角标记使用单独的绝对定位元素，完全不影响flex布局 */}
            {(isSelected || isHovered) && piece && (
              <>
                <div className="piece-corner piece-corner-tl"></div>
                <div className="piece-corner piece-corner-tr"></div>
                <div className="piece-corner piece-corner-bl"></div>
                <div className="piece-corner piece-corner-br"></div>
              </>
            )}
            {(isSelected || isHovered) && !piece && (
              <>
                <span className="corner corner-tl"></span>
                <span className="corner corner-tr"></span>
                <span className="corner corner-bl"></span>
                <span className="corner corner-br"></span>
              </>
            )}
            {isLastMoved && (
              <>
                <span className="last-move-corner last-move-corner-tl"></span>
                <span className="last-move-corner last-move-corner-tr"></span>
                <span className="last-move-corner last-move-corner-bl"></span>
                <span className="last-move-corner last-move-corner-br"></span>
              </>
            )}
          </div>
        );
      }
    }
    
    return cells;
  };

  return (
    <div className="chess-board-container">
      <div className="chess-board">
        {/* 绘制棋盘线 */}
        <svg className="board-lines" viewBox={`0 0 ${boardWidth} ${boardHeight}`} preserveAspectRatio="none" style={{ width: `${boardWidth}px`, height: `${boardHeight}px`, left: `${startX}px`, top: `${startY}px` }}>
          {/* 横线：10条 */}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * cellSize}
              x2={boardWidth}
              y2={i * cellSize}
              stroke="#8b4513"
              strokeWidth="2"
            />
          ))}
          {/* 竖线：9条，但在河带区域（第4-5行之间）不显示 */}
          {Array.from({ length: 9 }, (_, i) => (
            <g key={`v-${i}`}>
              {/* 上半部分竖线（0到第4行） */}
              <line
                x1={i * cellSize}
                y1="0"
                x2={i * cellSize}
                y2={4 * cellSize}
                stroke="#8b4513"
                strokeWidth="2"
              />
              {/* 下半部分竖线（第5行到底部） */}
              <line
                x1={i * cellSize}
                y1={5 * cellSize}
                x2={i * cellSize}
                y2={boardHeight}
                stroke="#8b4513"
                strokeWidth="2"
              />
            </g>
          ))}
          {/* 红方九宫斜线（行7-9，列3-5） */}
          <line x1={3 * cellSize} y1={7 * cellSize} x2={5 * cellSize} y2={9 * cellSize} stroke="#8b4513" strokeWidth="2" />
          <line x1={5 * cellSize} y1={7 * cellSize} x2={3 * cellSize} y2={9 * cellSize} stroke="#8b4513" strokeWidth="2" />
          {/* 黑方九宫斜线（行0-2，列3-5） */}
          <line x1={3 * cellSize} y1={0} x2={5 * cellSize} y2={2 * cellSize} stroke="#8b4513" strokeWidth="2" />
          <line x1={5 * cellSize} y1={0} x2={3 * cellSize} y2={2 * cellSize} stroke="#8b4513" strokeWidth="2" />
        </svg>

        {/* 绘制楚河汉界文字 */}
        <div className="river-text river-left" style={riverTextStyle.left}>楚河</div>
        <div className="river-text river-right" style={riverTextStyle.right}>汉界</div>

        {renderBoard()}
      </div>
    </div>
  );
}

export default ChessBoard;

