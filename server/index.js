const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// 存储游戏状态：最多支持一个游戏会话
let gameState = {
  players: [],
  currentTurn: 'red', // 'red' 或 'black'
  board: null,
  gameId: null,
  gameEnded: false // 游戏是否已结束
};

// 五子棋游戏状态
let gomokuGameState = {
  players: [],
  board: Array(15).fill(null).map(() => Array(15).fill(null)),
  turn: 0, // 0 = 黑方，1 = 白方
  gameEnded: false
};

// 五子棋：检查是否获胜
function checkGomokuWin(board, row, col, playerColor) {
  const directions = [
    [[0, 1], [0, -1]],   // 水平
    [[1, 0], [-1, 0]],   // 垂直
    [[1, 1], [-1, -1]],  // 主对角线
    [[1, -1], [-1, 1]]   // 副对角线
  ];

  for (const [forward, backward] of directions) {
    let count = 1;
    
    // 向前检查
    let r = row + forward[0];
    let c = col + forward[1];
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === playerColor) {
      count++;
      r += forward[0];
      c += forward[1];
    }
    
    // 向后检查
    r = row + backward[0];
    c = col + backward[1];
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === playerColor) {
      count++;
      r += backward[0];
      c += backward[1];
    }
    
    if (count >= 5) {
      return true;
    }
  }
  
  return false;
}

