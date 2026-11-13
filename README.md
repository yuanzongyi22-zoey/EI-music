# Ei Music · 可交互原型

Ei Music 是一套面向音乐爱好者的「硬件模块 + App」创作系统。这个仓库是它 App 端的**可交互原型**：不是图片，不是点热区的假页面，而是一整套真实的 React 组件——29 屏、8 个浮层、4 个一级模块都能点开，声音由 Web Audio 现场合成。

- **原型**：<https://yuanzongyi22-zoey.github.io/EI-music/>
- **设计板**：<https://yuanzongyi22-zoey.github.io/EI-music/board/>（架构图里有节点但没有视觉稿的 20 屏，按 393×852 真机尺寸铺开，每屏带设计意图与交互说明）

> 线上链接要等 GitHub Pages 开启后才生效，见下面的「部署」。

## 它做了什么

原始素材是一份《APP信息架构》思维导图、18 张高保真界面稿（1179×2556，iPhone 15 Pro）和 18 份 Figma SVG 导出。架构图定义了 4 个一级模块、约 38 个界面节点，其中只有 18 个节点有视觉稿。

所以这个原型分两部分：**18 张已有稿复刻成活组件**，**另外 20 屏按同一套视觉语言新设计**。两部分共用一套组件、一张样式表、一个导航 reducer。

| Tab | 子 tab | 复刻的原稿 | 新设计的屏 |
| --- | --- | --- | --- |
| 创意空间 | 我的项目 / 我的采样 / 采样处理 | 1 2 3 4 5 | 新建导入 · 线上编辑器 · 作品详情 · 上传设备 · 分享面板 |
| AI实验室 | 无子 tab，纵向 coverflow | 6 7 8 9 10 11 12 13 | 采样选择器 · 特效入口 · 处理与输出 · 合集播放 |
| 互动与社区 | 社区 / 小组创作 / 分享互动 | 14 15 16 | 作品详情 · 小组详情 · 组队选择 · 发现乐友 · 聊天 |
| 乐器乐理 | 虚拟乐器 / 乐理学习 | 17 18 | 体验与创作 · 课程详情 · 术语查询 |
| 全局 | — | — | 侧边抽屉 · 个人账户 · 全局搜索 |

架构图里的跨模块连线都能走通：采样 →「采样处理 / AI实验室 / 分享到团队·社区」；AI 产出 →「上传到创意空间 / 上传到互动与社区」；小组成果 →「上传创意空间」；项目与采样 →「上传设备」到采样 / 处理与演奏 / 创作三个硬件模块。

## 本地跑起来

```bash
npm install
npm run dev     # http://localhost:3000/ 原型，/board/ 设计板
npm test        # 31 个单测
npm run build   # 静态导出到 out/
```

`output: 'export'`，产物是纯静态 HTML，不需要 Node 运行时。

## 几个关键决定

**导航模型** — 不用 38 项扁平联合类型，而是 `tab + 每 tab 记忆的 sub + 一个 push 栈 + 一个 overlay 槽`。于是「哪个底 tab 变紫」「哪条子 tab 下划线亮」能直接读出来，detail 屏天然有返回历史，`上传到创意空间` 这类跨 tab 深链就是 `root(tab, sub)` 一个 action。reducer 在 `src/music/nav.ts`，不依赖 React，由 `nav.test.ts` 单测。

**一套组件服务两个页面** — 每屏是 `() => JSX`，通过 `useScreen()` 拿 `{go, back, root, open, close, toast, params, state, patch, audio, still}`，不 import 外壳。`still: true` 是设计板的开关：屏内所有 `setInterval` / `requestAnimationFrame` / 自动播放都 `if (still) return`，并渲染信息量最大的冻结态。浮层不由屏自己渲染，屏只调 `open({kind, …})`，由外壳的 `OverlayHost` 渲染——设计板因此能把抽屉、分享面板、采样选择器当独立条目摆出来。

**Web Audio，没有任何音频文件** — `AudioContext` 绝不在模块顶层创建，私有 `ensure()` 是唯一构造点，每个公开方法首行 `const c = ensure(); if (!c) return`。jsdom 下没有 `AudioContext` 构造器，于是全部方法自动变空操作，**测试不需要任何 mock**。音色全是振荡器叠加（钢琴 sine + 泛音、吉他 triangle 失谐 + lowpass、拨弦 saw + bandpass、鼓用一次性生成的白噪 buffer）；节拍器用 25ms 前瞻调度而不是每拍一个 timeout，避免漂移。

**试听要跟名字对得上** — `audio.ts` 里有一张 10 条的 `MOODS` 配方表，每条给出 `root / scale / prog / bpm / pad / lead / drums`，`content.ts` 的每个项目、采样、合集、社区作品、特效预设都带一个 `mood`：夜班电台是 72 BPM 的小调慢板无四踩，夏夜舞曲是 120 BPM 四踩，木吉他扫弦真的用 guitar 音色扫。随机数仍由 `seed` 决定，所以同一张卡每次出同样的 clip。乐器那边每件带 `oct` 半音移调，电贝斯 −12、三弦 +7、古筝 +12、立式钢琴 −5，同类里的两把不会一个声。

