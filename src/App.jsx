import React, { useState } from "react";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, useScroll, useTransform } from "framer-motion";
import { Linkedin, MessageCircle, ExternalLink, ShieldCheck, Code2, Server, Smartphone, Github, ArrowDown, Zap, Sun, Wrench, Camera, Car, Building2 } from "lucide-react";
import Intro from "./components/Intro";
import HackerText from "./components/HackerText";

/* ╔═══════════════════════════════════════════════════════════════╗
 * ║  VOLTZ GUARD — INTEGRAÇÃO DE BLOQUEIO AUTOMÁTICO             ║
 * ║  Desenvolvido por VOLTZ Soluções (gestao-adriano.vercel.app) ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║  PARA USAR EM QUALQUER PROJETO REACT:                        ║
 * ║  1. Copie hooks/useVoltzGuard.js para src/hooks/             ║
 * ║  2. Copie components/AvisoBloqueio.jsx para src/components/  ║
 * ║  3. Cole este bloco de imports no topo do seu App.jsx        ║
 * ║  4. Cole o bloco de verificação dentro do seu componente     ║
 * ╚═══════════════════════════════════════════════════════════════╝ */
import { useVoltzGuard } from './hooks/useVoltzGuard';
import AvisoBloqueio from './components/AvisoBloqueio';
/* ── FIM DOS IMPORTS DO VOLTZ GUARD ─────────────────────────── */


/* ── CPF/CNPJ do cliente — coloque no .env como VITE_CLIENTE_CPF ─
   Exemplo no .env:  VITE_CLIENTE_CPF=12345678901
   Ou substitua '00000000000' diretamente pelo CPF/CNPJ do cliente ─ */
const CPF_CLIENTE = import.meta.env.VITE_CLIENTE_CPF || '05674768390';
/* ─────────────────────────────────────────────────────────────── */


const services = [
  "⚡ Sistemas Fotovoltaicos On-grid e Off-grid",
  "⚡ Instalação de Sistemas Híbridos",
  "⚡ Dimensionamento de Projetos Solares",
  "⚡ Dimensionamento de Bancos de Baterias",
  "⚡ Assessoria e Negociação de Financiamento junto aos Bancos",
  "🔌 Instalação de Carregadores para Veículos Elétricos (EV)",
  "🔌 Inspeção e Laudo Técnico de Instalações Elétricas",
  "🏠 Instalação Elétrica Residencial",
  "🏢 Instalação Elétrica Predial e Comercial",
  "🏠 Automação Residencial Inteligente",
  "🏢 Automação Industrial e Empresarial",
  "📷 Instalação de Câmeras de Segurança (CFTV)",
  "⚡ Cercas Elétricas e Alarmes",
  "🔔 Interfones e Controle de Acesso",
  "🚪 Motores Elétricos para Portões e Cancelas",
  "💻 Desenvolvimento Web (React, Next.js, Node.js, Python)",
  "💻 Automação de Processos e Integrações",
  "🛠️ Montagem e Manutenção de Hardware",
];

const projects = [
  { title: "OrçaFácil",          desc: "Plataforma completa de gestão e orçamentos para empresas.",  tech: ["React", "Node.js"], link: "https://orcafacil.voltzsi.com.br/",             type: "Sistema"   },
  { title: "PC Pinturas",        desc: "Site comercial focado em SEO e conversão via WhatsApp.",      tech: ["React", "Tailwind"], link: "https://pcpinturasthe.netlify.app",             type: "Comercial" },
  { title: "Gestão Gamificada",  desc: "Plataforma para escolas com sistema de XP e recompensas.",    tech: ["Node.js", "React"],  link: "https://gestaoescolarereforco.netlify.app/",   type: "Sistema"   },
  { title: "AIPMS",              desc: "Portal de acessibilidade para associação.",                    tech: ["HTML5", "Social"],   link: "https://aipms.netlify.app/",                   type: "Social"    },
  { title: "IW Decor",           desc: "Catálogo digital imersivo para decoração.",                    tech: ["UI/UX", "React"],    link: "https://iwdecor.netlify.app/",                  type: "Design"    },
];


