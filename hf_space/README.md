---
title: Knowledge Flow
emoji: 🎮
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# 知识多元模式转化平台 — HuggingFace Space 部署指南

---

## 📦 你要上传的文件

这是 **已经就绪** 的 HF Space 部署包，里面只有以下文件：

```
hf_space/
├── app.py              # FastAPI 后端（服务前端 + API）
├── requirements.txt    # Python 依赖列表
├── Dockerfile          # HF Space 自动构建用
├── static/             # React 前端构建好的产物
│   ├── index.html
│   ├── assets/         # JS + CSS（已经压缩好）
│   └── vite.svg
└── README.md           # 本说明
```

**你只需要把 `hf_space` 这个文件夹里这 5 样东西（app.py / requirements.txt / Dockerfile / static 文件夹 / README.md）上传到 HF Space。**

---

## 🚀 部署步骤（一步步跟着做）

### 第 1 步：注册 HuggingFace 账号

打开 [huggingface.co](https://huggingface.co)，右上角点 **Sign Up** 注册一个免费账号。

### 第 2 步：创建 Space

1. 注册登录后，打开 **[huggingface.co/new-space](https://huggingface.co/new-space)**
2. 填写下面这些：
   - **Space Name**：`knowledge-flow`（可以改成你喜欢的名字）
   - **License**：`mit`
   - **Space SDK**：选择 **Docker**
   - **Docker Template**：选择 **Blank**
3. 点 **Create Space**

### 第 3 步：安装 Git（如果还没装）

如果你电脑没有 Git，去 https://git-scm.com/download/win 下载安装。

### 第 4 步：上传文件

打开命令行（PowerShell 或终端），按顺序执行：

```bash
# 1. 配置 Git 身份（仅第一次需要）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 2. 克隆你在 HF 上的 Space 仓库
#    把 YOUR_USERNAME 换成你的 HF 用户名
#    把 YOUR_SPACE_NAME 换成你第 2 步填的名字
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME

# 3. 进入这个目录
cd YOUR_SPACE_NAME

# 4. 把我们准备好的 hf_space 文件夹里所有文件复制过去
#    Windows 的话，直接在文件管理器里操作：
#      - 打开 hf_space 文件夹
#      - Ctrl+A 全选（app.py / requirements.txt / Dockerfile / static 文件夹 / README.md）
#      - Ctrl+C 复制
#      - 粘贴到你刚才 git clone 出来的那个文件夹里

# 5. 添加所有文件并提交
git add .
git commit -m "First deploy: knowledge platform"

# 6. 推送到 HF Space
git push origin main
```

推送时可能会要求你输入用户名和密码。**注意：密码不是你的 HF 账号密码，而是 Access Token**。

### 第 5 步：创建 Access Token（用于 Git 推送认证）

1. 打开 [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. 点 **Create new token**
3. **Token type** 选 `Read` 即可（如果不行就选 `Write`）
4. **Token name** 随便填，比如 `git-deploy`
5. 点 **Create**
6. **复制生成的 token**（一串 `hf_xxxxx` 的东西，只会显示一次！）

推送时：
- 用户名：你的 HF 用户名
- 密码：粘贴刚才复制的 token

### 第 6 步：等待构建

推送完成后，回到你的 Space 页面。HF 会自动：
1. 检测到 Dockerfile
2. 构建 Docker 镜像（大约 2-3 分钟）
3. 启动服务

你可以在 Space 页面看到构建日志。当出现 **"Running on …"** 就表示成功了！

### 第 7 步：打开你的网站

构建成功后，你的网站地址是：

```
https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space
```

---

## 🔑 配置 API Key（可选，用于 AI 生成题目）

如果你想用真实的 AI（而不是模拟数据）来生成题目：

1. 进入你的 Space 页面
2. 点击顶部 **Settings** 标签
3. 找到 **Variables and secrets** 区域
4. 点 **New secret**：
   - **Name**：`OPENAI_API_KEY`
   - **Value**：`sk-你的OpenAI密钥`
5. 点 **Save**
6. 重启 Space（点 **Factory reboot** 按钮）

---

## 📝 以后更新前端代码怎么重新部署？

在你的项目根目录执行：

```bash
# 重新构建前端（自动输出到 hf_space/static/）
npm run build

# 进入 HF Space 目录
cd 你的Space文件夹

# 复制新构建的 static 文件夹覆盖旧的
# （Windows 直接拖拽复制 hf_space/static → 你的Space文件夹/static）

git add .
git commit -m "Update frontend"
git push origin main
```

---

## ❓ 常见问题

**Q: 构建失败了怎么办？**

打开 Space 页面，点 **Settings** → 拉到最下面看 **Factory reboot**，点一下重新构建。如果还是失败，把构建日志截图发过来。

**Q: 网站打开是白的？**

等 1-2 分钟让 Docker 完全启动。然后刷新页面。还是白的就检查一下 Space 的 **App** 模式有没有选对。

**Q: 能把需要上传的文件发给我吗？**

`hf_space` 文件夹就在这里，里面 **5 样东西**（static 文件夹 / app.py / requirements.txt / Dockerfile / README.md）就是全部要上传的。你用文件管理器直接拖到克隆下来的 HF Space 文件夹里就行。

**Q: 想改成自己的域名？**

不需要域名。HF Space 会直接给你一个免费的公开地址：`https://你的用户名-你的Space名.hf.space`
