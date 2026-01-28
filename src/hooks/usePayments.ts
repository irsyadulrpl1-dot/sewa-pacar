import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useChatFromBooking } from './useChatFromBooking';

export type PaymentStatus = 'pending' | 'waiting_validation' | 'approved' | 'rejected' | 'cancelled' | 'expired';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'bank_transfer_integrated' | 'dana' | 'gopay' | 'ovo' | 'shopeepay';
export type DbPaymentMethod = Exclude<PaymentMethod, 'bank_transfer_integrated'>;

export interface PaymentConfig {
  id: string;
  method: PaymentMethod;
  bank_name: string | null;
  account_number: string;
  account_name: string;
  qr_code_url: string | null;
  is_active: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  companion_id: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  proof_url: string | null;
  notes: string | null;
  admin_notes: string | null;
  validated_by: string | null;
  validated_at: string | null;
  expires_at: string | null;
  booking_details: {
    companion_name?: string;
    package_name?: string;
    package_duration?: string;
    transfer_details?: {
      sender_account_number?: string;
      sender_name?: string;
      transfer_amount?: number;
    };
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  companion_id?: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  booking_details?: {
    companion_name?: string;
    package_name?: string;
    package_duration?: string;
    transfer_details?: {
      sender_account_number?: string;
      sender_name?: string;
      transfer_amount?: number;
    };
  };
}

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export function usePayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create notification safely (does not break payment flow if notifications table/policy isn't ready)
  const safeNotify = useCallback(
    async (payload: {
      type: string;
      title: string;
      message: string;
      related_id?: string | null;
      related_type?: string | null;
      metadata?: Record<string, any> | null;
    }) => {
      if (!user) return;
      try {
        await (supabase as any).from('notifications').insert({
          user_id: user.id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          related_id: payload.related_id || null,
          related_type: payload.related_type || null,
          metadata: payload.metadata || null,
        });
      } catch {
        // ignore
      }
    },
    [user?.id],
  );

  // Fetch payment configurations
  const fetchPaymentConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_config')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setPaymentConfigs((data || []) as PaymentConfig[]);
    } catch (err) {
      console.error('Error fetching payment configs:', err);
    }
  };

  // Fetch user's payments
  const fetchPayments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPayments((data || []) as Payment[]);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Gagal memuat riwayat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  // Create a new payment
  const createPayment = async (paymentData: CreatePaymentData): Promise<Payment | null> => {
    if (!user) {
      const error = new Error('Silakan login terlebih dahulu');
      console.error('Create payment error - no user:', error);
      toast.error('Silakan login terlebih dahulu');
      return null;
    }

    try {
      // Validate payment data
      if (!paymentData.amount || paymentData.amount <= 0) {
        const error = new Error('Jumlah pembayaran tidak valid');
        console.error('Invalid amount:', paymentData.amount);
        throw error;
      }

      if (!paymentData.method) {
        const error = new Error('Metode pembayaran harus dipilih');
        console.error('Missing payment method');
        throw error;
      }

      // Set expiry time (24 hours from now) - only for non-COD payments
      const expiresAt = paymentData.method !== 'cod' ? new Date() : null;
      if (expiresAt) {
        expiresAt.setHours(expiresAt.getHours() + 24);
      }

      // For COD, set status to waiting_validation immediately since no proof is needed
      // For other methods, set to pending until proof is uploaded
      const initialStatus: PaymentStatus = paymentData.method === 'cod' ? 'waiting_validation' : 'pending';

      // Map integrated bank transfer to plain bank_transfer for DB type compatibility
      const dbMethod: DbPaymentMethod =
        paymentData.method === 'bank_transfer_integrated' ? 'bank_transfer' : paymentData.method;

      // Validate companion_id - only use if it's a valid UUID
      // If companion_id is not a UUID (e.g., "dimas-putra"), set to null
      // The companion information is already stored in booking_details
      let companionId: string | null = null;
      if (paymentData.companion_id) {
        if (isValidUUID(paymentData.companion_id)) {
          companionId = paymentData.companion_id;
        } else {
          console.warn('companion_id is not a valid UUID, setting to null:', paymentData.companion_id);
          // companion_id is not a UUID, but that's okay - we store companion info in booking_details
        }
      }

      const payload = {
        user_id: user.id,
        companion_id: companionId,
        amount: paymentData.amount,
        method: dbMethod,
        status: initialStatus,
        notes: paymentData.notes || null,
        booking_details: paymentData.booking_details || null,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      };

      console.log('Creating payment payload', {
        ...payload,
        companion_id_original: paymentData.companion_id,
        companion_id_validated: companionId,
      });

      const { data, error } = await supabase
        .from('payments')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', {
          error,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          payload,
        });

        // Provide specific error messages
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          throw new Error('Pembayaran dengan data yang sama sudah ada. Silakan coba lagi.');
        } else if (error.code === '42501' || error.message?.includes('permission')) {
          throw new Error('Tidak memiliki izin untuk membuat pembayaran. Pastikan kamu sudah login.');
        } else if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
          throw new Error('Kebijakan keamanan mencegah pembuatan pembayaran. Hubungi admin jika masalah berlanjut.');
        } else if (error.message?.includes('foreign key') || error.message?.includes('companion_id')) {
          throw new Error('Data companion tidak valid. Silakan pilih companion yang berbeda.');
        } else if (error.message?.includes('uuid') || error.message?.includes('invalid input syntax')) {
          throw new Error('Format data tidak valid. Silakan refresh halaman dan coba lagi.');
        } else {
          throw new Error(`Gagal membuat pesanan: ${error.message || 'Terjadi kesalahan pada server'}`);
        }
      }

      if (!data) {
        throw new Error('Pembayaran gagal dibuat: Tidak ada data yang dikembalikan dari server');
      }

      const payment = data as Payment;
      
      console.log('Payment created successfully', {
        id: payment.id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
      });

      // Notification for user: payment created
      await safeNotify({
        type: 'payment_created',
        title: 'Pembayaran dibuat 💳',
        message:
          payment.method === 'cod'
            ? 'Metode COD dipilih. Status pembayaran: Menunggu Validasi Admin.'
            : 'Silakan lakukan pembayaran dan upload bukti pembayaran agar bisa divalidasi.',
        related_id: payment.id,
        related_type: 'payment',
        metadata: {
          payment_id: payment.id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          companion_name: paymentData.booking_details?.companion_name || null,
          package_name: paymentData.booking_details?.package_name || null,
        },
      });

      if (paymentData.method === 'cod') {
        toast.success('Pesanan COD berhasil dibuat. Status: Menunggu Validasi Admin.');
      } else {
        toast.success('Pesanan berhasil dibuat. Silakan upload bukti pembayaran.');
      }

      
      
      return payment;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Create payment error - Full error:', {
          error: err,
          message: err.message,
          stack: err.stack,
          paymentData,
        });
        throw err;
      }
      console.error('Create payment error - Unknown error:', {
        error: err,
        paymentData,
      });
      throw new Error('Gagal membuat pesanan. Coba lagi beberapa saat.');
    }
  };

  // Upload payment proof
  const uploadPaymentProof = async (paymentId: string, file: File): Promise<string> => {
    if (!user) {
      const error = new Error('Silakan login terlebih dahulu');
      console.error('Upload payment proof error:', error);
      throw error;
    }

    try {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const isValidType = allowedTypes.includes(file.type) || file.type.startsWith('image/');
      
      if (!isValidType) {
        const error = new Error('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
        console.error('Invalid file type:', file.type);
        throw error;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const error = new Error('Ukuran file melebihi 5MB. Silakan pilih file yang lebih kecil.');
        console.error('File too large:', file.size);
        throw error;
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${paymentId}-${Date.now()}.${fileExt}`;

      console.log('Uploading payment proof', {
        paymentId,
        fileName,
        type: file.type,
        size: file.size,
        user_id: user.id,
      });

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', {
          error: uploadError,
          message: uploadError.message,
        });
        
        // Provide specific error messages
        if (uploadError.message?.includes('duplicate') || uploadError.message?.includes('already exists')) {
          throw new Error('File dengan nama yang sama sudah ada. Silakan coba lagi.');
        } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
          throw new Error('Tidak memiliki izin untuk mengupload file. Pastikan kamu sudah login.');
        } else {
          throw new Error(`Gagal mengupload file: ${uploadError.message || 'Terjadi kesalahan pada server'}`);
        }
      }

      if (!uploadData) {
        throw new Error('Upload gagal: Tidak ada data yang dikembalikan dari server');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Gagal mendapatkan URL file yang diupload');
      }

      console.log('File uploaded successfully, updating payment status', {
        paymentId,
        proofUrl: urlData.publicUrl,
      });

      // Update payment with proof URL and change status to waiting_validation
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          proof_url: urlData.publicUrl,
          status: 'waiting_validation',
        })
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Payment update error:', {
          error: updateError,
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint,
        });

        // Provide specific error messages based on error code
        if (updateError.code === '42501' || updateError.message?.includes('permission')) {
          throw new Error('Tidak memiliki izin untuk memperbarui pembayaran. Pastikan status pembayaran masih pending.');
        } else if (updateError.message?.includes('row-level security') || updateError.message?.includes('policy')) {
          throw new Error('Kebijakan keamanan mencegah pembaruan. Hubungi admin jika masalah berlanjut.');
        } else {
          throw new Error(`Gagal memperbarui status pembayaran: ${updateError.message || 'Terjadi kesalahan pada server'}`);
        }
      }

      if (!updatedPayment) {
        throw new Error('Pembayaran tidak ditemukan atau tidak dapat diperbarui');
      }

      console.log('Payment updated successfully', {
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        proofUrl: updatedPayment.proof_url,
      });

      toast.success('Bukti pembayaran berhasil diunggah. Status berubah menjadi Menunggu Validasi Admin.');
      
      

      await fetchPayments();
      
      return urlData.publicUrl;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error uploading payment proof - Full error:', {
          error: err,
          message: err.message,
          stack: err.stack,
          paymentId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
        throw err;
      }
      console.error('Error uploading payment proof - Unknown error:', {
        error: err,
        paymentId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      throw new Error('Gagal mengupload bukti pembayaran. Silakan coba lagi.');
    }
  };

  // Cancel a payment
  const cancelPayment = async (paymentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .in('status', ['pending', 'waiting_validation']);

      if (error) throw error;

      toast.success('Pesanan berhasil dibatalkan');
      await fetchPayments();
      return true;
    } catch (err) {
      console.error('Error cancelling payment:', err);
      toast.error('Gagal membatalkan pesanan');
      return false;
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    fetchPayments();
    fetchPaymentConfigs();

    const channel = supabase
      .channel('payments-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedPayment = payload.new as Payment;
            setPayments((prev) =>
              prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
            );

            // Show toast for status changes
            if (updatedPayment.status === 'approved') {
              toast.success('Pembayaran telah disetujui!');
            } else if (updatedPayment.status === 'rejected') {
              toast.error('Pembayaran ditolak. Lihat catatan admin.');
            }
          } else if (payload.eventType === 'INSERT') {
            fetchPayments();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    payments,
    paymentConfigs,
    loading,
    error,
    createPayment,
    uploadPaymentProof,
    cancelPayment,
    fetchPayments,
    fetchPaymentConfigs,
  };
}

// Hook for admin payment management
export function useAdminPayments() {
  const { user, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { createChatFromBooking } = useChatFromBooking();

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) {
        setCheckingAdmin(true);
        return;
      }

      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      setCheckingAdmin(true);
      try {
        console.log('Checking admin role for user:', user.id);
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          console.log('Admin check result:', data);
          setIsAdmin(data === true);
        }
      } catch (err) {
        console.error('Error in admin check:', err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading]);

  const fetchAllPayments = async () => {
    if (!isAdmin) {
      console.warn('Attempted to fetch payments without admin role');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching all payments as admin...');
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }
      
      console.log('Payments fetched successfully:', data?.length || 0);
      setPayments((data || []) as Payment[]);
    } catch (err: unknown) {
      console.error('Error fetching all payments:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Gagal memuat data pembayaran: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const validatePayment = async (
    paymentId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ): Promise<boolean> => {
    if (!user || !isAdmin) {
      toast.error('Anda tidak memiliki izin untuk memvalidasi pembayaran');
      return false;
    }

    try {
      // First, get the payment to get user_id and details
      const { data: paymentData, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (fetchError || !paymentData) {
        throw new Error('Pembayaran tidak ditemukan');
      }

      // Update payment status
      const { error } = await supabase
        .from('payments')
        .update({
          status,
          admin_notes: adminNotes || null,
          validated_by: user.id,
          validated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      // Create notification for the payment owner
      const payment = paymentData as Payment;
      const bookingDetails = payment.booking_details as {
        companion_name?: string;
        companion_id?: string;
        package_name?: string;
        package_duration?: string;
        booking_date?: string;
        booking_time?: string;
        duration_hours?: number;
      } | null;

      const notificationType = status === 'approved' ? 'payment_approved' : 'payment_rejected';
      const notificationTitle = status === 'approved' 
        ? 'Pembayaran Disetujui ✅' 
        : 'Pembayaran Ditolak ❌';
      const notificationMessage = status === 'approved'
        ? `Pembayaran kamu untuk ${bookingDetails?.package_name || 'booking'} telah disetujui oleh admin.`
        : `Pembayaran kamu untuk ${bookingDetails?.package_name || 'booking'} ditolak.${adminNotes ? ` Alasan: ${adminNotes}` : ''}`;

      // If payment is approved, create chat automatically
      if (status === 'approved' && payment.user_id) {
        try {
          // Try to get companion_id from payment.companion_id first
          let companionUserId: string | null = null;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          // Check payment.companion_id (could be UUID)
          if (payment.companion_id && uuidRegex.test(payment.companion_id)) {
            companionUserId = payment.companion_id;
          } else if (bookingDetails?.companion_id && uuidRegex.test(bookingDetails.companion_id)) {
            // Check booking_details.companion_id
            companionUserId = bookingDetails.companion_id;
          } else if (bookingDetails?.companion_name) {
            // Try to find companion by name
            const { data: companionProfile } = await (supabase as any)
              .from("profiles")
              .select("user_id")
              .or(`full_name.ilike.%${bookingDetails.companion_name}%,username.ilike.%${bookingDetails.companion_name}%`)
              .eq("role", "companion") // Must be a companion (role-based)
              .limit(1)
              .maybeSingle();
            
            if (companionProfile?.user_id) {
              companionUserId = companionProfile.user_id;
            }
          }

          if (companionUserId && uuidRegex.test(companionUserId)) {
            const chatResult = await createChatFromBooking(
              paymentId,
              payment.user_id,
              companionUserId,
              {
                date: bookingDetails?.booking_date,
                time: bookingDetails?.booking_time,
                duration: bookingDetails?.duration_hours,
                packageName: bookingDetails?.package_name,
              }
            );

            if (chatResult.error) {
              console.error("Error creating chat from booking:", chatResult.error);
              // Don't fail the payment validation if chat creation fails
            } else if (!chatResult.chatExists) {
              console.log("Chat created successfully from booking");
            }
          } else {
            console.warn("Could not find valid companion user_id for chat creation");
          }
        } catch (chatError) {
          console.error("Error in chat creation process:", chatError);
          // Don't fail the payment validation if chat creation fails
        }
      }

      toast.success(
        status === 'approved' ? 'Pembayaran disetujui' : 'Pembayaran ditolak'
      );
      await fetchAllPayments();
      return true;
    } catch (err) {
      console.error('Error validating payment:', err);
      toast.error('Gagal memvalidasi pembayaran');
      return false;
    }
  };

  useEffect(() => {
    // Only fetch if user is admin
    if (isAdmin === true && !checkingAdmin && user) {
      fetchAllPayments();

      const channel = supabase
        .channel('admin-payments-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
          },
          () => {
            fetchAllPayments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, checkingAdmin, user]);

  return {
    payments,
    loading,
    validatePayment,
    fetchAllPayments,
    isAdmin: isAdmin === true,
    checkingAdmin,
  };
}
