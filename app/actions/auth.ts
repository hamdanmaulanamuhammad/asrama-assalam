'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admintd';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admintd';

export async function loginAdmin(username: string, password: string) {
  try {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      // Set cookie untuk session
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
      
      revalidatePath('/admin');
      return { success: true };
    }
    
    return { success: false, error: 'Username atau password salah' };
  } catch (error: unknown) {
    console.error('Login failed:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    console.error('Logout failed:', error);
    return { success: false, error: 'Logout failed' };
  }
}

export async function checkAdminSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    return {
      isAuthenticated: session?.value === 'authenticated'
    };
  } catch (error: unknown) {
    console.error('Check session failed:', error);
    return { isAuthenticated: false };
  }
}
