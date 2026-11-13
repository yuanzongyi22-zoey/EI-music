// 设计板的 20 条条目。每条描述「让机身停在哪个状态」，由 DesignBoard 组装成
// 一份固定 NavState 交给 ScreenHost——所以板上每一屏都是真组件，不是截图，
// 第二步直接复用，不存在返工。
import { initialNav, type Overlay, type ScreenId, type ScreenParams, type SubTab, type TabId } from './nav'
import type { NavState } from './nav'

export type BoardItem = {
  code: string
  title: string
  /** 为什么这么设计：取自哪张原稿的语言、解决架构图里的哪个节点。 */
  intent: string
  /** 这一屏上可点什么、点了去哪。 */
  notes: readonly string[]
  tab: TabId
  sub?: SubTab
  screen?: ScreenId
  params?: ScreenParams
  overlay?: Overlay
}

/** 把一条板上条目翻成冻结的导航状态。 */
export function boardNav(item: BoardItem): NavState {
  const sub = item.sub ?? initialNav.sub[item.tab]
  return {
    tab: item.tab,
    sub: { ...initialNav.sub, [item.tab]: sub },
    stack: item.screen ? [{ id: item.screen, params: item.params ?? {} }] : [],
    overlay: item.overlay ?? null,
    dir: 'lateral',
  }
}

