'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { loginAdmin, checkAdminSession } from '@/app/actions/auth';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const checkSession = async () => {
    const { isAuthenticated } = await checkAdminSession();
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginAdmin(formData.username, formData.password);

    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setErrorMessage(result.error || 'Login gagal');
      setShowError(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Presensi
        </Link>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Image
                src="/Logo Asrama_Biru.png"
                alt="Logo Asrama As-Salam"
                width={80}
                height={80}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600 text-sm">Masuk ke dashboard admin</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Memproses...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>

      {/* Error Modal */}
      <Modal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Login Gagal"
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
    </div>
  );
}
