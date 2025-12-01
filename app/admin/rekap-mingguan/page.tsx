'use client';

import { useState, useEffect } from 'react';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { AttendanceWithUser, User } from '@/lib/types';
import { getAttendance } from '@/app/actions/attendance';
import { getUsers } from '@/app/actions/users';
import { format, parseISO, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { X } from 'lucide-react';
// import { revalidatePath } from 'next/cache';
export default function RekapMingguanPage() {
  const [attendances, setAttendances] = useState<AttendanceWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [weeks, setWeeks] = useState<{ value: string; label: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = async () => {
    const [attendanceResult, usersResult] = await Promise.all([
      getAttendance({}),
      getUsers(),
    ]);

    if (attendanceResult.success && attendanceResult.data) {
      const data = attendanceResult.data as AttendanceWithUser[];
      setAttendances(data);
      
      // Generate months from data
      const monthSet = new Set<string>();
      data.forEach(att => {
        const date = parseISO(att.tanggal);
        monthSet.add(format(date, 'yyyy-MM'));
      });
      
      const monthOptions = Array.from(monthSet).map(m => ({
        value: m,
        label: format(new Date(m + '-01'), 'MMMM yyyy', { locale: localeId }),
      })).sort((a, b) => b.value.localeCompare(a.value));
      
      setMonths(monthOptions);
      if (monthOptions.length > 0) {
        setSelectedMonth(monthOptions[0].value);
      }
    }

    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data);
    }
  };

  // Generate weeks when month changes
  useEffect(() => {
    if (selectedMonth) {
      const monthDate = new Date(selectedMonth + '-01');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const weeksInMonth = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 }
      );
      
      const weekOptions = weeksInMonth.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        return {
          value: format(weekStart, 'yyyy-MM-dd'),
          label: `Pekan ${index + 1} (${format(weekStart, 'd MMM', { locale: localeId })} - ${format(weekEnd, 'd MMM', { locale: localeId })})`,
        };
      });
      
      setWeeks(weekOptions);
      setSelectedWeek('');
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, []);

  const groupedData = () => {
    let filtered = attendances;

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter(att => {
        const date = parseISO(att.tanggal);
        return format(date, 'yyyy-MM') === selectedMonth;
      });
    }

    // Filter by week
    if (selectedWeek) {
      const weekStart = startOfWeek(new Date(selectedWeek), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      filtered = filtered.filter(att => {
        const date = parseISO(att.tanggal);
        return date >= weekStart && date <= weekEnd;
      });
    }

    if (selectedName) {
      filtered = filtered.filter(att => att.nama_id === selectedName);
    }

    // Group by date
    const grouped: { [key: string]: AttendanceWithUser[] } = {};
    filtered.forEach(att => {
      const date = att.tanggal;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(att);
    });

    return grouped;
  };

  const grouped = groupedData();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Rekap Presensi Mingguan</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Pilih Bulan"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={months}
          />
          <Select
            label="Pilih Pekan"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            options={weeks}
          />
          <Select
            label="Filter Nama"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            options={users.map(u => ({ value: u.id, label: u.nama }))}
          />
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">Tidak ada data presensi</p>
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, items]) => (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-linear-to-r from-blue-500 to-blue-600 px-4 md:px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">
                    {format(parseISO(date), 'EEEE, dd MMMM yyyy', { locale: localeId })}
                  </h3>
                  <p className="text-blue-100 text-sm mt-0.5">{items.length} presensi</p>
                </div>
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(attendance => (
                      <div key={attendance.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <img 
                            src={attendance.foto_url} 
                            alt={attendance.users.nama}
                            className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(attendance.foto_url)}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{attendance.users.nama}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              🕐 {attendance.waktu.slice(0, 5)}
                            </p>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                attendance.status === 'Hadir' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {attendance.status}
                              </span>
                            </div>
                            {attendance.tukar_dengan && (
                              <p className="text-xs text-gray-600 mt-2 truncate">
                                Tukar: {attendance.tukar_dengan.nama}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

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
