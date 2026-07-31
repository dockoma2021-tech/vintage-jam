const OWNER = 'dockoma2021-tech';
const REPO = 'vintage-jam';
const BRANCH = 'main';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function isAllowedPath(path) {
  return path === 'data/products.json' ||
    path === 'data/catalog-data.js' ||
    /^images\/products\/vj-\d{6}\/\d{2}\.webp$/.test(path);
}

async function github(path, options = {}) {
  const token = process.env.GITHUB_PUBLISH_TOKEN;
  if (!token) throw new Error('На сервері не задано GITHUB_PUBLISH_TOKEN');
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `GitHub API: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  const configuredKey = process.env.ADMIN_PUBLISH_KEY;
  const suppliedKey = req.headers['x-admin-key'];
  if (!configuredKey) return json(res, 500, { ok: false, error: 'На сервері не задано ADMIN_PUBLISH_KEY' });
  if (!suppliedKey || suppliedKey !== configuredKey) return json(res, 401, { ok: false, error: 'Невірний пароль публікації' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (body.action === 'test') {
      const repo = await github('');
      return json(res, 200, { ok: true, repository: repo.full_name });
    }

    if (body.action !== 'put') return json(res, 400, { ok: false, error: 'Невідома дія' });

    const path = String(body.path || '');
    const content = String(body.content || '');
    const message = String(body.message || 'Update catalog from Admin').slice(0, 120);
    if (!isAllowedPath(path)) return json(res, 400, { ok: false, error: 'Цей шлях заборонено для публікації' });
    if (!content) return json(res, 400, { ok: false, error: 'Порожній вміст файлу' });

    let current = null;
    try {
      current = await github(`/contents/${path}?ref=${BRANCH}`);
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    const payload = { message, content, branch: BRANCH };
    if (current?.sha) payload.sha = current.sha;

    const result = await github(`/contents/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return json(res, 200, { ok: true, path, commit: result.commit?.sha || null });
  } catch (error) {
    return json(res, error.status === 401 ? 401 : 500, { ok: false, error: error.message || 'Помилка публікації' });
  }
}
