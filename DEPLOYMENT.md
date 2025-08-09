# AI聊天应用部署指南

## Cloudflare Workers 后端部署

### 前置要求
1. Cloudflare 账户
2. OpenAI API Key
3. Node.js 和 npm/pnpm

### 部署步骤

#### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare
```bash
wrangler login
```

#### 3. 配置环境变量
设置您的 OpenAI API Key：
```bash
wrangler secret put OPENAI_API_KEY
```
输入您的 OpenAI API Key 当提示时。

#### 4. 部署 Worker
```bash
wrangler deploy
```

#### 5. 获取 Worker URL
部署完成后，您会得到一个类似这样的URL：
`https://ai-chat-worker.your-subdomain.workers.dev`

### 前端配置

#### 1. 设置环境变量
在项目根目录创建 `.env` 文件：
```
VITE_API_URL=https://ai-chat-worker.your-subdomain.workers.dev
```

#### 2. 安装依赖并运行前端
```bash
pnpm install
pnpm run dev
```

### 生产环境部署

#### 前端部署
1. 构建应用：
```bash
pnpm run build
```

2. 部署到您选择的静态文件托管服务（如 Vercel、Netlify、Cloudflare Pages）

#### 自定义域名配置
1. 在 Cloudflare Dashboard 中为您的 Worker 设置自定义域名
2. 更新前端环境变量中的 API URL

### 故障排除

1. **CORS 错误**：确保 Worker 中的 CORS 设置正确
2. **API Key 错误**：检查 OpenAI API Key 是否正确设置
3. **部署失败**：检查 wrangler.toml 配置文件

### 成本估算
- Cloudflare Workers：每天 100,000 次请求免费
- OpenAI API：根据使用量计费

### 安全提示
- 不要将 API Key 提交到代码库
- 在生产环境中考虑添加速率限制
- 考虑添加用户认证机制