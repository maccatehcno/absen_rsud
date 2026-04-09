import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../api/auth';

export const LoginPage: React.FC = () => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authService.login({ nip, password });
      const { user, access_token } = response.data.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Login berhasil!', {
        description: `Selamat datang, ${user.name}`,
      });

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/attendance');
      }
    } catch (err: any) {
      toast.error(err.message || 'NIP atau Password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 bg-slate-50 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[2.5rem] border border-white bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
             <User size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight">RSUD Wajo.</h2>
          <p className="text-slate-500 font-medium text-sm">Sistem Presensi Kepegawaian</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Nomor Induk Pegawai</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="text" 
                placeholder="Masukkan NIP Anda"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-600/20 disabled:opacity-70 mt-6"
          >
            {loading ? 'Memproses...' : 'Masuk Aplikasi'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center">
          <p className="text-xs text-indigo-600/80 font-medium leading-relaxed">
            Jika lupa password atau akun belum terdaftar, silakan lapor bagian Kepegawaian RSUD Wajo.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
