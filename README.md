# RSUD Wajo — Sistem Absensi Digital

Platform presensi digital berbasis lokasi (Geofencing) dan verifikasi wajah untuk RSUD Lamaddukelleng Wajo.

---

## 📊 Analisa Gap: Database vs Frontend

Berdasarkan analisa skema database `prisma/schema.prisma` dan halaman frontend yang ada, berikut adalah temuan gap yang perlu segera dijembatani:

### ✅ Fitur yang SUDAH Ada (Backend & Frontend)
| Fitur | Backend Endpoint | Frontend Halaman |
|---|---|---|
| Login (NIP + Password) | `POST /api/auth/login` | `/login` ✅ |
| Tambah User | `POST /api/admin/users` | `/admin/users` ✅ |
| Daftar User | `GET /api/admin/users` | `/admin/users` ✅ |
| Absensi Masuk (Selfie + GPS) | `POST /api/attendance/check-in` | `/attendance` ✅ |
| Absensi Keluar (GPS) | `POST /api/attendance/check-out` | `/attendance` ✅ |

---

### ❌ Fitur yang ADA di Database tapi BELUM Ada di Frontend

#### 1. 👤 Admin — Manajemen User (Belum Lengkap)
Database `User` punya kolom: `nip`, `nik`, `email`, `name`, `jabatan`, `role`, `createdAt`, `updatedAt`.
- ❌ **Hapus User** — tidak ada tombol delete di `/admin/users`
- ❌ **Edit User** — tidak ada form edit (nama, jabatan, reset password)
- ❌ **Detail User** — tidak ada halaman detail profil user
- ❌ **Filter/Search User** — tidak ada fitur pencarian di tabel user

#### 2. 📋 Admin — Rekap Absensi Semua Staf (Belum Ada)
Database `Attendance` menyimpan: `checkIn`, `checkOut`, `status` (`PRESENT`, `LATE`, `ABSENT`, `PERMISSION`), `photoPath`, koordinat GPS.
- ❌ **Halaman Rekap Absensi Admin** — tidak ada `/admin/attendance` untuk melihat absensi semua staf
- ❌ **Filter per Tanggal/Bulan** — tidak ada filter kalender
- ❌ **Export Laporan** — tidak ada fitur export CSV/PDF
- ❌ **Backend Endpoint**: `GET /api/admin/attendance` (belum dibuat)

#### 3. ⏰ Admin — Manajemen Shift (Belum Ada Sama Sekali)
Database `Shift` & `UserShift` sudah ada dengan kolom: `name` (Pagi/Siang/Malam), `startTime`, `endTime`, `gracePeriod`.
- ❌ **Halaman Manajemen Shift** — tidak ada `/admin/shifts`
- ❌ **Penugasan Shift ke User** — tidak ada form assign shift per user
- ❌ **Backend Endpoints**: Seluruh CRUD shift belum dibuat

#### 4. 📝 Pengajuan Cuti / Izin (Belum Ada Sama Sekali)
Database `LeaveRequest` sudah ada dengan kolom: `startDate`, `endDate`, `reason`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `attachment`.
- ❌ **Form Pengajuan Izin/Cuti** — tidak ada halaman untuk staf mengajukan izin
- ❌ **Dashboard Persetujuan Izin Admin** — tidak ada halaman admin untuk approve/reject izin
- ❌ **Backend Endpoints**: Seluruh CRUD leave request belum dibuat

#### 5. 📅 User — History Absensi (Ada Backend, Belum Ada Halaman)
Backend `GET /api/attendance/history` **sudah ada** dan berjalan.
- ❌ **Halaman History Absensi Staf** — belum ada halaman `/history` atau tab khusus di halaman `/attendance` yang menampilkan riwayat absensi user yang sedang login
- Data yang tersedia: tanggal, jam masuk, jam keluar, status, foto selfie

#### 6. 📊 Admin — Dashboard Statistik (Placeholder)
- ❌ **Dashboard** saat ini hanya placeholder kosong, belum menampilkan data real:
  - Total staf hadir hari ini
  - Jumlah terlambat
  - Jumlah tidak hadir
  - Grafik kehadiran mingguan/bulanan

---

## 🗺️ Roadmap Implementasi (Urutan Prioritas)

### 🔴 Prioritas Tinggi (Segera)
1. **Halaman History Absensi Staf** — Tab/halaman di `/attendance` yang menampilkan riwayat absensi pribadi
2. **Rekap Absensi Admin** — Halaman `/admin/attendance` dengan filter tanggal dan status per staf
3. **Edit & Hapus User Admin** — Tombol aksi di tabel user

