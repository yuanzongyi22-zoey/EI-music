# Ei Music APP · 可交互原型

## 当前状态（2026-11-13）

两个路由都已经可以在浏览器里点：

- `/music/` — 完整原型。4 个一级 tab、9 个 tab 根屏、20 个二级屏、8 个浮层，全部是活的 React 组件，带 Web Audio 合成音。
- `/music-board/` — 设计板。把 20 个「架构图里有节点、但没有视觉稿」的新屏按 393×852 真机尺寸铺开，每屏配中文标题、设计意图、交互说明，顶部三档缩放和色板条。

素材来源：`/Users/yuanzongyi/Downloads/music/` 的《APP信息架构》思维导图（15360×4320）、18 张高保真界面稿（1179×2556，iPhone 15 Pro）和设计师后补的 18 份 Figma SVG 导出。SVG 里内嵌的原始位图被 `scripts/crop-music-assets.py` 取出来放进 `public/music/`，图标是设计师的 200×200 单色剪影，用 CSS mask 重新上色。

## 交付与预览

```bash
npm run dev     # http://localhost:3000/music/ 和 /music-board/
npm run build   # 静态导出到 out/music/ 与 out/music-board/
npx vitest run src/music
```

`npm run build` 走 `output: 'export'`，产物是纯静态 HTML，不需要 Node 运行时。

## 信息架构

底部 4 个 tab，每个 tab 顶部是 `☰ + 分段子 tab + 🔍`。

| Tab | 子 tab | 复刻的原稿 | 新设计的屏 |
| --- | --- | --- | --- |
| 创意空间 | 我的项目 / 我的采样 / 采样处理 | 1 2 3 4 5 | N3 新建导入 · N4 线上编辑器 · N5 作品详情 · N6 上传设备 · N7 分享面板 |
| AI实验室 | 无子 tab，纵向 coverflow | 6 7 8 9 10 11 12 13 | N8 采样选择器 · N9 特效入口 · N10 处理与输出 · N11 合集播放 |
| 互动与社区 | 社区 / 小组创作 / 分享互动 | 14 15 16 | N12 作品详情 · N13 小组详情 · N14 组队选择 · N15 发现乐友 · N16 聊天 |
| 乐器乐理 | 虚拟乐器 / 乐理学习 | 17 18 | N17 体验与创作 · N18 课程详情 · N19 术语查询 |
| 全局 | — | — | N1 侧边抽屉 · N2 个人账户 · N20 全局搜索 |

架构图里的跨模块连线都能走通：

- 采样 →「采样处理 / AI实验室 / 分享到团队·社区 / 一键分享」（我的采样左滑或「⋯」）
- AI 产出 →「上传到创意空间 / 上传到互动与社区」（三个 AI 功能的结果屏底部）
- 小组线上 / 线下成果 →「上传创意空间」（新建小组项目的组队选择）
- 项目 / 采样 →「上传设备」到采样模块 / 处理与演奏模块 / 创作模块

## 文件结构

```
app/music/page.tsx            路由，导出 metadata/viewport
app/music/music.css           唯一样式表，两个路由都引
app/music-board/page.tsx      设计板路由
app/music-board/board.css     设计板专用：body:has(.ei-board){overflow:auto} 逃生口、栅格、标注排版
src/music/MusicApp.tsx        外壳；导出 ScreenHost 供设计板复用
src/music/DesignBoard.tsx     设计板
src/music/board-content.ts    20 条板上条目：编号 / 屏 id / 参数 / 标题 / 设计意图 / 交互说明
src/music/nav.ts              TabId/SubTab/ScreenId/Overlay/NavState/navReducer（纯函数）
src/music/types.ts            ScreenCtx / ScreenDef / AppState
src/music/content.ts          全部中文文案与假数据
src/music/audio.ts            Web Audio 引擎 + silentAudio
src/music/assets.ts           asset() 路径助手
src/music/chrome.tsx          状态栏 / 顶栏 / 底 tab / chip / 行 / sheet / 推子组 / 波形
src/music/art.tsx             画出来的部分：世界地图、二维码、五线谱、黑胶、麦克风光环、键盘、指板
src/music/screens/*.tsx       create / lab / community / instrument / account / overlays + index.tsx 注册表
public/music/**               从原稿与 SVG 取出的位图
scripts/crop-music-assets.py  裁图脚本（表驱动、分数坐标，只写 public/music/）
```

