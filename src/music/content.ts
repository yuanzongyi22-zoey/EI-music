// Every piece of Chinese copy and mock data for the Ei Music prototype.
// Image paths are relative; render them through asset() from ./assets.
//
// `mood` 是给 audio.playPad() 的：它决定调式、速度、音色和有没有鼓，
// 所以每条内容的试听都得跟自己的名字对得上——「夜班电台」是小调慢板，
// 「夏夜舞曲」是 120 BPM 四踩，「木吉他扫弦」真的在扫弦。

export const COLORS = {
  cream: '#FCF1DB',
  coral: '#FF7A67',
  amber: '#FFAA1A',
  teal: '#12313E',
  sky: '#72CCFF',
  violet: '#9747FF',
  indigo: '#7876FF',
  orange: '#FFA451',
} as const

export const projects = [
  { id: 'p-1', name: '夜班电台 Demo', meta: '4 轨 · 02:18', cover: 'cover/proj-1.jpg', updated: '今天 09:12', mood: 'night' },
  { id: 'p-2', name: 'Red Heart 采样拼贴', meta: '3 轨 · 01:44', cover: 'cover/proj-2.jpg', updated: '昨天 22:05', mood: 'collage' },
  { id: 'p-3', name: '夏夜舞曲', meta: '6 轨 · 03:02', cover: 'cover/proj-3.jpg', updated: '11 月 8 日', mood: 'dance' },
  { id: 'p-4', name: '海边的棕榈', meta: '2 轨 · 01:07', cover: 'cover/proj-4.jpg', updated: '11 月 6 日', mood: 'dream' },
  { id: 'p-5', name: 'Blinding 翻奏', meta: '5 轨 · 02:51', cover: 'cover/proj-5.jpg', updated: '11 月 3 日', mood: 'cover' },
] as const

export const samples = [
  { id: 's-1', name: '清晨鸟鸣', length: '00:12', date: '今天', thumb: 'sample/s-1.jpg', from: '采样模块', mood: 'bird' },
  { id: 's-2', name: '雨落在空调外机', length: '00:31', date: '今天', thumb: 'sample/s-2.jpg', from: '采样模块', mood: 'rain' },
  { id: 's-3', name: '地铁进站', length: '00:24', date: '昨天', thumb: 'sample/s-3.jpg', from: '手机录制', mood: 'street' },
  { id: 's-4', name: '人声哼唱片段', length: '00:08', date: '昨天', thumb: 'sample/s-4.jpg', from: '手机录制', mood: 'dream' },
  { id: 's-5', name: '木吉他扫弦', length: '00:19', date: '11 月 7 日', thumb: 'sample/s-5.jpg', from: '处理与演奏模块', mood: 'folk' },
  { id: 's-6', name: '夜市人声', length: '00:46', date: '11 月 5 日', thumb: 'sample/s-6.jpg', from: '采样模块', mood: 'market' },
] as const

export const sampleActions = [
  { id: 'fx', label: '采样处理', hint: '去噪、修补、节奏整形' },
  { id: 'lab', label: 'AI实验室', hint: '交给 AI 继续生成' },
  { id: 'team', label: '分享到团队·社区', hint: '发到小组或社区' },
  { id: 'quick', label: '一键分享', hint: '生成链接或二维码' },
] as const

export const sampleFxTools = [
  { id: 'denoise', label: '一键去除噪音', desc: '压掉底噪与环境嗡声，保留人声与乐器', auto: true },
  { id: 'repair', label: '一键修补瑕疵', desc: '补齐爆音、断点与削波', auto: true },
  { id: 'aiGroove', label: 'AI节奏整形', desc: '自动对齐到 92 BPM 网格', auto: true },
  { id: 'handGroove', label: '手动节奏整形', desc: '用推子自己调摆动、量化与长度', auto: false },
] as const

export const faders = [
  { id: 'swing', label: '摆动', value: 42 },
  { id: 'quantize', label: '量化', value: 68 },
  { id: 'length', label: '长度', value: 55 },
  { id: 'gain', label: '增益', value: 73 },
] as const

export const deviceModules = [
  { id: 'sampler', name: '采样模块', desc: '随身录音与现场采集', detail: '把采样推到硬件的 8 个槽位' },
  { id: 'performer', name: '处理与演奏模块', desc: '旋钮与推子现场处理', detail: '载入处理链，手上实时演奏' },
  { id: 'creator', name: '创作模块', desc: '编曲与成品输出', detail: '整段项目同步到硬件工程' },
] as const

// ---------------------------------------------------------------- AI 实验室

