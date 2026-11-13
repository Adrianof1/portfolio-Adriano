/**
 * waf-express.js — WAF + IP Ban para backend Express (Render.com)
 *
 * COMO USAR no servidor Express:
 *
 *   const { createWAF } = require('./security/waf-express');
 *   const waf = createWAF({
 *     getBan:    async (ip) => BannedIP.exists({ ip }),
 *     setBan:    async (ip, meta) => BannedIP.create({ ip, ...meta }),
 *     notify:    async (ip, rule, route) => { ... },  // WhatsApp/email
 *   });
 *   app.use(waf);   // antes de qualquer rota
 *
 * O objeto BannedIP é um model Mongoose/Sequelize/Prisma qualquer.
 * O importante é que setBan persista no banco — NUNCA em memória.
 *
 * ─── ARMADILHA CRÍTICA: IP DO PROXY ──────────────────────────────
 * Se o app rodar atrás de Nginx/Cloudflare/load balancer:
 *
 *   app.set('trust proxy', 1);  // Express confia no 1º proxy
 *
 * Isso faz req.ip usar X-Forwarded-For automaticamente.
 * SEM isso, req.ip é sempre o IP do proxy — banir o proxy derruba
 * todos os usuários de uma vez. Confirme com a rota /waf-test-ip
 * antes de ativar em produção.
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

/* ─── PADRÕES DE ATAQUE ─────────────────────────────────────────── */
const RULES = [
  {
    name: 'sql_injection',
    re: [
      /['"`]\s*(?:or|and)\s+['"`\d]/i,
      /\bunion\s+(?:all\s+)?select\b/i,
      /(?:--|\/\*).{0,60}(?:select|insert|update|delete|drop|exec)/i,
      /;\s*(?:drop|truncate|delete\s+from|insert\s+into|update\s+\w|exec(?:ute)?)\b/i,
      /\b(?:sleep|benchmark|waitfor\s+delay|pg_sleep)\s*\(/i,
      /\b(?:extractvalue|updatexml|load_file|into\s+outfile)\s*\(/i,
      /\bxp_cmdshell\b/i,
    ],
  },
  {
    name: 'xss',
    re: [
      /<\s*script\b/i,
      /javascript\s*:/i,
      /\bon\w{2,15}\s*=\s*['"`]?\s*(?:alert|eval|fetch|location|document\.|window\.)/i,
      /\beval\s*\(\s*(?:atob|unescape|String\.fromCharCode)/i,
      /data:\s*(?:text\/html|application\/javascript)[^,]*,/i,
      /\bsrcdoc\s*=/i,
    ],
  },
  {
    name: 'nosql_injection',
    re: [
      /\$\s*(?:gt|gte|lt|lte|ne|eq|in|nin|or|and|nor|not|where|regex|expr|type|exists)\s*["':\s]/i,
      /["']\s*:\s*\{\s*"\$/,
      /__proto__|constructor\s*\[|prototype\s*\[/i,
    ],
  },
  {
    name: 'path_traversal',
    re: [
      /(?:\.{2,}[\/\\]){2,}/,
      /%2e{2,}%2f/i,
      /%252e/i,
      /\/(?:etc\/(?:passwd|shadow|hosts)|proc\/self\/|windows\/system32)/i,
      /(?:\.env|\.git\/config|wp-config\.php|database\.yml)(?:$|[?#\s])/i,
    ],
  },
];

/* ─── DECODIFICAÇÃO SEGURA ──────────────────────────────────────── */
function safeDecode(s) {
  let v = String(s);
  for (let i = 0; i < 3; i++) {
    try { const n = decodeURIComponent(v); if (n === v) break; v = n; } catch { break; }
  }
  return v.replace(/[\x00\r\n\t]+/g, ' ').trim();
}

/* ─── INSPEÇÃO DE VALOR ─────────────────────────────────────────── */
function inspectValue(raw) {
  if (typeof raw !== 'string' || raw.length < 3) return null;
  const decoded = safeDecode(raw);
  for (const rule of RULES) {
    for (const re of rule.re) {
      if (re.test(raw) || re.test(decoded)) return rule.name;
    }
  }
  return null;
}

/* ─── INSPEÇÃO RECURSIVA DE OBJETOS (body JSON) ─────────────────── */
function inspectObject(obj, depth = 0) {
  if (depth > 5) return null;
  if (typeof obj === 'string') return inspectValue(obj);
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const r = inspectObject(item, depth + 1);
      if (r) return r;
    }
  } else if (obj && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      const kr = inspectValue(key);
      if (kr) return kr;
      const vr = inspectObject(val, depth + 1);
      if (vr) return vr;
    }
  }
  return null;
}

/* ─── FÁBRICA DO MIDDLEWARE ─────────────────────────────────────── */
function createWAF({ getBan, setBan, notify = null } = {}) {
  if (!getBan || !setBan) {
    throw new Error('[WAF] createWAF exige as funções getBan e setBan.');
  }

  return async function wafMiddleware(req, res, next) {
    // ── IP real ────────────────────────────────────────────────────
    // req.ip já resolve X-Forwarded-For SE app.set('trust proxy',1)
    // estiver configurado. Caso contrário, lemos manualmente.
    const ip = req.ip
      || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || req.connection.remoteAddress
      || '0.0.0.0';

    // ── Checa ban existente ────────────────────────────────────────
    try {
      const banned = await getBan(ip);
      if (banned) return _block(res);
    } catch (err) {
      // Falha no banco não deve derrubar o servidor
      console.error('[WAF] Erro ao checar ban:', err.message);
    }

    // ── Detecta ataque na requisição atual ─────────────────────────
    const attack = _detectAttack(req);
    if (attack) {
      const route = req.originalUrl || req.url || '/';
      // Bana + notifica de forma assíncrona (não trava a resposta)
      Promise.allSettled([
        setBan(ip, { reason: attack, route, ts: new Date() }),
        notify ? notify(ip, attack, route) : Promise.resolve(),
      ]).catch(() => null);

      return _block(res);
    }

    next();
  };
}

/* ─── DETECÇÃO ──────────────────────────────────────────────────── */
function _detectAttack(req) {
  // 1. Path + query string
  const fullUrl = (req.originalUrl || req.url || '');
  const path    = req.path || '';
  const rPath   = inspectValue(path);
  if (rPath) return rPath;

  // Query params
  for (const [k, v] of Object.entries(req.query || {})) {
    const rk = inspectValue(k);   if (rk) return rk;
    const rv = inspectObject(v);  if (rv) return rv;
  }

  // 2. Body (JSON, urlencoded — já parseado pelo Express)
  if (req.body && typeof req.body === 'object') {
    const rb = inspectObject(req.body);
    if (rb) return rb;
  }

  // 3. Headers potencialmente perigosos (User-Agent, Referer)
  for (const h of ['user-agent', 'referer', 'x-forwarded-host']) {
    const val = req.headers[h];
    if (val) {
      const rv = inspectValue(val);
      if (rv) return rv;
    }
  }

  return null;
}

/* ─── RESPOSTA 404 NEUTRA ───────────────────────────────────────── */
function _block(res) {
  res.status(404).type('text/plain').send('Não foi dessa vez.');
}

/* ─── ROTA DE DIAGNÓSTICO ───────────────────────────────────────── */
function wafDiagRoute(req, res) {
  const rawConn = req.connection?.remoteAddress || 'n/d';
  const xff     = req.headers['x-forwarded-for'] || '(vazio)';
  const trustIp = req.ip || '(trust proxy não configurado)';
  res.json({
    ok: true,
    ip_usado_pelo_waf: trustIp,
    x_forwarded_for:   xff,
    ip_conexao_bruta:  rawConn,
    trust_proxy_ativo: req.app.get('trust proxy') !== undefined,
    aviso: rawConn === trustIp
      ? '⚠️ trust proxy pode não estar ativo — confirme antes de produção'
      : '✅ X-Forwarded-For está sendo usado corretamente',
  });
}

module.exports = { createWAF, wafDiagRoute };
