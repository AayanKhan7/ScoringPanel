import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { LogOut, Shield, Gavel, LayoutDashboard } from 'lucide-react';
import { User } from '../../types';

interface LayoutProps {
  children: ReactNode;
  currentUser: User;
  onLogout: () => void;
}

export function Layout({ children, currentUser, onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = currentUser.role === 'admin';
  const isJudge = currentUser.role === 'judge';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={isAdmin ? '/admin' : '/judge'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                {isAdmin ? (
                  <Shield className="size-6 text-white" />
                ) : (
                  <Gavel className="size-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Pitch Perfect Scoring
                </h1>
                <p className="text-xs text-slate-600">
                  {isAdmin ? 'Admin Panel' : 'Judge Panel'}
                </p>
              </div>
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-600">{currentUser.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                title="Logout"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-600">
            © 2026 Pitch Perfect Scoring System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}