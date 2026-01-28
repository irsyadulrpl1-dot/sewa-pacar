import { supabase } from '@/integrations/supabase/client';
import { AdminUser, CompanionExtended } from '@/types/admin';

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  gender: string | null;
  city: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  is_verified: boolean | null;
  is_online?: boolean | null;
  role?: 'admin' | 'renter' | 'companion' | null;
  hourly_rate?: number | null;
  created_at: string;
};

export class UserService {
  static async checkAdminRole(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error || !data) return false;
      return data.role === 'admin';
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  }

  static async fetchAllUsers(): Promise<{
    renters: AdminUser[];
    companions: CompanionExtended[];
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          username,
          email,
          gender,
          city,
          avatar_url,
          date_of_birth,
          is_verified,
          is_online,
          role,
          hourly_rate,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error || !data) throw error;

      // 🔧 FIX 1 — casting aman untuk TypeScript
      const profiles = data as unknown as ProfileRow[];

      const renters: AdminUser[] = [];
      const companions: CompanionExtended[] = [];

      profiles.forEach(profile => {
        const roleNormalized: 'renter' | 'companion' =
          profile.role === 'companion'
            ? 'companion'
            : profile.role === 'renter'
            ? 'renter'
            : profile.hourly_rate && profile.hourly_rate > 0
            ? 'companion'
            : 'renter';

        const userData: AdminUser = {
          user_id: profile.user_id,
          full_name: profile.full_name,
          username: profile.username,
          email: profile.email,
          gender: profile.gender,
          city: profile.city,
          avatar_url: profile.avatar_url,
          date_of_birth: profile.date_of_birth,
          is_verified: profile.is_verified ?? false,

          // 🔧 FIX 2 — field WAJIB sesuai AdminUser
          is_online: profile.is_online ?? false,

          role: roleNormalized,
          hourly_rate: profile.hourly_rate ?? null,
          is_account_active: profile.is_online ?? true,
          created_at: profile.created_at
        };

        if (roleNormalized === 'companion') {
          companions.push({
            ...userData,
            hourly_rate: userData.hourly_rate,
            rating: 0
          });
        } else {
          renters.push(userData);
        }
      });

      return { renters, companions };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async toggleUserStatus(userId: string, currentStatus: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_online: !currentStatus })
        .eq('user_id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await supabase.from('user_roles').delete().eq('user_id', userId);

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async approveCompanion(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async rejectCompanion(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: false })
      .eq('user_id', userId);

    if (error) throw error;
  }
}