export const labCards = [
  {
    id: 'chance',
    name: '偶然音乐',
    en: 'Accidental music',
    art: 'lab/chance.jpg',
    desc: '选关键词或丢一段采样进去，让算法替你掷骰子',
    screen: 'labChance',
  },
  {
    id: 'fx',
    name: 'AI特效处理',
    en: 'AI effects',
    art: 'lab/fx.jpg',
    desc: '挑一首社区共享音乐或自己的采样，套上特效链',
    screen: 'labFx',
  },
  {
    id: 'voice',
    name: '声音转音乐',
    en: 'Sound to music',
    art: 'lab/voice.jpg',
    desc: '直接哼一段，或者把采样喂进去变成完整编曲',
    screen: 'labVoice',
  },
  {
    id: 'picture',
    name: '图片转音乐',
    en: 'Picture to music',
    art: 'lab/picture.jpg',
    desc: '选一个照片合集，按画面情绪生成配乐',
    screen: 'labPicture',
  },
] as const

export const chanceKeywords = [
  { text: '潮湿', color: COLORS.sky },
  { text: '清晨', color: COLORS.amber },
  { text: '金属', color: '#D8B1FF' },
  { text: '失真', color: COLORS.coral },
  { text: '童声', color: COLORS.cream },
  { text: '地下', color: COLORS.teal },
  { text: '慢速', color: COLORS.indigo },
  { text: '雨', color: COLORS.sky },
  { text: '霓虹', color: COLORS.violet },
  { text: '木质', color: COLORS.orange },
  { text: '呼吸', color: COLORS.cream },
  { text: '回响', color: '#D8B1FF' },
  { text: '噪点', color: COLORS.coral },
  { text: '海', color: COLORS.sky },
  { text: '节日', color: COLORS.amber },
  { text: '独奏', color: COLORS.orange },
  { text: '夜车', color: COLORS.indigo },
  { text: '褪色', color: COLORS.violet },
] as const

export const chanceParams = [
  { id: 'density', label: '密度', value: 61 },
  { id: 'mood', label: '情绪', value: 38 },
  { id: 'tempo', label: '速度', value: 72 },
  { id: 'noise', label: '噪声', value: 25 },
] as const

// mood 让「换一个预设」真的换声音，不只是换一行说明文字。
export const fxPresets = [
  { id: 'tape', label: '磁带', desc: '抖动 + 高频衰减', mood: 'night' },
  { id: 'cave', label: '洞穴', desc: '长混响 + 低通', mood: 'dream' },
  { id: 'glitch', label: '故障', desc: '切片重排 + 比特压缩', mood: 'collage' },
  { id: 'warm', label: '暖箱', desc: '电子管饱和', mood: 'folk' },
  { id: 'wide', label: '展宽', desc: '立体声加宽', mood: 'dance' },
] as const

export const albums = [
  { id: 'outdoor', name: '户外照片合集', count: 54, cover: 'album/outdoor.jpg', mood: 'bird' },
  { id: 'portrait', name: '人像照片合集', count: 29, cover: 'album/portrait.jpg', mood: 'dream' },
  { id: 'sea', name: '海边的下午', count: 18, cover: 'album/sea.jpg', mood: 'folk' },
  { id: 'red-faith', name: '红色信仰', count: 12, cover: 'album/red-faith.jpg', mood: 'cover' },
] as const

export const recommendations = [
  { id: 'r-1', name: 'Mountain', artist: 'Krisx', cover: 'rec/r-1.jpg' },
  { id: 'r-2', name: 'Red Heart', artist: 'Lowen', cover: 'cover/proj-2.jpg' },
  { id: 'r-3', name: 'Palm Wipeout', artist: 'The Neighbourhood', cover: 'cover/proj-3.jpg' },
  { id: 'r-4', name: 'Blinding', artist: 'A. Tesfaye', cover: 'cover/proj-5.jpg' },
] as const

// ------------------------------------------------------------ 互动与社区

