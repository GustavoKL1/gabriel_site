import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Adding a small delay to ensure the initial render happens before triggering the animation state
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let requestRef: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (requestRef !== null) {
        cancelAnimationFrame(requestRef);
      }

      requestRef = requestAnimationFrame(() => {
        if (heroRef.current) {
          const rect = heroRef.current.getBoundingClientRect();
          setMousePos({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef !== null) {
        cancelAnimationFrame(requestRef);
      }
    };
  }, []);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div
        className={`absolute inset-0 transition-transform duration-[1.8s] ease-out ${
          isLoaded ? 'scale-100' : 'scale-110'
        }`}
      >
        <img
          src="/images/hero-bg.jpg"
          srcSet="/images/hero-bg.jpg 1344w"
          sizes="100vw"
          fetchPriority="high"
          loading="eager"
          alt="Canteiro de obras"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      </div>

      {/* Blueprint Grid Overlay */}
      <div
        ref={gridRef}
        className="absolute inset-0 blueprint-grid blueprint-pulse pointer-events-none"
        style={{
          transform: `translate(${(mousePos.x - 0.5) * -20}px, ${(mousePos.y - 0.5) * -20}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />

      {/* Animated Grid Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: isLoaded ? 0.15 : 0 }}
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#0160F8"
              strokeWidth="0.5"
              className={`transition-all duration-2000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                strokeDasharray: 240,
                strokeDashoffset: isLoaded ? 0 : 240,
                transition: 'stroke-dashoffset 2s ease-in-out',
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 text-center section-padding max-w-5xl mx-auto">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 transition-all duration-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.2s' }}
        >
          <span className="w-2 h-2 rounded-full bg-engine-orange animate-pulse" />
          <span className="text-white/90 text-sm font-medium tracking-wide">
            Excelência em Engenharia Civil
          </span>
        </div>

        {/* Main Heading */}
        <h1
          className={`font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.4s' }}
        >
          Engenharia para o
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-engine-blue to-engine-orange">
            Futuro
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.6s' }}
        >
          Excelência Estrutural. Transformamos desafios complexos em
          obras-primas estruturais que resistem ao teste do tempo.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.8s' }}
        >
          <Button
            size="lg"
            onClick={scrollToProjects}
            className="bg-engine-blue hover:bg-engine-blue-dark text-white px-8 py-6 text-lg font-medium rounded-lg transition-all duration-300 hover:shadow-glow hover:scale-105 group"
          >
            Explorar Projetos
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToAbout}
            className="border-white text-white bg-white/10 hover:bg-white/20 hover:text-white px-8 py-6 text-lg font-medium rounded-lg backdrop-blur-sm transition-all duration-300"
          >
            Saiba Mais
          </Button>
        </div>

        {/* Stats Row */}
        <div
          className={`grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '1s' }}
        >
          {[
            { value: '150+', label: 'Projetos' },
            { value: '25', label: 'Anos' },
            { value: '50+', label: 'Engenheiros' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white font-display">
                {stat.value}
              </div>
              <div className="text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1.2s' }}
      >
        <button
          onClick={scrollToAbout}
          className="flex flex-col items-center text-white/60 hover:text-white transition-colors"
          aria-label="Rolar para a seção Sobre Nós"
        >
          <span className="text-xs mb-2 tracking-wider" aria-hidden="true">ROLAR</span>
          <ChevronDown className="w-5 h-5 animate-bounce" aria-hidden="true" />
        </button>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-engine-blue/30 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-engine-orange/30 rounded-br-3xl" />
    </section>
  );
}
