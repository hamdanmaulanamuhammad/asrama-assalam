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

-- Create storage bucket for attendance photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendance-photos', 'attendance-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies for users table (allow all operations - admin auth handled at app level)
CREATE POLICY "Allow public read access to users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Allow insert users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update users"
  ON users FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete users"
  ON users FOR DELETE
  USING (true);

-- Policies for attendance table (allow all operations)
CREATE POLICY "Allow public read access to attendance"
  ON attendance FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update attendance"
  ON attendance FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete attendance"
  ON attendance FOR DELETE
  USING (true);

-- Storage policies (allow all operations)
CREATE POLICY "Allow public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attendance-photos');

CREATE POLICY "Allow public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attendance-photos');

CREATE POLICY "Allow delete photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'attendance-photos');
