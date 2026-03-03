import { useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import projectsData from '@/data/projects.json';
import type { Project } from '@/types/project';

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  civil: 'Projetos focados em infraestrutura e construção civil, aplicando as melhores práticas de engenharia para garantir segurança, durabilidade e eficiência.',
  eletrico: 'Soluções de engenharia elétrica que garantem eficiência energética, segurança e inovação para os mais diversos tipos de instalações.',
  // Add other categories as needed
};

export default function ProjectsPage() {
  const projects = projectsData as Project[];

  // Group by category and find the spotlight for each
  const categorySpotlights = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    projects.forEach(project => {
      const cat = project.category;
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(project);
    });

    const spotlights: { category: string; project: Project; description: string }[] = [];

    for (const [category, catProjects] of Object.entries(grouped)) {
      // Find spotlight: first starred, or fallback to most recent/highest id
      let spotlight = catProjects.find(p => p.starred);
      if (!spotlight) {
        spotlight = [...catProjects].sort((a, b) => {
          if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return b.id - a.id;
        })[0];
      }

      spotlights.push({
        category,
        project: spotlight,
        description: CATEGORY_DESCRIPTIONS[category] || 'Explore nossos projetos nesta categoria.'
      });
    }

    return spotlights;
  }, [projects]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-engine-blue hover:text-engine-blue-dark font-medium mb-6 transition-colors focus-visible:ring-2 focus-visible:ring-engine-blue focus-visible:outline-none rounded-sm"
            aria-label="Voltar para a página inicial"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Nossos Projetos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Conheça nosso portfólio de excelência. Selecione uma categoria abaixo para explorar nossos projetos mais recentes e em destaque.
          </p>
        </div>

        {/* Spotlights Sections */}
        <div className="space-y-24">
          {categorySpotlights.map((spotlight, index) => (
            <section
              key={spotlight.category}
              className="group"
              aria-labelledby={`category-title-${spotlight.category}`}
            >
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                {/* Text Content */}
                <div className="lg:w-1/2 flex flex-col items-start">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-8 h-0.5 bg-engine-blue" />
                    <span className="text-engine-blue font-semibold tracking-wider uppercase">
                      Categoria
                    </span>
                  </div>

                  <h2
                    id={`category-title-${spotlight.category}`}
                    className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 capitalize"
                  >
                    {spotlight.category === 'civil' ? 'Civil' : spotlight.category === 'eletrico' ? 'Elétrico' : spotlight.category}
                  </h2>

                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    {spotlight.description}
                  </p>

                  <Link
                    to={`/projects/${spotlight.category}`}
                    className="inline-flex items-center gap-2 bg-engine-blue hover:bg-engine-blue-dark text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-engine-blue focus-visible:outline-none group/btn"
                    aria-label={`Ver mais projetos de ${spotlight.category}`}
                  >
                    Ver mais projetos de {spotlight.category === 'civil' ? 'Civil' : spotlight.category}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>

                {/* Spotlight Image */}
                <div className="lg:w-1/2 w-full">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video lg:aspect-square xl:aspect-[4/3]">
                    <img
                      src={spotlight.project.image}
                      alt={`Projeto em destaque: ${spotlight.project.title}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading={index === 0 ? "eager" : "lazy"}
                    />

                    {/* Overlay with Project Name */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                      <div>
                        <span className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2 block">
                          Projeto em Destaque
                        </span>
                        <h3 className="text-2xl font-display font-bold text-white">
                          {spotlight.project.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {categorySpotlights.length === 0 && (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-lg">
                Nenhum projeto encontrado no momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
