import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import { attendanceService } from '../api/attendance';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  createdAt: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PRESENT:    { label: 'Hadir',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  LATE:       { label: 'Terlambat', color: 'text-amber-600',  bg: 'bg-amber-50'  },
  ABSENT:     { label: 'Absen',    color: 'text-red-600',     bg: 'bg-red-50'    },
  PERMISSION: { label: 'Izin',     color: 'text-blue-600',    bg: 'bg-blue-50'   },
};

function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

function duration(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return null;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}j ${m}m`;
}

export const AttendanceHistory: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await attendanceService.getHistory();
        setRecords(res.data as any);
      } catch {
        toast.error('Gagal mengambil riwayat absensi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayRecord = records.find(r => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold italic tracking-tight text-indigo-950">Riwayat.</h1>
          <p className="text-sm font-medium text-slate-500">Rekap absensi 30 hari terakhir</p>
        </div>

        {/* Today's Summary Card */}
        <div className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-600/20">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-200">Hari Ini</p>
          <p className="mt-1 text-lg font-bold">{formatDate(new Date().toISOString())}</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">Masuk</p>
              <p className="text-2xl font-extrabold">{formatTime(todayRecord?.checkIn ?? null)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">Keluar</p>
              <p className="text-2xl font-extrabold">{formatTime(todayRecord?.checkOut ?? null)}</p>
            </div>
          </div>
          {todayRecord && (
            <div className="mt-4 flex items-center gap-2">
              <div className={`rounded-full px-3 py-1 text-xs font-bold ${statusConfig[todayRecord.status]?.bg} ${statusConfig[todayRecord.status]?.color}`}>
                {statusConfig[todayRecord.status]?.label ?? todayRecord.status}
              </div>
              {duration(todayRecord.checkIn, todayRecord.checkOut) && (
                <span className="text-xs text-indigo-200 font-medium">Durasi: {duration(todayRecord.checkIn, todayRecord.checkOut)}</span>
              )}
            </div>
          )}
        </div>

        {/* History List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-1">Riwayat</h2>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          )}

          {!loading && records.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Belum ada riwayat absensi.</p>
            </div>
          )}

          {records.map((rec, i) => {
            const cfg = statusConfig[rec.status] ?? { label: rec.status, color: 'text-slate-600', bg: 'bg-slate-100' };
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${cfg.bg} ${cfg.color}`}>
                  {rec.checkIn ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{formatDate(rec.createdAt)}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(rec.checkIn)}</span>
                    <span>→</span>
                    <span className="flex items-center gap-1"><LogOut size={12} /> {formatTime(rec.checkOut)}</span>
                    {duration(rec.checkIn, rec.checkOut) && (
                      <span className="text-slate-400">({duration(rec.checkIn, rec.checkOut)})</span>
                    )}
                  </div>
                </div>

                <span className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
