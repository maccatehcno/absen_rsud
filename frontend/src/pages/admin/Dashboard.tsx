import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { adminService } from '../../api/admin';

interface Stats {
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  checkedOutToday: number;
  totalAttendanceThisMonth: number;
  recentAttendance: any[];
}

function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    adminService.getStats()
      .then(res => setStats(res.data as any))
      .catch(() => {});
  }, []);

  const cards = stats ? [
    { title: 'Total Staf',         value: stats.totalStaff,              icon: Users,         color: 'bg-indigo-50 text-indigo-600',  change: 'Terdaftar' },
    { title: 'Hadir Hari Ini',     value: stats.presentToday,            icon: CheckCircle2,  color: 'bg-emerald-50 text-emerald-600', change: 'Masuk Kerja' },
    { title: 'Belum Absen',        value: stats.absentToday,             icon: XCircle,       color: 'bg-red-50 text-red-600',         change: 'Belum Tercatat' },
    { title: 'Absensi Bulan Ini',  value: stats.totalAttendanceThisMonth,icon: TrendingUp,    color: 'bg-purple-50 text-purple-600',   change: 'Total Catatan' },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 italic">Ringkasan.</h2>
        <p className="text-slate-500 font-medium text-sm">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {!stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-slate-100" />
          ))
        ) : (
          cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${c.color}`}>
                <c.icon size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-500">{c.title}</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">{c.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-400">{c.change}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Recent Attendance Today */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 text-lg">Absensi Masuk Hari Ini</h3>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
            {stats?.recentAttendance?.length ?? '—'} terbaru
          </span>
        </div>

        {!stats ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-50" />
            ))}
          </div>
        ) : stats.recentAttendance.length === 0 ? (
          <div className="py-12 text-center">
            <Clock size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium text-sm">Belum ada absensi hari ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentAttendance.map((a: any, i: number) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{a.user?.name ?? '—'}</p>
                  <p className="text-xs text-slate-400 font-medium">{a.user?.jabatan ?? '—'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-600">{formatTime(a.checkIn)}</p>
                  <p className="text-xs text-slate-400">{a.checkOut ? `Keluar: ${formatTime(a.checkOut)}` : 'Belum keluar'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
