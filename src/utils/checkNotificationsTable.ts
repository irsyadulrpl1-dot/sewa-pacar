/**
 * Utility to check if notifications table exists
 * This helps diagnose 404 errors
 */
import { supabase } from '@/integrations/supabase/client';

export async function checkNotificationsTableExists(): Promise<{
  exists: boolean;
  error?: any;
  message: string;
}> {
  try {
    // Try to query the table with a simple select
    // notifications table exists but not in generated types yet
    const { error } = await (supabase as any)
      .from('notifications')
      .select('id')
      .limit(1);

    if (error) {
      // Check if it's a "table doesn't exist" error
      if (
        error.code === '42P01' ||
        error.code === 'PGRST116' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation') ||
        error.message?.includes('not found')
      ) {
        return {
          exists: false,
          error,
          message: 'Tabel notifications belum dibuat. Silakan jalankan migration.',
        };
      }

      // Other errors (permission, etc.)
      return {
        exists: true, // Table exists but has other issues
        error,
        message: `Error mengakses tabel: ${error.message}`,
      };
    }

    // No error means table exists
    return {
      exists: true,
      message: 'Tabel notifications sudah ada dan dapat diakses.',
    };
  } catch (err: any) {
    return {
      exists: false,
      error: err,
      message: `Exception: ${err?.message || 'Unknown error'}`,
    };
  }
}

// Make available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).checkNotificationsTable = checkNotificationsTableExists;
}

