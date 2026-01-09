# 部署指南

本指南将帮助你将中国象棋游戏部署到云端，让不同国家的人可以联网下棋。

## 部署方案

### 方案一：Railway（推荐，简单快速）

Railway 是一个现代化的部署平台，支持自动部署。

#### 步骤：

1. **注册 Railway 账号**
   - 访问 https://railway.app
   - 使用 GitHub 账号登录

2. **准备项目**
   ```bash
   # 确保代码已提交到 GitHub
   git add .
   git commit -m "准备部署"
   git push
   ```

3. **在 Railway 创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

4. **配置环境变量**
   - 在 Railway 项目设置中添加环境变量：
     - `NODE_ENV=production`
     - `PORT` (Railway 会自动设置)

5. **部署**
   - Railway 会自动检测并部署
   - 部署完成后，会提供一个 URL（如：`https://your-app.railway.app`）

6. **配置前端**
   - 在 Railway 项目设置中，找到部署 URL
   - 在客户端代码中，设置 `REACT_APP_SERVER_URL` 为你的 Railway URL

---

### 方案二：Heroku

#### 步骤：

1. **安装 Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # 或访问 https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **创建 Procfile**
   在项目根目录创建 `Procfile`：
   ```
   web: node server/index.js
   ```

3. **登录 Heroku**
   ```bash
   heroku login
   ```

4. **创建应用**
   ```bash
   heroku create your-chess-app
   ```

5. **设置环境变量**
   ```bash
   heroku config:set NODE_ENV=production
   ```

6. **部署**
   ```bash
   git push heroku main
   ```

7. **获取 URL**
   ```bash
   heroku info
   ```

---

### 方案三：使用自己的服务器（VPS）

如果你有自己的服务器（如阿里云、腾讯云、AWS等），可以按以下步骤部署：

#### 步骤：

1. **在服务器上安装 Node.js**
   ```bash
   # 使用 nvm 安装 Node.js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd chess
   npm run install-all
   ```

3. **构建前端**
   ```bash
   npm run build
   ```

4. **安装 PM2（进程管理器）**
   ```bash
   npm install -g pm2
   ```

5. **启动服务**
   ```bash
   NODE_ENV=production PORT=3001 pm2 start server/index.js --name chess-server
   pm2 save
   pm2 startup
   ```

6. **配置 Nginx（可选，推荐）**
   
   创建 `/etc/nginx/sites-available/chess`：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   启用配置：
   ```bash
   sudo ln -s /etc/nginx/sites-available/chess /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **配置防火墙**
   ```bash
   # 开放端口
   sudo ufw allow 3001
   sudo ufw allow 80
   sudo ufw allow 443
   ```

8. **配置域名和 SSL（可选）**
   ```bash
   # 使用 Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### 方案四：Vercel + Railway（前后端分离）

- 前端部署到 Vercel
- 后端部署到 Railway

#### 步骤：

1. **部署后端到 Railway**（参考方案一）

2. **部署前端到 Vercel**
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - 设置构建命令：`cd client && npm install && npm run build`
   - 设置输出目录：`client/build`
   - 添加环境变量：`REACT_APP_SERVER_URL=https://your-railway-app.railway.app`

---

## 部署后配置

### 1. 更新前端服务器地址

在生产环境中，需要确保前端连接到正确的后端服务器。

**方法一：使用环境变量**
- 在部署平台设置 `REACT_APP_SERVER_URL` 环境变量
- 重新构建前端

**方法二：修改代码**
- 在 `client/src/App.js` 中修改 `SERVER_URL`

### 2. 测试连接

部署完成后，在两个不同的设备/浏览器中访问你的应用：
1. 第一个设备选择红色
2. 第二个设备选择黑色
3. 开始下棋！

---

## 常见问题

### Q: WebSocket 连接失败
A: 确保：
- 服务器支持 WebSocket
- 防火墙开放了相应端口
- 如果使用 Nginx，配置了 WebSocket 代理

### Q: 跨域问题
A: 服务器已配置 CORS，允许所有来源。如果还有问题，检查：
- 服务器是否正常运行
- 前端 URL 是否正确

### Q: 静态文件无法加载
A: 确保：
- 运行了 `npm run build`
- 服务器配置了静态文件路径
- `NODE_ENV=production`

---

## 推荐配置

对于生产环境，建议：
- 使用 HTTPS（SSL 证书）
- 配置域名
- 使用进程管理器（PM2）
- 设置日志记录
- 配置自动重启

---

## 快速测试

部署后，可以通过以下方式测试：
1. 在不同设备上打开应用
2. 使用浏览器的开发者工具检查 WebSocket 连接
3. 尝试下棋，确认移动同步正常

祝你部署顺利！🎮

