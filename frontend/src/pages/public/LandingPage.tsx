import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, MapPin, ShieldCheck, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDefaultAuthenticatedRoute, isAuthenticated } from '../../lib/auth';

export const LandingPage: React.FC = () => {
  const dashboardPath = isAuthenticated() ? getDefaultAuthenticatedRoute() : '/login';

  return (
    <div className="overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="relative px-4 pb-24 pt-20 md:pt-32">
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 opacity-40 blur-[100px] bg-gradient-to-b from-indigo-200 to-emerald-100" />
        
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
              Sistem Kepegawaian Internal
            </span>
            <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl italic">
              Absensi Modern <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">RSUD Lamaddukelleng.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 font-medium md:text-xl">
              Platform presensi digital berbasis lokasi dan verifikasi wajah untuk efisiensi dan transparansi kinerja staf medis & administrasi.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/attendance" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-600/20">
                Mulai Absensi <ArrowRight size={18} />
              </Link>
              <Link to={dashboardPath} className="h-14 flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-8 font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-sm">
                Masuk ke Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-slate-200 relative shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: MapPin, title: "Geofencing Precision", desc: "Validasi lokasi secara real-time memastikan staf berada di radius area RSUD Wajo." },
              { icon: Camera, title: "Selfie Verification", desc: "Verifikasi identitas melalui pengambilan foto langsung dari perangkat staf." },
              { icon: ShieldCheck, title: "Data Integrity", desc: "Keamanan data terjamin dengan enkripsi standar industri dan log aktivitas lengkap." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="rounded-[2.5rem] border border-slate-100 bg-slate-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm border border-indigo-50">
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-16 italic tracking-tight">Pelayanan Prima Melalui Kedisiplinan.</h2>
            <div className="flex flex-wrap items-center justify-center gap-16">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 mb-6 rounded-[2rem] bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                    <Clock size={36} />
                  </div>
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Real-time Stats</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 mb-6 rounded-[2rem] bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                    <Users size={36} />
                  </div>
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Staff Management</span>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};