**CSS 特异度** — 样式隔离靠根 wrapper `.ei-music` 和 `ei-` 前缀。重置写成 `:where(.ei-music) button{…}` 而不是 `.ei-music button{…}`：后者是 (0,1,1)，会压过所有 (0,1,0) 的组件类，把 `.ei-btn` / `.ei-chip` / `.ei-row` 的内边距和底色全清掉；`:where()` 不贡献特异度，任何类都能覆盖。

**机身框** — `.ei-frame` 是固定 393×852 的盒子、自己不带 transform；原型页由 `.ei-stage .ei-frame` 加视口缩放，设计板由 `.ei-board-cell` 加 `--ei-board-scale` 缩放并自己预留布局高度（transform 不影响布局）。`@media (max-width:600px)` 下机身铺满屏幕。

**图标** — Figma 导出的图标是 200×200 单色剪影位图，不是矢量，拿不到 path。用 `mask-image` 把剪影的 alpha 当形状、`background: currentColor` 取颜色，形状是原件、颜色仍跟着选中态走。

更完整的记录在 [`docs/ei-music.md`](docs/ei-music.md)。

## 文件结构

```
app/page.tsx              原型路由
app/music.css             唯一样式表，两个页面都引
app/board/page.tsx        设计板路由
app/board/board.css       设计板专用：body:has(.ei-board){overflow:auto} 逃生口、栅格、标注排版
src/music/MusicApp.tsx    外壳；导出 ScreenHost 供设计板复用
src/music/DesignBoard.tsx 设计板
src/music/nav.ts          TabId/SubTab/ScreenId/Overlay/NavState/navReducer（纯函数）
src/music/content.ts      全部中文文案与假数据
src/music/audio.ts        Web Audio 引擎 + silentAudio
src/music/chrome.tsx      状态栏 / 顶栏 / 底 tab / chip / 行 / sheet / 推子组 / 波形
src/music/art.tsx         画出来的部分：世界地图、二维码、五线谱、黑胶、麦克风光环、键盘、指板
src/music/screens/*.tsx   create / lab / community / instrument / account / overlays + 注册表
public/music/**           从原稿与 Figma SVG 取出的位图
```

## 没有实现的部分

这些是原型刻意不做的，不是遗漏：

1. **没有真实音频文件**，所有声音都是振荡器现场合成的，所以「采样」听起来不像采样。
2. **没有后端**。点赞、转存、录音、上传设备、分享都只改内存里的 `AppState`，刷新就回到初始数据。
3. **二维码不能扫**。按 seed 画出稳定的方块图案，不是真的 QR 编码。
4. **编辑器不做片段拖拽**。4 条固定轨、16 小节标尺、片段绝对定位，三档缩放 chip 代替双指缩放。
5. **地图不是真的地图服务**，世界地图是手画的 SVG，图钉坐标写死在 `content.ts` 里。
6. **不开麦克风**。录制和哼唱只有计时是真的，音频不采集。
7. **浮层没做焦点环**。打开时把焦点挪进去、Esc 能关，但 Tab 还能走出浮层。
8. **没有真实相册权限**。图片转音乐的 4 个合集是固定照片。

## 视觉语言

底 `#1C1C1E`，卡片纯黑 `#000`，主紫 `#AF75EA`，选中行淡紫 `#D8B1FF`，浅按钮 `#F3E6FF`，深紫 `#723CAB`，高亮黄 `#FFD200`；社区彩色块 `#FCF1DB #FF7A67 #FFAA1A #12313E #72CCFF #9747FF #7876FF #FFA451`；分割线 `#363636`，次级字 `#6B6B6C`。状态栏固定 9:41。胶囊 chip 1px 描边，卡片圆角 18px，子 tab 17px、选中态是一截紧贴标签宽度的 3px 紫色下划线，底 tab 是一块离边 14px 的悬浮圆角卡。

## 部署

`main` 是源码，`gh-pages` 是已经构建好的静态站。要让线上链接生效，在仓库 **Settings → Pages** 里把 Source 选成 **Deploy from a branch**，分支选 `gh-pages`、目录选 `/ (root)`，保存后一两分钟站点就起来了。

重新构建并更新线上版本：

```bash
NEXT_PUBLIC_BASE_PATH=/EI-music npm run build
```

`NEXT_PUBLIC_BASE_PATH` 同时喂给 `next.config.mjs` 的 `basePath` 和 `src/music/assets.ts` 的 `asset()`——客户端只能读到 `NEXT_PUBLIC_*` 开头的变量，而 `assetPrefix` 不会重写 JSX 里的字面量字符串，所以两边必须共用一个变量。把 `out/` 的内容推到 `gh-pages` 即可。

`.github/workflows/build.yml` 是手动触发的构建检查（跑测试 + 构建并上传产物），不会自动部署。
