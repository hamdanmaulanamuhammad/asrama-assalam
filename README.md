# Presensi Assalam - TD

Aplikasi presensi berbasis web dengan Next.js dan Supabase, dilengkapi dengan role Guest dan Admin.

## Fitur Utama

### Guest (Halaman Presensi)
- Form presensi dengan validasi lengkap
- Upload foto wajib
- Modal konfirmasi sebelum submit
- Dukungan status "Hadir" dan "Tukar"
- Tampilan responsive dan mobile-friendly

### Admin Dashboard
- Login dengan Supabase Auth
- **Register dengan endpoint unik**: `/admin/register?token=presensi-admin-2024`
- CRUD manajemen nama peserta
- Rekap presensi keseluruhan dengan filter
- Rekap mingguan dengan grouping per hari
- Tampilan clean dan modern

## Setup Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` ke `.env.local` dan isi dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_REGISTER_TOKEN=presensi-admin-2024
```

### 3. Setup Supabase Database

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  nama_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tukar')),
  tukar_dengan_id UUID REFERENCES users(id) ON DELETE SET NULL,
  waktu TIME NOT NULL,
  foto_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Setup Supabase Storage

1. Buka Supabase Dashboard → Storage
2. Buat bucket baru dengan nama: `attendance-photos`
3. Set bucket menjadi **Public**

### 5. Setup Row Level Security (RLS)

Jalankan SQL berikut untuk setup policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Allow public read access to users"
  ON users FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert users"
  ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update users"
  ON users FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete users"
  ON users FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for attendance table
CREATE POLICY "Allow public read access to attendance"
  ON attendance FOR SELECT USING (true);

CREATE POLICY "Allow public insert attendance"
  ON attendance FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update attendance"
  ON attendance FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete attendance"
  ON attendance FOR DELETE USING (auth.role() = 'authenticated');
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## URL Penting

- **Halaman Presensi Guest**: `/`
- **Admin Login**: `/admin/login`
- **Admin Register**: `/admin/register?token=presensi-admin-2024`
- **Admin Dashboard**: `/admin/dashboard`
- **Rekap Presensi**: `/admin/rekap`
- **Rekap Mingguan**: `/admin/rekap-mingguan`

## Cara Register Admin

1. Buka URL: `http://localhost:3000/admin/register?token=presensi-admin-2024`
2. Masukkan email dan password
3. Token akan terisi otomatis dari URL
4. Klik Register
5. Setelah berhasil, login di `/admin/login`

**Catatan**: Ganti `ADMIN_REGISTER_TOKEN` di `.env.local` dengan token yang lebih aman untuk production!

## Teknologi yang Digunakan

- **Next.js 15** (App Router)
- **Supabase** (Database, Auth, Storage)
- **TypeScript**
- **Tailwind CSS**
- **date-fns** (Date manipulation)

## Struktur Project

```
app/
├── actions/          # Server Actions
│   ├── auth.ts
│   ├── users.ts
│   └── attendance.ts
├── admin/           # Admin routes
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── rekap/
│   └── rekap-mingguan/
├── layout.tsx
└── page.tsx         # Guest presensi form

components/
├── ui/              # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   └── ImageUpload.tsx
├── admin/
│   └── AdminNav.tsx
└── PresensiForm.tsx

lib/
├── supabase/
│   ├── client.ts
│   └── server.ts
├── types.ts
└── utils.ts
```

## Lisensi

MIT