export const feedPosts = [
  {
    id: 'post-1',
    art: 'feed/f-4.jpg',
    col: 'right',
    author: '半间一亩风',
    avatar: 'avatar/a-4.jpg',
    likes: '6.2万',
    kind: '音乐',
    title: '春天的花 掉落的光',
    desc: '用窗外的风声做底，加了一层老唱片的噪点',
    mood: 'dream',
  },
  {
    id: 'post-2',
    art: 'feed/f-1.jpg',
    col: 'left',
    author: '小熊日记铺',
    avatar: 'avatar/a-2.jpg',
    likes: '2443',
    kind: '音乐',
    title: 'Folk哼唱',
    desc: '一条人声哼唱的采样，反复叠了六层',
    mood: 'folk',
  },
  {
    id: 'post-3',
    art: 'feed/f-5.jpg',
    col: 'right',
    author: 'Xiao Vilian',
    avatar: 'avatar/a-5.jpg',
    likes: '63万',
    kind: '真实采样',
    title: '音乐节live采样',
    desc: '现场最后一首的人声鼎沸，原始采样可转存',
    mood: 'market',
  },
  {
    id: 'post-4',
    art: 'feed/f-2.jpg',
    col: 'left',
    author: '氧气吉他',
    avatar: 'avatar/a-3.jpg',
    likes: '3.1万',
    kind: '演奏视频',
    title: '吉他弹奏 真实采样',
    desc: 'R&B 纯吉他伴奏，单轨干声',
    mood: 'cover',
  },
  {
    id: 'post-5',
    art: 'feed/f-6.jpg',
    col: 'right',
    author: '原来是鸭腿',
    avatar: 'avatar/a-6.jpg',
    likes: '221',
    kind: '制作视频',
    title: '一台机器怎么出四条轨',
    desc: '把采样模块接到处理模块的完整过程',
    mood: 'street',
  },
  {
    id: 'post-6',
    art: 'feed/f-3.jpg',
    col: 'left',
    author: 'vcvcvc-chan',
    avatar: 'avatar/a-1.jpg',
    likes: '2443',
    kind: '音乐',
    title: '卧室里的合成器堆',
    desc: '全部用硬件走带录的，没有后期剪辑',
    mood: 'collage',
  },
] as const

export const postComments = [
  { id: 'c-1', author: '氧气吉他', avatar: 'avatar/a-3.jpg', text: '底噪处理得真干净，用了一键去噪吗？' },
  { id: 'c-2', author: '小熊日记铺', avatar: 'avatar/a-2.jpg', text: '第 40 秒那一下很顶。' },
  { id: 'c-3', author: 'Xiao Vilian', avatar: 'avatar/a-5.jpg', text: '转存了，想接到我的小组项目里。' },
] as const

export const groups = [
  {
    id: 'g-1',
    name: 'BEHAND乐队',
    cover: 'group/g-1.jpg',
    meta: '共有3个项目',
    members: ['avatar/a-1.jpg', 'avatar/a-3.jpg', 'avatar/a-5.jpg'],
    projects: [
      { id: 'gp-1', name: '巡演开场曲', meta: '线下排练 · 4 轨', owner: '氧气吉他' },
      { id: 'gp-2', name: 'Demo 第二版', meta: '线上协作 · 6 轨', owner: '半间一亩风' },
      { id: 'gp-3', name: '返场 Jam', meta: '线下排练 · 2 轨', owner: 'Xiao Vilian' },
    ],
  },
  {
    id: 'g-2',
    name: '和朋友随便玩玩',
    cover: 'group/g-2.jpg',
    meta: '共有1个项目',
    members: ['avatar/a-2.jpg', 'avatar/a-6.jpg'],
    projects: [{ id: 'gp-4', name: '周末即兴', meta: '线上协作 · 3 轨', owner: '小熊日记铺' }],
  },
] as const

export const friends = [
  { id: 'f-1', name: '氧气吉他', avatar: 'avatar/a-3.jpg', city: '杭州 · 2.1km', tag: '吉他 / R&B', online: true },
  { id: 'f-2', name: '小熊日记铺', avatar: 'avatar/a-2.jpg', city: '杭州 · 3.4km', tag: '人声 / 民谣', online: true },
  { id: 'f-3', name: 'Xiao Vilian', avatar: 'avatar/a-5.jpg', city: '上海 · 162km', tag: '现场采样', online: false },
  { id: 'f-4', name: '半间一亩风', avatar: 'avatar/a-4.jpg', city: '苏州 · 88km', tag: '氛围 / 合成器', online: false },
  { id: 'f-5', name: '原来是鸭腿', avatar: 'avatar/a-6.jpg', city: '杭州 · 0.8km', tag: '硬件玩家', online: true },
] as const

export const chatThread = [
  { id: 'm-1', me: false, text: '你那条夜市人声能发我吗？想加到小组项目里' },
  { id: 'm-2', me: true, text: '发你了，原始采样没处理过' },
  { id: 'm-3', me: true, attach: { kind: 'sample' as const, id: 's-6', name: '夜市人声', meta: '00:46 · 未处理' } },
  { id: 'm-4', me: false, text: '收到，我先去噪再铺一层鼓' },
  { id: 'm-5', me: false, attach: { kind: 'project' as const, id: 'gp-2', name: 'Demo 第二版', meta: '线上协作 · 6 轨' } },
  { id: 'm-6', me: true, text: '明晚排练直接上这版' },
] as const

