'use client'
// N2 个人账户：抽屉头像的落点。统计数字沿用原稿里 19px 粗体 + 11px 次级字
// 那一组比例，设置行直接复用 .ei-row，不另造列表样式。
import { asset } from '../assets'
import { accountRows, accountStats, deviceModules, me, projects, samples } from '../content'
import { SectionTitle, useScreen } from '../chrome'

export function Account() {
  const { open, root, toast, state, go } = useScreen()
  return (
    <>
      <div className="ei-me">
        <img src={asset(me.avatar)} alt="" width={78} height={78} loading="lazy" />
        <b>{me.name}</b>
        <small>{me.handle}</small>
        <p className="ei-hint">{me.bio}</p>
      </div>

      <div className="ei-me-stats">
        {accountStats.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.id === 'works') root('create', 'projects')
              else if (s.id === 'samples') root('create', 'samples')
              else root('community', 'groups')
            }}
          >
            <b>{s.value}</b>
            <small>{s.label}</small>
          </button>
        ))}
      </div>

      <SectionTitle aside={state.deviceConnected ? '3 个模块在线' : '未连接'}>我的硬件</SectionTitle>
      <div className="ei-sheet-list">
        {deviceModules.map((m) => (
          <button
            key={m.id}
            className="ei-row"
            onClick={() => open({ kind: 'uploadDevice', module: m.name })}
          >
            <span className="ei-dev-dot" data-on={state.deviceConnected || undefined} aria-hidden />
            <span className="ei-row-main">
              <b>{m.name}</b>
              <small>{m.desc}</small>
            </span>
            <span className="ei-row-tail">上传</span>
          </button>
        ))}
      </div>

      <SectionTitle aside={`${projects.length} 个项目 · ${samples.length + state.recorded.length} 条采样`}>
        最近
      </SectionTitle>
      <div className="ei-sheet-list">
        <button className="ei-row" onClick={() => go('projectPlayer', { projectId: projects[0].id })}>
          <img
            className="ei-row-thumb ei-sm-thumb"
            src={asset(projects[0].cover)}
            alt=""
            width={64}
            height={60}
            loading="lazy"
          />
          <span className="ei-row-main">
            <b>{projects[0].name}</b>
            <small>
              {projects[0].meta} · {projects[0].updated}
            </small>
          </span>
        </button>
      </div>

      <SectionTitle>设置</SectionTitle>
      <div className="ei-sheet-list">
        {accountRows.map((r) => (
          <button
            key={r.id}
            className="ei-row"
            onClick={() =>
              r.id === 'device' ? open({ kind: 'uploadDevice', module: '采样模块' }) : toast(`${r.label}：${r.value}`)
            }
          >
            <span className="ei-row-main">
              <b>{r.label}</b>
            </span>
            <span className="ei-row-tail">
              {r.value}
              <span className="ei-chev" aria-hidden style={{ transform: 'rotate(-135deg)' }} />
            </span>
          </button>
        ))}
      </div>

      <button className="ei-btn ei-btn-ghost ei-mt" onClick={() => toast('原型不接账号体系，这里只做个样子')}>
        退出登录
      </button>
    </>
  )
}
