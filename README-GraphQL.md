# GraphQL Worker 构建和部署指南

## 🚀 快速开始

### 构建命令

```bash
# 构建 Worker（打包 GraphQL 依赖）
npm run build-worker

# 本地开发 Worker
npm run dev-worker

# 构建并部署 Worker
npm run deploy-worker
```

## 📦 构建过程

`build-worker.js` 脚本使用 esbuild 将所有 GraphQL 依赖打包到单个文件中：

- **输入文件**: `worker.js`
- **输出文件**: `worker-bundled.js`
- **打包大小**: ~249KB（包含完整 GraphQL 运行时）

## 🔧 配置说明

### wrangler.toml 
配置文件已更新为使用打包后的文件：
```toml
main = "worker-bundled.js"
```

### GraphQL 功能
- ✅ 完整的 GraphQL 查询和变更支持
- ✅ GraphQL Playground (访问 `/graphql`)
- ✅ CORS 支持
- ✅ 错误处理和验证
- ✅ 轻量级实现（无重依赖）

## 🛠 开发工作流

1. **修改 Worker 代码** → `worker.js`
2. **构建打包文件** → `npm run build-worker`
3. **本地测试** → `npm run dev-worker`
4. **部署上线** → `npm run deploy-worker`

## 📋 可用命令

| 命令 | 功能 |
|------|------|
| `npm run build-worker` | 构建 Worker 并打包依赖 |
| `npm run dev-worker` | 启动本地 Worker 开发服务器 |
| `npm run deploy-worker` | 构建并部署到 Cloudflare |

## 🔍 GraphQL 端点

- **POST `/graphql`** - GraphQL API 端点
- **GET `/graphql`** - GraphQL Playground 界面

### 示例查询

```graphql
# 测试查询
query {
  hello
}

# 发送消息
mutation {
  sendMessage(message: "Hello AI!") {
    content
    error
  }
}
```

## ⚡ 性能优化

- 使用 esbuild 进行快速构建
- 代码最小化和压缩
- 只包含必要的 GraphQL 功能
- 针对 Cloudflare Workers 环境优化