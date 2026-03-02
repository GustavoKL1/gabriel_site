import { useState, useMemo, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Box, Loader2, ExternalLink } from 'lucide-react';
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

export default function ProjectCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const projects = projectsData as Project[];

  const { spotlight, otherProjects, isValidCategory } = useMemo(() => {
    const catProjects = projects.filter(p => p.category === category);

    if (catProjects.length === 0) {
      return { spotlight: null, otherProjects: [], isValidCategory: false };
    }

    // Find spotlight: first starred, or fallback to most recent/highest id
    let spotlightProject = catProjects.find(p => p.starred);
    if (!spotlightProject) {
      spotlightProject = [...catProjects].sort((a, b) => {
        if (a.date && b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return b.id - a.id;
      })[0];
    }

    const others = catProjects.filter(p => p.id !== spotlightProject?.id);

    return {
      spotlight: spotlightProject,
      otherProjects: others,
      isValidCategory: true
    };
  }, [projects, category]);

  const handleView3D = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  if (!isValidCategory || !spotlight) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex flex-col items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Categoria não encontrada
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Desculpe, não conseguimos encontrar projetos para esta categoria.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 bg-engine-blue hover:bg-engine-blue-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-engine-blue focus-visible:outline-none"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Projetos
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = category === 'civil' ? 'Civil' : category === 'eletrico' ? 'Elétrico' : category;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-engine-blue hover:text-engine-blue-dark font-medium transition-colors focus-visible:ring-2 focus-visible:ring-engine-blue focus-visible:outline-none rounded-sm"
            aria-label="Voltar para a lista de projetos"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Projetos
          </Link>
        </div>

        {/* Hero Spotlight Section */}
        <section className="mb-20" aria-labelledby="hero-title">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[60vh] min-h-[500px] w-full group">
            <img
              src={spotlight.image}
              alt={`Projeto em destaque: ${spotlight.title}`}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="eager"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
              <div className="p-8 md:p-16 w-full max-w-4xl">
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-12 h-0.5 bg-engine-blue" />
                  <span className="text-engine-blue font-semibold tracking-widest uppercase text-sm md:text-base">
                    Destaque em {categoryName}
                  </span>
                </div>

                <h1
                  id="hero-title"
                  className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight"
                >
                  {spotlight.title}
                </h1>

                <p className="text-lg md:text-xl text-white/90 leading-relaxed line-clamp-3 max-w-3xl">
                  {spotlight.description}
                </p>

                {spotlight.sketchfabId && (
                  <div className="mt-8">
                    <button
                      onClick={() => handleView3D(spotlight)}
                      className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-600 focus-visible:outline-none"
                      aria-label="Ver projeto em 3D"
                    >
                      <Box className="w-5 h-5" />
                      Visualizar Modelo 3D
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Other Projects Grid */}
        {otherProjects.length > 0 && (
          <section aria-labelledby="other-projects-title">
            <div className="mb-12 text-center">
              <h2
                id="other-projects-title"
                className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4"
              >
                Outros Projetos de {categoryName}
              </h2>
              <div className="w-24 h-1 bg-engine-blue mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {otherProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isVisible={true}
                  onView3D={handleView3D}
                />
              ))}
            </div>
          </section>
        )}
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
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-purple-400 rounded-sm outline-none"
              >
                Abrir no Sketchfab
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
