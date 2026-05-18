"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface StarPosition {
  top: number;
  left: number;
  size: number;
  dur: number;
  delay: number;
}

const starPositions: StarPosition[] = [
  { top: 8,  left: 10, size: 22, dur: 3.8, delay: 0    },
  { top: 12, left: 78, size: 18, dur: 4.5, delay: 0.8  },
  { top: 25, left: 92, size: 26, dur: 5,   delay: 1.5  },
  { top: 45, left: 5,  size: 20, dur: 4.2, delay: 0.3  },
  { top: 60, left: 95, size: 16, dur: 3.5, delay: 2    },
  { top: 78, left: 88, size: 24, dur: 4.8, delay: 0.6  },
  { top: 85, left: 15, size: 20, dur: 4,   delay: 1.2  },
  { top: 38, left: 50, size: 14, dur: 5.2, delay: 2.5  },
  { top: 18, left: 40, size: 12, dur: 3.2, delay: 0.5  },
  { top: 72, left: 55, size: 18, dur: 4.6, delay: 1.8  },
  { top: 55, left: 72, size: 22, dur: 3.9, delay: 0.9  },
  { top: 90, left: 40, size: 16, dur: 4.3, delay: 1.4  },
];

interface TeamMember {
name: string;
role: string;
icon: string; 
color: string; 
bg: string;
desc: string; 
}

const selenesTeam: TeamMember[] = [
{
name: "Eduarda Belles",
role: "Líder e desenvolvedora front-end",
icon: "👑",
color: "from-purple-500 to-indigo-500",
bg: "bg-teal-500/10",
desc: "UI/UX designer. Focada na experiência do usuário."
},
{
name: "Brenno D'Luca",
role: "Desenvolvedor Back-end",
icon: "🪐",
color: "from-blue-600 to-cyan-500",
bg: "bg-teal-500/10",
desc: "Foco na lógica por trás do sistema."
},
{
name: "Zeus Machado",
role: "Engenheiro de Software",
icon: "⚡",
color: "from-amber-500 to-orange-600",
bg: "bg-teal-500/10",
desc: "Foco em trazer um sistema bom e funcional."
},
{
name: "Ellen Gouveia",
role: "Analista e Desenvolvedora front-end",
icon: "🎨",
color: "from-pink-500 to-purple-500",
bg: "bg-teal-500/10",
desc: "Artista e game designer, focando no lado criativo do projeto."
},
{
name: "Luana",
role: "Desenvolvedora front-end e game designer",
icon: "✨",
color: "from-teal-400 to-blue-500",
bg: "bg-teal-500/10",
desc: "Foco em priorizar o lado criativo e lúdico do projeto."
}
];

const spectrumTeam: TeamMember[] = [
{
name: "Eduarda Belles",
role: "Líder & UX/UI Designer",
icon: "💫",
color: "from-purple-500 to-pink-500",
bg: "bg-teal-500/10",
desc: "UI/UX designer. Focada na experiência do usuário."
},
{
name: "Raiza Antoneli",
role: "Engenheira de Software",
icon: "🛡️",
color: "from-indigo-600 to-blue-500",
bg: "bg-teal-500/10",
desc: "Prioriza um sistema bom e funcional."
},
{
name: "Luigi Campregher",
role: "Desenvolvedor de Jogos",
icon: "👾",
color: "from-green-500 to-teal-500",
bg: "bg-teal-500/10",
desc: "Foco em trazer um jogo lúdico e funcional para os usuários."
},
{
name: "Ângelo Ferreira",
role: "Desenvolvedor Back-end",
icon: "📡",
color: "from-cyan-600 to-indigo-500",
bg: "bg-teal-500/10",
desc: "Foco na lógica por trás do sistema."
},
{
name: "Takeshi Aoki",
role: "Desenvolvedor e Designer de Jogos",
icon: "🎮",
color: "from-rose-500 to-orange-500",
bg: "bg-teal-500/10",
desc: "Foco no lado criativo e lúdico do jogo."
}
];



