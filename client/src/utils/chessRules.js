// 中国象棋规则引擎

// 初始棋盘布局
export const INITIAL_BOARD = [
  // 黑方（上方）
  ['r', 'n', 'b', 'a', 'k', 'a', 'b', 'n', 'r'], // 0: 车马象士将士象马车
  [null, null, null, null, null, null, null, null, null], // 1
  [null, 'c', null, null, null, null, null, 'c', null], // 2: 炮
  ['p', null, 'p', null, 'p', null, 'p', null, 'p'], // 3: 兵
  [null, null, null, null, null, null, null, null, null], // 4: 楚河
  [null, null, null, null, null, null, null, null, null], // 5: 汉界
  ['P', null, 'P', null, 'P', null, 'P', null, 'P'], // 6: 兵
  [null, 'C', null, null, null, null, null, 'C', null], // 7: 炮
  [null, null, null, null, null, null, null, null, null], // 8
  ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R'], // 9: 车马象士将士象马车
];

// 棋子说明：
// 大写 = 红方，小写 = 黑方
// R/r = 车, N/n = 马, B/b = 象, A/a = 士, K/k = 将/帅, C/c = 炮, P/p = 兵/卒

// 判断棋子颜色
export function getPieceColor(piece) {
  if (!piece) return null;
  return piece === piece.toUpperCase() ? 'red' : 'black';
}

// 判断是否是己方棋子
export function isOwnPiece(piece, playerColor) {
  if (!piece) return false;
  const pieceColor = getPieceColor(piece);
  return pieceColor === playerColor;
}

// 判断是否是对方棋子
export function isEnemyPiece(piece, playerColor) {
  if (!piece) return false;
  const pieceColor = getPieceColor(piece);
  return pieceColor !== playerColor;
}

// 检查位置是否在棋盘内
export function isValidPosition(row, col) {
  return row >= 0 && row < 10 && col >= 0 && col < 9;
}

// 检查移动是否合法
export function isValidMove(board, fromRow, fromCol, toRow, toCol, playerColor, isCurrentlyInCheck = false) {
  // 检查起始位置是否有己方棋子
  const piece = board[fromRow][fromCol];
  if (!piece || !isOwnPiece(piece, playerColor)) {
    return false;
  }

  // 检查目标位置是否是己方棋子
  const targetPiece = board[toRow][toCol];
  if (targetPiece && isOwnPiece(targetPiece, playerColor)) {
    return false;
  }

  // 根据棋子类型检查移动规则
  const pieceType = piece.toUpperCase();
  let moveIsValid = false;
  
  switch (pieceType) {
    case 'R': // 车
      moveIsValid = isValidRookMove(board, fromRow, fromCol, toRow, toCol);
      break;
    case 'N': // 马
      moveIsValid = isValidKnightMove(board, fromRow, fromCol, toRow, toCol);
      break;
    case 'B': // 象
      moveIsValid = isValidBishopMove(board, fromRow, fromCol, toRow, toCol, playerColor);
      break;
    case 'A': // 士
      moveIsValid = isValidAdvisorMove(board, fromRow, fromCol, toRow, toCol, playerColor);
      break;
    case 'K': // 将/帅
      moveIsValid = isValidKingMove(board, fromRow, fromCol, toRow, toCol, playerColor);
      break;
    case 'C': // 炮
      moveIsValid = isValidCannonMove(board, fromRow, fromCol, toRow, toCol);
      break;
    case 'P': // 兵/卒
      moveIsValid = isValidPawnMove(board, fromRow, fromCol, toRow, toCol, playerColor);
      break;
    default:
      return false;
  }

  // 如果基本移动规则不合法，直接返回
  if (!moveIsValid) {
    return false;
  }

  // 模拟移动，检查移动后的状态
  const newBoard = makeMove(board, fromRow, fromCol, toRow, toCol);
  
  // 检查移动后自己是否会被将军（不能送将）
  // 这个检查适用于所有情况：
  // 1. 如果当前被将军，移动后必须不再被将军
  // 2. 如果当前未被将军，移动后也不能让自己被将军
  if (isInCheck(newBoard, playerColor)) {
    return false;
  }

  return true;
}

// 车的移动规则
function isValidRookMove(board, fromRow, fromCol, toRow, toCol) {
  // 车只能直线移动
  if (fromRow !== toRow && fromCol !== toCol) {
    return false;
  }

  // 检查路径是否有阻挡
  if (fromRow === toRow) {
    // 横向移动
    const start = Math.min(fromCol, toCol);
    const end = Math.max(fromCol, toCol);
    for (let col = start + 1; col < end; col++) {
      if (board[fromRow][col]) return false;
    }
  } else {
    // 纵向移动
    const start = Math.min(fromRow, toRow);
    const end = Math.max(fromRow, toRow);
    for (let row = start + 1; row < end; row++) {
      if (board[row][fromCol]) return false;
    }
  }

  return true;
}

