# Plan Improvement Fitur RSUD Wajo

Tanggal analisa: 2026-04-09

## Tujuan

Dokumen ini fokus pada improvement fitur dari sisi produk, operasional admin, dan kebutuhan staf. Ini bukan plan refactor teknis. Fokusnya adalah:

- fitur apa yang sudah cukup baik
- fitur apa yang masih kosong atau belum matang
- fitur mana yang paling layak dikerjakan berikutnya

## Snapshot Fitur Saat Ini

Berdasarkan halaman frontend, endpoint backend, dan skema database saat ini:

### Sudah tersedia

- Login admin/staf dengan `nip` dan password
- Absensi masuk dengan selfie + lokasi
- Absensi keluar dengan lokasi
- Riwayat absensi staf
- Dashboard admin ringkas
- Manajemen user admin
- Rekap absensi admin
- Preview foto absensi di admin

### Sudah ada di database tapi belum dimanfaatkan penuh

- `Shift`
- `UserShift`
- `LeaveRequest`
- `Attendance.note`
- status absensi selain `PRESENT`

### Belum terlihat ada

- notifikasi
- approval flow izin/cuti
- manajemen shift
- koreksi absensi
- export laporan
- audit trail tindakan admin
- pengaturan aplikasi

## Gap Fitur Utama

### 1. Shift management belum ada, padahal model data sudah siap

Referensi model:

- `backend-nestjs/prisma/schema.prisma`

Kenapa penting:

- tanpa shift, status seperti `LATE` belum punya dasar aturan yang jelas
- rumah sakit biasanya punya pola kerja per hari dan per unit
- dashboard kehadiran akan lebih bernilai jika berbasis jadwal kerja aktual

Fitur yang disarankan:

- halaman `/admin/shifts`
- CRUD shift
- assign shift ke staf per hari
- tampilan shift aktif per staf
- grace period per shift
- kalkulasi otomatis `PRESENT` vs `LATE`

Prioritas: tinggi

### 2. Pengajuan izin/cuti belum ada, padahal sudah ada tabel `LeaveRequest`

Kenapa penting:

- absensi tanpa fitur izin/cuti akan membuat data “tidak hadir” tidak punya konteks
- admin butuh membedakan absent vs approved leave

Fitur yang disarankan:

- halaman staf untuk ajukan cuti/izin
- upload lampiran
- halaman admin untuk approve/reject
- riwayat pengajuan untuk staf
- integrasi dengan status absensi harian

Prioritas: tinggi

### 3. Koreksi absensi manual belum ada

Kondisi saat ini:

- sistem sudah mendukung check-in/check-out normal
- belum ada alur jika staf lupa checkout, kamera gagal, atau GPS bermasalah

Kenapa penting:

- kasus nyata operasional hampir pasti muncul
- tanpa fitur koreksi, admin akan sulit menjaga data tetap valid

Fitur yang disarankan:

- request koreksi absensi oleh staf
- approval koreksi oleh admin
- alasan koreksi wajib diisi
- audit siapa yang mengubah jam masuk/keluar

Prioritas: tinggi

### 4. Rekap admin sudah ada, tetapi belum cukup operasional

Kondisi saat ini:

- admin sudah bisa lihat rekap absensi dan preview foto

Yang masih kurang:

- filter per user/unit/jabatan
- filter rentang tanggal, bukan hanya satu tanggal
- pencarian cepat
- export CSV/Excel/PDF
- detail lokasi check-in/check-out di peta atau link koordinat
- pembeda jelas antara hadir, terlambat, izin, absent

Kenapa penting:

- admin rumah sakit biasanya butuh laporan periodik
- rekap baru berguna penuh kalau bisa difilter dan diexport

Prioritas: tinggi

### 5. Dashboard admin masih bisa dibuat jauh lebih bernilai

Kondisi saat ini:

- dashboard sudah menampilkan statistik dasar

Improvement yang layak:

- grafik tren kehadiran 7 hari dan 30 hari
- ringkasan keterlambatan
- staf belum checkout
- staf yang belum absen sampai jam tertentu
- komposisi hadir per jabatan/unit
- widget pengajuan izin pending

Kenapa penting:

- dashboard seharusnya membantu keputusan cepat, bukan hanya angka statis

Prioritas: menengah-tinggi

### 6. Profil dan self-service staf masih minim

Kondisi saat ini:

- staf fokus ke absensi dan riwayat

Fitur yang disarankan:

- halaman profil saya
- ganti password
- lihat data jabatan/unit
- lihat shift mingguan
- lihat status izin/cuti

Kenapa penting:

- mengurangi ketergantungan ke admin untuk kebutuhan dasar