function StarSVG({ size }: { size: number }) {
  const points: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outer = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const inner = outer + Math.PI / 5;
    points.push(`${Math.cos(outer).toFixed(4)},${Math.sin(outer).toFixed(4)}`);
    points.push(
      `${(Math.cos(inner) * 0.4).toFixed(4)},${(Math.sin(inner) * 0.4).toFixed(4)}`
    );
  }
  return (
    <svg
      viewBox="-1 -1 2 2"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points={points.join(" ")} fill="rgba(160,80,255,0.75)" />
    </svg>
  );
}

export default function Home() {
  const [selenesIndex, setSelenesIndex] = useState(0);
  const [spectrumIndex, setSpectrumIndex] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handlePrev = (team: "selenes" | "spectrum", listLength: number) => {
if (team === "selenes") {
setSelenesIndex((prev) => (prev === 0 ? listLength - 1 : prev - 1));
} else {
setSpectrumIndex((prev) => (prev === 0 ? listLength - 1 : prev - 1));
}
};

const handleNext = (team: "selenes" | "spectrum", listLength: number) => {
if (team === "selenes") {
setSelenesIndex((prev) => (prev === listLength - 1 ? 0 : prev + 1));
} else {
setSpectrumIndex((prev) => (prev === listLength - 1 ? 0 : prev + 1));
}
};

  const menuItems = [
    { label: "Início", href: "#hero" }, 
    { label: "Download", href: "#download" },
    { label: "Quem Somos", href: "#aboutus" },
    { label: "Sobre", href: "#about" },
    { label: "Contato", href: "#contact" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Raleway:wght@300;400;500&display=swap');

        .page-wrapper {
          min-height: 100vh;
          background-image: url('/landpage.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          position: relative;
          overflow: hidden;
          font-family: 'Raleway', sans-serif;
        }

        .btn-explore {
          margin-top: 40px;
          padding: 12px 40px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid rgba(91, 200, 245, 0.5);
          color: #5bc8f5;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: all 0.3s;
          backdrop-filter: blur(5px);
        }

        .btn-explore:hover {
          background: rgba(91, 200, 245, 0.2);
          box-shadow: 0 0 20px rgba(91, 200, 245, 0.3);
          transform: translateY(-3px);
        }

        .star-item {
          position: absolute;
          pointer-events: none;
          filter: blur(1.5px);
          animation: twinkle var(--dur) ease-in-out infinite var(--delay);
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(1.2); }
        }

        .brand-cosmic {
          color: #bf5fff;
          text-shadow: 0 0 30px rgba(180,80,255,0.35);
        }

        .brand-mind {
          color: #5bc8f5;
          text-shadow: 0 0 30px rgba(80,180,255,0.35);
        }

        .btn-login {
          padding: 9px 28px;
          border-radius: 999px;
          background: rgba(80, 60, 180, 0.45);
          border: 1px solid rgba(120, 100, 220, 0.5);
          color: #fff;
          font-family: 'Raleway', sans-serif;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.03em;
        }
        .btn-login:hover {
          background: rgba(100, 80, 200, 0.65);
          transform: translateY(-1px);
        }

        .btn-register {
          padding: 9px 26px;
          border-radius: 999px;
          background: #3b63f5;
          border: none;
          color: #fff;
          font-family: 'Raleway', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.03em;
        }
        .btn-register:hover {
          background: #2a50df;
          transform: translateY(-1px);
        }

        .game-card {
          background: rgba(235, 230, 245, 0.22);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(200, 180, 255, 0.18);
          border-radius: 8px;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .game-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(80, 30, 160, 0.45);
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-hero    { animation: fadeSlideDown 0.9s ease both; }
        .animate-hero-2  { animation: fadeSlideDown 1s ease 0.2s both; }
        .animate-hero-3  { animation: fadeSlideDown 1s ease 0.4s both; }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="page-wrapper" ref={pageRef}>

        {/* ── Stars ── */}
        {starPositions.map((sp, i) => (
          <div
            key={i}
            className="star-item"
            style={{
              top: `${sp.top}%`,
              left: `${sp.left}%`,
              ["--dur" as string]: `${sp.dur}s`,
              ["--delay" as string]: `${sp.delay}s`,
            }}
          >
            <StarSVG size={sp.size} />
          </div>
        ))}

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-12 py-5 relative z-10">
          <nav className="flex gap-9">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/90 hover:text-white transition-colors text-sm font-medium tracking-wide"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/login')}
              className="btn-login"
            >
              Entrar
            </button>
            <button 
              onClick={() => router.push('/register')}
              className="btn-register"
            >
              Cadastrar-se
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <div className="flex flex-col items-center text-center px-6 pt-32 pb-20 relative z-10 min-h-[70vh] justify-center">
          <h1
            className="animate-hero mb-10"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              lineHeight: 1.1,
            }}
          >
            <span className="brand-cosmic">Cosmic</span>{" "}
            <span className="brand-mind">Mind</span>
          </h1>

          <p
            className="animate-hero-2 mb-14 max-w-2xl leading-relaxed"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.45rem",
              fontWeight: 300,
              color: "rgba(255,255,255,0.68)",
            }}
          >
            Uma plataforma inteligente que une diversão com dados e métricas precisas sobre o TDAH.
          </p>

          <button 
          className="animate-hero-3 px-10 py-4 rounded-full bg-gradient-to-r  to-cyan-500 from-purple-500 text-white font-bold tracking-[0.2em] hover:to-cyan-600 hover:from-purple-600 hover:scale-105 active:scale-95 transition-all shadow-lg"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          CONHECER
        </button>
          
        </div>

        {/* ── Cards ── */}
        <div className="animate-hero-3 flex justify-center gap-9 px-12 pb-16 flex-wrap relative z-10">

          {/* Card 1 — com estrela decorativa no canto inferior esquerdo */}
          <div
            className="game-card flex items-center justify-center relative"
            style={{ width: "clamp(260px, 34vw, 380px)", aspectRatio: "16/9" }}
          >
            <span
              className="absolute"
              style={{
                bottom: "-18px",
                left: "-14px",
                fontSize: "2rem",
                color: "rgba(130, 60, 220, 0.8)",
                filter: "blur(1px)",
                zIndex: 0,
                pointerEvents: "none",
              }}
              aria-hidden="true"
            >
              ★
            </span>
            <span
              className="font-bold text-base"
              style={{ color: "rgba(30,20,50,0.85)", letterSpacing: "0.02em" }}
            >
              Imagem do jogo
            </span>
          </div>

          {/* Card 2 */}
          <div
            className="game-card flex items-center justify-center"
            style={{ width: "clamp(260px, 34vw, 380px)", aspectRatio: "16/9" }}
          >
            <span
              className="font-bold text-base"
              style={{ color: "rgba(30,20,50,0.85)", letterSpacing: "0.02em" }}
            >
              Imagem do jogo
            </span>
          </div>

        </div>

        {/* ── Download ── */}
        <section id="download" className="flex flex-col items-center py-20 relative z-10">
          <div className="game-card p-10 flex flex-col items-center max-w-xl text-center">
            <h2 
              style={{ fontFamily: "'Orbitron', sans-serif" }} 
              className="text-2xl text-white mb-4"
            >
              Pronto para a Missão?
            </h2>
            <p className="text-white/70 mb-8 font-light">
              Baixe agora o Cosmic Mind e conecte-se ao nosso dashboard para monitorar 
              o progresso cognitivo em tempo real.
            </p>
            
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="btn-register text-center no-underline inline-block scale-110 opacity-80 cursor-not-allowed"
            >
              Fazer download 
            </a>
            
            <span className="text-white/40 text-xs mt-4">
             Desenvolvido em Unity 
            </span>
          </div>
        </section>

      {/* ── Quem somos ── */}
    <section id="aboutus" className="py-24 relative z-10 px-6 backdrop-blur-sm border-y border-white/5">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-3xl text-white mb-8 uppercase tracking-widest">
          Quem Somos
        </h2>
        <p style={{ fontFamily: "'Raleway', serif" }} className="text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto italic">
          "Somos a equipe Selenes e, em parceria com a equipe Spectrum, desenvolvedora de um jogo lúdico voltado para crianças com TDAH, nos unimos para criar o Cosmic Mind Dashboard."
        </p>
        
        <p style={{ fontFamily: "'Raleway', sans-serif" }} className="text-base text-white/70 leading-relaxed max-w-3xl mx-auto font-light">
          Nosso projeto consiste em uma plataforma inteligente capaz de gerar métricas e análises sobre o desempenho das crianças dentro do jogo, auxiliando no acompanhamento de seu desenvolvimento de forma prática, acessível e intuitiva. 
          Buscamos unir tecnologia, inclusão e inovação para contribuir com uma experiência mais eficiente e acolhedora.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        
        {/* ── CARROSSEL 1: SELENES ── */}
        <div className="flex flex-col items-center">
          <h3 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-xl text-cyan-400 mb-6 uppercase tracking-wider font-semibold">
            🌙 Equipe Selenes
          </h3>

          <div className="relative w-full max-w-sm px-4">
            <div className="overflow-hidden py-4">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${selenesIndex * 100}%)` }}
              >
                {selenesTeam.map((member, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-2">
                    <div className={`game-card ${member.bg} p-6 flex flex-col items-center text-center h-[340px] justify-between border border-white/10`}>
                      {/* Avatar Cósmico */}
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${member.color} flex items-center justify-center text-3xl shadow-lg shadow-black/45 ring-2 ring-white/15`}>
                        {member.icon}
                      </div>
                      
                      <div className="mt-4 flex-grow flex flex-col justify-center">
                        <h4 className="text-white text-lg font-bold tracking-wide">{member.name}</h4>
                        <p className="text-cyan-400 text-xs uppercase tracking-widest font-semibold mt-1 mb-3">{member.role}</p>
                        <p className="text-white/60 text-xs font-light px-2 line-clamp-3 leading-relaxed">{member.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handlePrev("selenes", selenesTeam.length)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
              aria-label="Membro Anterior"
            >
              ◀
            </button>
            <button 
              onClick={() => handleNext("selenes", selenesTeam.length)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
              aria-label="Próximo Membro"
            >
              ▶
            </button>

            <div className="flex justify-center gap-2 mt-4">
              {selenesTeam.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelenesIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${selenesIndex === idx ? "w-6 bg-cyan-400" : "w-2 bg-white/25"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── CARROSSEL 2: SPECTRUM ── */}
        <div className="flex flex-col items-center">
          <h3 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-xl text-purple-400 mb-6 uppercase tracking-wider font-semibold">
            👾 Equipe Spectrum
          </h3>

          <div className="relative w-full max-w-sm px-4">
            <div className="overflow-hidden py-4">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${spectrumIndex * 100}%)` }}
              >
                {spectrumTeam.map((member, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-2">
                    <div className={`game-card ${member.bg} p-6 flex flex-col items-center text-center h-[340px] justify-between border border-white/10`}>

                      <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${member.color} flex items-center justify-center text-3xl shadow-lg shadow-black/45 ring-2 ring-white/15`}>
                        {member.icon}
                      </div>
                      
                      <div className="mt-4 flex-grow flex flex-col justify-center">
                        <h4 className="text-white text-lg font-bold tracking-wide">{member.name}</h4>
                        <p className="text-purple-400 text-xs uppercase tracking-widest font-semibold mt-1 mb-3">{member.role}</p>
                        <p className="text-white/60 text-xs font-light px-2 line-clamp-3 leading-relaxed">{member.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controles de Navegação */}
            <button 
              onClick={() => handlePrev("spectrum", spectrumTeam.length)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-purple-500/30 hover:border-purple-400 text-purple-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
              aria-label="Membro Anterior"
            >
              ◀
            </button>
            <button 
              onClick={() => handleNext("spectrum", spectrumTeam.length)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-purple-500/30 hover:border-purple-400 text-purple-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
              aria-label="Próximo Membro"
            >
              ▶
            </button>

            <div className="flex justify-center gap-2 mt-4">
              {spectrumTeam.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSpectrumIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${spectrumIndex === idx ? "w-6 bg-purple-400" : "w-2 bg-white/25"}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>

      {/* ── Seção Sobre o Projeto ── */}
        <section id="about" className="flex flex-col items-center py-20 relative z-10 px-6 bg-black/20">
          <div className="max-w-4xl text-center mb-16 animate-hero">
            <h2 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-3xl text-white mb-6 uppercase tracking-widest">
              Sobre o Cosmic Mind
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
              A plataforma tem como objetivo transformar dados gerados dentro do jogo educativo em métricas claras e acessíveis, auxiliando no acompanhamento do desempenho de crianças com TDAH de forma intuitiva e eficiente. 
      Unindo tecnologia, inclusão e inovação, buscamos criar uma experiência moderna e acolhedora para análise e acompanhamento infantil. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
            <div className="game-card p-8 border-t-2 border-cyan-500/50">
              <div className="text-cyan-400 mb-4">🧠</div>
              <h4 className="text-white font-bold mb-2">Métricas Inteligentes</h4>
              <p className="text-white/60 text-sm text-pretty">Análise de desempenho em tempo real para identificar padrões e evolução.</p>
            </div>

            <div className="game-card p-8 border-t-2 border-purple-500/50">
              <div className="text-purple-400 mb-4">🎮</div>
              <h4 className="text-white font-bold mb-2">Integração Total</h4>
              <p className="text-white/60 text-sm text-pretty">Conectado diretamente ao universo lúdico criado pela equipe Spectrum.</p>
            </div>

            <div className="game-card p-8 border-t-2 border-cyan-500/50">
              <div className="text-cyan-400 mb-4">📊</div>
              <h4 className="text-white font-bold mb-2">Dashboard Interativo</h4>
              <p className="text-white/60 text-sm text-pretty">Visualização simples de dados complexos para pais e especialistas.</p>
            </div>

            <div className="game-card p-8 border-t-2 border-purple-500/50">
              <div className="text-purple-400 mb-4">✨</div>
              <h4 className="text-white font-bold mb-2">Foco em Inclusão</h4>
              <p className="text-white/60 text-sm text-pretty">Tecnologia pensada para acessibilidade e suporte ao desenvolvimento infantil.</p>
            </div>
          </div>
        </section>

      {/* ── Contato ── */}
        <section id="contact" className="py-24 relative z-10 px-6 bg-gradient-to-b from-transparent to-purple-900/20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
            
            <div className="flex flex-col justify-center">
              <h2 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-4xl text-white mb-6 uppercase tracking-tighter">
                Vamos Conversar?
              </h2>
              <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl text-white/70 mb-10 leading-relaxed">
                Estamos sempre abertos para sugestões, feedbacks e novas parcerias. 
                Entre em contato com a equipe Selenes e acompanhe a evolução do <strong>Cosmic Mind</strong>. 💫
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-all">
                    📧
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">E-mail</p>
                    <p className="text-white font-mono text-sm">cosmicmind.site@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all">
                    🐙
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">GitHub</p>
                    <p className="text-white font-mono text-sm">github.com/equipe-selenes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="game-card p-8 bg-black/40 backdrop-blur-xl border border-white/10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
              
              <form className="space-y-4 relative z-10">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-widest mb-2 block">Nome</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all" placeholder="Seu nome" />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-widest mb-2 block">E-mail</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-purple-500/50 transition-all" placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-widest mb-2 block">Mensagem</label>
                  <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all resize-none" placeholder="Como podemos ajudar?"></textarea>
                </div>
                <button type="button" className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold uppercase tracking-widest rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
                  Enviar Mensagem
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative z-10 pt-20 pb-10 px-6 bg-black/40 border-t border-white/5 backdrop-blur-md">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              
              <div className="flex flex-col gap-4">
                <h3 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-xl text-white tracking-widest uppercase">
                  Cosmic Mind<span className="text-cyan-500"></span>
                </h3>
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-lg text-white/50 leading-tight">
                  Transformando dados de jogabilidade em acompanhamento inteligente e inclusivo.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-2">Conecte-se</h4>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-purple-500/50 hover:text-purple-400 transition-all">🐙</a>
                  <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">📸</a>
                  <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-purple-500/50 hover:text-purple-400 transition-all">✉️</a>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] text-center md:text-left">
                © 2026 Cosmic Mind Dashboard — Desenvolvido pela Equipe Selenes
              </p>
              <p className="text-white/20 text-[10px] uppercase tracking-[0.3em]">
                Parceria com Equipe Spectrum 💫
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}