// 马的移动规则
function isValidKnightMove(board, fromRow, fromCol, toRow, toCol) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // 马走日字：(2,1) 或 (1,2)
  if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
    return false;
  }

  // 检查蹩马腿
  let blockRow, blockCol;
  if (rowDiff === 2) {
    blockRow = fromRow + (toRow - fromRow) / 2;
    blockCol = fromCol;
  } else {
    blockRow = fromRow;
    blockCol = fromCol + (toCol - fromCol) / 2;
  }

  if (board[blockRow][blockCol]) return false;

  return true;
}

// 象的移动规则
function isValidBishopMove(board, fromRow, fromCol, toRow, toCol, playerColor) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // 象走田字：(2,2)
  if (rowDiff !== 2 || colDiff !== 2) {
    return false;
  }

  // 象不能过河
  if (playerColor === 'red' && toRow < 5) return false;
  if (playerColor === 'black' && toRow >= 5) return false;

  // 检查塞象眼
  const blockRow = fromRow + (toRow - fromRow) / 2;
  const blockCol = fromCol + (toCol - fromCol) / 2;
  if (board[blockRow][blockCol]) return false;

  return true;
}

// 士的移动规则
function isValidAdvisorMove(board, fromRow, fromCol, toRow, toCol, playerColor) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // 士走斜线：(1,1)
  if (rowDiff !== 1 || colDiff !== 1) {
    return false;
  }

  // 士不能出九宫
  if (playerColor === 'red') {
    if (toRow < 7 || toCol < 3 || toCol > 5) return false;
  } else {
    if (toRow > 2 || toCol < 3 || toCol > 5) return false;
  }

  return true;
}

// 将/帅的移动规则
function isValidKingMove(board, fromRow, fromCol, toRow, toCol, playerColor) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // 特殊情况：将帅对脸（同一列，中间无子，目标是对方的将/帅）
  if (rowDiff > 0 && colDiff === 0 && fromCol === toCol) {
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.toUpperCase() === 'K' && isEnemyPiece(targetPiece, playerColor)) {
      // 检查中间是否有棋子
      const start = Math.min(fromRow, toRow);
      const end = Math.max(fromRow, toRow);
      for (let row = start + 1; row < end; row++) {
        if (board[row][fromCol]) return false;
      }
      return true; // 将帅对脸，可以吃
    }
  }

  // 将/帅只能走一格，且只能直线
  if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
    return false;
  }

  // 将/帅不能出九宫
  if (playerColor === 'red') {
    if (toRow < 7 || toCol < 3 || toCol > 5) return false;
  } else {
    if (toRow > 2 || toCol < 3 || toCol > 5) return false;
  }

  return true;
}

// 炮的移动规则
function isValidCannonMove(board, fromRow, fromCol, toRow, toCol) {
  // 炮只能直线移动
  if (fromRow !== toRow && fromCol !== toCol) {
    return false;
  }

  const targetPiece = board[toRow][toCol];
  let pieceCount = 0;

  if (fromRow === toRow) {
    // 横向移动
    const start = Math.min(fromCol, toCol);
    const end = Math.max(fromCol, toCol);
    for (let col = start + 1; col < end; col++) {
      if (board[fromRow][col]) pieceCount++;
    }
  } else {
    // 纵向移动
    const start = Math.min(fromRow, toRow);
    const end = Math.max(fromRow, toRow);
    for (let row = start + 1; row < end; row++) {
      if (board[row][fromCol]) pieceCount++;
    }
  }

  // 如果目标位置有棋子，必须隔一个棋子（吃子）
  // 如果目标位置没有棋子，路径必须为空（移动）
  if (targetPiece) {
    return pieceCount === 1; // 必须隔一个棋子
  } else {
    return pieceCount === 0; // 路径必须为空
  }
}

