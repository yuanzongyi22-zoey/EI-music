'use client'
// 互动与社区：原稿 14/15/16（社区瀑布流、小组创作、分享互动）复刻，外加
// 新增的 N12 社区作品详情 / N13 小组详情 / N15 发现乐友 / N16 聊天。
// 作者条沿用原稿 14 卡片底部那条奶油色 #FCF1DB 作者带，让详情页和瀑布流块
// 视觉同源；地图是画的 SVG——裁原稿到 361px 宽会糊，而且图钉要跟状态联动。
import { useEffect, useState } from 'react'
import { asset } from '../assets'
import { chatThread, feedPosts, friends, groups, postComments } from '../content'
import { ChipRow, PlayButton, SectionTitle, SeekBar, Waveform, useScreen } from '../chrome'
import { WorldMapArt } from '../art'

export function PostDetail() {
  const { params, state, patch, audio, still, toast, open, root } = useScreen()
  const post = feedPosts.find((p) => p.id === params.postId) ?? feedPosts[0]
  const liked = state.likedPosts.includes(post.id)
  const saved = state.savedPosts.includes(post.id)
  const [playing, setPlaying] = useState(false)
  const [pct, setPct] = useState(still ? 44 : 0)

  useEffect(() => {
    if (!playing || still) return
    const t = setInterval(() => setPct((p) => (p >= 100 ? 0 : p + 1)), 240)
    return () => clearInterval(t)
  }, [playing, still])

  return (
    <>
      <img className="ei-post-art" src={asset(post.art)} alt="" width={361} height={300} loading="lazy" />

      <div className="ei-post-by">
        <img src={asset(post.avatar)} alt="" width={40} height={40} loading="lazy" />
        <span>
          <b>{post.author}</b>
          <small>
            {post.kind} · {post.likes} 赞
          </small>
        </span>
        <button className="ei-chip" onClick={() => toast(`已关注 ${post.author}`)}>
          关注
        </button>
      </div>

      <h2 className="ei-post-title">{post.title}</h2>
      <p className="ei-hint">{post.desc}</p>

      <Waveform seed={post.id} lit={pct / 100} bars={52} />
      <SeekBar at={`00:${String(Math.round(pct * 0.52)).padStart(2, '0')}`} total="00:52" pct={pct} />
      <div className="ei-player-ops">
        <PlayButton
          playing={playing}
          label={playing ? '暂停' : '播放作品'}
          onClick={() => {
            if (still) return
            setPlaying((p) => !p)
            if (!playing) audio.playPad(post.id, post.mood)
            else audio.stopAll()
          }}
        />
      </div>

      <div className="ei-post-ops">
        <button
          aria-pressed={liked}
          onClick={() =>
            patch({
              likedPosts: liked ? state.likedPosts.filter((i) => i !== post.id) : [...state.likedPosts, post.id],
            })
          }
        >
          {liked ? '已赞' : '点赞'}
        </button>
        <button
          aria-pressed={saved}
          onClick={() => {
            if (saved) {
              patch({ savedPosts: state.savedPosts.filter((i) => i !== post.id) })
              return
            }
            patch({ savedPosts: [...state.savedPosts, post.id] })
            toast('已转存到我的采样')
          }}
        >
          {saved ? '已转存' : '转存下载'}
        </button>
        <button onClick={() => open({ kind: 'share', target: post.title, scope: 'one' })}>分享</button>
      </div>
      {saved ? (
        <button className="ei-btn ei-btn-ghost" onClick={() => root('create', 'samples')}>
          去我的采样看看
        </button>
      ) : null}

      <SectionTitle aside={`${postComments.length} 条`}>评论</SectionTitle>
      <ul className="ei-comments">
        {postComments.map((c) => (
          <li key={c.id}>
            <img src={asset(c.avatar)} alt="" width={34} height={34} loading="lazy" />
            <span>
              <b>{c.author}</b>
              <small>{c.text}</small>
            </span>
          </li>
        ))}
      </ul>
      <p className="ei-hint">原型没有后端，评论只读。</p>
    </>
  )
}

