import { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';
import articlesData from '@/data/articles.json';
import type { Article } from '@/types/article';

export default function ArticlesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const articles: Article[] = articlesData as Article[];

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

  const currentArticles = useMemo(() => {
    // Show the 3 most recent articles
    return [...articles]
      .sort((a, b) => {
        if (a.date && b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return b.id - a.id;
      })
      .slice(0, 3);
  }, [articles]);

  if (currentArticles.length === 0) {
    return null; // Don't show section if no articles exist
  }

  return (
    <section
      ref={sectionRef}
      id="articles"
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
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
                Blog e Novidades
              </span>
            </div>

            {/* Heading */}
            <h2
              className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Últimos
              <span className="text-engine-blue"> Artigos</span>
            </h2>

            {/* Description */}
            <p
              className={`text-gray-600 text-lg leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Fique por dentro das últimas novidades, dicas e tendências do mundo da engenharia civil.
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentArticles.map((article, index) => (
            <article
              key={article.id}
              className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 group flex flex-col ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-engine-blue text-white text-xs font-semibold rounded-full shadow-lg">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-engine-blue" />
                    <span>
                      {new Date(article.date).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-engine-blue" />
                    <span className="truncate max-w-[100px]" title={article.author}>
                      {article.author}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-engine-blue transition-colors">
                  {article.title}
                </h3>

                <p className="text-gray-600 line-clamp-3 mb-6 flex-grow">
                  {article.content}
                </p>

                {/* Optional "Ler mais" link pointing to individual article page if it existed */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                   <Link
                      to={`/articles`}
                      className="inline-flex items-center gap-2 text-engine-blue font-semibold group-hover:text-engine-blue-dark transition-colors"
                    >
                      Ler artigo completo
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                   </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All CTA */}
        <div
          className={`text-center mt-12 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            asChild
            size="lg"
            className="bg-engine-blue hover:bg-engine-blue-dark text-white px-8 py-6 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-glow group"
          >
            <Link to="/articles">
              Ver Todos os Artigos
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
