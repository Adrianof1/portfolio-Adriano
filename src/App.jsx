import React, { useState } from "react";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, useScroll, useTransform } from "framer-motion";
import { Linkedin, MessageCircle, ExternalLink, ShieldCheck, Code2, Server, Smartphone, Github, ArrowDown, Phone } from "lucide-react";
import Intro from "./components/Intro";
import HackerText from "./components/HackerText";

// SEUS PROJETOS
const projects = [
  {
    title: "PC Pinturas",
    desc: "Site comercial focado em SEO e conversão via WhatsApp.",
    tech: ["React", "Tailwind"],
    link: "https://pcpinturasthe.netlify.app",
    type: "Comercial"
  },
  {
    title: "Gestão Gamificada",
    desc: "Plataforma para escolas com sistema de XP.",
    tech: ["Node.js", "React"],
    link: "https://gestaoescolarereforco.netlify.app/",
    type: "Sistema"
  },
  {
    title: "AIPMS",
    desc: "Portal de acessibilidade para associação.",
    tech: ["HTML5", "Social"],
    link: "https://aipms.netlify.app/",
    type: "Social"
  },
  {
    title: "IW Decor",
    desc: "Catálogo digital imersivo.",
    tech: ["UI/UX", "React"],
    link: "https://iwdecor.netlify.app/",
    type: "Design"
  }
];

const WHATSAPP = import.meta.env.VITE_WHATSAPP || "5586999830819";
const LINKEDIN = import.meta.env.VITE_LINKEDIN || "https://linkedin.com/in/adrianoferreira-dev";
const GITHUB_URL = "https://github.com/Adrianof1";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  
  const { scrollY } = useScroll();
  const arrowOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  return (
    <HelmetProvider>
      <div className="bg-[#050505] min-h-screen text-gray-100 font-sans selection:bg-green-900 selection:text-white">
        
        <Helmet>
          <title>Adriano Ferreira | Dev. Full Stack</title>
        </Helmet>

        {showIntro ? (
          <Intro onFinish={() => setShowIntro(false)} />
        ) : (
          <main>
            {/* NAV */}
            <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <span className="font-bold text-xl tracking-tighter text-white">AF<span className="text-green-500">.CODE</span></span>
              <div className="flex items-center gap-2 text-green-500 text-xs font-mono bg-green-900/20 px-3 py-1 rounded-full border border-green-900/50">
                <ShieldCheck size={12} />
                <span>SECURE</span>
              </div>
            </nav>

            {/* HERO */}
            <section className="min-h-screen flex flex-col items-center justify-center px-4 relative pt-20"> {/* Adicionei pt-20 para não colar no topo */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center max-w-3xl flex flex-col items-center" // Flex col para alinhar foto e texto
              >
                
                {/* --- FOTO DE PERFIL (NOVO) --- */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
                  className="relative mb-8"
                >
                  {/* Círculo Neon atrás da foto */}
                  <div className="absolute inset-0 bg-green-500 blur-xl opacity-50 rounded-full"></div>
                  
                  {/* A Foto em si (IMPORTANTE: Coloque sua foto como 'perfil.jpg' na pasta public) */}
                  <img 
                    src="/perfil.jpg" 
                    alt="Adriano Ferreira" 
                    className="relative w-40 h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-green-500 shadow-2xl"
                  />
                  
                  {/* Selo de "Open to Work" ou Status */}
                  <div className="absolute bottom-2 right-2 bg-black border border-green-500 text-green-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    ON
                  </div>
                </motion.div>

                <p className="text-green-400 font-mono mb-4 text-sm">&lt;system_ready /&gt;</p>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
                  <HackerText text="ADRIANO FERREIRA" />
                </h1>
                <p className="text-gray-400 text-lg md:text-xl mb-8">
                  Desenvolvedor Full Stack transformando ideias em <span className="text-white font-semibold">software seguro</span>.
                </p>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                  
                  {/* WhatsApp */}
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                    <MessageCircle size={20} /> WhatsApp
                  </a>
                  
                  {/* GitHub */}
                  <a href={GITHUB_URL} target="_blank" className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]">
                    <Github size={20} /> GitHub
                  </a>

                  {/* LinkedIn */}
                  <a href={LINKEDIN} target="_blank" className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(29,78,216,0.5)]">
                    <Linkedin size={20} /> LinkedIn
                  </a>
                  
                </div>
              </motion.div>

              {/* SETA DE SCROLL ANIMADA */}
              <motion.div 
                style={{ opacity: arrowOpacity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
              >
                <span className="text-xs font-mono tracking-widest uppercase">Veja meus trabalhos recentes</span>
                <ArrowDown className="animate-bounce text-green-500" size={24} />
              </motion.div>
            </section>

            {/* PROJETOS */}
            <section className="py-24 px-4 bg-black/50 border-t border-white/10">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 flex items-center gap-2">
                  <Code2 className="text-green-500"/> Projetos Recentes (Em Desenvolvimento)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-green-500/50 hover:bg-neutral-800 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-black rounded-lg border border-white/10">
                          {project.type === "Sistema" ? <Server size={20} className="text-blue-400"/> : <Smartphone size={20} className="text-green-400"/>}
                        </div>
                        <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">{project.type}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-green-400">{project.title}</h3>
                      <p className="text-gray-400 mb-6">{project.desc}</p>
                      <a href={project.link} target="_blank" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-green-400">
                        Acessar <ExternalLink size={14}/>
                      </a>
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