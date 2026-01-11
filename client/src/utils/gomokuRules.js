// 五子棋规则引擎

// 棋盘大小：15x15
export const BOARD_SIZE = 15;

// 创建空棋盘
export function createEmptyBoard() {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

// 初始棋盘（空棋盘）
export const INITIAL_BOARD = createEmptyBoard();

// 检查位置是否在棋盘内
export function isValidPosition(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// 检查是否可以在此位置落子
export function isValidMove(board, row, col) {
  // 检查位置是否在棋盘内
  if (!isValidPosition(row, col)) {
    return false;
  }
  
  // 检查位置是否已有棋子
  if (board[row][col] !== null) {
    return false;
  }
  
  return true;
}

// 执行落子
export function makeMove(board, row, col, playerColor) {
  if (!isValidMove(board, row, col)) {
    return board;
  }
  
  const newBoard = board.map(row => [...row]);
  newBoard[row][col] = playerColor;
  return newBoard;
}

// 检查是否获胜（五子连珠）
export function checkWin(board, row, col, playerColor) {
  // 检查四个方向：水平、垂直、两个对角线
  const directions = [
    [[0, 1], [0, -1]],   // 水平
    [[1, 0], [-1, 0]],   // 垂直
    [[1, 1], [-1, -1]],  // 主对角线
    [[1, -1], [-1, 1]]   // 副对角线
  ];
  
  for (const [forward, backward] of directions) {
    let count = 1; // 包括当前落子
    
    // 向前检查
    let r = row + forward[0];
    let c = col + forward[1];
    while (isValidPosition(r, c) && board[r][c] === playerColor) {
      count++;
      r += forward[0];
      c += forward[1];
    }
    
    // 向后检查
    r = row + backward[0];
    c = col + backward[1];
    while (isValidPosition(r, c) && board[r][c] === playerColor) {
      count++;
      r += backward[0];
      c += backward[1];
    }
    
    // 如果连续5个或更多，则获胜
    if (count >= 5) {
      return true;
    }
  }
  
  return false;
}

// 检查是否平局（棋盘已满）
export function isDraw(board) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        return false; // 还有空位
      }
    }
  }
  return true; // 棋盘已满
}

// 获取当前玩家
export function getCurrentPlayer(turn) {
  return turn % 2 === 0 ? 'black' : 'white';
}

