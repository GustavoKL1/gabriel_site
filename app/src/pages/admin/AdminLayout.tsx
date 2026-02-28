import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, FolderPlus } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav
        className="w-full md:w-64 bg-white border-r border-slate-200 px-4 py-6"
        aria-label="Admin Navigation"
      >
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-slate-800">Admin Portal</h1>
        </div>

        <ul className="space-y-1">
          <li>
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              }`}
              aria-current={location.pathname === '/admin' ? 'page' : undefined}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/projects/new"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/admin/projects/new'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              }`}
              aria-current={location.pathname === '/admin/projects/new' ? 'page' : undefined}
            >
              <FolderPlus className="w-4 h-4" aria-hidden="true" />
              New Project
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8" id="main-content">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
