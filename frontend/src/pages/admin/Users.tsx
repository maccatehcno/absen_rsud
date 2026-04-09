import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Contact, Briefcase, Pencil, Trash2, X, Check, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { adminService } from '../../api/admin';
import { toast } from 'sonner';
import type { User } from '../../types/api';

const JABATAN_OPTIONS = [
  'Perawat', 'Dokter Umum', 'Dokter Spesialis', 'Bidan', 'Apoteker',
  'Analis Kesehatan', 'Radiografer', 'Perekam Medis',
  'Staf Administrasi', 'IT / Sistem Informasi', 'Direksi / Manajemen', 'Lainnya',
];

const emptyForm = { nip: '', nik: '', name: '', email: '', jabatan: '', password: '', role: 'STAFF' };

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
  STAFF: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

const PAGE_SIZE = 10;

interface Meta { total: number; page: number; limit: number; totalPages: number; }

export const Users: React.FC = () => {
  const [users, setUsers]           = useState<User[]>([]);
  const [meta, setMeta]             = useState<Meta>({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]             = useState(1);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [formData, setFormData]     = useState({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Debounce search → reset to page 1 when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers({ page, limit: PAGE_SIZE, search: debouncedSearch });
      const body = res.data as any;
      setUsers(body.data);
      setMeta(body.meta);
    } catch {
      toast.error('Gagal mengambil data pengguna');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // --- Modal helpers ---
  const openCreate = () => {
    setEditTarget(null); setFormData({ ...emptyForm }); setShowModal(true);
  };
  const openEdit = (u: User) => {
    setEditTarget(u);
    setFormData({ nip: u.nip, nik: (u as any).nik ?? '', name: u.name, email: u.email, jabatan: u.jabatan, password: '', role: u.role });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editTarget) {
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password;
        await adminService.updateUser(editTarget.id, payload);
        toast.success('Data pengguna diperbarui.');
      } else {
        await adminService.createUser(formData);
        toast.success('Pengguna berhasil ditambahkan.');
      }
      setShowModal(false); fetchUsers();
    } catch (err: any) { toast.error(err.message || 'Gagal menyimpan data.'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteUser(id);
      toast.success('Pengguna dihapus.');
      setDeleteConfirm(null);
      if (users.length === 1 && page > 1) setPage(p => p - 1);
      else fetchUsers();
    } catch (err: any) { toast.error(err.message || 'Gagal menghapus.'); }
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all';

  // Pagination page numbers
  const pageNums = Array.from({ length: meta.totalPages }, (_, i) => i + 1)
    .reduce<(number | '...')[]>((acc, p) => {
      if (p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1) {
        if (acc.length && (p as number) - (acc[acc.length - 1] as number) > 1) acc.push('...');
        acc.push(p);
      }
      return acc;
    }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-extrabold italic tracking-tight text-slate-900">Data Pegawai.</h2>
          <p className="text-sm font-medium text-slate-500">{meta.total} pengguna terdaftar</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all self-start sm:self-auto">
          <UserPlus size={17} /> Tambah Staf
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        {loading ? (
          <Loader2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" />
        ) : (
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type="text"
          placeholder="Cari nama, NIP, jabatan, atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {['#', 'Nama', 'NIP', 'Jabatan', 'Email', 'Role', 'Aksi'].map((h, i) => (
                  <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 ${i === 6 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className={`h-4 animate-pulse rounded-lg bg-slate-100 ${j === 0 ? 'w-5' : j === 3 ? 'w-36' : 'w-24'}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Search size={32} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Tidak ada data yang cocok.</p>
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-xs font-bold text-slate-300 tabular-nums">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-slate-800 whitespace-nowrap">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                        <Contact size={13} className="text-slate-300 flex-shrink-0" /> {user.nip}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                        <Briefcase size={13} className="text-slate-300 flex-shrink-0" /> {user.jabatan}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                        <Mail size={13} className="text-slate-300 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${ROLE_BADGE[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {deleteConfirm === user.id ? (
                          <>
                            <button onClick={() => handleDelete(user.id)} className="rounded-lg p-2 text-white bg-red-500 hover:bg-red-600 transition-colors">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => openEdit(user)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(user.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          <p className="text-xs font-medium text-slate-400 order-2 sm:order-1">
            Menampilkan{' '}
            <span className="font-bold text-slate-600">{meta.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, meta.total)}</span>
            {' '}dari{' '}
            <span className="font-bold text-slate-600">{meta.total}</span> data
          </p>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
            >
              <ChevronLeft size={16} />
            </button>
            {pageNums.map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="px-1 text-slate-300 text-xs">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  disabled={loading}
                  className={`h-8 w-8 rounded-lg text-sm font-bold transition-all ${page === p ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20' : 'text-slate-500 hover:bg-white hover:border-slate-200 border border-transparent'}`}
                >
                  {p}
                </button>
              )
            )}
            <button
              disabled={page === meta.totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-[2rem] bg-white shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-7 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-xl font-extrabold italic text-slate-900">
                      {editTarget ? 'Edit Pengguna.' : 'Tambah Pengguna.'}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {editTarget ? `Mengedit: ${editTarget.name}` : 'Isi data lengkap staf baru'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setShowModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">NIP</label>
                    <input required className={inputCls} placeholder="Nomor Induk Pegawai" value={formData.nip} onChange={e => setFormData({ ...formData, nip: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">NIK</label>
                    <input required className={inputCls} placeholder="Nomor KTP" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Nama Lengkap</label>
                  <input required className={inputCls} placeholder="Nama sesuai SK" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Jabatan</label>
                    <select required className={inputCls} value={formData.jabatan} onChange={e => setFormData({ ...formData, jabatan: e.target.value })}>
                      <option value="" disabled>Pilih Jabatan</option>
                      {JABATAN_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Role</label>
                    <select className={inputCls} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Email</label>
                  <input required type="email" className={inputCls} placeholder="email@rsud.go.id" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Password {editTarget && <span className="text-slate-300 normal-case font-medium">(kosongkan jika tidak diubah)</span>}
                  </label>
                  <input type="password" required={!editTarget} className={inputCls} placeholder="Minimal 8 karakter" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Batal</button>
                  <button type="submit" className="flex-[2] rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                    {editTarget ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
