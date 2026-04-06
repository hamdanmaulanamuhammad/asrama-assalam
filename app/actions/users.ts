'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  try {
    const db = getDb();
    const { rows } = await db.query(
      `SELECT
         id,
         nama,
         created_at::text AS created_at
       FROM users
       ORDER BY nama ASC`
    );
    return { success: true, data: rows };
  } catch (error: unknown) {
    console.error('Get users error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return { success: false, error: message };
  }
}

export async function createUser(nama: string) {
  try {
    const db = getDb();
    const { rows } = await db.query(
      `INSERT INTO users (nama)
       VALUES ($1)
       RETURNING id, nama, created_at::text AS created_at`,
      [nama]
    );
    revalidatePath('/', 'layout');
    revalidatePath('/admin/dashboard');
    return { success: true, data: rows[0] };
  } catch (error: unknown) {
    console.error('Create user error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return { success: false, error: message };
  }
}

export async function updateUser(id: string, nama: string) {
  try {
    const db = getDb();
    await db.query(
      'UPDATE users SET nama = $1 WHERE id = $2',
      [nama, id]
    );
    revalidatePath('/', 'layout');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return { success: false, error: message };
  }
}

export async function deleteUser(id: string) {
  try {
    const db = getDb();
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    revalidatePath('/');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return { success: false, error: message };
  }
}
