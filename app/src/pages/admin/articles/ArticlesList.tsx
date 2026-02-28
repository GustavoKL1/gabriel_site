import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Article } from '../../../types/article';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const token = import.meta.env.VITE_ADMIN_TOKEN || 'admin_secret_token';
      const response = await fetch(`${API_URL}/admin/articles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
      } else {
        toast.error('Failed to load articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Error fetching articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const token = import.meta.env.VITE_ADMIN_TOKEN || 'admin_secret_token';
      const response = await fetch(`${API_URL}/admin/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Article deleted successfully');
        setArticles(articles.filter(a => a.id !== id));
      } else {
        toast.error(data.message || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Error deleting article');
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Articles</h2>
          <p className="text-slate-500 mt-2">Manage your blog articles.</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Manage Articles</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : articles.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No articles found. Create your first one!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Image</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Title</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Category</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Author</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x75?text=No+Image';
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{article.title}</td>
                    <td className="py-3 px-4 text-slate-600 capitalize">{article.category}</td>
                    <td className="py-3 px-4 text-slate-600">{article.author}</td>
                    <td className="py-3 px-4 text-slate-600">{new Date(article.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        aria-label={`Delete ${article.title}`}
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