## 关键决策

**导航模型** — 不用 38 项扁平联合类型，而是 `tab + 每 tab 记忆的 sub + 一个 push 栈 + 一个 overlay 槽`。于是「哪个底 tab 变紫」「哪条子 tab 下划线亮」能直接读出来，detail 屏天然有返回历史，`上传到创意空间` 这类跨 tab 深链就是 `root(tab, sub)` 一个 action。reducer 在 `src/music/nav.ts`，不依赖 React，由 `nav.test.ts` 单测。

**一套组件服务两个路由** — 每屏是 `() => JSX`，通过 `useScreen()` 拿 `{go, back, root, open, close, toast, params, state, patch, audio, still}`，不 import 外壳。`still: true` 是设计板的开关：屏内所有 `setInterval`/`requestAnimationFrame`/自动播放都 `if (still) return`，并渲染信息量最大的冻结态。浮层不由屏自己渲染，屏只调 `open({kind, …})`，由外壳的 `OverlayHost` 渲染——设计板因此能把 N1/N3/N6/N7/N8/N14/N20 当独立条目摆出来。

**机身框** — 不复用全局 `.iphone-frame`：它的 `transform: scale()` 按视口算，20 个并排会各自撑满视口。`.ei-frame` 是固定 393×852 的盒子、自己不带 transform；`/music/` 由 `.ei-stage .ei-frame` 加视口缩放，设计板由 `.ei-board-cell` 加 `--ei-board-scale` 缩放并自己预留布局高度（transform 不影响布局）。`@media (max-width:600px)` 下机身铺满屏幕。

**图标** — Figma 导出的图标是 200×200 单色剪影位图，不是矢量，拿不到 path。用 `mask-image` 把剪影的 alpha 当形状、`background: currentColor` 取颜色，形状是原件、颜色仍跟着选中态走（底 tab 选中要变紫）。mask 的 url 写在 inline style 里，因为它要过 `asset()` 加 basePath。

**Web Audio** — 纯合成，不带任何音频文件。`AudioContext` 绝不在模块顶层创建，私有 `ensure()` 是唯一构造点，每个公开方法首行 `const c = ensure(); if (!c) return`。jsdom 下没有 `AudioContext` 构造器，于是全部方法自动变空操作，**测试不需要任何 mock**。音色全是振荡器叠加（钢琴 sine + 泛音、吉他 triangle 失谐 + lowpass、拨弦 saw + bandpass、鼓用一次性生成的白噪 buffer、节拍器 30ms square）；节拍器用 25ms 前瞻调度而不是每拍一个 timeout，避免漂移。外壳根节点一个 `onPointerDown` 调 `resume()` 满足 iOS 的手势要求，路由切换时 `stopAll()` 掐掉还在响的尾音。抽屉里的声音开关存 `localStorage['ei-music-sound']`。

**试听要跟名字对得上** — 第一版每条内容都走同一个 `playPad(seed)`，于是「夜班电台 Demo」和「夏夜舞曲」听起来一模一样。现在 `audio.ts` 里有一张 10 条的 `MOODS` 配方表，每条给出 `root / scale / prog / bpm / pad / lead / drums`，`content.ts` 的每个项目、采样、合集、社区作品、特效预设都带一个 `mood` 字段：夜班电台是 72 BPM 的小调慢板无四踩，夏夜舞曲是 120 BPM 四踩，木吉他扫弦真的用 guitar 音色扫。`playPad(seed, mood)` 按配方排四小节（三音垫 + 低音两下 + 每拍一个带空拍的旋律 + 鼓），随机数仍由 `seed` 决定，所以同一张卡每次出同样的 clip；没标 `mood` 的内容（处理后的素材、临时工程）由种子自己抽一条配方，彼此也不会同声。