export function GroupDetail() {
  const { params, go, open } = useScreen()
  const group = groups.find((g) => g.id === params.groupId) ?? groups[0]
  return (
    <>
      <img className="ei-post-art" src={asset(group.cover)} alt="" width={361} height={190} loading="lazy" />
      <div className="ei-group-by">
        <b>{group.name}</b>
        <small>{group.meta}</small>
        <div className="ei-group-mem" aria-label={`${group.members.length} 位成员`}>
          {group.members.map((m) => (
            <img key={m} src={asset(m)} alt="" width={34} height={34} loading="lazy" />
          ))}
        </div>
      </div>

      <SectionTitle aside="点一个去修改创作">小组项目</SectionTitle>
      <div className="ei-sheet-list">
        {group.projects.map((p) => (
          <button key={p.id} className="ei-row" onClick={() => go('projectEditor', { projectId: p.id, title: p.name })}>
            <span className="ei-row-main">
              <b>{p.name}</b>
              <small>
                {p.meta} · {p.owner}
              </small>
            </span>
            <span className="ei-row-tail">
              <span className="ei-chev" aria-hidden style={{ transform: 'rotate(-135deg)' }} />
            </span>
          </button>
        ))}
      </div>

      <button className="ei-btn ei-btn-purple ei-mt" onClick={() => open({ kind: 'teamMode', groupId: group.id })}>
        新建小组项目
      </button>
      <SectionTitle>成员</SectionTitle>
      <div className="ei-sheet-list">
        {friends.slice(0, group.members.length).map((f) => (
          <button key={f.id} className="ei-row" onClick={() => go('chat', { friendId: f.id, title: f.name })}>
            <img className="ei-row-thumb ei-avatar" src={asset(f.avatar)} alt="" width={44} height={44} loading="lazy" />
            <span className="ei-row-main">
              <b>{f.name}</b>
              <small>{f.tag}</small>
            </span>
            <span className="ei-row-tail">发消息</span>
          </button>
        ))}
      </div>
    </>
  )
}

/** 图钉坐标按 WorldMapArt 的 360×230 视口手摆，和 friends 一一对应。 */
const PINS = [
  { x: 262, y: 118 },
  { x: 274, y: 132 },
  { x: 280, y: 104 },
  { x: 250, y: 96 },
  { x: 238, y: 140 },
]

export function FriendDiscover() {
  const { still, go, toast, state, patch } = useScreen()
  const [sel, setSel] = useState(still ? 0 : -1)
  const friend = sel >= 0 ? friends[sel] : null
  const added = friend ? state.savedPosts.includes(`friend:${friend.id}`) : false

  return (
    <>
      <p className="ei-hint">地图是画出来的简化轮廓，不接任何真实地图服务。点图钉看乐友详情。</p>
      <div className="ei-map-wrap">
        <WorldMapArt pins={PINS.map((p, i) => ({ ...p, on: i === sel }))} />
        <div className="ei-map-hit" role="group" aria-label="地图上的乐友">
          {friends.map((f, i) => (
            <button
              key={f.id}
              style={{ left: `${(PINS[i].x / 360) * 100}%`, top: `${(PINS[i].y / 230) * 100}%` }}
              aria-label={`${f.name} · ${f.city}`}
              aria-pressed={i === sel}
              onClick={() => setSel(i === sel ? -1 : i)}
            />
          ))}
        </div>
      </div>
      {renderCard()}
      <SectionTitle aside={`${friends.filter((f) => f.online).length} 人在线`}>附近的乐友</SectionTitle>
      <div className="ei-sheet-list">
        {friends.map((f, i) => (
          <button key={f.id} className="ei-row" data-on={i === sel || undefined} onClick={() => setSel(i)}>
            <img className="ei-row-thumb ei-avatar" src={asset(f.avatar)} alt="" width={44} height={44} loading="lazy" />
            <span className="ei-row-main">
              <b>{f.name}</b>
              <small>
                {f.city} · {f.tag}
              </small>
            </span>
            <span className="ei-row-tail">{f.online ? '在线' : '离线'}</span>
          </button>
        ))}
      </div>
    </>
  )

  function renderCard() {
    if (!friend) return <p className="ei-hint ei-mt">还没选中图钉。</p>
    return (
      <div className="ei-pin-card">
        <img src={asset(friend.avatar)} alt="" width={54} height={54} loading="lazy" />
        <span>
          <b>{friend.name}</b>
          <small>
            {friend.city} · {friend.tag}
          </small>
        </span>
        {added ? (
          <button className="ei-chip" onClick={() => go('chat', { friendId: friend.id, title: friend.name })}>
            发消息
          </button>
        ) : (
          <button
            className="ei-chip"
            onClick={() => {
              patch({ savedPosts: [...state.savedPosts, `friend:${friend.id}`] })
              toast(`已向 ${friend.name} 发出好友申请`)
            }}
          >
            加好友
          </button>
        )}
      </div>
    )
  }
}

