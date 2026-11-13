/**
 * middleware.js — Vercel Edge Middleware (WAF + IP Ban)
 *
 * Executa na borda antes de qualquer rota ser servida.
 * Runtime: Edge (sem Node.js — somente Web APIs + fetch).
 *
 * Variáveis de ambiente necessárias (Vercel Dashboard → Settings → Env):
 *   UPSTASH_REDIS_REST_URL   → URL do banco Upstash (https://...)
 *   UPSTASH_REDIS_REST_TOKEN → Token de acesso ao Upstash
 *   WAF_NOTIFY_WA_TOKEN      → Token CallMeBot para WhatsApp
 *   WAF_NOTIFY_WA_PHONE      → Número destino (ex: 5586999830819)
 *
 * Teste obrigatório antes de produção (leia o comentário ARMADILHA
 * na função getRealIP). Acesse /api/waf-test-ip para ver qual IP
 * o middleware está capturando.
 */

export const config = {
  // Aplica em todas as rotas. Exclua rotas internas se necessário.
  matcher: ['/((?!_next/static|_next/image|favicon).*)'],
};

/* ─────────────────────────────────────────────────────────────────
   CONFIGURAÇÕES
───────────────────────────────────────────────────────────────── */
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const WA_TOKEN    = process.env.WAF_NOTIFY_WA_TOKEN;
const WA_PHONE    = process.env.WAF_NOTIFY_WA_PHONE || '5586999830819';

// Prefixo das chaves no Redis
const BAN_KEY = (ip) => `voltz:banned:${ip}`;

/* ─────────────────────────────────────────────────────────────────
   DETECÇÃO DE ATAQUE — mesmas regras do waf-patterns.js
   (duplicadas aqui porque o Edge não suporta imports locais com
   path relativo fora de src/ em todos os frameworks Vercel)
───────────────────────────────────────────────────────────────── */
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
      /\/(?:etc\/(?:passwd|shadow|hosts)|proc\/self\/|windows\/system32|boot\.ini)/i,
      /(?:\.env|\.git\/config|wp-config\.php|config\.php|database\.yml)(?:$|[?#\s])/i,
    ],
  },
];

function decode(s) {
  let v = s;
  for (let i = 0; i < 3; i++) {
    try { const n = decodeURIComponent(v); if (n === v) break; v = n; } catch { break; }
  }
  return v.replace(/[\x00\r\n\t]+/g, ' ').trim();
}

function detectAttack(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return null; }

  const targets = [
    parsed.pathname,
    ...Array.from(parsed.searchParams.entries()).flatMap(([k, v]) => [k, v]),
  ];

  for (const raw of targets) {
    const s = decode(raw);
    for (const rule of RULES) {
      for (const re of rule.re) {
        if (re.test(raw) || re.test(s)) {
          return { rule: rule.name, target: raw.slice(0, 120) };
        }
      }
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────
   IP REAL — ARMADILHA CRÍTICA
   Nunca usar req.ip direto atrás de proxy.
   Vercel sempre popula x-forwarded-for corretamente.
   O PRIMEIRO IP da lista é o do cliente real.
───────────────────────────────────────────────────────────────── */
function getRealIP(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '0.0.0.0';
}

/* ─────────────────────────────────────────────────────────────────
   UPSTASH REDIS — via REST API (sem SDK, funciona no Edge)
───────────────────────────────────────────────────────────────── */
async function redisPing() {
  if (!REDIS_URL || !REDIS_TOKEN) return false;
  const r = await fetch(`${REDIS_URL}/ping`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  }).catch(() => null);
  return r?.ok;
}

async function isBanned(ip) {
  if (!REDIS_URL || !REDIS_TOKEN) return false;
  try {
    const r = await fetch(`${REDIS_URL}/exists/${BAN_KEY(ip)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const json = await r.json();
    return json.result === 1;
  } catch { return false; }
}

async function banIP(ip, reason, route) {
  if (!REDIS_URL || !REDIS_TOKEN) return;
  const meta = JSON.stringify({ reason, route, ts: Date.now() });
  // SET sem TTL = permanente
  await fetch(`${REDIS_URL}/set/${BAN_KEY(ip)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([meta]),
  }).catch(() => null);
}

/* ─────────────────────────────────────────────────────────────────
   NOTIFICAÇÃO WHATSAPP — CallMeBot
   Registrar em callmebot.com antes de usar.
   Env: WAF_NOTIFY_WA_TOKEN + WAF_NOTIFY_WA_PHONE
───────────────────────────────────────────────────────────────── */
async function notifyAdmin(ip, rule, route) {
  if (!WA_TOKEN || !WA_PHONE) return;
  const msg = encodeURIComponent(
    `🚨 *VOLTZ WAF — IP Banido*\n` +
    `IP: ${ip}\n` +
    `Rota: ${route}\n` +
    `Ataque: ${rule}\n` +
    `⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' })}`
  );
  await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${WA_PHONE}&text=${msg}&apikey=${WA_TOKEN}`
  ).catch(() => null); // nunca bloqueia a resposta por falha na notificação
}

/* ─────────────────────────────────────────────────────────────────
   ROTA DE DIAGNÓSTICO — /api/waf-test-ip
   Acesse em staging para confirmar que o IP capturado é o correto
   ANTES de ativar o banimento em produção.
   REMOVA ou proteja essa rota depois do teste.
───────────────────────────────────────────────────────────────── */
function handleDiag(request) {
  const ip = getRealIP(request);
  const xff = request.headers.get('x-forwarded-for') || '(vazio)';
  return new Response(
    JSON.stringify({ real_ip: ip, x_forwarded_for: xff, ok: true }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

/* ─────────────────────────────────────────────────────────────────
   HANDLER PRINCIPAL
───────────────────────────────────────────────────────────────── */
export default async function middleware(request) {
  const url  = request.url;
  const path = new URL(url).pathname;
  const ip   = getRealIP(request);

  // Rota de diagnóstico (remover em produção)
  if (path === '/api/waf-test-ip') return handleDiag(request);

  // ① Checa ban existente primeiro (barato: 1 query Redis)
  if (await isBanned(ip)) {
    return new Response(
      'Não foi dessa vez.',
      { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  // ② Detecta ataque na requisição atual
  const attack = detectAttack(url);
  if (attack) {
    // Bana + notifica em paralelo, sem bloquear a resposta
    await Promise.allSettled([
      banIP(ip, attack.rule, path),
      notifyAdmin(ip, attack.rule, path),
    ]);

    // Retorna 404 — nunca 403/400 que confirma a detecção
    return new Response(
      'Não foi dessa vez.',
      { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  // Requisição legítima — passa adiante
  return undefined;
}
