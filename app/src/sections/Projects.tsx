import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Calendar, ExternalLink, Box } from 'lucide-react';
import SketchfabEmbed from '@/components/SketchfabEmbed';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Project {
  id: number;
  title: string;
  category: 'civil' | 'electrical';
  location: string;
  year: string;
  image: string;
  description: string;
  sketchfabId?: string;
  sketchfabTitle?: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  isVisible: boolean;
  onView3D: (project: Project) => void;
}

function ProjectCard({ project, index, isVisible, onView3D }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-70'
          }`}
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              project.category === 'civil'
                ? 'bg-engine-blue text-white'
                : 'bg-engine-orange text-white'
            }`}
          >
            {project.category === 'civil' ? 'Civil' : 'Elétrico'}
          </span>
        </div>

        {/* 3D Model Badge */}
        {project.sketchfabId && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5" />
              3D
            </span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white font-display mb-2">
            {project.title}
          </h3>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {project.year}
            </span>
          </div>

          {/* Description - Shows on Hover */}
          <p
            className={`text-white/80 text-sm leading-relaxed transition-all duration-300 ${
              isHovered ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
            } overflow-hidden`}
          >
            {project.description}
          </p>

          {/* Action Buttons */}
          <div
            className={`mt-4 flex gap-3 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {project.sketchfabId && (
              <button 
                onClick={() => onView3D(project)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg transition-colors"
              >
                <Box className="w-4 h-4" />
                Ver em 3D
              </button>
            )}
            <button className="inline-flex items-center gap-2 text-engine-orange font-medium text-sm hover:underline">
              Ver Projeto
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'civil' | 'electrical'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleView3D = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const projects: Project[] = [
    {
      id: 1,
      title: 'Torre Skyline',
      category: 'civil',
      location: 'Centro da Metrópole',
      year: '2023',
      image: '/images/project-skyline.jpg',
      description: 'Um edifício comercial de 45 andares com design estrutural inovador e práticas sustentáveis de construção.',
      sketchfabId: '9bdbc1a76f4e43e893978e67678d6efd',
      sketchfabTitle: 'Modern Skyscraper',
    },
    {
      id: 2,
      title: 'Modernização da Rede Metro',
      category: 'electrical',
      location: 'Centro da Cidade',
      year: '2023',
      image: '/images/project-metro.jpg',
      description: 'Upgrade completo da infraestrutura elétrica do sistema metroviário, melhorando confiabilidade e eficiência.',
    },
    {
      id: 3,
      title: 'Ponte do Porto',
      category: 'civil',
      location: 'Distrito Costeiro',
      year: '2022',
      image: '/images/project-bridge.jpg',
      description: 'Ponte suspensa emblemática conectando os distritos do porto com um vão de 1,2 quilômetros.',
      sketchfabId: '88f76c4bf89a4f25a9e31556cd80e1ae',
      sketchfabTitle: 'Suspension Bridge',
    },
    {
      id: 4,
      title: 'Usina de Energia Industrial',
      category: 'electrical',
      location: 'Zona Industrial',
      year: '2022',
      image: '/images/project-plant.jpg',
      description: 'Instalação de geração de energia de última geração com capacidades avançadas de integração à rede.',
    },
    {
      id: 5,
      title: 'Parque Solar',
      category: 'electrical',
      location: 'Interior',
      year: '2023',
      image: '/images/project-solar.jpg',
      description: 'Instalação solar de 50MW fornecendo energia limpa para mais de 15.000 residências na região.',
    },
    {
      id: 6,
      title: 'Interchange de Rodovia',
      category: 'civil',
      location: 'Conector Urbano',
      year: '2021',
      image: '/images/project-highway.jpg',
      description: 'Complexo intercâmbio de rodovia em múltiplos níveis melhorando o fluxo de tráfego e reduzindo congestionamentos.',
    },
  ];

  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const filters = [
    { key: 'all', label: 'Todos os Projetos' },
    { key: 'civil', label: 'Engenharia Civil' },
    { key: 'electrical', label: 'Engenharia Elétrica' },
  ] as const;

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative py-24 lg:py-32 bg-engine-light overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute top-60 left-10 w-80 h-80 bg-engine-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-engine-orange/5 rounded-full blur-3xl" />

      <div className="relative z-10 section-padding max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            {/* Section Label */}
            <div
              className={`inline-flex items-center gap-2 mb-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="w-8 h-0.5 bg-engine-blue" />
              <span className="text-engine-blue font-semibold text-sm tracking-wider uppercase">
                Portfólio
              </span>
            </div>

            {/* Heading */}
            <h2
              className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Projetos
              <span className="text-engine-blue"> em Destaque</span>
            </h2>

            {/* Description */}
            <p
              className={`text-gray-600 text-lg leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Explore nosso portfólio de projetos bem-sucedidos de engenharia civil e elétrica. 
              Alguns projetos incluem visualizações 3D interativas.
            </p>
          </div>

          {/* Filter Buttons */}
          <div
            className={`flex flex-wrap gap-2 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-engine-blue text-white shadow-glow'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isVisible={isVisible}
              onView3D={handleView3D}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div
          className={`text-center mt-16 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            size="lg"
            className="bg-engine-blue hover:bg-engine-blue-dark text-white px-8 py-6 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-glow group"
          >
            Ver Todos os Projetos
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* 3D Model Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-gray-900 border-gray-800">
          <DialogHeader className="p-4 pb-0 bg-gray-900">
            <DialogTitle className="text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-purple-500" />
              {selectedProject?.title} - Visualização 3D
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {selectedProject?.sketchfabId && (
              <SketchfabEmbed
                modelId={selectedProject.sketchfabId}
                title={selectedProject.sketchfabTitle || selectedProject.title}
                height="500px"
                className="rounded-lg"
              />
            )}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                {selectedProject?.description}
              </p>
              <a
                href={`https://sketchfab.com/3d-models/${selectedProject?.sketchfabId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors"
              >
                Abrir no Sketchfab
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
