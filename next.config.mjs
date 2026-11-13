// 静态导出。GitHub Pages 把站点挂在 /EI-music/ 下，而 assetPrefix 不会重写 JSX 里的
// 字面量字符串，所以 basePath 和 src/music/assets.ts 的 asset() 共用同一个环境变量：
// 客户端只能读到 NEXT_PUBLIC_* 开头的变量，这是唯一能同时喂到两边的办法。
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  images: { unoptimized: true },
  basePath: base,
  assetPrefix: base ? `${base}/` : '',
  trailingSlash: true,
}
