'use client';

import { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Modal from './ui/Modal';
import ImageUpload from './ui/ImageUpload';
import { User } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { checkDuplicateAttendance } from '@/app/actions/attendance';

export default function PresensiForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    tanggal: format(new Date(), 'yyyy-MM-dd'),
    nama_id: '',
    status: '',
    tukar_dengan_id: '',
    waktu: '',
    foto: null as File | null,
  });

  const [previewData, setPreviewData] = useState<{
    tanggal: string;
    nama: string;
    status: string;
    tukar_dengan: string;
    waktu: string;
    foto: string;
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('users').select('*').order('nama');
    if (data) setUsers(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nama_id || !formData.status || !formData.waktu || !formData.foto) {
      alert('Harap isi semua field');
      return;
    }

    if (formData.status === 'Tukar' && !formData.tukar_dengan_id) {
      alert('Harap pilih nama untuk tukar');
      return;
    }

    // Check duplicate attendance
    const selectedUser = users.find(u => u.id === formData.nama_id);
    const checkResult = await checkDuplicateAttendance(formData.nama_id, formData.tanggal);
    
    if (checkResult.success && checkResult.exists) {
      setErrorMessage(`${selectedUser?.nama || 'Anda'} sudah presensi hari ini`);
      setShowError(true);
      return;
    }

    // Prepare preview
    const tukarUser = users.find(u => u.id === formData.tukar_dengan_id);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewData({
        tanggal: format(new Date(formData.tanggal), 'dd/MM/yyyy'),
        nama: selectedUser?.nama || '',
        status: formData.status,
        tukar_dengan: tukarUser?.nama || '-',
        waktu: formData.waktu,
        foto: reader.result as string,
      });
      setShowValidation(true);
    };
    reader.readAsDataURL(formData.foto);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // Upload photo to public folder via API
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.foto!);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) throw new Error('Upload failed');

      // Save attendance
      const supabase = createClient();
      const { error: insertError } = await supabase.from('attendance').insert({
        tanggal: formData.tanggal,
        nama_id: formData.nama_id,
        status: formData.status,
        tukar_dengan_id: formData.status === 'Tukar' ? formData.tukar_dengan_id : null,
        waktu: formData.waktu,
        foto_url: uploadResult.url,
      });

      if (insertError) throw insertError;

      setShowValidation(false);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        nama_id: '',
        status: '',
        tukar_dengan_id: '',
        waktu: '',
        foto: null,
      });
    } catch (error) {
      alert('Gagal menyimpan presensi');
    } finally {
      setLoading(false);
    }
  };

  const availableTukarUsers = users.filter(u => u.id !== formData.nama_id);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="date"
          label="Tanggal"
          value={formData.tanggal}
          onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
          required
        />

        <Select
          label="Nama"
          value={formData.nama_id}
          onChange={(e) => setFormData({ ...formData, nama_id: e.target.value })}
          options={users.map(u => ({ value: u.id, label: u.nama }))}
          required
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: 'Hadir', label: 'Hadir' },
            { value: 'Tukar', label: 'Tukar' },
          ]}
          required
        />

        {formData.status === 'Tukar' && (
          <Select
            label="Tukar Dengan"
            value={formData.tukar_dengan_id}
            onChange={(e) => setFormData({ ...formData, tukar_dengan_id: e.target.value })}
            options={availableTukarUsers.map(u => ({ value: u.id, label: u.nama }))}
            required
          />
        )}

        <Input
          type="time"
          label="Waktu Kehadiran"
          value={formData.waktu}
          onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
          required
        />

        <ImageUpload
          label="Upload Foto"
          onChange={(file) => setFormData({ ...formData, foto: file })}
          value={formData.foto}
        />

        <Button type="submit" className="w-full">
          Submit Presensi
        </Button>
      </form>

      {/* Validation Modal */}
      <Modal
        isOpen={showValidation}
        onClose={() => setShowValidation(false)}
        title="Konfirmasi Data Presensi"
        size="md"
      >
        {previewData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Tanggal:</span>
                <span>{previewData.tanggal}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nama:</span>
                <span>{previewData.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span>{previewData.status}</span>
              </div>
              {previewData.status === 'Tukar' && (
                <div className="flex justify-between">
                  <span className="font-medium">Tukar Dengan:</span>
                  <span>{previewData.tukar_dengan}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Waktu:</span>
                <span>{previewData.waktu}</span>
              </div>
              <div className="mt-4">
                <span className="font-medium">Foto:</span>
                <img 
                  src={previewData.foto} 
                  alt="Preview" 
                  className="mt-2 w-full max-h-64 object-contain rounded-lg border border-gray-200"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowValidation(false)}
                className="flex-1"
              >
                Kembali
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Mengirim...' : 'Kirim Sekarang'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => window.location.reload()}
        title="Sukses"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="text-green-600 text-5xl">✓</div>
          <p className="text-lg">Presensi berhasil dikirim!</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            OK
          </Button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Gagal"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="text-red-600 text-5xl">✕</div>
          <p className="text-lg">{errorMessage}</p>
          <Button onClick={() => setShowError(false)} className="w-full" variant="secondary">
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}
