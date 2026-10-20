// Shared storage for viewer pin comments (Vercel serverless function + Upstash Redis).
//   GET    /api/comments            -> all comments
//   POST   /api/comments            -> create/update one comment (body = comment)
//   DELETE /api/comments?id=<id>    -> delete one
//   DELETE /api/comments?all=1      -> delete all
// If COMMENTS_WRITE_KEY is set, writes must send it in the `x-comments-key` header.
import { Redis } from '@upstash/redis';

const HASH = 'au:comments';
const MAX_COMMENTS = 500;

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v) => (Number.isFinite(v) ? v : null);

/** Whitelist + clamp every field: never store raw request bodies. */
function sanitize(body) {
  if (!body || typeof body !== 'object') return null;
  const id = str(body.id, 64);
  const path = str(body.path, 200);
  const text = str(body.text, 2000).trim();
  const x = num(body.x);
  const y = num(body.y);
  if (!/^[\w-]{8,64}$/.test(id) || !path.startsWith('/artifacts/') || !text || x === null || y === null) return null;
  return {
    id,
    path,
    x: Math.round(x),
    y: Math.round(y),
    viewport: Math.round(num(body.viewport) ?? 0),
    selector: str(body.selector, 300),
    elementText: str(body.elementText, 100),
    text,
    author: str(body.author, 40) || 'Anonymous',
    createdAt: Number.isFinite(body.createdAt) ? body.createdAt : Date.now(),
  };
}

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  if (payload === undefined) return res.status(status).end();
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  if (!redis) return send(res, 503, { error: 'Storage is not configured' });

  try {
    if (req.method === 'GET') {
      const all = (await redis.hgetall(HASH)) || {};
      const list = Object.values(all)
        .map((v) => (typeof v === 'string' ? JSON.parse(v) : v))
        .sort((a, b) => a.createdAt - b.createdAt);
      return send(res, 200, list);
    }

    if (req.method === 'POST' || req.method === 'DELETE') {
      const writeKey = process.env.COMMENTS_WRITE_KEY;
      if (writeKey && req.headers['x-comments-key'] !== writeKey) return send(res, 401, { error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      const comment = sanitize(req.body);
      if (!comment) return send(res, 400, { error: 'Invalid comment' });
      const exists = await redis.hexists(HASH, comment.id);
      if (!exists && (await redis.hlen(HASH)) >= MAX_COMMENTS) return send(res, 429, { error: 'Comment limit reached' });
      await redis.hset(HASH, { [comment.id]: JSON.stringify(comment) });
      return send(res, 200, comment);
    }

    if (req.method === 'DELETE') {
      if (req.query.all === '1') await redis.del(HASH);
      else if (typeof req.query.id === 'string') await redis.hdel(HASH, req.query.id);
      else return send(res, 400, { error: 'id or all=1 required' });
      return send(res, 204);
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return send(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('comments api failed', error instanceof Error ? error.message : error);
    return send(res, 500, { error: 'Storage error' });
  }
}
