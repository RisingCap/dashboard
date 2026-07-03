// Direct-save endpoint: the admin page POSTs updated JSON here, and this
// commits it to GitHub via the Contents API — which triggers a Vercel deploy.
// No more copy-paste into VS Code.
//
// Required Vercel env vars:
//   ADMIN_PASSWORD — shared secret the admin page must send
//   GITHUB_TOKEN   — fine-grained PAT with "Contents: Read and write" on the repo
//   GITHUB_REPO    — e.g. "RisingCap/dashboard"
//
// Safety: only whitelisted data files can be written, and content must parse
// as valid JSON before anything is committed.

const ALLOWED_PATHS = new Set([
  'data/posts.json',
  'data/market_brief.json',
  'data/strategy.json',
]);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { password, path, content, message } = req.body || {};

  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: '未配置 ADMIN_PASSWORD 环境变量' });
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: '密码错误' });
  if (!ALLOWED_PATHS.has(path)) return res.status(400).json({ error: '不允许写入该路径' });

  try { JSON.parse(content); }
  catch (e) { return res.status(400).json({ error: 'JSON 无效：' + e.message }); }

  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) return res.status(500).json({ error: '未配置 GITHUB_REPO / GITHUB_TOKEN 环境变量' });

  const api = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'htx-dashboard-admin',
  };

  try {
    // current file SHA is required by GitHub to update an existing file
    let sha;
    const cur = await fetch(`${api}?ref=main`, { headers });
    if (cur.ok) sha = (await cur.json()).sha;

    const put = await fetch(api, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: message || `admin: update ${path}`,
        content: Buffer.from(content, 'utf-8').toString('base64'),
        sha,
        branch: 'main',
      }),
    });
    const j = await put.json();
    if (!put.ok) return res.status(put.status).json({ error: j.message || 'GitHub API 错误' });
    return res.status(200).json({ ok: true, commit: j.commit && j.commit.sha });
  } catch (err) {
    return res.status(500).json({ error: '保存失败：' + err.message });
  }
}
