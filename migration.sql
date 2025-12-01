-- Drop tables if exists (untuk reset)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  nama_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tukar')),
  tukar_dengan_id UUID REFERENCES users(id) ON DELETE SET NULL,
  waktu TIME NOT NULL,
  foto_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_attendance_tanggal ON attendance(tanggal);
CREATE INDEX idx_attendance_nama_id ON attendance(nama_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Insert sample users (optional - hapus jika tidak perlu)
INSERT INTO users (nama) VALUES 
  ('Ahmad'),
  ('Budi'),
  ('Citra'),
  ('Dewi'),
  ('Eko');

-- Enable Row Level Security (RLS) - Optional
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (karena pakai cookie auth, bukan supabase auth)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on attendance" ON attendance FOR ALL USING (true);