// 允许玩家选择颜色
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 加入游戏（等待选择颜色）
  socket.on('join-game', () => {
    // 如果游戏已结束但还有玩家在，新玩家必须等待
    if (gameState.gameEnded && gameState.players.length > 0) {
      socket.emit('game-ended-waiting', { 
        message: '游戏已结束，请等待所有玩家退出后才能开始新游戏' 
      });
      return;
    }
    
    if (gameState.players.length >= 2) {
      socket.emit('game-full');
      return;
    }
    
    // 检查是否已经加入
    const existingPlayer = gameState.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      socket.emit('already-joined', { color: existingPlayer.color });
      return;
    }

    // 发送可用颜色信息
    const takenColors = gameState.players.map(p => p.color);
    const availableColors = ['red', 'black'].filter(c => !takenColors.includes(c));
    
    socket.emit('choose-color', { 
      availableColors,
      takenColors,
      players: gameState.players.map(p => ({ color: p.color, timestamp: p.timestamp }))
    });
    console.log('等待玩家选择颜色:', socket.id);
  });

  // 玩家选择颜色
  socket.on('choose-color', ({ color, timestamp }) => {
    if (!['red', 'black'].includes(color)) {
      socket.emit('error', { message: '无效的颜色选择' });
      return;
    }

    // 检查是否已经加入
    const existingPlayer = gameState.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      socket.emit('error', { message: '你已经选择了颜色' });
      return;
    }

    // 检查颜色是否已被占用
    const colorTakenPlayer = gameState.players.find(p => p.color === color);
    if (colorTakenPlayer) {
      // 如果同时选择，根据UTC时间判断
      const requestTime = timestamp || Date.now();
      const takenTime = colorTakenPlayer.timestamp || Date.now();
      
      if (requestTime < takenTime) {
        // 当前请求更早，替换已选择的玩家
        gameState.players = gameState.players.filter(p => p.id !== colorTakenPlayer.id);
        // 通知被替换的玩家
        io.to(colorTakenPlayer.id).emit('color-taken', { 
          message: '该颜色已被其他玩家选择',
          availableColors: ['red', 'black'].filter(c => c !== color)
        });
        // 添加新玩家
        gameState.players.push({ id: socket.id, color, timestamp: requestTime });
        socket.emit('color-chosen', { color });
        console.log(`${color === 'red' ? '红方' : '黑方'}选择颜色（替换）:`, socket.id);
      } else {
        // 已选择的玩家更早，拒绝当前请求
        socket.emit('error', { message: '该颜色已被选择' });
        return;
      }
    } else {
      // 颜色未被占用，直接添加
      const requestTime = timestamp || Date.now();
      gameState.players.push({ id: socket.id, color, timestamp: requestTime });
      socket.emit('color-chosen', { color });
      console.log(`${color === 'red' ? '红方' : '黑方'}选择颜色:`, socket.id);
    }
    
    // 通知所有玩家更新可用颜色
    const takenColors = gameState.players.map(p => p.color);
    const availableColors = ['red', 'black'].filter(c => !takenColors.includes(c));
    io.emit('colors-updated', { takenColors, availableColors });

    // 如果两个玩家都选择了颜色，开始游戏
    if (gameState.players.length === 2) {
      const redPlayer = gameState.players.find(p => p.color === 'red');
      const blackPlayer = gameState.players.find(p => p.color === 'black');
      
      if (redPlayer && blackPlayer) {
        // 重置游戏状态
        gameState.currentTurn = 'red';
        gameState.board = null;
        
        // 通知两个玩家游戏开始
        io.to(redPlayer.id).emit('game-started', { 
          color: 'red', 
          isYourTurn: true 
        });
        io.to(blackPlayer.id).emit('game-started', { 
          color: 'black', 
          isYourTurn: false 
        });
        console.log('游戏开始！红方:', redPlayer.id, '黑方:', blackPlayer.id);
        console.log('当前回合:', gameState.currentTurn);
      }
    } else {
      // 通知另一个玩家有人加入
      gameState.players.forEach(player => {
        if (player.id !== socket.id) {
          io.to(player.id).emit('opponent-choosing', {});
        }
      });
    }
  });

  // 处理移动
  socket.on('make-move', (move) => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit('error', { message: '你还没有加入游戏' });
      return;
    }

    // 检查是否是当前玩家的回合
    if (gameState.currentTurn !== player.color) {
      socket.emit('error', { message: '不是你的回合' });
      return;
    }

    // 更新当前回合（在广播之前）
    gameState.currentTurn = player.color === 'red' ? 'black' : 'red';
    console.log(`服务器收到移动: ${player.color} 从 (${move.fromRow},${move.fromCol}) 到 (${move.toRow},${move.toCol}). 下一回合: ${gameState.currentTurn}`);

    // 广播移动给所有玩家
    io.emit('move-made', {
      move,
      playerColor: player.color,
      nextTurn: gameState.currentTurn
    });
  });

  // 处理游戏结束通知
  socket.on('game-ended', () => {
    gameState.gameEnded = true;
    console.log('游戏已结束，等待所有玩家退出');
  });

  // 处理游戏重置
  socket.on('reset-game', () => {
    // 只有在所有玩家都退出后才能重置
    if (gameState.players.length > 0) {
      socket.emit('error', { message: '请等待所有玩家退出后才能重置游戏' });
      return;
    }
    gameState.players = [];
    gameState.currentTurn = 'red';
    gameState.board = null;
    gameState.gameEnded = false; // 重置游戏结束状态
    io.emit('game-reset');
    console.log('游戏已重置');
  });

  // ========== 五子棋相关事件 ==========
  
  // 五子棋：加入游戏
  socket.on('join-gomoku-game', () => {
    if (gomokuGameState.gameEnded && gomokuGameState.players.length > 0) {
      socket.emit('game-ended-waiting', { 
        message: '游戏已结束，请等待所有玩家退出后才能开始新游戏' 
      });
      return;
    }
    
    if (gomokuGameState.players.length >= 2) {
      socket.emit('gomoku-game-full');
      return;
    }
    
    const existingPlayer = gomokuGameState.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      socket.emit('already-joined-gomoku', { color: existingPlayer.color });
      return;
    }

    const takenColors = gomokuGameState.players.map(p => p.color);
    const availableColors = ['black', 'white'].filter(c => !takenColors.includes(c));
    
    socket.emit('choose-gomoku-color', { 
      availableColors,
      takenColors
    });
    console.log('等待玩家选择五子棋颜色:', socket.id);
  });

  // 五子棋：选择颜色
  socket.on('choose-gomoku-color', ({ color, timestamp }) => {
    if (!['black', 'white'].includes(color)) {
      socket.emit('error', { message: '无效的颜色选择' });
      return;
    }

    const existingPlayer = gomokuGameState.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      socket.emit('error', { message: '你已经选择了颜色' });
      return;
    }

    const colorTakenPlayer = gomokuGameState.players.find(p => p.color === color);
    if (colorTakenPlayer) {
      const requestTime = timestamp || Date.now();
      const takenTime = colorTakenPlayer.timestamp || Date.now();
      
      if (requestTime < takenTime) {
        gomokuGameState.players = gomokuGameState.players.filter(p => p.id !== colorTakenPlayer.id);
        io.to(colorTakenPlayer.id).emit('color-taken-gomoku', { 
          message: '该颜色已被其他玩家选择',
          availableColors: ['black', 'white'].filter(c => c !== color)
        });
        gomokuGameState.players.push({ id: socket.id, color, timestamp: requestTime });
        socket.emit('color-chosen-gomoku', { color });
        console.log(`${color === 'black' ? '黑方' : '白方'}选择颜色（替换）:`, socket.id);
      } else {
        socket.emit('error', { message: '该颜色已被选择' });
        return;
      }
    } else {
      const requestTime = timestamp || Date.now();
      gomokuGameState.players.push({ id: socket.id, color, timestamp: requestTime });
      socket.emit('color-chosen-gomoku', { color });
      console.log(`${color === 'black' ? '黑方' : '白方'}选择颜色:`, socket.id);
    }
    
    const takenColors = gomokuGameState.players.map(p => p.color);
    const availableColors = ['black', 'white'].filter(c => !takenColors.includes(c));
    io.emit('colors-updated-gomoku', { takenColors, availableColors });

    if (gomokuGameState.players.length === 2) {
      const blackPlayer = gomokuGameState.players.find(p => p.color === 'black');
      const whitePlayer = gomokuGameState.players.find(p => p.color === 'white');
      
      if (blackPlayer && whitePlayer) {
        gomokuGameState.turn = 0;
        gomokuGameState.board = Array(15).fill(null).map(() => Array(15).fill(null));
        
        io.to(blackPlayer.id).emit('gomoku-game-started', { 
          color: 'black', 
          isYourTurn: true 
        });
        io.to(whitePlayer.id).emit('gomoku-game-started', { 
          color: 'white', 
          isYourTurn: false 
        });
        console.log('五子棋游戏开始！黑方:', blackPlayer.id, '白方:', whitePlayer.id);
      }
    } else {
      gomokuGameState.players.forEach(player => {
        if (player.id !== socket.id) {
          io.to(player.id).emit('opponent-choosing-gomoku', {});
        }
      });
    }
  });

  // 五子棋：落子
  socket.on('gomoku-make-move', ({ row, col }) => {
    const player = gomokuGameState.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit('error', { message: '你还没有加入游戏' });
      return;
    }

    const currentPlayer = gomokuGameState.turn % 2 === 0 ? 'black' : 'white';
    if (player.color !== currentPlayer) {
      socket.emit('error', { message: '不是你的回合' });
      return;
    }

    if (gomokuGameState.board[row][col] !== null) {
      socket.emit('error', { message: '该位置已有棋子' });
      return;
    }

    gomokuGameState.board[row][col] = player.color;
    const nextTurn = gomokuGameState.turn + 1;
    gomokuGameState.turn = nextTurn;

    const winner = checkGomokuWin(gomokuGameState.board, row, col, player.color);
    if (winner) {
      gomokuGameState.gameEnded = true;
    }

    io.emit('gomoku-move-made', {
      row,
      col,
      playerColor: player.color,
      nextTurn,
      winner: winner ? player.color : null
    });

    console.log(`五子棋落子: ${player.color} 在 (${row},${col}), 下一回合: ${nextTurn % 2 === 0 ? 'black' : 'white'}`);
  });

  // 五子棋：重置游戏
  socket.on('gomoku-reset-game', () => {
    if (gomokuGameState.players.length > 0) {
      socket.emit('error', { message: '请等待所有玩家退出后才能重置游戏' });
      return;
    }
    gomokuGameState.players = [];
    gomokuGameState.board = Array(15).fill(null).map(() => Array(15).fill(null));
    gomokuGameState.turn = 0;
    gomokuGameState.gameEnded = false;
    io.emit('gomoku-game-reset');
    console.log('五子棋游戏已重置');
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
    
    // 处理象棋断开
    const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
      const player = gameState.players[playerIndex];
      gameState.players.splice(playerIndex, 1);
      console.log(`${player.color === 'red' ? '红方' : '黑方'}断开连接`);
      
      gameState.players.forEach(remainingPlayer => {
        io.to(remainingPlayer.id).emit('opponent-disconnected', {});
      });
      
      if (gameState.gameEnded && gameState.players.length === 0) {
        gameState.currentTurn = 'red';
        gameState.board = null;
        gameState.gameEnded = false;
        console.log('所有玩家已退出，游戏状态已重置，可以开始新游戏');
      } else if (!gameState.gameEnded && gameState.players.length === 0) {
        gameState.currentTurn = 'red';
        gameState.board = null;
        console.log('所有玩家断开，重置游戏状态');
      }
    }
    
    // 处理五子棋断开
    const gomokuPlayerIndex = gomokuGameState.players.findIndex(p => p.id === socket.id);
    if (gomokuPlayerIndex !== -1) {
      const player = gomokuGameState.players[gomokuPlayerIndex];
      gomokuGameState.players.splice(gomokuPlayerIndex, 1);
      console.log(`五子棋${player.color === 'black' ? '黑方' : '白方'}断开连接`);
      
      gomokuGameState.players.forEach(remainingPlayer => {
        io.to(remainingPlayer.id).emit('gomoku-opponent-disconnected', {});
      });
      
      if (gomokuGameState.gameEnded && gomokuGameState.players.length === 0) {
        gomokuGameState.board = Array(15).fill(null).map(() => Array(15).fill(null));
        gomokuGameState.turn = 0;
        gomokuGameState.gameEnded = false;
        console.log('所有五子棋玩家已退出，游戏状态已重置');
      } else if (!gomokuGameState.gameEnded && gomokuGameState.players.length === 0) {
        gomokuGameState.board = Array(15).fill(null).map(() => Array(15).fill(null));
        gomokuGameState.turn = 0;
        console.log('所有五子棋玩家断开，重置游戏状态');
      }
    }
  });
});

// 在生产环境中提供静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('生产模式：提供静态文件服务');
  }
});
