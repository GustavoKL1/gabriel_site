import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Users, Building2 } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

function StatCard({ icon, value, label, delay }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-xl p-6 transition-all duration-700 hover:shadow-xl hover:-translate-y-2 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
      }`}
    >
      <div className="w-12 h-12 rounded-lg bg-engine-blue/10 flex items-center justify-center mb-4">
        <div className="text-engine-blue">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 font-display mb-1">
        {value}
      </div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: <Building2 className="w-6 h-6" />, value: '150+', label: 'Projetos Concluídos' },
    { icon: <Award className="w-6 h-6" />, value: '25', label: 'Anos de Experiência' },
    { icon: <Users className="w-6 h-6" />, value: '50+', label: 'Engenheiros Especialistas' },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 lg:py-32 bg-engine-light overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 blueprint-grid opacity-50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-engine-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-engine-orange/5 rounded-full blur-3xl" />

      <div className="relative z-10 section-padding max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="relative">
              {/* Main Image */}
              <div 
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  clipPath: isVisible 
                    ? 'polygon(0 0, 100% 0, 95% 100%, 0 100%)' 
                    : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                  transition: 'clip-path 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              >
                <img
                  src="/images/about-image.jpg"
                  alt="Equipe de engenharia trabalhando"
                  className={`w-full h-[500px] object-cover transition-transform duration-700 ${
                    imageLoaded ? 'scale-100' : 'scale-110'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Floating Badge */}
              <div
                className={`absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 transition-all duration-700 delay-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-engine-orange/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-engine-orange" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Certificada</div>
                    <div className="text-xs text-gray-500">ISO 9001:2015</div>
                  </div>
                </div>
              </div>

              {/* Decorative Frame */}
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-engine-blue/20 rounded-2xl -z-10" />
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:pl-8">
            {/* Section Label */}
            <div
              className={`inline-flex items-center gap-2 mb-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="w-8 h-0.5 bg-engine-blue" />
              <span className="text-engine-blue font-semibold text-sm tracking-wider uppercase">
                Sobre Nós
              </span>
            </div>

            {/* Heading */}
            <h2
              className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Construindo a Infraestrutura do
              <span className="text-engine-blue"> Amanhã</span> Hoje
            </h2>

            {/* Description */}
            <p
              className={`text-gray-600 text-lg leading-relaxed mb-8 transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Somos uma empresa líder em engenharia especializada em infraestrutura civil.
              Com décadas de experiência combinada, transformamos desafios complexos em 
              obras-primas estruturais. Nossa equipe de engenheiros especialistas traz inovação, 
              precisão e dedicação para cada projeto que realizamos.
            </p>

            {/* Features List */}
            <div
              className={`grid sm:grid-cols-2 gap-4 mb-10 transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {[
                'Excelência em Design Estrutural',
                'Gestão de Projetos',
                'Soluções Sustentáveis',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-engine-blue/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-engine-blue" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div
              className={`transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Button
                size="lg"
                className="bg-engine-blue hover:bg-engine-blue-dark text-white px-8 py-6 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-glow group"
              >
                Conheça Nossa História
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-20">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              delay={index * 150}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