/** content.ts 用 as const，气泡里要同时读 text 和 attach，所以先放宽一次。 */
type ChatAttachment = { kind: 'sample' | 'project'; id: string; name: string; meta: string }
type ChatMsg = { id: string; me: boolean; text?: string; attach?: ChatAttachment }
const THREAD = chatThread as readonly ChatMsg[]

function ChatAttach({
  attach,
  onSample,
  onProject,
}: {
  attach: ChatAttachment
  onSample: (a: ChatAttachment) => void
  onProject: (a: ChatAttachment) => void
}) {
  return (
    <button
      className="ei-chat-attach"
      onClick={() => (attach.kind === 'sample' ? onSample(attach) : onProject(attach))}
    >
      <span className="ei-chat-kind">{attach.kind === 'sample' ? '采样' : '项目'}</span>
      <span className="ei-row-main">
        <b>{attach.name}</b>
        <small>{attach.meta}</small>
      </span>
    </button>
  )
}

export function Chat() {
  const { params, go, audio, still, toast, root } = useScreen()
  const friend = friends.find((f) => f.id === params.friendId) ?? friends[0]
  return (
    <>
      <div className="ei-chat-top">
        <img src={asset(friend.avatar)} alt="" width={36} height={36} loading="lazy" />
        <span>
          <b>{friend.name}</b>
          <small>{friend.online ? '在线' : '最近活跃 2 小时前'}</small>
        </span>
      </div>

      <ul className="ei-chat">
        {THREAD.map((m) => (
          <li key={m.id} data-me={m.me || undefined}>
            {m.text ? <p>{m.text}</p> : null}
            {m.attach ? (
              <ChatAttach
                attach={m.attach}
                onSample={(a) => {
                  if (!still) audio.playPad(a.id)
                  toast(`「${a.name}」已存到我的采样`)
                  root('create', 'samples')
                }}
                onProject={(a) => go('projectEditor', { projectId: a.id, title: a.name })}
              />
            ) : null}
          </li>
        ))}
      </ul>

      <div className="ei-chat-bar">
        <button className="ei-icon-btn" aria-label="发送采样或项目" onClick={() => toast('选一条采样或项目发过去')}>
          +
        </button>
        <input placeholder="说点什么…" aria-label="输入消息" readOnly={still} />
        <button className="ei-chip" onClick={() => toast('原型没有后端，消息不会真的发出')}>
          发送
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------ 原稿 14 · 社区 */

const FEED_FILTERS = [
  { id: 'all', label: '推荐' },
  { id: '音乐', label: '音乐' },
  { id: '真实采样', label: '真实采样' },
  { id: '演奏视频', label: '演奏视频' },
]

export function Feed() {
  const { go, state, patch, toast } = useScreen()
  const [filter, setFilter] = useState('all')
  const list = filter === 'all' ? feedPosts : feedPosts.filter((p) => p.kind === filter)

  return (
    <>
      <ChipRow items={FEED_FILTERS} active={filter} onPick={setFilter} label="社区筛选" />
      {list.length === 0 ? <p className="ei-hint">这一类暂时没有新作品。</p> : null}

      <div className="ei-masonry">
        {list.map((p) => {
          const liked = state.likedPosts.includes(p.id)
          return (
            <div className="ei-feed-card" key={p.id}>
              <button className="ei-feed-hit" onClick={() => go('postDetail', { postId: p.id })}>
                <img src={asset(p.art)} alt="" width={168} height={196} loading="lazy" />
                <b>{p.title}</b>
              </button>
              <div className="ei-feed-by">
                <img src={asset(p.avatar)} alt="" width={22} height={22} loading="lazy" />
                <small>{p.author}</small>
                <button
                  aria-pressed={liked}
                  aria-label={liked ? `取消点赞 ${p.title}` : `点赞 ${p.title}`}
                  onClick={() => {
                    patch({ likedPosts: liked ? state.likedPosts.filter((id) => id !== p.id) : [...state.likedPosts, p.id] })
                    if (!liked) toast(`赞了「${p.title}」`)
                  }}
                >
                  ♥ {p.likes}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* -------------------------------------------- 原稿 15 · 小组创作 */

export function Groups() {
  const { go, open, toast } = useScreen()
  return (
    <>
      <p className="ei-hint">小组是线上线下一起做东西的地方：成果都能上传回创意空间。</p>

      <div className="ei-groups ei-mt">
        {groups.map((g) => (
          <div className="ei-group-card" key={g.id}>
            <button className="ei-group-hit" onClick={() => go('groupDetail', { groupId: g.id })}>
              <img src={asset(g.cover)} alt="" width={345} height={160} loading="lazy" />
              <span>
                <b>{g.name}</b>
                <small>{g.meta}</small>
              </span>
            </button>
            <div className="ei-group-foot">
              <span className="ei-group-mem" aria-hidden>
                {g.members.map((m) => (
                  <img key={m} src={asset(m)} alt="" width={34} height={34} loading="lazy" />
                ))}
              </span>
              <small>{g.members.length} 位成员</small>
              <button className="ei-chip" onClick={() => open({ kind: 'teamMode', groupId: g.id })}>
                新建项目
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="ei-btn ei-btn-ghost ei-mt" onClick={() => toast('原型里小组是固定的两个')}>
        建一个新小组
      </button>
    </>
  )
}

/* -------------------------------------------- 原稿 16 · 分享互动 */

export function Social() {
  const { go, open, state, toast } = useScreen()
  const shared = feedPosts.filter((p) => state.savedPosts.includes(p.id))

  return (
    <>
      <SectionTitle aside="点进去聊">消息</SectionTitle>
      <div className="ei-sheet-list">
        {friends.slice(0, 3).map((f) => (
          <button key={f.id} className="ei-row" onClick={() => go('chat', { friendId: f.id })}>
            <img className="ei-avatar" src={asset(f.avatar)} alt="" width={44} height={44} loading="lazy" />
            <span className="ei-row-main">
              <b>{f.name}</b>
              <small>{f.id === 'f-1' ? '你那条夜市人声能发我吗？' : f.online ? '在线' : '最近活跃 2 小时前'}</small>
            </span>
            <span className="ei-row-tail">
              <i className="ei-dev-dot" data-on={f.online || undefined} aria-hidden />
            </span>
          </button>
        ))}
      </div>

      <SectionTitle aside={`附近 ${friends.filter((f) => f.online).length} 人在线`}>发现乐友</SectionTitle>
      <button className="ei-btn ei-btn-purple" onClick={() => go('friendDiscover')}>
        打开地图找人
      </button>

      <SectionTitle aside="一键分享或分享到团队·社区">我分享出去的</SectionTitle>
      {shared.length === 0 ? (
        <p className="ei-hint">还没有转存或分享过的作品。社区里点「转存」就会出现在这里。</p>
      ) : (
        <div className="ei-sheet-list">
          {shared.map((p) => (
            <button key={p.id} className="ei-row" onClick={() => open({ kind: 'share', target: p.title, scope: 'one' })}>
              <img className="ei-row-thumb ei-sm-thumb" src={asset(p.art)} alt="" width={64} height={60} loading="lazy" />
              <span className="ei-row-main">
                <b>{p.title}</b>
                <small>{p.author} · 已转存</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <SectionTitle>线下</SectionTitle>
      <button className="ei-btn ei-btn-ghost" onClick={() => toast('原型不做扫码，二维码是画的')}>
        面对面加好友
      </button>
    </>
  )
}
