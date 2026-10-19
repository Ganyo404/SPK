import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_USERS, MOCK_POSYANDU, MOCK_AUDIT_LOGS } from '../lib/mockData';

let usersStore = [...MOCK_USERS];
let posyanduStore = [...MOCK_POSYANDU];
let auditStore = [...MOCK_AUDIT_LOGS];

export const adminService = {
  async getUsers() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return { data, error };
    }
    return { data: [...usersStore], error: null };
  },

  async updateUserRole(userId, newRole) {
    if (!['parent', 'staff', 'admin'].includes(newRole)) {
      return { data: null, error: { message: 'Peran tidak valid.' } };
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    }

    const idx = usersStore.findIndex(u => u.id === userId);
    if (idx !== -1) {
      usersStore[idx].role = newRole;
      this.logAudit({
        actorName: 'Administrator',
        action: 'UPDATE_ROLE',
        entityType: 'profiles',
        entityId: userId,
        reason: `Mengubah peran pengguna menjadi ${newRole}`
      });
      return { data: usersStore[idx], error: null };
    }
    return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };
  },

  async getPosyandus() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('posyandu').select('*').order('name');
      return { data, error };
    }
    return { data: [...posyanduStore], error: null };
  },

  async createPosyandu({ name, address, rw_rt, village, district }) {
    if (!name || !address) {
      return { data: null, error: { message: 'Nama dan alamat Posyandu wajib diisi.' } };
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('posyandu')
        .insert({ name, address, rw_rt, village, district })
        .select()
        .single();
      return { data, error };
    }

    const newPosyandu = {
      id: `posyandu-${Date.now()}`,
      name,
      address,
      rw_rt: rw_rt || '-',
      village: village || '-',
      district: district || '-',
      is_active: true
    };
    posyanduStore.push(newPosyandu);
    return { data: newPosyandu, error: null };
  },

  async getAuditLogs() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      return { data, error };
    }
    return { data: [...auditStore], error: null };
  },

  logAudit({ actorName, action, entityType, entityId, reason }) {
    auditStore.unshift({
      id: `log-${Date.now()}`,
      actor_name: actorName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      reason,
      created_at: new Date().toISOString()
    });
  }
};
