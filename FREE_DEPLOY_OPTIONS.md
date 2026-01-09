# 免费部署方案对比

## Railway - 有免费额度

Railway **确实有免费额度**，但界面可能不够清晰。

### Railway 免费额度：
- **每月 $5 免费额度**
- 对于小型应用（如这个象棋游戏）通常足够使用
- 如果显示需要订阅，可能是：
  1. 界面提示不够清晰（实际有免费额度）
  2. 需要先创建项目才能看到免费额度

### 如何避免付费：
1. **创建项目时**，选择免费计划
2. **监控使用量**，保持在 $5 以内
3. **设置使用限制**，避免意外超支

---

## 其他免费替代方案

### 方案 1：Render（推荐，完全免费）

Render 提供**完全免费**的 Web 服务。

#### 步骤：

1. **注册 Render**
   - 访问 https://render.com
   - 使用 GitHub 账号注册

2. **创建 Web Service**
   - 点击 "New" → "Web Service"
   - 连接 GitHub 仓库
   - 选择仓库：`chaosambkk/chinese-chess`

3. **配置设置**
   ```
   Name: chinese-chess
   Environment: Node
   Build Command: npm run install-all && npm run build
   Start Command: npm start
   ```

4. **环境变量**
   ```
   NODE_ENV=production
   PORT=10000 (Render 会自动设置，但可以指定)
   ```

5. **免费计划限制**
   - 服务在 15 分钟无活动后会休眠
   - 唤醒需要几秒钟
   - 完全免费，无信用卡要求

#### Render 优缺点：
- ✅ 完全免费
- ✅ 无需信用卡
- ✅ 自动部署
- ⚠️ 15 分钟无活动会休眠（对游戏影响不大）

---

### 方案 2：Fly.io（推荐，免费额度大）

Fly.io 提供**慷慨的免费额度**。

#### 步骤：

1. **注册 Fly.io**
   - 访问 https://fly.io
   - 使用 GitHub 账号注册

2. **安装 Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

3. **登录**
   ```bash
   fly auth login
   ```

4. **创建应用**
   ```bash
   fly launch
   ```

5. **免费额度**
   - 3 个共享 CPU 实例
   - 3GB 存储
   - 160GB 出站流量/月
   - 通常足够使用

---

### 方案 3：Vercel（前端）+ Railway/Render（后端）

前后端分离部署。

#### 步骤：

1. **前端部署到 Vercel**（免费）
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - 设置：
     - Build Command: `cd client && npm install && npm run build`
     - Output Directory: `client/build`
     - 环境变量：`REACT_APP_SERVER_URL=你的后端地址`

2. **后端部署到 Render**（免费）
   - 参考方案 1

---

### 方案 4：使用自己的服务器（如果已有）

如果你有云服务器（阿里云、腾讯云等），可以免费使用。

---

## 推荐方案对比

| 方案 | 免费额度 | 休眠 | 难度 | 推荐度 |
|------|---------|------|------|--------|
| **Render** | 完全免费 | 15分钟休眠 | ⭐⭐ 简单 | ⭐⭐⭐⭐⭐ |
| **Fly.io** | 慷慨免费 | 无休眠 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ |
| **Railway** | $5/月 | 无休眠 | ⭐⭐ 简单 | ⭐⭐⭐ |
| **Vercel+Render** | 完全免费 | 15分钟休眠 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ |

---

## 我的推荐：使用 Render

对于这个象棋游戏，**Render 是最佳选择**：

1. ✅ **完全免费**，无需信用卡
2. ✅ **简单易用**，界面友好
3. ✅ **自动部署**，连接 GitHub 即可
4. ⚠️ 15分钟休眠（对游戏影响不大，有人访问时会自动唤醒）

### Render 快速部署步骤：

1. 访问 https://render.com
2. 注册账号（GitHub 登录）
3. 点击 "New" → "Web Service"
4. 连接 GitHub 仓库
5. 配置：
   - Build Command: `npm run install-all && npm run build`
   - Start Command: `npm start`
6. 点击 "Create Web Service"
7. 等待部署完成（约 5-10 分钟）

---

## 如果坚持使用 Railway

Railway 确实有免费额度，如果界面显示需要订阅：

1. **尝试直接创建项目**（可能免费额度在创建后才显示）
2. **检查账户设置**，确认免费计划
3. **联系 Railway 支持**：support@railway.app

---

## 需要帮助？

选择你想要的方案，我可以提供详细的部署步骤！

