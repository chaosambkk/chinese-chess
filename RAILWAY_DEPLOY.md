# Railway 部署指南

本指南将帮助你使用 Railway 快速部署中国象棋游戏。

## ⚠️ 关于免费额度

Railway 提供**每月 $5 免费额度**，对于小型应用通常足够使用。
- 如果界面显示需要订阅，可能是提示不够清晰
- 可以先创建项目，免费额度会在使用后显示
- 如果担心费用，建议使用 **Render**（完全免费），参考 `FREE_DEPLOY_OPTIONS.md`

## 前置准备

1. **GitHub 账号**（如果没有，请先注册：https://github.com）
2. **Railway 账号**（如果没有，请先注册：https://railway.app）

## 部署步骤

### 第一步：准备代码并推送到 GitHub

1. **提交所有更改到 Git**
   ```bash
   git add .
   git commit -m "准备 Railway 部署"
   git push origin main
   ```

   如果还没有初始化 Git 仓库：
   ```bash
   git init
   git add .
   git commit -m "初始提交"
   ```

2. **在 GitHub 创建仓库**
   - 访问 https://github.com/new
   - 创建新仓库（例如：`chinese-chess`）
   - 不要初始化 README、.gitignore 或 license
   - 点击 "Create repository"

3. **推送代码到 GitHub**
   ```bash
   git remote add origin https://github.com/你的用户名/chinese-chess.git
   git branch -M main
   git push -u origin main
   ```

### 第二步：在 Railway 部署

1. **登录 Railway**
   - 访问 https://railway.app
   - 点击 "Login" 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权 Railway 访问你的 GitHub 账号（如果第一次使用）
   - 选择你的仓库（`chinese-chess`）

3. **Railway 会自动检测并部署**
   - Railway 会自动识别 Node.js 项目
   - 会自动运行 `npm install` 和构建
   - 部署过程可能需要几分钟

4. **获取部署 URL**
   - 部署完成后，Railway 会提供一个 URL
   - 例如：`https://your-app-name.up.railway.app`
   - 点击 URL 右侧的图标可以复制

### 第三步：配置环境变量（可选）

Railway 通常不需要额外配置，但如果需要：

1. 在 Railway 项目页面，点击 "Variables"
2. 添加环境变量（如果需要）：
   - `NODE_ENV=production`（Railway 会自动设置）
   - `PORT`（Railway 会自动设置）

### 第四步：测试部署

1. **访问部署的 URL**
   - 在浏览器中打开 Railway 提供的 URL
   - 应该能看到游戏界面

2. **测试连接**
   - 打开两个浏览器窗口（或两个设备）
   - 一个选择红色，一个选择黑色
   - 尝试下棋，确认移动同步正常

## 常见问题

### Q: 部署失败怎么办？
A: 
1. 检查 Railway 的部署日志（在项目页面点击 "Deployments"）
2. 确保 `package.json` 中有 `start` 脚本
3. 确保代码已推送到 GitHub

### Q: WebSocket 连接失败？
A: 
- Railway 自动支持 WebSocket，无需额外配置
- 如果还有问题，检查浏览器控制台的错误信息

### Q: 如何更新代码？
A: 
1. 修改代码后：
   ```bash
   git add .
   git commit -m "更新说明"
   git push
   ```
2. Railway 会自动检测并重新部署

### Q: 如何查看日志？
A: 
- 在 Railway 项目页面，点击 "Deployments"
- 选择最新的部署，查看日志

### Q: 如何自定义域名？
A: 
1. 在 Railway 项目页面，点击 "Settings"
2. 找到 "Domains" 部分
3. 点击 "Generate Domain" 或添加自定义域名

## 费用说明

- Railway 提供免费额度（每月 $5 免费额度）
- 对于个人项目和小型应用，通常足够使用
- 如果超出免费额度，会按使用量收费

## 下一步

部署成功后：
1. 分享 URL 给你的朋友
2. 可以在不同国家/地区测试连接
3. 享受在线下棋的乐趣！

## 需要帮助？

如果遇到问题：
1. 查看 Railway 文档：https://docs.railway.app
2. 检查部署日志
3. 确认代码已正确提交到 GitHub

祝你部署顺利！🎮

