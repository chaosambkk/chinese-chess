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

  // 处理断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
    const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
      const player = gameState.players[playerIndex];
      gameState.players.splice(playerIndex, 1);
      console.log(`${player.color === 'red' ? '红方' : '黑方'}断开连接`);
      
      // 通知另一个玩家
      gameState.players.forEach(remainingPlayer => {
        io.to(remainingPlayer.id).emit('opponent-disconnected', {});
      });
      
      // 如果游戏已结束且所有玩家都断开，重置游戏状态，允许新游戏开始
      if (gameState.gameEnded && gameState.players.length === 0) {
        gameState.currentTurn = 'red';
        gameState.board = null;
        gameState.gameEnded = false; // 重置游戏结束状态，允许新游戏开始
        console.log('所有玩家已退出，游戏状态已重置，可以开始新游戏');
      } else if (!gameState.gameEnded && gameState.players.length === 0) {
        // 如果游戏未结束但所有玩家都断开，只重置基本状态
        gameState.currentTurn = 'red';
        gameState.board = null;
        console.log('所有玩家断开，重置游戏状态');
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
