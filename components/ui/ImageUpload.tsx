'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  label?: string;
  error?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
}

export default function ImageUpload({ 
  label, 
  error, 
  onChange,
  value 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onChange(null);
      setPreview('');
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className={cn(
        'border-2 border-dashed rounded-lg p-4',
        error ? 'border-red-500' : 'border-gray-300'
      )}>
        {preview ? (
          <div className="space-y-2">
            <div className="relative w-full h-48">
              <Image 
                src={preview} 
                alt="Preview" 
                fill
                className="object-contain rounded"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setPreview('');
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Hapus foto
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <div className="text-gray-500">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 48 48"
              >
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <p className="mt-1 text-sm">Klik untuk upload foto</p>
            </div>
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
