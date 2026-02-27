import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, HardHat, Zap, ClipboardCheck } from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  image: string;
  index: number;
}

function ServiceCard({ icon, title, description, features, image, index }: ServiceCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Icon Badge */}
        <div className="absolute top-4 left-4 w-14 h-14 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <div className="text-engine-blue">{icon}</div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white font-display">{title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
        
        {/* Features */}
        <ul className="space-y-3 mb-6">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-engine-orange flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          variant="ghost"
          className="text-engine-blue hover:text-engine-blue-dark hover:bg-engine-blue/5 p-0 h-auto font-medium group/btn"
        >
          Saiba Mais
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>

      {/* Hover Border Effect */}
      <div
        className={`absolute inset-0 rounded-2xl border-2 border-engine-blue transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: <HardHat className="w-7 h-7" />,
      title: 'Engenharia Civil',
      description: 'Soluções completas de engenharia civil do conceito à conclusão. Projetamos e construímos estruturas que definem o horizonte.',
      features: [
        'Design e Análise Estrutural',
        'Gestão de Projetos',
        'Planejamento de Infraestrutura',
        'Supervisão de Construção',
      ],
      image: '/images/service-civil.jpg',
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'Engenharia Elétrica',
      description: 'Design e implementação de sistemas elétricos de ponta para infraestrutura moderna e instalações industriais.',
      features: [
        'Sistemas de Distribuição de Energia',
        'Design de Iluminação',
        'Gestão de Energia',
        'Automação e Controle',
      ],
      image: '/images/service-electrical.jpg',
    },
    {
      icon: <ClipboardCheck className="w-7 h-7" />,
      title: 'Consultoria',
      description: 'Consultoria especializada para guiar seus projetos desde estudos de viabilidade até a implementação bem-sucedida.',
      features: [
        'Estudos de Viabilidade',
        'Avaliação de Riscos',
        'Auditorias Técnicas',
        'Conformidade Regulatória',
      ],
      image: '/images/service-consulting.jpg',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-engine-light to-transparent" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-engine-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-20 w-96 h-96 bg-engine-orange/5 rounded-full blur-3xl" />

      <div className="relative z-10 section-padding max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Section Label */}
          <div
            className={`inline-flex items-center gap-2 mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="w-8 h-0.5 bg-engine-blue" />
            <span className="text-engine-blue font-semibold text-sm tracking-wider uppercase">
              Nossos Serviços
            </span>
            <div className="w-8 h-0.5 bg-engine-blue" />
          </div>

          {/* Heading */}
          <h2
            className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Soluções de Engenharia
            <span className="text-engine-blue"> Completas</span>
          </h2>

          {/* Description */}
          <p
            className={`text-gray-600 text-lg leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Do conceito inicial à implementação final, fornecemos serviços de engenharia 
            completos que entregam excelência em cada etapa do seu projeto.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              features={service.features}
              image={service.image}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-16 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-gray-600 mb-4">
            Precisa de uma solução personalizada para seu projeto?
          </p>
          <Button
            size="lg"
            className="bg-engine-orange hover:bg-engine-orange/90 text-white px-8 py-6 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-glow-orange group"
          >
            Solicite uma Consultoria Gratuita
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
