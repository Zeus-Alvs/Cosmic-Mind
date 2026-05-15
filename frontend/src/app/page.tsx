"use client";

import { useRef } from "react";
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
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const menuItems = [
    { label: "Início", href: "/" },
    { label: "Download", href: "/download" },
    { label: "Quem Somos", href: "/aboutus" },
    { label: "Sobre", href: "/aboutapp" },
    { label: "Contate", href: "/contact" },
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
        <div className="flex flex-col items-center text-center px-6 pt-8 relative z-10">
          <h1
            className="animate-hero mb-7"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(2rem, 5.5vw, 3.6rem)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              lineHeight: 1,
            }}
          >
            <span className="brand-cosmic">Cosmic</span>{" "}
            <span className="brand-mind">Mind</span>
          </h1>

          <p
            className="animate-hero-2 mb-14 max-w-2xl leading-relaxed"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.05rem",
              fontWeight: 300,
              color: "rgba(255,255,255,0.68)",
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam commodo,
            mi eu pellentesque lobortis, lectus quam blandit velit, et tristique urna
            urna ac dui. In a tincidunt est. Aliquam erat volutpat. Nulla facilisi.
            Nulla iaculis est ut massa condimentum gravida. Cras ac condimentum
            lectus, sit amet suscipit dui.
          </p>
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
      </div>
    </>
  );
}