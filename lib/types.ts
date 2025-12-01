export interface User {
  id: string;
  nama: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  tanggal: string;
  nama_id: string;
  status: 'Hadir' | 'Tukar';
  tukar_dengan_id?: string | null;
  waktu: string;
  foto_url: string;
  created_at: string;
}

export interface AttendanceWithUser extends Attendance {
  users: User;
  tukar_dengan?: User | null;
}
