'use client';

import { useState, useEffect } from 'react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { AttendanceWithUser, User } from '@/lib/types';
import { deleteAttendance, getAttendance } from '@/app/actions/attendance';
import { getUsers } from '@/app/actions/users';
import { formatDate, formatTime } from '@/lib/utils';
import { X } from 'lucide-react';

export default function RekapPage() {
  const [attendances, setAttendances] = useState<AttendanceWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceWithUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [filters, setFilters] = useState({
    nama_id: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [attendanceResult, usersResult] = await Promise.all([
      getAttendance(filters),
      getUsers(),
    ]);

    if (attendanceResult.success && attendanceResult.data) {
      setAttendances(attendanceResult.data as AttendanceWithUser[]);
    }

    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const handleReset = () => {
    setFilters({
      nama_id: '',
      status: '',
      date_from: '',
      date_to: '',
    });
    fetchData();
  };

  const openDeleteModal = (attendance: AttendanceWithUser) => {
    setSelectedAttendance(attendance);
    setShowDeleteConfirm(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteConfirm(false);
    setSelectedAttendance(null);
  };

  const handleDeleteAttendance = async () => {
    if (!selectedAttendance) return;

    setDeleting(true);
    const result = await deleteAttendance(selectedAttendance.id);

    if (result.success) {
      await fetchData();
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
    } else {
      alert(result.error || 'Gagal menghapus presensi');
    }

    setDeleting(false);
  };

  const closeSuccessModal = () => {
    setShowDeleteSuccess(false);
    setSelectedAttendance(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Rekap Seluruh Presensi</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Select
            label="Nama"
            value={filters.nama_id}
            onChange={(e) => setFilters({ ...filters, nama_id: e.target.value })}
            options={users.map(u => ({ value: u.id, label: u.nama }))}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: 'Hadir', label: 'Hadir' },
              { value: 'Tukar', label: 'Tukar' },
            ]}
          />
          <Input
            type="date"
            label="Dari Tanggal"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          />
          <Input
            type="date"
            label="Sampai Tanggal"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleFilter} className="flex-1 sm:flex-none">Filter</Button>
          <Button variant="secondary" onClick={handleReset} className="flex-1 sm:flex-none">Reset</Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tukar</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Waktu</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Foto</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                  <td className="px-4 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                </tr>
              ))
            ) : attendances.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Tidak ada data presensi</p>
                  </div>
                </td>
              </tr>
            ) : (
              attendances.map((attendance, idx) => (
                <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{formatDate(attendance.tanggal)}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{attendance.users.nama}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      attendance.status === 'Hadir' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {attendance.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {attendance.tukar_dengan?.nama || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatTime(attendance.waktu)}</td>
                  <td className="px-4 py-4 text-sm">
                    <button
                      onClick={() => setSelectedImage(attendance.foto_url)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Lihat
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-1 text-sm"
                      onClick={() => openDeleteModal(attendance)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : attendances.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">Tidak ada data presensi</p>
          </div>
        ) : (
          attendances.map((attendance) => (
            <div key={attendance.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src={attendance.foto_url} 
                  alt={attendance.users.nama}
                  className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(attendance.foto_url)}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{attendance.users.nama}</h3>
                  <p className="text-sm text-gray-600">{formatDate(attendance.tanggal)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      attendance.status === 'Hadir' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {attendance.status}
                    </span>
                    <span className="text-xs text-gray-600">{formatTime(attendance.waktu)}</span>
                  </div>
                </div>
              </div>
              {attendance.tukar_dengan && (
                <div className="text-sm text-gray-600 pt-3 border-t border-gray-100">
                  Tukar dengan: <span className="font-medium">{attendance.tukar_dengan.nama}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="danger"
                  className="w-full"
                  onClick={() => openDeleteModal(attendance)}
                >
                  Hapus Presensi
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={closeDeleteModal}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {selectedAttendance
              ? `Yakin ingin menghapus presensi ${selectedAttendance.users.nama} pada ${formatDate(selectedAttendance.tanggal)}?`
              : 'Yakin ingin menghapus presensi ini?'}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAttendance}
              disabled={deleting}
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteSuccess}
        onClose={closeSuccessModal}
        title="Berhasil"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="text-green-600 text-5xl">✓</div>
          <p className="text-lg">Presensi berhasil dihapus.</p>
          <Button type="button" className="w-full" onClick={closeSuccessModal}>
            OK
          </Button>
        </div>
      </Modal>

      {/* Modal Preview Foto */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
