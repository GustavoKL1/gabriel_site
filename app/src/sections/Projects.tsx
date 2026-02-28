import { useEffect, useRef, useState, useMemo, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Calendar, ExternalLink, Box, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import projectsData from '@/data/projects.json';
import type { Project } from '@/types/project';

// Lazy load SketchfabEmbed
const SketchfabEmbed = lazy(() => import('@/components/SketchfabEmbed'));

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
          loading="lazy"
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'civil'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const projects: Project[] = projectsData as Project[];
  const ITEMS_PER_PAGE = 6;

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

  const filteredProjects = useMemo(() => {
    return activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === activeFilter);
  }, [activeFilter, projects]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  const currentProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const filters = [
    { key: 'all', label: 'Todos os Projetos' },
    { key: 'civil', label: 'Engenharia Civil' },
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
              Explore nosso portfólio de projetos bem-sucedidos de engenharia civil.
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
                onClick={() => {
                  setActiveFilter(filter.key);
                  setCurrentPage(1);
                }}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isVisible={isVisible}
              onView3D={handleView3D}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(p => p - 1);
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(p => p + 1);
                    }}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

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
              <Suspense
                fallback={
                  <div className="h-[500px] w-full flex flex-col items-center justify-center bg-gray-900 rounded-lg">
                    <Loader2 className="w-10 h-10 text-engine-blue animate-spin mb-3" />
                    <p className="text-gray-400 text-sm">Carregando visualizador...</p>
                  </div>
                }
              >
                <SketchfabEmbed
                  modelId={selectedProject.sketchfabId}
                  title={selectedProject.sketchfabTitle || selectedProject.title}
                  height="500px"
                  className="rounded-lg"
                />
              </Suspense>
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
