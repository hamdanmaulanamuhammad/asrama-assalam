'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('nama', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error('Get users error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return { success: false, error: message };
  }
}

export async function createUser(nama: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .insert({ nama })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/', 'layout');
    revalidatePath('/admin/dashboard');
    return { success: true, data };
  } catch (error: unknown) {
    console.error('Create user error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return { success: false, error: message };
  }
}

export async function updateUser(id: string, nama: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .update({ nama })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
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
    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return { success: false, error: message };
  }
}
