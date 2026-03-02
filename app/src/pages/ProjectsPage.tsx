import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 flex flex-col items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
          Todos os Projetos
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Página em construção. Em breve você poderá ver e filtrar todos os nossos projetos aqui.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-engine-blue hover:bg-engine-blue-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
