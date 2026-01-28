import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { checkNotificationsTableExists } from '@/utils/checkNotificationsTable';

export type NotificationType = 
  | 'payment_approved'
  | 'payment_rejected'
  | 'payment_pending'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'system_announcement'
  | 'payment_created'
  | 'payment_expired';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  related_id: string | null;
  related_type: string | null;
  metadata: {
    payment_amount?: number;
    companion_name?: string;
    package_name?: string;
    admin_notes?: string;
    [key: string]: any;
  } | null;
  created_at: string;
  read_at: string | null;
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  related_type?: string;
  metadata?: Record<string, any>;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const debugRef = useRef(false);
  const lastFetchAtRef = useRef<number>(0);
  
  // Use ref to track the current subscription
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Fetch notifications - wrapped in useCallback to prevent infinite loops
  const fetchNotifications = useCallback(async (filter?: NotificationType, showError = false) => {
    if (!user || !isMountedRef.current) {
      if (isMountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
      }
      return;
    }

    // Throttle noisy repeated fetches (common in dev/StrictMode or multi-mount)
    const now = Date.now();
    if (!showError && !filter && now - lastFetchAtRef.current < 1500) {
      return;
    }
    lastFetchAtRef.current = now;

    setLoading(true);
    try {
      if (debugRef.current) {
        console.log('Fetching notifications for user:', user.id, 'filter:', filter);
      }

      let query = (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter) {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications - Full error:', {
          error,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          user_id: user.id,
        });

        // Handle specific error cases
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === 'PGRST116') {
          // Table doesn't exist - migration not run
          console.warn('Notifications table does not exist. Please run migrations.');
          console.warn('Migration file: supabase/migrations/20251228000000_create_notifications.sql');
          if (showError && isMountedRef.current) {
            toast.error('Tabel notifikasi belum dibuat. Silakan jalankan migration di Supabase Dashboard.', {
              duration: 8000,
            });
          }
        } else if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          // RLS policy issue
          console.warn('RLS policy issue. Check notifications table policies.');
          if (showError && isMountedRef.current) {
            toast.error('Tidak memiliki izin untuk melihat notifikasi. Hubungi admin.');
          }
        } else if (
          error.code === 'PGRST204' || 
          error.code === 'PGRST116' ||
          error.message?.includes('Could not find the table') ||
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist') ||
          error.message?.includes('relation') ||
          error.message?.includes('not found')
        ) {
          // 404 - Table or endpoint doesn't exist
          if (isMountedRef.current) {
            setTableExists(false);
          }
          console.error('❌ Notifications table not found!');
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            hint: 'Table notifications belum dibuat. Migration perlu dijalankan!',
          });
          console.warn('📋 INSTRUKSI:');
          console.warn('1. Buka Supabase Dashboard → SQL Editor');
          console.warn('2. Buka file: RUN_THIS_MIGRATION.sql');
          console.warn('3. Copy semua isi file tersebut');
          console.warn('4. Paste ke SQL Editor dan klik RUN');
          console.warn('5. Refresh browser setelah migration selesai');
          
          // Check table existence
          checkNotificationsTableExists().then((result) => {
            if (isMountedRef.current) {
              console.log('Table check result:', result);
              setTableExists(result.exists);
            }
          });
          
          if (showError && isMountedRef.current) {
            toast.error('Tabel notifikasi belum dibuat! Jalankan migration terlebih dahulu.', {
              duration: 12000,
              description: 'Buka file RUN_THIS_MIGRATION.sql dan jalankan di Supabase Dashboard → SQL Editor',
            });
          }
        } else {
          // Other errors
          if (showError && isMountedRef.current) {
            toast.error(`Gagal memuat notifikasi: ${error.message || 'Terjadi kesalahan'}`);
          }
        }

        // Set empty state on error
        if (isMountedRef.current) {
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }
      
      if (debugRef.current) {
        console.log('Notifications fetched successfully:', data?.length || 0, 'notifications');
      }
      if (isMountedRef.current) {
        setNotifications((data || []) as Notification[]);
        setTableExists(true); // Table exists if we got data
        
        // Update unread count
        const unread = (data || []).filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
        if (debugRef.current) {
          console.log('Unread count:', unread);
        }
      }
    } catch (err: any) {
      console.error('Error fetching notifications - Exception:', {
        error: err,
        message: err?.message,
        stack: err?.stack,
        user_id: user.id,
      });
      
      // Only show error if explicitly requested (e.g., from notifications page)
      if (showError && isMountedRef.current) {
        toast.error(`Gagal memuat notifikasi: ${err?.message || 'Terjadi kesalahan yang tidak diketahui'}`);
      }
      
      // Set empty state on error
      if (isMountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user || !isMountedRef.current) return false;

    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      if (isMountedRef.current) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user || !isMountedRef.current) return false;

    try {
      const { error } = await (supabase as any).rpc('mark_all_notifications_read');

      if (error) throw error;

      // Update local state
      if (isMountedRef.current) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() }))
        );
        setUnreadCount(0);
        toast.success('Semua notifikasi ditandai sebagai dibaca');
      }
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      if (isMountedRef.current) {
        toast.error('Gagal menandai semua notifikasi');
      }
      return false;
    }
  }, [user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user || !isMountedRef.current) return false;

    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      if (isMountedRef.current) {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      if (isMountedRef.current) {
        toast.error('Gagal menghapus notifikasi');
      }
      return false;
    }
  }, [user?.id, notifications]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    if (!user || !isMountedRef.current) return false;

    try {
      const { error } = await (supabase as any).rpc('delete_all_read_notifications');

      if (error) throw error;

      // Update local state
      if (isMountedRef.current) {
        setNotifications((prev) => prev.filter((n) => !n.is_read));
        toast.success('Semua notifikasi yang sudah dibaca dihapus');
      }
      return true;
    } catch (err) {
      console.error('Error deleting all read notifications:', err);
      if (isMountedRef.current) {
        toast.error('Gagal menghapus notifikasi');
      }
      return false;
    }
  }, [user?.id]);

  // Create notification (for admin/system use)
  const createNotification = useCallback(async (data: CreateNotificationData): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .insert({
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          message: data.message,
          related_id: data.related_id || null,
          related_type: data.related_type || null,
          metadata: data.metadata || null,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error creating notification:', err);
      return false;
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    isMountedRef.current = true;
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Main effect for fetching and subscribing to notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch notifications silently (no error toast) on mount
    fetchNotifications(undefined, false);

    // Clean up any existing subscription
    if (channelRef.current) {
      console.log('Cleaning up existing notifications subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    try {
      const channelName = `notifications-updates-${user.id}`;
      const subscribeChannel = () => {
        const channel = supabase.channel(channelName);
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (!isMountedRef.current) return;
              try {
                if (payload.eventType === 'INSERT') {
                  const newNotification = payload.new as Notification;
                  setNotifications((prev) => {
                    const exists = prev.some((n) => n.id === newNotification.id);
                    if (exists) return prev;
                    return [newNotification, ...prev];
                  });
                  if (!newNotification.is_read) {
                    setUnreadCount((prev) => prev + 1);
                    toast.info(newNotification.title, {
                      description: newNotification.message,
                      duration: 5000,
                    });
                  }
                } else if (payload.eventType === 'UPDATE') {
                  const updatedNotification = payload.new as Notification;
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
                  );
                  if (updatedNotification.is_read) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                  }
                } else if (payload.eventType === 'DELETE') {
                  const deletedId = payload.old.id;
                  setNotifications((prev) => prev.filter((n) => n.id !== deletedId));
                }
              } catch (err) {
                console.error('Error processing realtime notification:', err);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              channelRef.current = channel;
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
              }
              setTimeout(() => {
                if (isMountedRef.current && user) {
                  subscribeChannel();
                }
              }, 2000);
            }
          });
      };
      subscribeChannel();
    } catch (err) {
      console.error('Error setting up notifications subscription:', err);
    }

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up notifications subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, fetchNotifications]); // Depend on user.id and the memoized fetchNotifications

  return {
    notifications,
    loading,
    unreadCount,
    tableExists,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    createNotification,
  };
}
