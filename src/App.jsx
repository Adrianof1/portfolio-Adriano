import React, { useState } from "react";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, useScroll, useTransform } from "framer-motion";
import { Linkedin, MessageCircle, ExternalLink, ShieldCheck, Code2, Server, Smartphone, Github, ArrowDown, Zap } from "lucide-react";
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


const projects = [
  { title: "PC Pinturas",        desc: "Site comercial focado em SEO e conversão via WhatsApp.", tech: ["React", "Tailwind"], link: "https://pcpinturasthe.netlify.app",               type: "Comercial" },
  { title: "Gestão Gamificada",  desc: "Plataforma para escolas com sistema de XP.",             tech: ["Node.js", "React"],  link: "https://gestaoescolarereforco.netlify.app/",        type: "Sistema"   },
  { title: "AIPMS",             desc: "Portal de acessibilidade para associação.",               tech: ["HTML5", "Social"],   link: "https://aipms.netlify.app/",                         type: "Social"    },
  { title: "IW Decor",          desc: "Catálogo digital imersivo.",                              tech: ["UI/UX", "React"],    link: "https://iwdecor.netlify.app/",                        type: "Design"    }
];

const WHATSAPP   = import.meta.env.VITE_WHATSAPP || "5586999830819";
const LINKEDIN   = import.meta.env.VITE_LINKEDIN || "https://linkedin.com/in/adrianoferreira-dev";
const GITHUB_URL = "https://github.com/Adrianof1";

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

  /* Se bloqueado, exibe tela VOLTZ antes de QUALQUER conteúdo */
  if (!carregando && bloqueado) {
    return <AvisoBloqueio dias={diasAtraso} cpfCnpj={CPF_CLIENTE} />;
  }

  /* Enquanto verifica: null = tela em branco por < 1s
     Troque por <Intro onFinish={...}/> se preferir mostrar a intro */
  if (carregando) return null;
  /* ── VOLTZ GUARD — VERIFICAÇÃO  (FIM) ──────────────────── */


  /* ── SITE NORMAL (só chega aqui se NÃO estiver bloqueado) ── */
  return (
    <HelmetProvider>
      <div className="bg-[#050505] min-h-screen text-gray-100 font-sans selection:bg-yellow-500 selection:text-black">

        <Helmet>
          <title>Adriano Ferreira | Voltz Soluções</title>
        </Helmet>

        {showIntro ? (
          <Intro onFinish={() => setShowIntro(false)} />
        ) : (
          <main>
            {/* NAV */}
            <nav className="fixed top-0 w-full z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-3 flex flex-wrap justify-between items-center gap-4">
              <span className="font-bold text-xl tracking-tighter text-white flex items-center gap-1">
                VOLTZ<span className="text-[#FFD700]">.DEV</span>
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
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight"><HackerText text="ADRIANO FERREIRA" /></h1>
                <p className="text-gray-400 text-lg md:text-xl mb-8">CEO da <span className="text-[#FFD700] font-bold">Voltz Soluções</span>. Transformando ideias em software seguro.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" className="bg-[#FFD700] hover:bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"><MessageCircle size={20}/> Orçamento Voltz</a>
                  <a href={GITHUB_URL} target="_blank" className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-white/10"><Github size={20}/> GitHub</a>
                  <a href={LINKEDIN} target="_blank" className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(29,78,216,0.5)]"><Linkedin size={20}/> LinkedIn</a>
                </div>
              </motion.div>
              <motion.div style={{opacity:arrowOpacity}} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
                <span className="text-xs font-mono tracking-widest uppercase">Meus Projetos</span>
                <ArrowDown className="animate-bounce text-[#FFD700]" size={24}/>
              </motion.div>
            </section>

            {/* PROJETOS */}
            <section className="py-24 px-4 bg-black/50 border-t border-white/10">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 flex items-center gap-2"><Code2 className="text-[#FFD700]"/> Projetos Recentes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project, index) => (
                    <motion.div key={index} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*0.1}} className="group bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-[#FFD700]/50 hover:bg-neutral-800 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-black rounded-lg border border-white/10">
                          {project.type === "Sistema" ? <Server size={20} className="text-blue-400"/> : <Smartphone size={20} className="text-[#FFD700]"/>}
                        </div>
                        <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">{project.type}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-[#FFD700]">{project.title}</h3>
                      <p className="text-gray-400 mb-6">{project.desc}</p>
                      <a href={project.link} target="_blank" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#FFD700]">Acessar <ExternalLink size={14}/></a>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        )}
      </div>
    </HelmetProvider>
  );
}

export default App;