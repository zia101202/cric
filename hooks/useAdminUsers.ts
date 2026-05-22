import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';
import { UserFilters } from '../store/adminStore';

/**
 * User interface for admin operations
 */
export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  displayName: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  suspendedUntil: string | null;
  restrictions: Record<string, any>;
  lastActive: string | null;
  createdAt: string;
  role?: string;
}

/**
 * User details with extended information
 */
export interface AdminUserDetails extends AdminUser {
  walletBalance: number;
  matchHistory: any[];
  teams: any[];
  verificationDocs?: any;
}

/**
 * Response type for list operations
 */
export interface ListUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Custom hook for admin user management
 * Handles user listing, search, suspend, verify, and export operations
 */
export const useAdminUsers = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Log admin action to admin_actions table
   */
  const logAdminAction = useCallback(
    async (
      actionType: string,
      targetType: string,
      targetId: string,
      reason?: string,
      meta?: Record<string, any>
    ) => {
      if (!user?.id) return;

      await supabase.from('admin_actions').insert({
        actor_id: user.id,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        reason: reason || null,
        meta: meta || {},
      });
    },
    [user]
  );

  /**
   * List users with pagination and filters
   */
  const listUsers = useCallback(
    async (options: { page?: number; pageSize?: number; filters?: UserFilters }) => {
      setLoading(true);
      setError(null);

      try {
        const { page = 1, pageSize = 20, filters = {} } = options;
        const offset = (page - 1) * pageSize;

        let query = supabase
          .from('user_profiles')
          .select('*, user_roles(role)', { count: 'exact' });

        // Apply filters
        if (filters.query) {
          query = query.or(
            `full_name.ilike.%${filters.query}%,display_name.ilike.%${filters.query}%,email.ilike.%${filters.query}%`
          );
        }

        if (filters.isVerified !== undefined) {
          query = query.eq('is_verified', filters.isVerified);
        }

        if (filters.isSuspended !== undefined) {
          query = query.eq('is_suspended', filters.isSuspended);
        }

        if (filters.isBanned !== undefined) {
          query = query.eq('is_banned', filters.isBanned);
        }

        if (filters.role) {
          query = query.eq('user_roles.role', filters.role);
        }

        // Apply sorting
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.order(sortBy === 'lastActive' ? 'updated_at' : sortBy, {
          ascending: sortOrder === 'asc',
        });

        // Apply pagination
        query = query.range(offset, offset + pageSize - 1);

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw fetchError;
        }

        const users: AdminUser[] =
          data?.map((item: any) => ({
            id: item.id,
            email: item.email || '',
            fullName: item.full_name,
            displayName: item.display_name,
            profilePictureUrl: item.profile_picture_url,
            isVerified: item.is_verified || false,
            isSuspended: item.is_suspended || false,
            isBanned: item.is_banned || false,
            suspendedUntil: item.suspended_until,
            restrictions: item.restrictions || {},
            lastActive: item.updated_at,
            createdAt: item.created_at,
            role: item.user_roles?.[0]?.role,
          })) || [];

        return {
          success: true,
          data: {
            users,
            total: count || 0,
            page,
            pageSize,
          } as ListUsersResponse,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get user details with extended information
   */
  const getUserDetails = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*, user_roles(role)')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('User not found');
      }

      // Fetch wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      // Fetch match history (recent 10)
      const { data: matches } = await supabase
        .from('match_players')
        .select('match_id, matches(*)')
        .eq('player_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch teams
      const { data: teams } = await supabase
        .from('team_members')
        .select('team_id, teams(*)')
        .eq('user_id', userId);

      const userDetails: AdminUserDetails = {
        id: profile.id,
        email: profile.email || '',
        fullName: profile.full_name,
        displayName: profile.display_name,
        profilePictureUrl: profile.profile_picture_url,
        isVerified: profile.is_verified || false,
        isSuspended: profile.is_suspended || false,
        isBanned: profile.is_banned || false,
        suspendedUntil: profile.suspended_until,
        restrictions: profile.restrictions || {},
        lastActive: profile.updated_at,
        createdAt: profile.created_at,
        role: profile.user_roles?.[0]?.role,
        walletBalance: parseFloat(wallet?.balance || '0'),
        matchHistory: matches || [],
        teams: teams || [],
      };

      return { success: true, data: userDetails };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Suspend user account
   */
  const suspendUser = useCallback(
    async (userId: string, reason: string, until?: string) => {
      if (!reason) {
        return { success: false, error: 'Reason is required for suspension' };
      }

      setLoading(true);
      setError(null);

      try {
        const updateData: any = {
          is_suspended: true,
          restrictions: { suspended: true },
        };

        if (until) {
          updateData.suspended_until = until;
        }

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Log admin action
        await logAdminAction('suspend_user', 'user', userId, reason, { until });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to suspend user';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [logAdminAction]
  );

  /**
   * Unsuspend user account
   */
  const unsuspendUser = useCallback(
    async (userId: string, reason: string) => {
      setLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            is_suspended: false,
            suspended_until: null,
            restrictions: supabase.rpc('jsonb_set', {
              target: 'restrictions',
              path: '{suspended}',
              new_value: 'false',
            }),
          })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Log admin action
        await logAdminAction('unsuspend_user', 'user', userId, reason);

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to unsuspend user';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [logAdminAction]
  );

  /**
   * Permanently ban user
   */
  const banUser = useCallback(
    async (userId: string, reason: string) => {
      if (!reason) {
        return { success: false, error: 'Reason is required for ban' };
      }

      setLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            is_banned: true,
            is_suspended: true,
            restrictions: { banned: true, suspended: true },
          })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Log admin action
        await logAdminAction('ban_user', 'user', userId, reason);

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to ban user';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [logAdminAction]
  );

  /**
   * Verify user
   */
  const verifyUser = useCallback(
    async (userId: string, reason?: string, docs?: any) => {
      setLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ is_verified: true })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Log admin action
        await logAdminAction('verify_user', 'user', userId, reason, { docs });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify user';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [logAdminAction]
  );

  /**
   * Unverify user
   */
  const unverifyUser = useCallback(
    async (userId: string, reason: string) => {
      if (!reason) {
        return { success: false, error: 'Reason is required' };
      }

      setLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ is_verified: false })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Log admin action
        await logAdminAction('unverify_user', 'user', userId, reason);

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to unverify user';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [logAdminAction]
  );

  /**
   * Impose restrictions on user
   */
  const imposeRestrictions = useCallback(
    async (userId: string, restrictions: Record<string, any>, reason: string) => {
      if (!reason) {
        return { success: false, error: 'Reason is required' };
      }

      setLoading(true);
      setError(null);

      try {
        // Get current restrictions
        const { data: user } = await supabase
          .from('user_profiles')
          .select('restrictions')
          .eq('id', userId)
          .single();

        const currentRestrictions = user?.restrictions || {};
        const newRestrictions = { ...currentRestrictions, ...restrictions };

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ restrictions: newRestrictions })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Log admin action
        await logAdminAction('impose_restrictions', 'user', userId, reason, { restrictions });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to impose restrictions';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [logAdminAction]
  );

  /**
   * Revoke restrictions
   */
  const revokeRestrictions = useCallback(
    async (userId: string, restrictionKeys: string[], reason: string) => {
      if (!reason) {
        return { success: false, error: 'Reason is required' };
      }

      setLoading(true);
      setError(null);

      try {
        // Get current restrictions
        const { data: user } = await supabase
          .from('user_profiles')
          .select('restrictions')
          .eq('id', userId)
          .single();

        const currentRestrictions = user?.restrictions || {};
        const newRestrictions = { ...currentRestrictions };

        restrictionKeys.forEach((key) => {
          delete newRestrictions[key];
        });

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ restrictions: newRestrictions })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Log admin action
        await logAdminAction('revoke_restrictions', 'user', userId, reason, { restrictionKeys });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to revoke restrictions';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [logAdminAction]
  );

  /**
   * Reset user password (triggers Supabase password reset)
   */
  const resetPassword = useCallback(async (email: string, reason: string) => {
    if (!reason) {
      return { success: false, error: 'Reason is required' };
    }

    setLoading(true);
    setError(null);

    try {
      // Use Supabase auth admin API to reset password
      const { error: resetError } = await supabase.auth.admin.resetPasswordForEmail(email, {
        redirectTo: undefined, // Handle in app
      });

      if (resetError) {
        throw resetError;
      }

      // Get user ID from email
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userProfile) {
        // Log admin action
        await logAdminAction('reset_password', 'user', userProfile.id, reason);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [logAdminAction]);

  /**
   * Export users to CSV
   */
  const exportUsersCSV = useCallback(async (filters?: UserFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all users matching filters (no pagination for export)
      const result = await listUsers({ page: 1, pageSize: 10000, filters });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      // Convert to CSV format
      const headers = ['ID', 'Email', 'Full Name', 'Display Name', 'Verified', 'Suspended', 'Banned', 'Role', 'Created At'];
      const rows = result.data.users.map((u) => [
        u.id,
        u.email,
        u.fullName || '',
        u.displayName || '',
        u.isVerified ? 'Yes' : 'No',
        u.isSuspended ? 'Yes' : 'No',
        u.isBanned ? 'Yes' : 'No',
        u.role || 'player',
        u.createdAt,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      // Save to audit_snapshots
      if (user?.id) {
        await supabase.from('audit_snapshots').insert({
          snapshot_type: 'users',
          data: { users: result.data.users, filters },
          created_by: user.id,
        });
      }

      return { success: true, data: csvContent };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export users';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [listUsers, user]);

  return {
    loading,
    error,
    listUsers,
    getUserDetails,
    suspendUser,
    unsuspendUser,
    banUser,
    verifyUser,
    unverifyUser,
    imposeRestrictions,
    revokeRestrictions,
    resetPassword,
    exportUsersCSV,
  };
};

