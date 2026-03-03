import { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import articlesData from '@/data/articles.json';
import type { Article } from '@/types/article';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ArticlesPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('recentes');
  const articles = articlesData as Article[];

  const { topics, articlesByTopic } = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(article => {
      counts[article.category] = (counts[article.category] || 0) + 1;
    });

    return {
      topics: Object.keys(counts).sort(),
      articlesByTopic: counts
    };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let sorted = [...articles].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (selectedTopic !== 'recentes') {
      sorted = sorted.filter(article => article.category === selectedTopic);
    }

    return sorted;
  }, [articles, selectedTopic]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-engine-blue hover:text-engine-blue-dark font-medium mb-6 transition-colors focus-visible:ring-2 focus-visible:ring-engine-blue focus-visible:outline-none rounded-sm"
            aria-label="Voltar para a página inicial"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
                Artigos
              </h1>
              <p className="text-xl text-gray-600">
                Explore nossos artigos e novidades sobre engenharia.
              </p>
            </div>

            <div className="w-full md:w-64">
              <label htmlFor="topic-filter" className="sr-only">
                Filtrar artigos por tópico
              </label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger id="topic-filter" aria-label="Filtrar por tópico" className="w-full bg-white">
                  <SelectValue placeholder="Selecione um tópico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recentes">
                    Recentes ({articles.length})
                  </SelectItem>
                  {topics.map(topic => (
                    <SelectItem key={topic} value={topic}>
                      {topic} ({articlesByTopic[topic]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-8" role="feed" aria-busy="false">
          {filteredArticles.map((article, index) => (
            <article
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              aria-posinset={index + 1}
              aria-setsize={filteredArticles.length}
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto">
                  <img
                    src={article.imageUrl}
                    alt="" // Decorative image, title provides context
                    role="presentation"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 md:p-8 md:w-2/3 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="bg-engine-blue/10 text-engine-blue px-3 py-1 rounded-full font-medium">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      {new Date(article.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                    {article.title}
                  </h2>

                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {article.content}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" aria-hidden="true" />
                      </div>
                      {article.author}
                    </div>
                    <button
                      className="text-engine-blue font-medium hover:text-engine-blue-dark transition-colors focus-visible:ring-2 focus-visible:ring-engine-blue focus-visible:outline-none rounded-sm"
                      aria-label={`Ler o artigo completo: ${article.title}`}
                    >
                      Ler mais
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500 text-lg">
                Nenhum artigo encontrado para este tópico.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