// ------------------------------------------------------------- 乐器乐理

/** `art: null` means the card is drawn in CSS — those two categories have no
 *  design-source screenshot, which docs/ei-music.md discloses. */
export const instrumentCategories = [
  { id: 'guitar', name: '吉他类乐器', en: 'GUTARE', art: 'instrument/guitar.jpg', count: 6 },
  { id: 'traditional', name: '中国传统乐器', en: 'TRADITIONAL', art: 'instrument/sanxian.jpg', count: 8 },
  { id: 'piano', name: '古典钢琴', en: 'PIANO', art: 'instrument/piano.jpg', count: 3 },
  { id: 'percussion', name: '打击乐', en: 'PERCUSSION', art: null, count: 5 },
  { id: 'electronic', name: '电子乐器', en: 'ELECTRONIC', art: null, count: 4 },
] as const

// layout 决定弹的界面，timbre 决定音色，oct 是半音移调——
// 不给移调的话同类里两把都是 pluck 的乐器试听起来一模一样。
export const instruments = {
  guitar: [
    { id: 'i-steel', name: '钢弦吉他', layout: 'fret' as const, timbre: 'guitar' as const, oct: 0 },
    { id: 'i-nylon', name: '古典吉他', layout: 'fret' as const, timbre: 'pluck' as const, oct: 0 },
    { id: 'i-bass', name: '电贝斯', layout: 'fret' as const, timbre: 'pluck' as const, oct: -12 },
  ],
  traditional: [
    { id: 'i-sanxian', name: '三弦', layout: 'fret' as const, timbre: 'pluck' as const, oct: 7 },
    { id: 'i-guzheng', name: '古筝', layout: 'keys' as const, timbre: 'bell' as const, oct: 12 },
  ],
  piano: [
    { id: 'i-grand', name: '三角钢琴', layout: 'keys' as const, timbre: 'piano' as const, oct: 0 },
    { id: 'i-upright', name: '立式钢琴', layout: 'keys' as const, timbre: 'piano' as const, oct: -5 },
  ],
  percussion: [{ id: 'i-kit', name: '鼓组', layout: 'pads' as const, timbre: 'piano' as const, oct: 0 }],
  electronic: [{ id: 'i-synth', name: '合成器', layout: 'keys' as const, timbre: 'bell' as const, oct: -12 }],
} as const

export const theoryLessons = [
  {
    id: 'l-1',
    name: '认识大调音阶',
    level: '入门',
    meta: '6 小节 · 约 8 分钟',
    scale: [60, 62, 64, 65, 67, 69, 71, 72],
    scaleName: 'C 大调',
    body: [
      '大调音阶的七个音之间，只有第三到第四级、第七到第八级是半音，其余都是全音。',
      '先把这串音从头到尾听一遍，再跟着节拍器用 80 BPM 弹一遍，注意两处半音落在哪里。',
    ],
  },
  {
    id: 'l-2',
    name: '自然小调与关系大调',
    level: '入门',
    meta: '5 小节 · 约 7 分钟',
    scale: [57, 59, 60, 62, 64, 65, 67, 69],
    scaleName: 'A 自然小调',
    body: [
      'A 自然小调和 C 大调用的是同一组白键，区别只在于从哪个音开始，以及哪个音听起来像“家”。',
      '把两条音阶接着听，你会听到同样的音级排列却是两种情绪。',
    ],
  },
  {
    id: 'l-3',
    name: '摆动节奏怎么来的',
    level: '进阶',
    meta: '4 小节 · 约 6 分钟',
    scale: [60, 63, 65, 67, 70, 72],
    scaleName: 'C 小五声',
    body: [
      '把一拍里的两个八分音符改成三连音的前两个，就得到了最基础的摆动。',
      '采样处理里的「摆动」推子就是在做这件事，推到 42 大致相当于轻微 swing。',
    ],
  },
] as const

export const knowledgeTerms = [
  {
    id: 't-1',
    name: 'Gmaj11',
    kind: '和弦',
    summary: 'G 大七和弦叠加九音与十一音，色彩明亮但不紧张，常用在爵士与 City Pop 的落脚处。',
    notes: [55, 59, 62, 66, 69, 72],
    noteNames: ['G', 'B', 'D', 'F♯', 'A', 'C'],
    frets: [3, 2, 0, 0, 0, 3],
    related: ['Gmaj7', 'G6/9', 'Bm7'],
  },
  {
    id: 't-2',
    name: '平行五度',
    kind: '术语',
    summary: '两个声部同时以五度音程平行移动。古典和声里被禁止，在摇滚吉他的强力和弦里却是标志性音响。',
    notes: [60, 67, 62, 69],
    noteNames: ['C', 'G', 'D', 'A'],
    frets: [],
    related: ['强力和弦', '声部进行'],
  },
] as const

