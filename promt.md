Buatkan sebuah web aplikasi presensi dengan dua role: Guest dan Admin, dibangun menggunakan Next.js (App Router) dengan Supabase sebagai backend database, auth, serta object storage untuk upload foto. Proyek harus memiliki struktur folder yang rapi, reusable components, dan clean UI modern.

Aplikasi ini terdiri dari dua bagian utama: halaman presensi untuk guest dan dashboard sederhana untuk admin.

Bagian Guest (Halaman Presensi)

Buat halaman presensi khusus guest yang sangat sederhana dan mudah digunakan. Di halaman ini terdapat satu form presensi dengan field:

Tanggal (format dd/mm/yyyy, default hari ini otomatis)

Nama (dropdown, source datanya dari tabel users di Supabase)

Status (dropdown berisi: Hadir, Tukar)

Apabila Tukar nanti ada field tukar dengan dengan dropdown nama nama selain nama dia yang udah di select

Waktu kehadiran (time picker)

Upload foto wajib (pakai Supabase Storage)

Setelah user mengisi form dan menekan submit, tampilkan modal validasi yang berisi preview seluruh data yang akan disimpan (tanggal, nama, status, waktu kehadiran, dan foto). Modal berisi dua tombol:

“Kembali” untuk mengedit data

“Kirim Sekarang” untuk submit final

Jika berhasil menyimpan data ke Supabase, tampilkan modal sukses dengan pesan “Presensi berhasil dikirim”.

Semua data presensi disimpan ke tabel attendance di Supabase dengan struktur:

id (uuid)

tanggal (date)

nama_id (foreign key ke tabel users)

status (text)

waktu (time)

foto_url (text)

created_at (timestamp default)

Foto harus diupload ke Supabase Storage (bucket: attendance-photos) dan URL-nya disimpan ke tabel.

Bagian Admin (Dashboard)

Buat halaman dashboard admin dengan fitur:

1. Auth Admin

Gunakan Supabase Auth email/password.
Admin login di route /admin/login.

Setelah login, admin diarahkan ke /admin/dashboard.

2. Manajemen Nama

Menu khusus untuk menambah, mengedit, dan menghapus nama peserta presensi.
Data tersimpan di tabel users:

id (uuid)

nama (text)

created_at

Nama-nama ini menjadi source dropdown untuk guest.

3. Rekap Presensi Mingguan

Halaman yang menampilkan data presensi dalam bentuk grouping:

Group 1 → per pekan (misalnya Pekan 1, Pekan 2)

Sub-group → per hari (Senin, Selasa, dst)

Tampilkan daftar kehadiran dengan foto tiap orang

Ada filter pekan, filter nama, dan filter status

4. Menu Rekap Seluruh Presensi

Halaman ini menampilkan semua data attendance tanpa grouping, tampilkan dalam tabel:

Nama

Tanggal

Waktu

Status

Thumbnail foto

Tombol download foto

Tambahkan fitur filtering:

Filter berdasarkan nama

Filter range tanggal

Filter status

Tampilan admin dibuat clean, minimalis, modern, responsif, dan mudah dinavigasi.

Teknologi dan Implementasi

Next.js 

Supabase JS SDK

Supabase Auth untuk admin

Supabase PostgreSQL untuk data presensi

Supabase Storage untuk foto

TailwindCSS untuk styling

Modal & UI bisa pakai shadcn/ui

Buat semua API route menggunakan server actions (bukan API routes legacy), dan pastikan validasi form lengkap.

Output yang harus dibuat oleh AI:

Struktur project Next.js Terbaru lengkap

Halaman Guest (form + modal validasi + modal sukses)

Halaman Admin (login, dashboard, CRUD nama, rekap mingguan, rekap keseluruhan)

Koneksi lengkap Supabase: database schema, storage logic, auth, server actions

Komponen UI seperti dropdown, timepicker, image uploader, modal

Styling clean modern

Semua query ke Supabase sudah ready to use