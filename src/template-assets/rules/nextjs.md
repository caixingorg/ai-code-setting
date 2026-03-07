# Next.js 规范 Rules

## App Router 规范
- 使用 App Router，不用 Pages Router
- Server Components 为默认，只在需要交互/状态时加 'use client'
- 数据获取优先在 Server Component 中完成，避免客户端瀑布请求
- 路由文件命名：page.tsx、layout.tsx、loading.tsx、error.tsx

## 数据获取
- Server Component 中直接 async/await，不用 useEffect 获取数据
- 客户端数据获取统一用 SWR 或 React Query，不裸用 fetch
- API 路由放在 app/api/ 下，文件名为 route.ts

## 性能
- 图片必须用 next/image，禁止裸 <img>
- 字体必须用 next/font，禁止 @import Google Fonts
- 动态导入大型组件：dynamic(() => import(...), { ssr: false })
- 静态页面优先 generateStaticParams，减少服务端计算
