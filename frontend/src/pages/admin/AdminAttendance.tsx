import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Filter, User, Image as ImageIcon, X } from 'lucide-react';
import { adminService } from '../../api/admin';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PRESENT:    { label: 'Hadir',     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200'  },
  LATE:       { label: 'Terlambat', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'     },
  ABSENT:     { label: 'Absen',     color: 'text-red-700',     bg: 'bg-red-50 border-red-200'          },
  PERMISSION: { label: 'Izin',      color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200'        },
};

function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

type AttendanceRecord = {
  id: string;
  createdAt: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  photoPath: string | null;
  user?: {
    name?: string;
    jabatan?: string;
  };
};

function getPhotoUrl(photoPath: string | null) {
  if (!photoPath) return null;
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const normalizedPath = photoPath
    .replace(/\\/g, '/')
    .replace(/^\.?\/?uploads/, '/uploads');

  return `${baseUrl}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
}

export const AdminAttendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAttendance({
        date: filterDate || undefined,
        status: filterStatus || undefined,
      });
      setRecords(res.data as AttendanceRecord[]);
    } catch {
      toast.error('Gagal mengambil data absensi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate, filterStatus]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 italic">Rekap Absensi.</h2>
          <p className="text-slate-500 font-medium text-sm">{records.length} catatan ditemukan</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Calendar size={16} className="text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="text-sm font-semibold text-slate-700 focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm font-semibold text-slate-700 focus:outline-none bg-transparent pr-4"
          >
            <option value="">Semua Status</option>
            <option value="PRESENT">Hadir</option>
            <option value="LATE">Terlambat</option>
            <option value="ABSENT">Absen</option>
            <option value="PERMISSION">Izin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Pegawai</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Masuk</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Keluar</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Foto</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-24 animate-pulse rounded-lg bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400 font-medium">Tidak ada data absensi untuk filter ini.</p>
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => {
                  const cfg = statusConfig[rec.status] ?? { label: rec.status, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' };
                  const photoUrl = getPhotoUrl(rec.photoPath);
                  return (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{rec.user?.name ?? '—'}</p>
                            <p className="text-xs text-slate-400 font-medium">{rec.user?.jabatan ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{formatDate(rec.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          <Clock size={14} className="text-emerald-500" />{formatTime(rec.checkIn)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          <Clock size={14} className="text-slate-400" />{formatTime(rec.checkOut)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {photoUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(photoUrl)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm"
                            aria-label={`Lihat foto absensi ${rec.user?.name ?? 'pegawai'}`}
                          >
                            <Eye size={18} />
                          </button>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/70 p-2 text-white transition hover:bg-slate-900"
            >
              <X size={18} />
            </button>
            <img
              src={selectedPhoto}
              alt="Preview foto absensi"
              className="max-h-[80vh] w-full object-contain bg-slate-950"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};
