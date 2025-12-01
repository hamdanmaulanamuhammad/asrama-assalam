
import Link from 'next/link';
import Image from 'next/image';
import PresensiForm from '@/components/PresensiForm';
import { Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Image
              src="/Logo Asrama_Biru.png"
              alt="Logo Asrama As-Salam"
              width={60}
              height={60}
              priority
            />
            <div>
              <h1 className="text-sm font-bold text-gray-900 mb-2">Presensi Assalam - TD</h1>
              <p className="text-gray-600 text-xs">Isi form presensi dengan lengkap</p>
            </div>
          </div>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <PresensiForm />
        </div>
      </div>
    </div>
  );
}