### 🟡 Prioritas Menengah
4. **Dashboard Statistik Real** — Widget data kehadiran hari ini di `/admin`
5. **Manajemen Shift** — CRUD shift dan penugasan ke user
6. **Pengajuan Izin/Cuti** — Form staf + approval admin

### 🟢 Prioritas Rendah (Nice to Have)
7. **Export Laporan** — Download absensi dalam format CSV/Excel
8. **Notifikasi** — Sistem notifikasi status izin
9. **Profil Staf** — Halaman profil user yang bisa diedit sendiri

---

## 🏗️ Arsitektur Teknis

### Stack
| Layer | Teknologi |
|---|---|
| Backend | **NestJS** (Node.js) + Prisma ORM |
| Database | **PostgreSQL** (Remote: `148.230.102.103`) |
| Frontend | **React** + Vite + Tailwind CSS |
| Auth | **JWT** (via `Authorization: Bearer <token>`) |
| File Upload | **Multer** (local `/uploads/attendance/`) |
| Containerisasi | **Docker** + Docker Compose |

### API Endpoints yang Sudah Ada
```
POST   /api/auth/login            — Login
GET    /api/auth/me               — Profil saya (jika ada)

POST   /api/admin/users           — Buat user baru (ADMIN only)
GET    /api/admin/users           — Daftar semua user (ADMIN only)

POST   /api/attendance/check-in   — Absensi masuk (multipart/form-data: photo, latitude, longitude)
POST   /api/attendance/check-out  — Absensi keluar (JSON: latitude, longitude)
GET    /api/attendance/history    — Riwayat absensi saya
```

### API Endpoints yang Belum Ada (Perlu Dibuat)
```
PATCH  /api/admin/users/:id        — Edit user
DELETE /api/admin/users/:id        — Hapus user
GET    /api/admin/attendance       — Rekap absensi semua staf (+ query filter: date, userId, status)

GET    /api/shifts                 — Daftar shift
POST   /api/shifts                 — Buat shift baru
PATCH  /api/shifts/:id             — Edit shift
DELETE /api/shifts/:id             — Hapus shift
POST   /api/users/:id/shifts       — Assign shift ke user

GET    /api/leaves                 — Daftar pengajuan izin saya
POST   /api/leaves                 — Buat pengajuan izin
GET    /api/admin/leaves           — Semua pengajuan izin (ADMIN)
PATCH  /api/admin/leaves/:id       — Approve/reject izin (ADMIN)
```

---

## 🔐 Akun Default
| Role | NIP | Password |
|---|---|---|
| **ADMIN** | `admin_rsud` | `Barakallah_99` |

---

## 🚀 Cara Menjalankan

### Development
```bash
# Backend
cd backend-nestjs
bun start:dev

# Frontend
cd frontend
npm run dev
```

### Production (Docker)
```bash
docker-compose up --build
```

### Database Migration
```bash
cd backend-nestjs
npx prisma migrate dev
npx prisma db seed  # Buat admin default
```

---

## 📂 Struktur Proyek
```
rsud_wajo/
├── backend-nestjs/          # NestJS API Server (Port 3000)
│   ├── prisma/
│   │   ├── schema.prisma    # Model DB: User, Attendance, Shift, LeaveRequest
│   │   └── seed.ts          # Data awal (akun admin)
│   ├── src/
│   │   ├── admin/           # Manajemen user oleh admin
│   │   ├── attendance/      # Check-in/out + history
│   │   ├── auth/            # JWT Strategy + Guards
│   │   ├── users/           # User service
│   │   └── prisma/          # Prisma service
│   ├── uploads/             # Foto selfie tersimpan di sini
│   └── .env                 # Konfigurasi (DB, JWT, koordinat RSUD)
│
└── frontend/                # React App (Port 5173)
    └── src/
        ├── api/             # HTTP client (client.ts, auth.ts, attendance.ts, admin.ts)
        ├── components/      # Layout komponen
        ├── pages/
        │   ├── Attendance.tsx        # ✅ Halaman absensi staf
        │   ├── admin/
        │   │   ├── Dashboard.tsx     # ⚠️  Placeholder
        │   │   └── Users.tsx         # ✅ CRUD user (belum: edit, delete)
        │   ├── auth/LoginPage.tsx    # ✅ Halaman login
        │   └── public/LandingPage.tsx # ✅ Landing page
        └── types/api.ts     # TypeScript interfaces
```

---

## ⚙️ Environment Variables (backend-nestjs/.env)

```env
DATABASE_URL="postgresql://usr_katalog:Barakallah_99@148.230.102.103:5432/supernova?sslmode=disable"
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="1d"

# Koordinat RSUD Wajo (untuk validasi geofencing)
RSUD_LATITUDE=-4.123456
RSUD_LONGITUDE=120.032456
RSUD_RADIUS_METERS=100

PORT=3000
```
# absen_rsud
