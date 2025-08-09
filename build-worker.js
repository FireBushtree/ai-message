import { build } from 'esbuild'

console.log('📦 开始构建 Worker...')

try {
  await build({
    entryPoints: ['worker.js'],
    bundle: true,
    outfile: 'worker-bundled.js',
    format: 'esm',
    target: 'es2022',
    platform: 'neutral',
    conditions: ['worker', 'browser'],
    external: [],
    minify: true,
    sourcemap: false,
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    banner: {
      js: '// Bundled Worker with GraphQL dependencies\n// Generated automatically - do not edit\n'
    },
    logLevel: 'info'
  })

  console.log('✅ Worker 构建成功！')
  console.log('📁 输出文件: worker-bundled.js')
  console.log('🚀 可以部署到 Cloudflare Workers')
} catch (error) {
  console.error('❌ 构建失败:', error)
  process.exit(1)
}