Prioritas: menengah

### 7. Belum ada layer notifikasi

Use case yang jelas:

- izin/cuti disetujui atau ditolak
- absensi berhasil/gagal
- pengingat belum check-out
- pengingat hari ini belum absen

Bentuk awal yang realistis:

- notifikasi in-app
- toast dan badge dashboard
- email/WhatsApp bisa menyusul belakangan

Prioritas: menengah

### 8. Belum ada grouping organisasi seperti unit/divisi/poli

Kondisi saat ini:

- user punya `jabatan`, tapi belum terlihat ada struktur unit kerja

Kenapa penting:

- rumah sakit biasanya butuh pelaporan per poli, ruangan, instalasi, atau unit
- admin akan kesulitan melihat performa per unit hanya dari jabatan

Fitur yang disarankan:

- tambah entitas unit/divisi
- assign user ke unit
- filter dashboard dan laporan per unit

Prioritas: menengah

### 9. Attendance photo dan lokasi belum dimanfaatkan sebagai evidence lengkap

Kondisi saat ini:

- foto sudah tersimpan
- lokasi sudah tersimpan
- admin sudah bisa preview foto

Improvement lanjutan:

- tampilkan koordinat check-in/check-out lebih jelas
- link “lihat di peta”
- tampilkan metadata foto dan waktu upload
- beri flag jika foto atau lokasi tidak lengkap

Prioritas: menengah

### 10. Belum ada audit trail admin

Use case:

- siapa membuat user
- siapa mengubah role
- siapa menghapus user
- siapa mengubah atau menyetujui koreksi absensi
- siapa approve/reject cuti

Kenapa penting:

- sistem kepegawaian butuh jejak tindakan untuk akuntabilitas

Prioritas: menengah

## Fitur yang Paling Layak Dikerjakan Berikutnya

Jika tujuannya meningkatkan nilai produk paling cepat, urutan terbaik menurut kondisi repo saat ini:

1. Manajemen shift
2. Pengajuan izin/cuti
3. Koreksi absensi manual
4. Rekap admin versi operasional lengkap
5. Dashboard admin yang lebih analitis

Alasannya:

- lima fitur ini langsung membuat sistem lebih realistis dipakai harian
- model database sebagian sudah mendukung
- dampaknya terasa untuk admin dan staf sekaligus

## Roadmap yang Disarankan

### Fase 1 — Lengkapi alur absensi inti

- manajemen shift
- assignment shift ke staf
- status `LATE` otomatis
- detail rekap admin lebih lengkap

Outcome:

- sistem absensi tidak lagi hanya catat hadir, tapi mulai sesuai aturan kerja

### Fase 2 — Tambahkan exception workflow

- pengajuan izin/cuti
- koreksi absensi
- approval admin
- status dan riwayat approval

Outcome:

- sistem siap menangani kasus nyata di lapangan

### Fase 3 — Perkuat monitoring admin

- dashboard tren dan anomaly
- export laporan
- filter per unit/jabatan/user
- ringkasan pending action

Outcome:

- admin bisa memakai sistem untuk monitoring, bukan hanya input data

### Fase 4 — Self-service dan engagement

- profil staf
- ganti password
- shift mingguan
- notifikasi

Outcome:

- pengalaman staf lebih lengkap dan mandiri

## Backlog Fitur Tambahan

Beberapa ide tambahan yang belum wajib, tetapi bagus untuk jangka menengah:

- mode kiosk untuk absensi perangkat bersama
- deteksi duplicate selfie atau quality check foto
- geofence multipoint jika ada beberapa gedung/lokasi RSUD
- leaderboard kedisiplinan atau laporan kinerja bulanan
- integrasi fingerprint atau face recognition di masa depan
- dashboard khusus kepala unit

## Prioritas Akhir

### Prioritas tinggi

- manajemen shift
- pengajuan izin/cuti
- koreksi absensi manual
- rekap admin lengkap + export

### Prioritas menengah

- dashboard analitik admin
- profil staf dan self-service
- notifikasi
- struktur unit/divisi
- audit trail

### Prioritas rendah

- mode kiosk
- advanced face verification
- laporan performa lanjutan

## Rekomendasi Praktis

Kalau hanya memilih satu fitur berikutnya, pilih:

- manajemen shift

Kalau memilih dua fitur berikutnya, pilih:

- manajemen shift
- pengajuan izin/cuti

Kalau ingin dampak paling terasa untuk admin, pilih:

- rekap admin lengkap + export

Kalau ingin dampak paling terasa untuk staf, pilih:

- self-service izin/cuti + koreksi absensi
