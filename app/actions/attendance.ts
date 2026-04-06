'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function checkDuplicateAttendance(nama_id: string, tanggal: string) {
  try {
    const db = getDb();
    const { rows } = await db.query(
      'SELECT id FROM attendance WHERE nama_id = $1 AND tanggal = $2 LIMIT 1',
      [nama_id, tanggal]
    );
    return { success: true, exists: rows.length > 0 };
  } catch {
    return { success: false, error: 'Failed to check attendance' };
  }
}

export async function createAttendance(formData: {
  tanggal: string;
  nama_id: string;
  status: string;
  tukar_dengan_id?: string | null;
  waktu: string;
  foto_url: string;
}) {
  try {
    const db = getDb();
    const { rows } = await db.query(
      `INSERT INTO attendance (tanggal, nama_id, status, tukar_dengan_id, waktu, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         tanggal::text AS tanggal,
         nama_id,
         status,
         tukar_dengan_id,
         waktu::text AS waktu,
         foto_url,
         created_at::text AS created_at`,
      [
        formData.tanggal,
        formData.nama_id,
        formData.status,
        formData.tukar_dengan_id ?? null,
        formData.waktu,
        formData.foto_url,
      ]
    );
    revalidatePath('/');
    return { success: true, data: rows[0] };
  } catch {
    return { success: false, error: 'Failed to create attendance' };
  }
}

export async function getAttendance(filters?: {
  nama_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}) {
  try {
    const db = getDb();
    const conditions: string[] = [];
    const values: string[] = [];

    if (filters?.nama_id) {
      values.push(filters.nama_id);
      conditions.push(`a.nama_id = $${values.length}`);
    }
    if (filters?.status) {
      values.push(filters.status);
      conditions.push(`a.status = $${values.length}`);
    }
    if (filters?.date_from) {
      values.push(filters.date_from);
      conditions.push(`a.tanggal >= $${values.length}`);
    }
    if (filters?.date_to) {
      values.push(filters.date_to);
      conditions.push(`a.tanggal <= $${values.length}`);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const { rows } = await db.query(
      `SELECT
         a.id,
         a.tanggal::text AS tanggal,
         a.nama_id,
         a.status,
         a.tukar_dengan_id,
         a.waktu::text AS waktu,
         a.foto_url,
         a.created_at::text AS created_at,
         json_build_object('id', u.id, 'nama', u.nama, 'created_at', u.created_at::text) AS users,
         CASE
           WHEN t.id IS NULL THEN NULL
           ELSE json_build_object('id', t.id, 'nama', t.nama, 'created_at', t.created_at::text)
         END AS tukar_dengan
       FROM attendance a
       JOIN users u ON u.id = a.nama_id
       LEFT JOIN users t ON t.id = a.tukar_dengan_id
       ${whereClause}
       ORDER BY a.tanggal DESC, a.waktu DESC`,
      values
    );

    return { success: true, data: rows };
  } catch {
    return { success: false, error: 'Failed to fetch attendance' };
  }
}

export async function deleteAttendance(id: string) {
  try {
    const db = getDb();
    await db.query('DELETE FROM attendance WHERE id = $1', [id]);
    revalidatePath('/admin/rekap');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete attendance' };
  }
}
