'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadPhoto(file: File) {
  try {
    const supabase = await createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('attendance-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('attendance-photos')
      .getPublicUrl(fileName);

    return { success: true, url: data.publicUrl };
  } catch (error) {
    return { success: false, error: 'Failed to upload photo' };
  }
}

export async function checkDuplicateAttendance(nama_id: string, tanggal: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('attendance')
      .select('id')
      .eq('nama_id', nama_id)
      .eq('tanggal', tanggal)
      .maybeSingle();

    if (error) throw error;
    return { success: true, exists: !!data };
  } catch (error) {
    return { success: false, error: 'Failed to check attendance' };
  }
}

export async function createAttendance(formData: {
  tanggal: string;
  nama_id: string;
  status: string;
  tukar_dengan_id?: string;
  waktu: string;
  foto_url: string;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('attendance')
      .insert(formData)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/');
    return { success: true, data };
  } catch (error) {
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
    const supabase = await createClient();
    let query = supabase
      .from('attendance')
      .select(`
        *,
        users:nama_id (id, nama),
        tukar_dengan:tukar_dengan_id (id, nama)
      `)
      .order('tanggal', { ascending: false })
      .order('waktu', { ascending: false });

    if (filters?.nama_id) {
      query = query.eq('nama_id', filters.nama_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.date_from) {
      query = query.gte('tanggal', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('tanggal', filters.date_to);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch attendance' };
  }
}

export async function deleteAttendance(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/rekap');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete attendance' };
  }
}
