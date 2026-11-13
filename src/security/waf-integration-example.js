/**
 * EXEMPLO COMPLETO de integração do WAF no backend Express
 * (api-voltz-sistema-de-pagamentos — Render.com)
 *
 * Copie este arquivo para o projeto do backend e adapte ao seu ORM.
 */

'use strict';

const express    = require('express');
const mongoose   = require('mongoose'); // ou Sequelize/Prisma
const { createWAF, wafDiagRoute } = require('./waf-express');

const app = express();

/* ── OBRIGATÓRIO: Trust Proxy ─────────────────────────────────────
   Sem isso, req.ip = IP do Nginx/Cloudflare, não do cliente.
   Banir o proxy derrubaria TODOS os usuários de uma vez.
   Valor 1 = confia no 1º proxy (Render.com usa 1 camada). */
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Modelo para IPs banidos (MongoDB/Mongoose) ──────────────────── */
const BannedIP = mongoose.model('BannedIP', new mongoose.Schema({
  ip:        { type: String, required: true, unique: true, index: true },
  reason:    String,
  route:     String,
  ts:        { type: Date, default: Date.now },
}));

/* ── Função de notificação WhatsApp (CallMeBot) ──────────────────── */
async function notifyAdmin(ip, rule, route) {
  const WA_TOKEN = process.env.WAF_NOTIFY_WA_TOKEN;
  const WA_PHONE = process.env.WAF_NOTIFY_WA_PHONE || '5586999830819';
  if (!WA_TOKEN) return;

  const msg = encodeURIComponent(
    `🚨 *VOLTZ WAF — IP Banido*\nIP: ${ip}\nRota: ${route}\nAtaque: ${rule}\n` +
    `⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' })}`
  );
  await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${WA_PHONE}&text=${msg}&apikey=${WA_TOKEN}`
  ).catch(() => null);
}

/* ── WAF: primeira coisa antes de qualquer rota ──────────────────── */
const waf = createWAF({
  getBan: async (ip) => BannedIP.exists({ ip }),
  setBan: async (ip, meta) => {
    // upsert: se o IP já estiver banido por outra rota, atualiza
    await BannedIP.updateOne({ ip }, { $set: meta }, { upsert: true });
  },
  notify: notifyAdmin,
});

app.use(waf); // ← antes de tudo

/* ── Rota de diagnóstico (REMOVA em produção) ────────────────────── */
app.get('/waf-test-ip', wafDiagRoute);

/* ── Rota de admin: listar IPs banidos (proteja com auth!) ───────── */
app.get('/admin/banned-ips', async (req, res) => {
  const list = await BannedIP.find().sort({ ts: -1 }).limit(100);
  res.json(list);
});

/* ── Rota de admin: desbanir IP manualmente ──────────────────────── */
app.delete('/admin/banned-ips/:ip', async (req, res) => {
  await BannedIP.deleteOne({ ip: req.params.ip });
  res.json({ ok: true, unbanned: req.params.ip });
});

/* ── Suas rotas normais vêm depois ───────────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// ... resto das rotas

module.exports = app;
