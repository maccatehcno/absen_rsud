# Plan Improvement Fitur RSUD Wajo
Terakhir diperbarui: 2026-04-09 (Analisis paska implementasi Datatable & Maps)

## 🎯 Tujuan
Dokumen ini merangkum strategi pengembangan fitur untuk menjadikan sistem absensi RSUD Wajo siap pakai secara operasional (Production Ready). Fokus pada transisi dari "prototype" ke "sistem manajemen sdm yang reliabel".

---

## 🚦 Status Fitur Saat Ini (Snapshot 2026-04-09)

### ✅ Sudah Matang (Selesai Implementasi)
- **User Interface**: Tema Modern Light Mode di semua platform (Admin & Staf).
- **Security Check**: Absensi multi-evidence (Selfie Kamera + GPS Geolocation).
- **Core Ops (Admin)**: 
  - Manajemen Staf (CRUD) dengan validasi role & jabatan.
  - **Server-Side Datatable**: Pencarian & paginasi diproses di database (performa tinggi untuk ribuan staf).
  - **Dashboard Real-time**: Statistik kehadiran harian & rekap bulanan.
- **Visualisasi**: Map interaktif (Leaflet/OSM) pada saat staf melakukan absensi (deteksi jangkauan geofence).

### 🛠️ Fitur "Setengah Matang" (Backend Siap, Frontend Belum)
- **Shift & Penugasan**: Tabel `Shift` dan `UserShift` sudah ada di database namun belum ada UI untuk pengelolaannya.
- **Leave/Permit**: Tabel `LeaveRequest` sudah ada namun alur pengajuan dan approval belum dibuat.
- **Evidence Monitoring**: Lokasi & Foto sudah tersimpan lengkap, tapi Admin belum memiliki "Detail View" yang nyaman untuk audit per baris absensi.

---

## 📈 Rekomendasi Improvement (The GAP)

### 1. Konfigurasi Global Admin (Crucial)
**Masalah**: Koordinat RSUD & Radius Geofence saat ini masih *hardcoded* di file kode (`Attendance.tsx`).
**Solusi**:
- Buat halaman `/admin/settings`.
- Form untuk update lokasi RSUD (pilih kordinat via map picker) dan set radius jangkauan (dalam meter).
- Global toggles (contoh: aktifkan/matikan fitur foto).

### 2. Manajemen Shift (Prioritas Tinggi)
**Masalah**: Tanpa shift, admin tidak tahu staf mana yang terlambat (`LATE`) atau absen (`ABSENT`).
**Solusi**:
- UI CRUD Shift (Nama Shift, Jam Masuk, Jam Pulang, Grace Period).
- UI Plotting Shift (Menu bulanan untuk tentukan shift pegawai per hari).
- Integrasi logic: Saat staf absen, sistem otomatis bandingkan dengan jam masuk di jadwalnya.

### 3. Workflow Pengajuan Izin/Cuti
**Masalah**: Saat ini jika staf tidak absen, datanya hanya muncul sebagai "Tidak Hadir".
**Solusi**:
- Form pengajuan di sisi Staf (Pilih jenis izin: Sakit, Cuti, DL, dll).
- Upload lampiran (Surat Dokter/Surat Tugas).
- Notifikasi ke Admin untuk approval.
- Status izin otomatis memvalidasi status kehadiran staf di rekap.

### 4. Evidence Audit View (Admin)
**Masalah**: Tabel rekap admin saat ini baru menampilkan teks. Admin butuh verifikasi bukti lebih cepat.
**Solusi**:
- Klik baris absensi → Munculkan Modal Detail.
- Tampilkan foto selfie staf yang besar.
- Tampilkan peta dengan dua marker: Lokasi Staf vs Lokasi RSUD saat itu.
- Metadata: Jenis perangkat (Android/iOS/Web) yang dipakai.

### 5. Export & Pelaporan Formal
**Masalah**: Admin butuh data fisik untuk laporan bulanan ke pimpinan.
**Solusi**:
- Tombol **Export Excel** pada tabel rekap admin.
- Cetak PDF Slip Kehadiran per pegawai.
- Filter rekap per unit kerja/poli (Struktur unit kerja perlu ditambahkan sebagai entitas).

---

## 🗓️ Roadmap Prioritas Berikutnya

### Step 1: Penentuan Aturan (Policy) 🧱
**Target**: Manajemen Shift & Global Settings.
Agar absensi punya acuan waktu masuk-pulang dan kordinat geofence yang dinamis.

### Step 2: Kasus Khusus (Exception) 🚑
**Target**: Alur Izin/Cuti & Koreksi Manual.
Menangani kondisi nyata dimana staf tidak bisa absen karena alasan sah atau kendala teknis.

### Step 3: Output & Audit (Reporting) 📄
**Target**: Detailed View + Maps Recap + Export Excel.
Mempermudah admin melakukan verifikasi bukti paska-absensi dan pembuatan laporan.

---

## 💡 Analisa Penutup
Implementasi **Server-side Pagination** dan **Leaflet Maps** yang baru saja dilakukan sudah menutup celah performa dan visualisasi dasar. Langkah paling logis berikutnya adalah **Manajemen Shift**. Tanpa shift, sistem ini hanyalah "perekam waktu", bukan "manajemen kehadiran". Integrasi shift akan mengubah data mentah menjadi metrik kedisiplinan yang berharga bagi RSUD Wajo.
