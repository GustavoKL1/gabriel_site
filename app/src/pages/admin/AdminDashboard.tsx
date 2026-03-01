import { Link } from 'react-router-dom';
import { ArrowRight, FolderPlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Project } from '../../types/project';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const token = import.meta.env.VITE_ADMIN_TOKEN || 'admin_secret_token';
      const response = await fetch(`${API_URL}/admin/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        toast.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Error fetching projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = import.meta.env.VITE_ADMIN_TOKEN || 'admin_secret_token';
      const response = await fetch(`${API_URL}/admin/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Project deleted successfully');
        setProjects(projects.filter(p => p.id !== id));
      } else {
        toast.error(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project');
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h2>
        <p className="text-slate-500 mt-2">Welcome to the administration dashboard.</p>
      </header>

      <section
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8"
        aria-labelledby="quick-actions-heading"
      >
        <h3 id="quick-actions-heading" className="text-lg font-semibold text-slate-800 mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action Card */}
          <Link
            to="/admin/projects/new"
            className="group block relative rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Create a new project"
          >
            <div className="flex items-center gap-4">
              <div
                className="bg-blue-50 text-blue-600 rounded-lg p-3 group-hover:bg-blue-100 transition-colors"
                aria-hidden="true"
              >
                <FolderPlus className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Add New Project
                </h4>
                <p className="text-sm text-slate-500">
                  Create and publish a new portfolio item
                </p>
              </div>
              <ArrowRight
                className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Manage Projects</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No projects found. Create your first one!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Image</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Title</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Category</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Year</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x75?text=No+Image';
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{project.title}</td>
                    <td className="py-3 px-4 text-slate-600 capitalize">{project.category}</td>
                    <td className="py-3 px-4 text-slate-600">{project.year}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        aria-label={`Delete ${project.title}`}
                        title="Delete Project"
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
