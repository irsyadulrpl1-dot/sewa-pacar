import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserService } from '@/services/admin/userService';
import { AdminUser, CompanionExtended } from '@/types/admin';

export function useAdminUsers() {
  const [renters, setRenters] = useState<AdminUser[]>([]);
  const [companions, setCompanions] = useState<CompanionExtended[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { renters, companions } = await UserService.fetchAllUsers();
      setRenters(renters);
      setCompanions(companions);
    } catch (error) {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await UserService.toggleUserStatus(userId, currentStatus);
      toast.success(currentStatus ? 'Akun dinonaktifkan' : 'Akun diaktifkan');
      await fetchUsers();
    } catch (error) {
      toast.error('Gagal mengubah status akun');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await UserService.deleteUser(userId);
      toast.success('Pengguna berhasil dihapus');
      await fetchUsers();
    } catch (error) {
      toast.error('Gagal menghapus pengguna');
    }
  };

  const approveCompanion = async (userId: string) => {
    try {
      await UserService.approveCompanion(userId);
      toast.success('Teman sewa berhasil diverifikasi');
      await fetchUsers();
    } catch (error) {
      toast.error('Gagal memverifikasi teman sewa');
    }
  };

  const rejectCompanion = async (userId: string) => {
    try {
      await UserService.rejectCompanion(userId);
      toast.success('Verifikasi ditolak');
      await fetchUsers();
    } catch (error) {
      toast.error('Gagal menolak verifikasi');
    }
  };

  return {
    renters,
    companions,
    loading,
    toggleUserStatus,
    deleteUser,
    approveCompanion,
    rejectCompanion,
    refetch: fetchUsers,
  };
}