乐器那边同理：`instruments` 的每件乐器带 `oct` 半音移调，`demo(timbre, layout, oct)` 按乐器性格给一句示范——吉他是两遍六弦扫弦，拨弦是一条上行五声句，钟琴/古筝是八音刮奏，钢琴是低音加 C 和弦再接一句右手，打击垫是一小节 kick/snare/hat。电贝斯 −12、三弦 +7、古筝 +12、立式钢琴 −5，同类里的两把不会再一个声。

**静态导出的 basePath** — `next.config.mjs` 只在 `GITHUB_ACTIONS` 时设 `basePath: '/baidu-photo-live'`，而 `assetPrefix` 不会改 JSX 里的字面量字符串。客户端只能看到 `NEXT_PUBLIC_*`，所以 `assets.ts` 读 `process.env.NEXT_PUBLIC_BASE_PATH ?? ''`。**部署前要补这一步**：现在的 `.github/workflows/pages.yml` 直接把仓库根目录当静态站上传，没有 `npm run build` 步骤，所以没有地方挂这个 env。真要把 `/music/` 发到 Pages，得先给 workflow 加一个 build 步骤并在那里设 `NEXT_PUBLIC_BASE_PATH: /baidu-photo-live`。

**无障碍** — 子 tab 是 `role=tablist` + `aria-selected`，底 tab 用 `aria-current="page"`，sheet / 抽屉 / 浮层是 `role=dialog aria-modal` 且打开时把焦点挪进去，Esc 走和返回同一个 action（浮层开着先关浮层，否则退一层栈），toast 是 `role=status`，所有纯图标按钮都有中文 `aria-label`。我的采样那一列原稿是左滑出操作条——触屏上留着左滑，但每行同时给一个「更多」按钮，键盘和读屏也要能走到那四个跨模块出口。

**动效** — 转场方向由 reducer 写在 `data-dir` 上（`fwd`/`back`/`lateral`），`.ei-body` 的 key 是 `routeKey(nav)`，换屏即重挂载，所以入场动画挂在它身上就够了，不用维护一份「上一屏」的 DOM。`prefers-reduced-motion: reduce` 下 `.ei-music` 里的 animation/transition 全部关掉，但**不静音**——音频不是动效。

## 没有实现的部分

这些是原型刻意不做的，不是遗漏：

1. **没有真实音频文件**，所有声音都是振荡器现场合成的，所以「采样」听起来不像采样。
2. **没有后端**。点赞、转存、录音、上传设备、分享都只改内存里的 `AppState`，刷新就回到初始数据。
3. **二维码不能扫**。`QrArt` 按 seed 画出稳定的方块图案，不是真的 QR 编码。
4. **N4 编辑器不做片段拖拽**。4 条固定轨、16 小节标尺、片段由 `content.ts` 的 `{track, bar, len}` 绝对定位，三档缩放 chip 代替双指缩放，点片段出「静音 / 独奏 / 删除」但只走 toast。拖拽移动片段、拖动播放头、真实双指缩放都不在 v1。
5. **地图不是真的地图服务**。N15 的世界地图是手画的 SVG，图钉坐标写死在 `content.ts` 里。
6. **不开麦克风**。N17 的录制和 N10 的哼唱只有计时是真的，音频不采集。
7. **浮层没做焦点环**（focus trap）。打开时把焦点挪进去、Esc 能关，但 Tab 还能走出浮层。
8. **没有真实相册权限**。图片转音乐的 4 个合集是固定照片。

## 视觉语言

底 `#1C1C1E`，卡片纯黑 `#000`，主紫 `#AF75EA`，选中行淡紫 `#D8B1FF`，浅按钮 `#F3E6FF`，深紫 `#723CAB`，高亮黄 `#FFD200`；社区彩色块 `#FCF1DB #FF7A67 #FFAA1A #12313E #72CCFF #9747FF #7876FF #FFA451`；分割线 `#363636`，次级字 `#6B6B6C`。状态栏固定 9:41。胶囊 chip 1px 描边，卡片圆角 18px，子 tab 21px、选中态是一截紧贴标签宽度的 3px 紫色下划线，底 tab 是一块离边 14px 的悬浮圆角卡、选中图标变紫，黑卡上的标题是奶油色 `#FCF1DB`，列表里的小播放键 33px。
