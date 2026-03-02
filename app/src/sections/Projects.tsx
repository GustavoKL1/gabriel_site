import { useEffect, useRef, useState, useMemo, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Box, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import projectsData from '@/data/projects.json';
import type { Project } from '@/types/project';
import ProjectCard from '@/components/ProjectCard';

// Lazy load SketchfabEmbed
const SketchfabEmbed = lazy(() => import('@/components/SketchfabEmbed'));

export default function Projects() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const projects: Project[] = projectsData as Project[];

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

  const currentProjects = useMemo(() => {
    // 1. Get starred projects
    const starred = projects.filter(p => p.starred);

    // 2. If we have 3 or more starred, just take the first 3
    if (starred.length >= 3) {
      return starred.slice(0, 3);
    }

    // 3. Otherwise, fill the remaining slots with the most recent ones
    const needed = 3 - starred.length;

    // Sort remaining by date (descending) or id if no date
    const remaining = projects
      .filter(p => !p.starred)
      .sort((a, b) => {
        if (a.date && b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return b.id - a.id;
      });

    return [...starred, ...remaining.slice(0, needed)];
  }, [projects]);

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

        {/* View All CTA */}
        <div
          className={`text-center mt-16 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            asChild
            size="lg"
            className="bg-engine-blue hover:bg-engine-blue-dark text-white px-8 py-6 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-glow group"
          >
            <Link to="/projects">
              Ver Todos os Projetos
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
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