export const BOARD_ITEMS: readonly BoardItem[] = [
  {
    code: 'N1',
    title: '侧边抽屉',
    intent:
      '架构图里每个模块顶栏都有 ☰，但 18 张稿都没画打开后的样子。沿用卡片纯黑 + 淡紫按钮的语言，把「我是谁 / 去哪个模块 / 硬件连没连 / 要不要声音」四件事收在一屏。',
    notes: [
      '点头像进 N2 个人账户',
      '四个模块快捷等于底 tab 的 root 跳转，会清掉当前返回栈',
      '设备区三个模块各自显示连接点；声音开关写进 localStorage 并直接作用于 Web Audio',
    ],
    tab: 'create',
    sub: 'projects',
    overlay: { kind: 'drawer' },
  },
  {
    code: 'N2',
    title: '个人账户',
    intent:
      '抽屉头像的落点。统计数字用原稿里 19px 粗体 + 11px 次级字的那一组比例，设置行复用 .ei-row，不另造一套列表样式。',
    notes: ['作品 / 采样 / 小组三个数字对应三个模块', '设备绑定一行进 N6 上传到设备', '退出登录只出 toast，原型不做账号体系'],
    tab: 'create',
    sub: 'projects',
    screen: 'account',
  },
  {
    code: 'N3',
    title: '新建 / 导入项目',
    intent:
      '架构图「我的项目」下挂着新建这条边。用居中模糊浮层而不是整屏，保证你还能看见身后的项目列表，知道新建完会落在哪。',
    notes: [
      '空白项目直接进 N4 编辑器',
      '从采样新建转交 N8 采样选择器（mode=editor）',
      '从设备导入转交 N6，复用同一套传输进度',
    ],
    tab: 'create',
    sub: 'projects',
    overlay: { kind: 'newProject' },
  },
  {
    code: 'N4',
    title: '项目线上编辑器',
    intent:
      '架构图里唯一标了「线上编辑」却没有视觉稿的节点，也是信息密度最高的一屏。轨道色沿用社区彩块里的紫/蓝/琥珀/珊瑚，片段块圆角 8px 比卡片小一档，避免和外层卡片抢层级。',
    notes: [
      '四条固定轨 + 16 小节标尺，片段块由 content.ts 的 {track,bar,len} 绝对定位',
      '三档缩放 chip（16/8/4 小节）代替双指缩放；点片段出一行静音/独奏/删除',
      'v1 不做片段拖拽，已写进 docs 的未实现清单；吸取采样走 N8 选择器',
    ],
    tab: 'create',
    sub: 'projects',
    screen: 'projectEditor',
    params: { projectId: 'p-1' },
  },
  {
    code: 'N5',
    title: '项目播放 / 作品详情',
    intent:
      '原稿 11（声音转音乐结果）已经给了「大封面 + 走带条」的播放语言，这里直接继承，只把黑胶换成项目封面，并补上架构图要求的两个出口。',
    notes: ['波形是 seed 决定的固定形状，同一个项目每次画出同一条', '播放键走 Web Audio 合成 pad，不是音频文件', '底部两颗按钮分别进 N7 分享面板和 N6 上传到设备'],
    tab: 'create',
    sub: 'projects',
    screen: 'projectPlayer',
    params: { projectId: 'p-1' },
  },
  {
    code: 'N6',
    title: '上传到设备',
    intent:
      '架构图里「上传设备」从项目和采样两处指向三个硬件模块（见作品集板）。做成底部 sheet，因为它总是从别的屏触发，不该顶掉上下文。',
    notes: ['先选模块，再出传输进度；进度是模拟的，没有真实设备通道', '设计板上冻结在 62%，好让你看清进度条的配色', '传完 toast 回原屏，不新开一屏'],
    tab: 'create',
    sub: 'projects',
    overlay: { kind: 'uploadDevice', module: '采样模块', itemId: 'p-1' },
  },
  {
    code: 'N7',
    title: '分享面板',
    intent:
      '原稿 3 的采样操作里并排写着「一键分享」和「分享到团队·社区」，是两条不同的边。用分段控件把它们收进同一个 sheet，省掉一屏。',
    notes: ['一键分享给二维码 + 四个渠道；二维码是画出来的示意图，不可扫（docs 里如实写明）', '分享到团队·社区切到小组与社区列表', '任意渠道都只出 toast，原型不接任何外部服务'],
    tab: 'create',
    sub: 'projects',
    overlay: { kind: 'share', target: '夜班电台 Demo', scope: 'one' },
  },
  {
    code: 'N8',
    title: '采样选择器',
    intent:
      '架构图里「从我的采样中获取」被偶然音乐、声音转音乐、AI特效、新建项目四处共用。所以做成一个带 mode 的 sheet，标题与下一步跟着 mode 变，不复制四份。',
    notes: ['列表项复用 .ei-row + 84×82 缩略图（Figma 实测尺寸，圆角 5），和原稿 2 的我的采样完全同一套', '顶部一行提示写明「选完去哪」，避免选了不知道落点', '板上展示的是 mode=chance（偶然音乐）这一支'],
    tab: 'lab',
    overlay: { kind: 'samplePicker', mode: 'chance' },
  },
  {
    code: 'N9',
    title: 'AI特效处理 · 入口',
    intent:
      '原稿 6/7 的 AI实验室卡片里有「AI特效处理」，但点进去的选择页没有稿。架构图给了两个来源：社区共享音乐、我的采样。两张大卡对半分，和原稿 6 的卡片比例一致。',
    notes: ['社区共享音乐一支直接列出社区热门作品', '从我的采样获取转交 N8（mode=fx）', '选完都进 N10 处理与输出'],
    tab: 'lab',
    screen: 'labFx',
  },
  {
    code: 'N10',
    title: 'AI特效处理 · 处理与输出',
    intent:
      '原稿 4/5（采样处理）已经确立了「工具行 + 推子组 + 前后对比」的语言，这屏继承它，把采样处理的手动推子换成五个特效预设，保证两个模块看起来是一家人。',
    notes: ['处理前 / 处理后两条波形上下并排，同 seed 不同 lit 比例', '五个预设 chip 单选，选中即重算波形与试听音色', '底部两个出口对应架构图的上传到创意空间 / 上传到互动与社区'],
    tab: 'lab',
    screen: 'labFxRun',
    params: { sampleId: 's-6' },
  },
  {
    code: 'N11',
    title: '图片转音乐 · 合集播放',
    intent:
      '原稿 12/13 停在选照片合集，播放结果没有稿。把原稿 13 的大图直接放大成轮播主体，音乐信息压到底部一条，因为这个功能的主角是照片。',
    notes: ['照片用裁出来的真实合集图，轮播点对应 content 里的 count', '播放 / 分享 / 下载三颗按钮，下载只出 toast', '分享走 N7，上传走 N6，和项目那边同一套浮层'],
    tab: 'lab',
    screen: 'labPictureAlbum',
    params: { albumId: 'red-faith' },
  },
  {
    code: 'N12',
    title: '社区作品详情',
    intent:
      '原稿 14 的瀑布流点进去是什么，架构图只写了「作品详情」。作者条沿用原稿 14 卡片底部那条奶油色 #FCF1DB 作者带，让详情页和瀑布流块视觉同源。',
    notes: ['点赞 / 转存下载 / 分享三态写进 AppState，点了会留痕', '转存下载落到我的采样，对应架构图那条指回创意空间的线', '评论区三条假评论，输入框不可提交（原型无后端）'],
    tab: 'community',
    sub: 'feed',
    screen: 'postDetail',
    params: { postId: 'post-3' },
  },
  {
    code: 'N13',
    title: '小组详情 · 项目列表',
    intent:
      '原稿 15（创作）给了小组卡，点进去的项目列表没有稿。成员头像用 52px 圆形叠排，项目卡复用 .ei-row，保证和我的项目那屏手感一致。',
    notes: ['点项目卡进 N4 编辑器，对应架构图「选择项目去修改创作」', '新建项目进 N14 组队选择', '成员行可点，进 N16 聊天'],
    tab: 'community',
    sub: 'groups',
    screen: 'groupDetail',
    params: { groupId: 'g-1' },
  },
  {
    code: 'N14',
    title: '新建小组项目 · 组队选择',
    intent:
      '架构图里小组创作分线上协作与线下排练两条，最后都汇到「上传创意空间」。用分段控件表达这个分叉，再用同一颗主按钮表达汇合。',
    notes: ['先勾成员，再选线上 / 线下', '两条路的说明文案不同（线上进编辑器，线下记排练）', '确认后 root 跳到创意空间 · 我的项目，这就是架构图那条上传边'],
    tab: 'community',
    sub: 'groups',
    overlay: { kind: 'teamMode', groupId: 'g-1' },
  },
  {
    code: 'N15',
    title: '交友 / 发现乐友',
    intent:
      '原稿 16（分享互动）里有一块地图，但没有点开图钉之后的样子。地图是画的 SVG——把原稿裁到 361px 宽会糊，而且图钉要跟状态联动。',
    notes: ['图钉分在线/离线两色，点一下在下方出详情卡', '加好友后按钮变为「发消息」，进 N16', '不接任何真实地图服务，大陆轮廓是简化路径'],
    tab: 'community',
    sub: 'social',
    screen: 'friendDiscover',
  },
  {
    code: 'N16',
    title: '聊天窗口',
    intent:
      '架构图「分享互动」下的聊天节点。气泡自己一侧用主紫、对方用卡片黑，附件卡直接复用 .ei-row 的缩略图比例，让「发来一条采样」看起来就是我的采样里那一行。',
    notes: ['两条附件卡：一条采样、一条小组项目', '点采样附件可试听并存到我的采样', '点项目附件进 N4 编辑器'],
    tab: 'community',
    sub: 'social',
    screen: 'chat',
    params: { friendId: 'f-1' },
  },
  {
    code: 'N17',
    title: '虚拟乐器 · 体验与创作',
    intent:
      '原稿 17 只有乐器分类卡，弹奏界面没有稿。键盘与指板都是画的，因为它们必须跟按下状态联动；音色全走振荡器合成，没有采样文件。',
    notes: ['板上展示吉他类（指板 6 弦 × 5 格）；钢琴与古筝走 14 键键盘、打击乐走六个打击垫，同一屏按乐器 layout 换', '点录制后把演奏存成一条「我的采样」，对应架构图回创意空间那条线', '离开这屏会 stopAll，避免尾音跟着你走；设计板上不发声'],
    tab: 'instrument',
    sub: 'instruments',
    screen: 'instrumentPlay',
    params: { categoryId: 'guitar', title: '钢弦吉他' },
  },
  {
    code: 'N18',
    title: '乐理课程详情',
    intent:
      '原稿 18 给了课程列表，课程内页没有稿。五线谱按课程的 midi 数组算音符位置，和试听用的是同一份数据，所以看到的和听到的一定对得上。',
    notes: ['点播放逐音高亮，当前音符变黄 #FFD200', '节拍器用 25ms 前瞻调度，不是每拍一个 timeout，避免漂移', '设计板上定在第 2 个音符与第 1 拍'],
    tab: 'instrument',
    sub: 'theory',
    screen: 'theoryLesson',
    params: { lessonId: 'l-1' },
  },
  {
    code: 'N19',
    title: '知识查询结果',
    intent:
      '架构图「乐理学习」下有知识查询这条边。做成术语卡：定义在上、和弦图在中、可试听在下，和弦图也是画的（指位要跟数据走）。',
    notes: ['和弦图按 frets 数组画，0 为空弦画空心圈', '试听一次性弹响整个和弦，用钢琴音色', '相关术语可点，在同一屏换内容'],
    tab: 'instrument',
    sub: 'theory',
    screen: 'knowledgeResult',
    params: { termId: 't-1' },
  },
  {
    code: 'N20',
    title: '全局搜索',
    intent:
      '四个模块顶栏右上角都有 🔍，架构图把它当全局入口。结果按四个模块分组，组标题直接用模块名，这样搜到一条就知道它属于哪个 tab。',
    notes: ['历史词 chip 可点，点了填进输入框', '每条结果都是真实深链：项目→N5、采样→采样处理、社区→N12、乐理→N19', '覆盖整个机身（z-index 70），在顶栏之上'],
    tab: 'create',
    sub: 'projects',
    overlay: { kind: 'search' },
  },
] as const
