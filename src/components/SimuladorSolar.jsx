import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sun, Zap, Info } from "lucide-react";

const WHATSAPP = import.meta.env.VITE_WHATSAPP || "5586999830819";

// Valores reais extraídos da fatura Equatorial Piauí (out/2026)
const TARIFA        = 0.9515;   // R$/kWh — tarifa cheia com ICMS/PIS/COFINS
const FIO_B         = 0.3010;   // R$/kWh — Parc. Inj. s/ Desc. GD2 (Lei 14.300/22)
const CIP_KWH       = 0.1136;   // R$/kWh — CIP Teresina (equiv. 85,11 / 749 kWh)
const TOTAL_KWH     = TARIFA + CIP_KWH;          // ~1,065 R$/kWh (custo real total)
const ECONOMIA_KWH  = TARIFA - FIO_B;             // 0,6505 R$/kWh (economia líquida)
const PCT_ECONOMIA  = ECONOMIA_KWH / TOTAL_KWH;  // ~61%
const CO2_FATOR     = 0.136;    // kg CO₂/kWh — grid Brasil (SEEG 2024)
const INVEST_MULT   = 30;       // R$ investimento por R$1 de conta — ~5 kWp a R$5.000/kWp
const HS_PICO       = 5.5;      // horas de sol pico/dia — Piauí (Atlas INPE)

function fmt(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function SimuladorSolar() {
  const [conta, setConta] = useState(400);

  const calc = useMemo(() => {
    const c = Number(conta) || 0;
    if (c < 100) return null;

    const kwhMes       = c / TOTAL_KWH;
    const economiaMes  = kwhMes * ECONOMIA_KWH;
    const contaRest    = c - economiaMes;
    const economiaAno  = economiaMes * 12;
    const economia25   = economiaAno * 25;
    const investimento = c * INVEST_MULT;
    const payback      = investimento / economiaAno;
    const co2Ano       = (kwhMes * 12 * CO2_FATOR) / 1000;
    const pct          = Math.round(PCT_ECONOMIA * 100);

    // Fio B + CIP breakdown
    const fioBMes  = kwhMes * FIO_B;
    const cipMes   = kwhMes * CIP_KWH;

    return { kwhMes, economiaMes, contaRest, economiaAno, economia25, investimento, payback, co2Ano, pct, fioBMes, cipMes };
  }, [conta]);

  const msgWa = encodeURIComponent(
    `Olá VOLTZ! Fiz a simulação no site: minha conta de luz é R$${conta}/mês. Quero saber quanto posso economizar com energia solar.`
  );

  return (
    <section className="py-20 px-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1 rounded-full mb-4">
            <Sun size={12} /> Calculadora Solar
          </span>
          <h2 className="text-3xl font-bold text-white">
            Quanto você economiza com <span className="text-[#FFD700]">energia solar</span>?
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Baseado na <strong className="text-gray-300">tarifa real da Equatorial Piauí</strong> e na irradiação solar do Piauí — uma das mais altas do Brasil
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 md:p-8"
        >
          {/* Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Valor médio da sua conta de luz mensal
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] font-bold text-lg">R$</span>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="50"
                  value={conta}
                  onChange={e => setConta(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white text-2xl font-bold focus:outline-none focus:border-[#FFD700]/60 transition-colors"
                />
              </div>
              <span className="text-gray-500 text-sm hidden sm:block">/mês</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={conta}
              onChange={e => setConta(Number(e.target.value))}
              className="w-full mt-3 accent-yellow-400 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>R$ 100</span><span>R$ 5.000</span>
            </div>
          </div>

          {calc ? (
            <>
              {/* Headline de economia */}
              <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl p-5 mb-6 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Sua economia estimada</p>
                <p className="text-5xl font-black text-[#FFD700] mb-1">{fmt(calc.economiaMes)}<span className="text-lg font-semibold text-yellow-500">/mês</span></p>
                <p className="text-gray-400 text-sm">
                  Redução de <span className="text-[#FFD700] font-bold">{calc.pct}%</span> na sua conta de luz — de {fmt(Number(conta))} para apenas{" "}
                  <span className="text-white font-semibold">{fmt(calc.contaRest)}/mês</span>
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Economia / ano",    value: fmt(calc.economiaAno),  sub: "dinheiro de volta"   },
                  { label: "Em 25 anos",        value: fmt(calc.economia25),   sub: "vida útil do sistema" },
                  { label: "Retorno estimado",  value: `~${calc.payback.toFixed(1)} anos`, sub: "depois disso é lucro" },
                  { label: "CO₂ evitado",       value: `${calc.co2Ano.toFixed(1)} ton`, sub: "por ano" },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-4 border bg-black/40 border-white/10">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* Por que ainda paga algo? */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-gray-400 flex-shrink-0" />
                  <p className="text-xs font-semibold text-gray-300">Por que ainda restam {fmt(calc.contaRest)}/mês após o solar?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex justify-between gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <span>Fio B / TUSD <span className="text-gray-600">(Lei 14.300/22)</span></span>
                    <span className="text-gray-400 font-semibold">{fmt(calc.fioBMes)}</span>
                  </div>
                  <div className="flex justify-between gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <span>CIP <span className="text-gray-600">(iluminação pública)</span></span>
                    <span className="text-gray-400 font-semibold">{fmt(calc.cipMes)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Esses encargos são obrigatórios por lei — toda unidade consumidora paga, mesmo com geração solar. Nenhuma empresa elimina isso. <span className="text-gray-400">O que podemos eliminar é tudo o mais.</span>
                </p>
              </div>

              {/* Investimento */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-black/30 rounded-xl border border-white/5 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Zap size={14} className="text-[#FFD700]" />
                  Investimento estimado: <span className="text-white font-semibold">{fmt(calc.investimento)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  ~{(calc.kwhMes / (HS_PICO * 30)).toFixed(1)} kWp · retorno em ~{calc.payback.toFixed(1)} anos · lucro nos {(25 - calc.payback).toFixed(0)} anos seguintes
                </div>
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/${WHATSAPP}?text=${msgWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#FFD700] hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] text-base"
              >
                <MessageCircle size={18} />
                Quero economizar {fmt(calc.economiaMes)}/mês — Falar com integrador
              </a>

              {/* Disclaimer */}
              <div className="mt-4 flex gap-3 bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <span className="text-yellow-500 text-lg flex-shrink-0 mt-0.5">⚠️</span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-gray-300">Esta é apenas uma simulação.</strong> Os valores são estimativas baseadas na tarifa real da Equatorial Piauí (R$0,95/kWh) e na irradiação solar média do Piauí — o resultado real varia conforme consumo, equipamentos e local. O Fio B e a CIP são encargos obrigatórios cobrados pela distribuidora e não são eliminados pelo solar.{" "}
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá VOLTZ! Quero um dimensionamento técnico gratuito e personalizado para energia solar.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFD700] underline underline-offset-2 hover:text-yellow-300 transition-colors"
                  >
                    Fale com nosso integrador pelo WhatsApp
                  </a>{" "}
                  para um orçamento técnico sem compromisso.
                </p>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 text-sm py-4">Digite um valor acima de R$ 100 para ver a simulação.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
