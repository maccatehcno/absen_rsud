import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ShieldCheck, Menu, X, ClipboardList, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAuth, getStoredUser } from '../../lib/auth';

const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all font-semibold text-sm ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={19} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
      <span>{label}</span>
      {isActive && <ChevronRight size={16} className="ml-auto text-indigo-200" />}
    </Link>
  );
};

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const userData = getStoredUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white shadow-xl transition-transform lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col p-5">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-between px-2">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold italic tracking-tight text-slate-900 leading-none">RSUD Wajo.</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-0.5">Admin Panel</p>
              </div>
            </Link>
            <button className="lg:hidden rounded-xl p-2 text-slate-400 hover:bg-slate-100" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1.5">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menu</p>
            <SidebarLink to="/admin" icon={LayoutDashboard} label="Overview" />
            <SidebarLink to="/admin/users" icon={Users} label="Data Pegawai" />
            <SidebarLink to="/admin/attendance" icon={ClipboardList} label="Rekap Absensi" />
          </nav>

          {/* User Info & Logout */}
          <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-extrabold text-sm flex-shrink-0">
                {userData?.name?.charAt(0) ?? 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{userData?.name || 'Admin'}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{userData?.jabatan || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-500 font-semibold text-sm transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              className="lg:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 font-medium">
              <ShieldCheck size={16} className="text-indigo-500" />
              <span>Admin</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden sm:flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-extrabold text-xs">
                  {userData?.name?.charAt(0) ?? 'A'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none">{userData?.name || 'Admin'}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">ADMIN</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-5 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
