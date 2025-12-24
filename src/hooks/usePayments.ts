import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type PaymentStatus = 'pending' | 'waiting_validation' | 'approved' | 'rejected' | 'cancelled' | 'expired';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'dana' | 'gopay' | 'ovo' | 'shopeepay';

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
  };
}

export function usePayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      toast.error('Silakan login terlebih dahulu');
      return null;
    }

    try {
      // Set expiry time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          companion_id: paymentData.companion_id || null,
          amount: paymentData.amount,
          method: paymentData.method,
          status: 'pending',
          notes: paymentData.notes || null,
          booking_details: paymentData.booking_details || null,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Pesanan berhasil dibuat');
      return data as Payment;
    } catch (err) {
      console.error('Error creating payment:', err);
      toast.error('Gagal membuat pesanan');
      return null;
    }
  };

  // Upload payment proof
  const uploadPaymentProof = async (paymentId: string, file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${paymentId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update payment with proof URL and change status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          proof_url: urlData.publicUrl,
          status: 'waiting_validation',
        })
        .eq('id', paymentId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Bukti pembayaran berhasil diunggah');
      await fetchPayments();
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading payment proof:', err);
      toast.error('Gagal mengunggah bukti pembayaran');
      return null;
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
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as Payment[]);
    } catch (err) {
      console.error('Error fetching all payments:', err);
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const validatePayment = async (
    paymentId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
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
  }, []);

  return {
    payments,
    loading,
    validatePayment,
    fetchAllPayments,
  };
}
