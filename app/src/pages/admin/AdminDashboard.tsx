import { Link } from 'react-router-dom';
import { ArrowRight, FolderPlus } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h2>
        <p className="text-slate-500 mt-2">Welcome to the administration dashboard.</p>
      </header>

      <section
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8"
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
    </div>
  );
}
