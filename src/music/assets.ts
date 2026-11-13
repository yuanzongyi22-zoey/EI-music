// Static-export asset paths. next.config.mjs only sets basePath under
// GITHUB_ACTIONS, and assetPrefix never rewrites literal strings in JSX, so
// every <img src> in this prototype has to go through asset().
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function asset(path: string): string {
  if (!path) return path
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${BASE}/music/${path.replace(/^\/+/, '')}`
}
