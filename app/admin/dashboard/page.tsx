'use client';

import { useState, useEffect, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { User } from '@/lib/types';
import { getUsers, createUser, updateUser, deleteUser } from '@/app/actions/users';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [nama, setNama] = useState('');

  const fetchUsers = async () => {
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingUser) {
      const result = await updateUser(editingUser.id, nama);
      if (result.success) {
        await fetchUsers();
        resetForm();
      } else {
        alert(result.error);
      }
    } else {
      const result = await createUser(nama);
      if (result.success) {
        await fetchUsers();
        resetForm();
      } else {
        alert(result.error);
      }
    }

    setLoading(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNama(user.nama);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus nama ini?')) return;

    const result = await deleteUser(id);
    if (result.success) {
      await fetchUsers();
    } else {
      alert(result.error);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingUser(null);
    setNama('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Kelola Anggota</h1>
        <Button className='min-w-30' onClick={() => setShowModal(true)}>
          + Anggota
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.nama}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingUser ? 'Edit Nama' : 'Tambah Nama'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={resetForm} type="button" className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
