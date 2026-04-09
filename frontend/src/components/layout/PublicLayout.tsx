import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAuth, useAuth } from '../../lib/auth';

export const PublicLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAttendanceRoute = location.pathname === '/attendance';
  const { authenticated, defaultRoute } = useAuth();

  const handleLogout = () => {
    clearAuth();
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900 italic">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span>RSUD<span className="text-indigo-600">Wajo.</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600">Beranda</Link>
            {authenticated && (
              <>
                <Link to="/attendance" className="text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600">Absensi</Link>
                <Link to="/history" className="text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600">Riwayat</Link>
              </>
            )}
            {!authenticated ? (
              <Link 
                to="/login" 
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/20"
              >
                Masuk
              </Link>
            ) : (
              <>
                <Link
                  to={defaultRoute}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/20"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95 shadow-sm"
                >
                  Keluar
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 bg-white md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-2 p-4 shadow-xl">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors">Beranda</Link>
                {authenticated && (
                  <>
                    <Link to="/attendance" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors">Absensi Online</Link>
                    <Link to="/history" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors">Riwayat Absensi</Link>
                  </>
                )}
                {!authenticated ? (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="mt-2 w-full rounded-xl bg-indigo-600 py-4 text-center font-bold text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all">Masuk Aplikasi</Link>
                ) : (
                  <>
                    <Link to={defaultRoute} onClick={() => setIsMenuOpen(false)} className="mt-2 w-full rounded-xl bg-indigo-600 py-4 text-center font-bold text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all">Buka Dashboard</Link>
                    <button onClick={handleLogout} className="w-full rounded-xl bg-slate-100 py-4 text-center font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all">Keluar Akun</button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer - Hiding on mobile attendance view to use max screen real estate */}
      {!isAttendanceRoute && (
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-slate-500">
              &copy; {new Date().getFullYear()} RSUD Lamaddukelleng Wajo. Developed by IT Team.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
