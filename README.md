# 中国象棋在线对战

一个简单的中国象棋在线对战游戏，支持两人远程对弈。

## 功能特点

- 🎮 完整的中国象棋规则实现
- 🌐 实时在线对战（WebSocket）
- 🎨 简洁美观的界面
- 📱 响应式设计

## 安装和运行

### 1. 安装依赖

```bash
npm run install-all
```

### 2. 启动开发服务器

```bash
npm run dev
```

这将同时启动：
- 后端服务器：http://localhost:3001
- 前端应用：http://localhost:3000

### 3. 使用说明

#### 单人测试（自己和自己下棋）

有几种方法可以一个人测试：

**方法一：两个浏览器窗口（推荐）**
1. 启动服务器后，打开第一个浏览器窗口，访问 http://localhost:3000
   - 你会成为**红方**（先手）
   - 等待对手加入...
2. 打开第二个浏览器窗口（或新标签页），也访问 http://localhost:3000
   - 你会成为**黑方**（后手）
   - 游戏开始！
3. 现在你可以在两个窗口之间切换，自己和自己下棋

**方法二：使用隐身模式**
1. 正常窗口打开 http://localhost:3000（红方）
2. 使用浏览器的隐身/无痕模式打开 http://localhost:3000（黑方）

**方法三：使用不同浏览器**
1. 在 Chrome 中打开 http://localhost:3000（红方）
2. 在 Firefox/Safari/Edge 中打开 http://localhost:3000（黑方）

#### 双人对战（联网）

1. 将服务器部署到公网（如云服务器）
2. 双方访问部署后的地址
3. 第一个连接的选择红方（先手），第二个选择黑方（后手）

**详细部署指南请查看 [DEPLOY.md](./DEPLOY.md)**

## 项目结构

```
chess/
├── server/          # 后端服务器
│   └── index.js    # Express + Socket.io 服务器
├── client/          # React 前端应用
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   └── utils/
│   └── public/
└── package.json
```

## 技术栈

- 前端：React
- 后端：Node.js + Express + Socket.io
- 通信：WebSocket

