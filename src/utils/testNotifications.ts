/**
 * Utility function to test notification creation
 * This can be called from browser console for debugging
 */
import { supabase } from '@/integrations/supabase/client';

export async function testCreateNotification(userId: string) {
  try {
    console.log('Testing notification creation for user:', userId);
    
    const { data, error } = await (supabase as any)
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'system_announcement',
        title: 'Test Notifikasi',
        message: 'Ini adalah notifikasi test untuk memastikan sistem bekerja dengan baik.',
        related_type: 'system',
        metadata: {
          test: true,
        },
      })
      .select();

    if (error) {
      console.error('Error creating test notification:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { success: false, error };
    }

    console.log('Test notification created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Exception creating test notification:', err);
    return { success: false, error: err };
  }
}

export async function testFetchNotifications(userId: string) {
  try {
    console.log('Testing notification fetch for user:', userId);
    
    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { success: false, error };
    }

    console.log('Notifications fetched successfully:', data?.length || 0, 'notifications');
    return { success: true, data, count: data?.length || 0 };
  } catch (err) {
    console.error('Exception fetching notifications:', err);
    return { success: false, error: err };
  }
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testCreateNotification = testCreateNotification;
  (window as any).testFetchNotifications = testFetchNotifications;
}