const WHATSAPP   = import.meta.env.VITE_WHATSAPP || "5586999830819";
const LINKEDIN   = import.meta.env.VITE_LINKEDIN || "https://linkedin.com/in/adrianoferreira-dev";
const GITHUB_URL = "https://github.com/Adrianof1";

const marqueeItems = [...services, ...services];

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const { scrollY }  = useScroll();
  const arrowOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  /* ╔═══════════════════════════════════════════════════════════╗
   * ║  VOLTZ GUARD — VERIFICAÇÃO  (INÍCIO)                     ║
   * ╠═══════════════════════════════════════════════════════════╣
   * ║  Chama GET /api/site-status/:cpf na API da VOLTZ         ║
   * ║  e retorna 3 valores:                                    ║
   * ║                                                           ║
   * ║  carregando → aguardando resposta da API (< 1 segundo)   ║
   * ║  bloqueado  → true se o cliente está inadimplente        ║
   * ║  diasAtraso → número de dias em atraso                   ║
   * ║                                                           ║
   * ║  SEGURO: se a API cair, bloqueado volta false            ║
   * ║  (site nunca bloqueia por erro de rede)                  ║
   * ╚═══════════════════════════════════════════════════════════╝ */
  const { carregando, bloqueado, diasAtraso } = useVoltzGuard(CPF_CLIENTE);

  if (!carregando && bloqueado) {
    return <AvisoBloqueio dias={diasAtraso} cpfCnpj={CPF_CLIENTE} />;
  }

  if (carregando) return null;
  /* ── VOLTZ GUARD — VERIFICAÇÃO  (FIM) ──────────────────── */


  /* ── SITE NORMAL (só chega aqui se NÃO estiver bloqueado) ── */
  return (
    <HelmetProvider>
      <div className="bg-[#050505] min-h-screen text-gray-100 font-sans selection:bg-yellow-500 selection:text-black">

        <Helmet>
          <title>Adriano Ferreira | VOLTZ Soluções Integradas & Energias Renováveis</title>
          <meta name="description" content="VOLTZ Soluções Integradas e Energias Renováveis — Desenvolvimento de software, sistemas fotovoltaicos, automação e TI." />
        </Helmet>

        {showIntro ? (
          <Intro onFinish={() => setShowIntro(false)} />
        ) : (
          <main>
            {/* NAV */}
            <nav className="fixed top-0 w-full z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-3 flex flex-wrap justify-between items-center gap-4">
              <span className="flex flex-col leading-none">
                <span className="font-black text-lg tracking-tight text-white">
                  VOLTZ <span className="text-[#FFD700]">S.I</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-[#FFD700]/70 uppercase">
                  & Energias Renováveis
                </span>
              </span>
              <div className="flex items-center gap-4">
                <a href="https://gestao-adriano.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <motion.button
                    animate={{ opacity:[1,0.6,1], scale:[1,1.02,1], boxShadow:["0px 0px 0px rgba(255,215,0,0)","0px 0px 10px rgba(255,215,0,0.5)","0px 0px 0px rgba(255,215,0,0)"] }}
                    transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
                    className="flex items-center gap-2 bg-[#FFD700] text-black px-4 py-2 rounded-md font-bold text-xs md:text-sm uppercase tracking-wide border border-yellow-400 hover:bg-yellow-400 transition-colors"
                  >
                    <Zap size={16} fill="black" /> Cliente Voltz
                  </motion.button>
                </a>
                <div className="hidden md:flex items-center gap-2 text-green-500 text-xs font-mono bg-green-900/20 px-3 py-1 rounded-full border border-green-900/50 opacity-70">
                  <ShieldCheck size={12} /><span>SECURE</span>
                </div>
              </div>
            </nav>

            {/* HERO */}
            <section className="min-h-screen flex flex-col items-center justify-center px-4 relative pt-20">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.8}} className="z-10 text-center max-w-3xl flex flex-col items-center">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:260,damping:20,delay:0.5}} className="relative mb-8">
                  <div className="absolute inset-0 bg-[#FFD700] blur-xl opacity-40 rounded-full"></div>
                  <img src="/perfil.jpg" alt="Adriano Ferreira" className="relative w-40 h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-[#FFD700] shadow-2xl"/>
                  <div className="absolute bottom-2 right-2 bg-black border border-[#FFD700] text-[#FFD700] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>VOLTZ
                  </div>
                </motion.div>
                <p className="text-yellow-500 font-mono mb-4 text-sm">&lt;system_online /&gt;</p>
                <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white leading-tight"><HackerText text="ADRIANO FERREIRA" /></h1>
                <p className="text-gray-400 text-base md:text-lg mb-2">CEO da <span className="text-[#FFD700] font-bold">VOLTZ Soluções Integradas & Energias Renováveis</span></p>
                <p className="text-gray-500 text-sm md:text-base mb-8">Tecnologia de software + Engenharia de energia solar em uma única empresa.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" className="bg-[#FFD700] hover:bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"><MessageCircle size={20}/> Solicitar Orçamento</a>
                  <a href={GITHUB_URL} target="_blank" className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-white/10"><Github size={20}/> GitHub</a>
                  <a href={LINKEDIN} target="_blank" className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(29,78,216,0.5)]"><Linkedin size={20}/> LinkedIn</a>
                </div>
              </motion.div>
              <motion.div style={{opacity:arrowOpacity}} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
                <span className="text-xs font-mono tracking-widest uppercase">Nossos Serviços</span>
                <ArrowDown className="animate-bounce text-[#FFD700]" size={24}/>
              </motion.div>
            </section>

            {/* MARQUEE — SERVIÇOS */}
            <div className="bg-[#FFD700] py-4 overflow-hidden relative border-y border-yellow-400">
              <div className="marquee-track">
                {marqueeItems.map((item, i) => (
                  <span key={i} className="text-[#003366] font-bold text-sm md:text-base mx-8 whitespace-nowrap">{item}</span>
                ))}
              </div>
            </div>

            {/* ESPECIALIDADES */}
            <section className="py-24 px-4 border-t border-white/10">
              <div className="max-w-6xl mx-auto">
                <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-3xl font-bold mb-12 flex items-center gap-2">
                  <Zap className="text-[#FFD700]"/> Nossas Especialidades
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Card Energia Solar */}
                  <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="group bg-neutral-900 border border-white/10 rounded-xl overflow-hidden hover:border-[#FFD700]/50 transition-all">
                    <div className="h-52 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                        alt="Painéis Solares"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sun size={20} className="text-[#FFD700]"/>
                        <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">Energias Renováveis</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#FFD700] transition-colors">Energia Solar Fotovoltaica</h3>
                      <p className="text-gray-400 text-sm">Projetos completos On-grid, Off-grid e Híbridos. Dimensionamento de sistemas e bancos de baterias, com suporte total na negociação de financiamentos bancários.</p>
                    </div>
                  </motion.div>

                  {/* Card Software */}
                  <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.2}} className="group bg-neutral-900 border border-white/10 rounded-xl overflow-hidden hover:border-[#FFD700]/50 transition-all">
                    <div className="h-52 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                        alt="Desenvolvimento de Software"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Code2 size={20} className="text-[#FFD700]"/>
                        <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">Engenharia de Software</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#FFD700] transition-colors">Desenvolvimento Web & TI</h3>
                      <p className="text-gray-400 text-sm">Sistemas Full-Stack modernos, plataformas de gestão, landing pages de alta conversão, automação inteligente e infraestrutura de TI — React, Next.js, Node.js e Python.</p>
                    </div>
                  </motion.div>

                  {/* Card Elétrica e Carregadores EV */}
                  <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.3}} className="group bg-neutral-900 border border-white/10 rounded-xl overflow-hidden hover:border-[#FFD700]/50 transition-all">
                    <div className="h-52 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80"
                        alt="Carregador para Veículo Elétrico"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Car size={20} className="text-[#FFD700]"/>
                        <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">Elétrica & EV</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#FFD700] transition-colors">Instalação Elétrica & Carregadores EV</h3>
                      <p className="text-gray-400 text-sm">Instalação de carregadores para veículos elétricos (Wallbox e estações públicas), instalações elétricas residenciais e prediais, inspeções técnicas e laudos elétricos com total segurança e conformidade às normas ABNT.</p>
                    </div>
                  </motion.div>

                  {/* Card Segurança Eletrônica */}
                  <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.3}} className="group bg-neutral-900 border border-white/10 rounded-xl overflow-hidden hover:border-[#FFD700]/50 transition-all">
                    <div className="h-52 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80"
                        alt="Segurança Eletrônica"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Camera size={20} className="text-[#FFD700]"/>
                        <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">Segurança Eletrônica</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#FFD700] transition-colors">Segurança & Controle de Acesso</h3>
                      <p className="text-gray-400 text-sm">Instalação de câmeras CFTV, cercas elétricas, alarmes, interfones, motores elétricos para portões e cancelas — proteção completa para residências e empresas.</p>
                    </div>
                  </motion.div>

                  {/* Card Hardware */}
                  <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.4}} className="group bg-neutral-900 border border-white/10 rounded-xl overflow-hidden hover:border-[#FFD700]/50 transition-all">
                    <div className="h-52 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80"
                        alt="Manutenção de Hardware"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-black rounded-xl border border-white/10">
                        <Wrench size={28} className="text-[#FFD700]"/>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">Hardware & Suporte</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#FFD700] transition-colors">Montagem e Manutenção de Hardware</h3>
                        <p className="text-gray-400 text-sm">Montagem personalizada de computadores, manutenção preventiva e corretiva, upgrades de performance e suporte técnico completo para empresas e usuários finais.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* PROJETOS */}
            <section className="py-24 px-4 bg-black/50 border-t border-white/10">
              <div className="max-w-6xl mx-auto">
                <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-3xl font-bold mb-12 flex items-center gap-2">
                  <Server className="text-[#FFD700]"/> Sistemas & Projetos em Destaque
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project, index) => (
                    <motion.div key={index} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*0.1}} className="group bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-[#FFD700]/50 hover:bg-neutral-800 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-black rounded-lg border border-white/10">
                          {project.type === "Sistema" ? <Server size={20} className="text-blue-400"/> : <Smartphone size={20} className="text-[#FFD700]"/>}
                        </div>
                        <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">{project.type}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-[#FFD700] transition-colors">{project.title}</h3>
                      <p className="text-gray-400 mb-4 text-sm">{project.desc}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech.map((t, i) => (
                          <span key={i} className="text-xs bg-black border border-white/10 text-gray-400 px-2 py-1 rounded font-mono">{t}</span>
                        ))}
                      </div>
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#FFD700] transition-colors">Acessar <ExternalLink size={14}/></a>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-black border-t border-white/10 py-10 px-4 text-center">
              <p className="text-[#FFD700] font-bold text-lg mb-1">VOLTZ Soluções Integradas & Energias Renováveis</p>
              <p className="text-gray-500 text-sm mb-6">Desenvolvido e mantido por Adriano Ferreira</p>
              <div className="flex justify-center gap-6 mb-6">
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#FFD700] text-sm transition-colors">
                  <Linkedin size={16}/> LinkedIn
                </a>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#FFD700] text-sm transition-colors">
                  <MessageCircle size={16}/> WhatsApp
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#FFD700] text-sm transition-colors">
                  <Github size={16}/> GitHub
                </a>
              </div>
              <p className="text-gray-600 text-xs">© {new Date().getFullYear()} VOLTZ SI. Todos os direitos reservados.</p>
            </footer>
          </main>
        )}
      </div>
    </HelmetProvider>
  );
}

export default App;