// 兵/卒的移动规则
function isValidPawnMove(board, fromRow, fromCol, toRow, toCol, playerColor) {
  const rowDiff = toRow - fromRow;
  const colDiff = Math.abs(toCol - fromCol);

  if (playerColor === 'red') {
    // 红方兵：未过河只能向前，过河后可以左右
    if (fromRow >= 5) {
      // 未过河：只能向前
      if (rowDiff !== -1 || colDiff !== 0) return false;
    } else {
      // 已过河：可以向前或左右，不能后退
      if (rowDiff === -1 && colDiff === 0) return true; // 向前
      if (rowDiff === 0 && colDiff === 1) return true; // 左右
      return false;
    }
  } else {
    // 黑方卒：未过河只能向前，过河后可以左右
    if (fromRow < 5) {
      // 未过河：只能向前
      if (rowDiff !== 1 || colDiff !== 0) return false;
    } else {
      // 已过河：可以向前或左右，不能后退
      if (rowDiff === 1 && colDiff === 0) return true; // 向前
      if (rowDiff === 0 && colDiff === 1) return true; // 左右
      return false;
    }
  }

  return true;
}

// 执行移动
export function makeMove(board, fromRow, fromCol, toRow, toCol) {
  const newBoard = board.map(row => [...row]);
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  return newBoard;
}

// 检查是否被将军（将/帅是否被对方棋子威胁）
export function isInCheck(board, playerColor) {
  // 查找将/帅的位置
  const kingSymbol = playerColor === 'red' ? 'K' : 'k';
  let kingRow = -1, kingCol = -1;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === kingSymbol) {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
    if (kingRow !== -1) break;
  }

  // 如果找不到将/帅，说明已经被将死
  if (kingRow === -1) return false;

  // 检查是否有对方的棋子可以攻击到将/帅
  const opponentColor = playerColor === 'red' ? 'black' : 'red';
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && isEnemyPiece(piece, playerColor)) {
        // 检查这个棋子是否可以移动到将/帅的位置
        // 注意：这里不能使用 isValidMove，因为它会检查"不能送将"，导致循环依赖
        // 所以直接检查移动规则，不检查送将
        if (canAttackKing(board, row, col, kingRow, kingCol, opponentColor)) {
          return true;
        }
      }
    }
  }

  return false;
}

// 检查棋子是否可以攻击到将/帅（不检查送将规则，用于 isInCheck）
function canAttackKing(board, fromRow, fromCol, kingRow, kingCol, attackerColor) {
  const piece = board[fromRow][fromCol];
  if (!piece || !isOwnPiece(piece, attackerColor)) {
    return false;
  }

  // 检查目标位置是否是己方棋子
  const targetPiece = board[kingRow][kingCol];
  if (targetPiece && isOwnPiece(targetPiece, attackerColor)) {
    return false;
  }

  // 根据棋子类型检查移动规则（不检查送将）
  const pieceType = piece.toUpperCase();
  
  switch (pieceType) {
    case 'R': // 车
      return isValidRookMove(board, fromRow, fromCol, kingRow, kingCol);
    case 'N': // 马
      return isValidKnightMove(board, fromRow, fromCol, kingRow, kingCol);
    case 'B': // 象
      return isValidBishopMove(board, fromRow, fromCol, kingRow, kingCol, attackerColor);
    case 'A': // 士
      return isValidAdvisorMove(board, fromRow, fromCol, kingRow, kingCol, attackerColor);
    case 'K': // 将/帅
      return isValidKingMove(board, fromRow, fromCol, kingRow, kingCol, attackerColor);
    case 'C': // 炮
      return isValidCannonMove(board, fromRow, fromCol, kingRow, kingCol);
    case 'P': // 兵/卒
      return isValidPawnMove(board, fromRow, fromCol, kingRow, kingCol, attackerColor);
    default:
      return false;
  }
}

// 检查是否将死（被将军且无法解除）
export function isCheckmate(board, playerColor) {
  // 首先检查是否被将军
  if (!isInCheck(board, playerColor)) {
    return false; // 未被将军，不是将死
  }

  // 如果被将军，检查是否有任何合法走法可以解除将军
  // 遍历所有己方棋子，看是否有任何合法移动
  for (let fromRow = 0; fromRow < 10; fromRow++) {
    for (let fromCol = 0; fromCol < 9; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (!piece || !isOwnPiece(piece, playerColor)) {
        continue; // 不是己方棋子，跳过
      }

      // 尝试所有可能的目标位置
      for (let toRow = 0; toRow < 10; toRow++) {
        for (let toCol = 0; toCol < 9; toCol++) {
          // 检查这个移动是否合法（isValidMove 会检查是否解除将军）
          if (isValidMove(board, fromRow, fromCol, toRow, toCol, playerColor, true)) {
            return false; // 找到合法走法，不是将死
          }
        }
      }
    }
  }

  // 被将军且没有任何合法走法，是将死
  return true;
}

