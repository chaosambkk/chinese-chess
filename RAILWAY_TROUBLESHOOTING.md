# Railway 找不到仓库 - 解决方案

## 问题：Railway 显示 "Configure GitHub App" 或找不到仓库

### 解决方案 1：配置 GitHub App（最常见）

Railway 需要访问你的 GitHub 仓库，需要授权。

#### 步骤：

1. **在 Railway 界面点击 "Configure GitHub App"**
   - 会跳转到 GitHub 授权页面

2. **授权 Railway 访问你的仓库**
   - 选择 "Only select repositories"
   - 勾选你的仓库：`chaosambkk/chinese-chess`
   - 点击 "Install & Authorize"

3. **返回 Railway**
   - 刷新页面
   - 再次尝试 "Deploy from GitHub repo"
   - 现在应该能看到你的仓库了

---

### 解决方案 2：确保代码已推送到 GitHub

如果仓库列表为空，可能是代码还没推送到 GitHub。

#### 检查步骤：

```bash
# 1. 检查远程仓库配置
git remote -v

# 2. 检查是否有未提交的更改
git status

# 3. 检查是否有提交记录
git log --oneline -5
```

#### 如果还没推送：

```bash
# 1. 添加所有文件
git add .

# 2. 提交
git commit -m "准备部署到 Railway"

# 3. 推送（需要先解决 GitHub 认证问题）
git push -u origin main
```

**注意**：如果遇到认证问题，参考 `GITHUB_AUTH.md` 文件。

---

### 解决方案 3：使用 GitHub App 而不是 OAuth

Railway 现在推荐使用 GitHub App 而不是传统的 OAuth。

#### 步骤：

1. **在 Railway 项目页面**
   - 点击 "Settings"
   - 找到 "GitHub" 部分
   - 点击 "Connect GitHub"

2. **选择授权方式**
   - 选择 "GitHub App"（推荐）
   - 或选择 "OAuth App"（传统方式）

3. **授权访问**
   - 选择要授权的仓库
   - 点击 "Install"

---

### 解决方案 4：手动输入仓库 URL

如果自动检测不到，可以手动输入：

1. **在 Railway 项目页面**
   - 点击 "New" → "GitHub Repo"
   - 选择 "Connect a different repository"
   - 输入仓库 URL：`https://github.com/chaosambkk/chinese-chess`

2. **或者使用 SSH URL**
   - `git@github.com:chaosambkk/chinese-chess.git`

---

### 解决方案 5：检查仓库是否私有

如果仓库是私有的：

1. **确保 Railway 有访问权限**
   - Railway 的 GitHub App 必须被授权访问私有仓库
   - 在 GitHub 仓库设置中检查

2. **或者暂时改为公开**
   - Settings → Danger Zone → Change visibility
   - 部署完成后再改回私有（可选）

---

### 快速检查清单

- [ ] 代码已推送到 GitHub
- [ ] Railway GitHub App 已安装并授权
- [ ] 仓库在授权列表中
- [ ] 仓库不是空的（至少有一个提交）
- [ ] 网络连接正常

---

### 如果还是不行

1. **清除浏览器缓存并重新登录 Railway**
2. **尝试使用不同的浏览器**
3. **检查 Railway 状态页面**：https://status.railway.app
4. **联系 Railway 支持**：support@railway.app

---

## 推荐流程

1. **先解决 GitHub 认证问题**（参考 `GITHUB_AUTH.md`）
2. **推送代码到 GitHub**
3. **在 Railway 配置 GitHub App**
4. **选择仓库并部署**

祝你成功！🎮