// ------------------------------------------------- N4 项目线上编辑器 / 全局

export const editorTracks = [
  { id: 'tk-1', name: '鼓组', color: '#9747FF' },
  { id: 'tk-2', name: '贝斯', color: '#72CCFF' },
  { id: 'tk-3', name: '吉他采样', color: '#FFAA1A' },
  { id: 'tk-4', name: '人声哼唱', color: '#FF7A67' },
] as const

/** bar/len are in bars on a 16-bar ruler; track is a 0-based row index. */
export const editorClips = [
  { id: 'cl-1', track: 0, bar: 0, len: 8, label: '四拍底鼓' },
  { id: 'cl-2', track: 0, bar: 8, len: 8, label: '加花' },
  { id: 'cl-3', track: 1, bar: 2, len: 6, label: '低音线 A' },
  { id: 'cl-4', track: 1, bar: 10, len: 4, label: '低音线 B' },
  { id: 'cl-5', track: 2, bar: 0, len: 4, label: '木吉他扫弦' },
  { id: 'cl-6', track: 2, bar: 6, len: 5, label: '扫弦 变奏' },
  { id: 'cl-7', track: 3, bar: 4, len: 7, label: '人声哼唱片段' },
  { id: 'cl-8', track: 3, bar: 12, len: 4, label: '尾句' },
] as const

export const editorZooms = [
  { id: 'wide', label: '16 小节' },
  { id: 'mid', label: '8 小节' },
  { id: 'tight', label: '4 小节' },
] as const

export const newProjectSources = [
  { id: 'blank', label: '空白项目', desc: '从四条空轨开始' },
  { id: 'sample', label: '从采样新建', desc: '挑一条我的采样作为第一轨' },
  { id: 'device', label: '从设备导入', desc: '读取硬件里的工程与槽位' },
  { id: 'file', label: '导入音频文件', desc: '支持 wav / mp3 / aiff' },
] as const

export const shareChannels = [
  { id: 'link', label: '复制链接' },
  { id: 'qr', label: '二维码' },
  { id: 'wechat', label: '微信' },
  { id: 'xhs', label: '小红书' },
] as const

export const accountStats = [
  { id: 'works', label: '作品', value: 12 },
  { id: 'samples', label: '采样', value: 46 },
  { id: 'groups', label: '小组', value: 2 },
] as const

export const accountRows = [
  { id: 'device', label: '设备绑定', value: '3 个模块已连接' },
  { id: 'storage', label: '云端空间', value: '2.1 GB / 10 GB' },
  { id: 'quality', label: '导出音质', value: '24bit / 48kHz' },
  { id: 'privacy', label: '隐私与可见范围', value: '仅好友可见' },
  { id: 'about', label: '关于 Ei Music', value: 'v1.0.0' },
] as const

export const me = {
  name: '邹一一',
  handle: '@zoey.ei',
  avatar: 'avatar/a-2.jpg',
  bio: '收集城市里的噪音，然后把它们编成歌。',
} as const

export const searchHistory = ['夜市人声', 'Gmaj11', '摆动节奏', 'BEHAND乐队'] as const

export const searchResults = {
  projects: [
    { id: 'p-1', name: '夜班电台 Demo', meta: '4 轨 · 02:18' },
    { id: 'p-3', name: '夏夜舞曲', meta: '6 轨 · 03:02' },
  ],
  samples: [
    { id: 's-6', name: '夜市人声', meta: '00:46 · 采样模块' },
    { id: 's-2', name: '雨落在空调外机', meta: '00:31 · 采样模块' },
  ],
  posts: [{ id: 'post-3', name: '音乐节live采样', meta: 'Xiao Vilian · 真实采样' }],
  theory: [{ id: 't-1', name: 'Gmaj11', meta: '和弦 · 可试听' }],
} as const

export type Project = (typeof projects)[number]
export type Sample = (typeof samples)[number]
export type LabCard = (typeof labCards)[number]
export type FeedPost = (typeof feedPosts)[number]
export type Group = (typeof groups)[number]
export type Friend = (typeof friends)[number]
export type InstrumentCategory = (typeof instrumentCategories)[number]
export type TheoryLesson = (typeof theoryLessons)[number]
export type KnowledgeTerm = (typeof knowledgeTerms)[number]
export type Album = (typeof albums)[number]
export type DeviceModuleInfo = (typeof deviceModules)[number]
export type EditorClip = (typeof editorClips)[number]




