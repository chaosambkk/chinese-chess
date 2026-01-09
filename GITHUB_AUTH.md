# GitHub 认证问题解决方案

GitHub 已不再支持密码认证，需要使用 Personal Access Token (PAT) 或 SSH 密钥。

## 方案一：使用 Personal Access Token（推荐，简单快速）

### 步骤 1：创建 Personal Access Token

1. **访问 GitHub 设置**
   - 打开 https://github.com/settings/tokens
   - 或者：GitHub 右上角头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **生成新 Token**
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 输入 Token 名称（例如：`chess-deploy`）
   - 选择过期时间（建议选择 90 天或 No expiration）
   - **勾选权限**：
     - ✅ `repo` (完整仓库访问权限)
     - ✅ `workflow` (如果需要 GitHub Actions)

3. **生成并复制 Token**
   - 点击 "Generate token"
   - **重要**：立即复制 Token（只显示一次！）
   - 格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤 2：使用 Token 推送代码

**方法 A：在推送时输入 Token（临时）**

```bash
git push -u origin main
# Username: chaosambkk@gmail.com
# Password: 粘贴你的 Token（不是密码！）
```

**方法 B：将 Token 保存到 Git 凭据（推荐）**

```bash
# macOS
git credential-osxkeychain store
# 然后输入：
# protocol=https
# host=github.com
# username=chaosambkk@gmail.com
# password=你的Token（ghp_开头）
# 按 Ctrl+D 结束输入
```

**方法 C：在 URL 中包含 Token（一次性）**

```bash
git remote set-url origin https://你的Token@github.com/chaosambkk/chinese-chess.git
git push -u origin main
```

---

## 方案二：使用 SSH 密钥（更安全，长期使用）

### 步骤 1：检查是否已有 SSH 密钥

```bash
ls -al ~/.ssh
```

如果看到 `id_rsa` 或 `id_ed25519`，说明已有密钥，跳到步骤 3。

### 步骤 2：生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "chaosambkk@gmail.com"
# 按 Enter 使用默认路径
# 可以设置密码（可选，建议设置）
```

### 步骤 3：复制公钥

```bash
# 复制公钥内容
cat ~/.ssh/id_ed25519.pub
# 或
cat ~/.ssh/id_rsa.pub
```

### 步骤 4：添加到 GitHub

1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. Title: 输入名称（例如：`My Mac`）
4. Key: 粘贴刚才复制的公钥内容
5. 点击 "Add SSH key"

### 步骤 5：更改远程 URL 为 SSH

```bash
git remote set-url origin git@github.com:chaosambkk/chinese-chess.git
git push -u origin main
```

---

## 快速解决方案（推荐）

**最简单的方法：使用 Personal Access Token**

1. 创建 Token：https://github.com/settings/tokens/new
   - 勾选 `repo` 权限
   - 生成并复制 Token

2. 使用 Token 推送：
   ```bash
   git push -u origin main
   # Username: chaosambkk@gmail.com
   # Password: 粘贴你的 Token（ghp_开头）
   ```

3. 保存凭据（避免每次都输入）：
   ```bash
   git config --global credential.helper osxkeychain
   ```

---

## 验证

推送成功后，你应该看到：
```
Enumerating objects: ...
Writing objects: ...
To https://github.com/chaosambkk/chinese-chess.git
 * [new branch]      main -> main
```

---

## 需要帮助？

如果还有问题：
1. 确认 Token 权限包含 `repo`
2. 确认 Token 未过期
3. 尝试使用 SSH 方式

