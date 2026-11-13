import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sun, Zap } from "lucide-react";

const WHATSAPP = import.meta.env.VITE_WHATSAPP || "5586999830819";

function fmt(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function SimuladorSolar() {
  const [conta, setConta] = useState(400);

  const calc = useMemo(() => {
    const c = Number(conta) || 0;
    if (c < 100) return null;
    const economiaMes  = c * 0.88;
    const economiaAno  = economiaMes * 12;
    const economia25   = economiaAno * 25;
    const investimento = c * 42;
    const payback      = investimento / economiaAno;
    const kwhMes       = c / 0.92;
    const co2Ano       = (kwhMes * 12 * 0.136) / 1000;
    return { economiaMes, economiaAno, economia25, investimento, payback, co2Ano };
  }, [conta]);

  const msgWa = encodeURIComponent(
    `Olá VOLTZ! Fiz a simulação no site: minha conta de luz é R$${conta}/mês. Quero saber mais sobre energia solar.`
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
            Baseado na irradiação solar do Piauí — uma das mais altas do Brasil
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

          {/* Results */}
          {calc ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Economia / mês",    value: fmt(calc.economiaMes),  sub: "na conta de luz",        gold: true  },
                  { label: "Economia / ano",    value: fmt(calc.economiaAno),  sub: "dinheiro de volta",      gold: false },
                  { label: "Em 25 anos",        value: fmt(calc.economia25),   sub: "vida útil do sistema",   gold: false },
                  { label: "Retorno estimado",  value: `~${calc.payback.toFixed(1)} anos`, sub: "depois disso é lucro", gold: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border ${item.gold ? "bg-[#FFD700]/10 border-[#FFD700]/30" : "bg-black/40 border-white/10"}`}
                  >
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${item.gold ? "text-[#FFD700]" : "text-white"}`}>{item.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-black/30 rounded-xl border border-white/5 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Zap size={14} className="text-[#FFD700]" />
                  Investimento estimado: <span className="text-white font-semibold">{fmt(calc.investimento)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-green-400">🌱</span>
                  CO₂ evitado: <span className="text-white font-semibold">{calc.co2Ano.toFixed(1)} ton/ano</span>
                </div>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP}?text=${msgWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#FFD700] hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] text-base"
              >
                <MessageCircle size={18} />
                Quero um orçamento para meu sistema — Economia de {fmt(calc.economiaMes)}/mês
              </a>
              <div className="mt-4 flex gap-3 bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <span className="text-yellow-500 text-lg flex-shrink-0 mt-0.5">⚠️</span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-gray-300">Esta é apenas uma simulação.</strong> Os valores são estimativas baseadas na tarifa média da Equatorial Piauí e na irradiação solar média da região — o resultado real pode variar conforme o consumo, equipamentos e condições do local.{" "}
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá VOLTZ! Quero um orçamento real e personalizado para energia solar na minha residência/empresa.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFD700] underline underline-offset-2 hover:text-yellow-300 transition-colors"
                  >
                    Fale com nosso integrador pelo WhatsApp
                  </a>{" "}
                  para um dimensionamento técnico gratuito e sem compromisso.
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
