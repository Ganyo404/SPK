import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_USERS } from '../lib/mockData';

const CURRENT_USER_KEY = 'spk_active_user';

export const authService = {
  async getCurrentUser() {
    if (isSupabaseConfigured()) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return { user: null, profile: null };

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { user, profile: profile || null, error: profileErr };
    }

    // Local / Demo Mode
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    const user = saved ? JSON.parse(saved) : MOCK_USERS[0]; // Default to parent
    return { user, profile: user, error: null };
  },

  async login(email, password) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { data: null, error };

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return { data: { ...data, profile }, error: null };
    }

    // Local / Demo Mode Match
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
      return { data: { user: found, profile: found }, error: null };
    }

    return {
      data: null,
      error: { message: 'Email atau kata sandi tidak sesuai. Periksa kembali data Anda.' }
    };
  },

  async register({ fullName, nik, address, phone, email, password, role = 'parent' }) {
    // Validasi NIK Indonesia (16 digit angka)
    if (!/^\d{16}$/.test(nik)) {
      return {
        data: null,
        error: { message: 'NIK harus terdiri dari 16 digit angka yang valid sesuai KTP/KK.' }
      };
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            nik,
            address,
            phone,
            role: 'parent', // Keamanan: pendaftaran publik selalu parent
          }
        }
      });
      return { data, error };
    }

    // Local / Demo Mode: Cek keunikan NIK dan Email
    const emailExists = MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { data: null, error: { message: 'Alamat email sudah terdaftar dalam sistem.' } };
    }

    const nikExists = MOCK_USERS.some(u => u.nik === nik);
    if (nikExists) {
      return { data: null, error: { message: 'NIK sudah terdaftar pada akun lain.' } };
    }

    const newUser = {
      id: `u-parent-${Date.now()}`,
      email,
      full_name: fullName,
      nik,
      address,
      phone,
      role: 'parent'
    };

    MOCK_USERS.push(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { data: { user: newUser, profile: newUser }, error: null };
  },

  async logout() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    return { error: null };
  },

  // Helper untuk testing/switching role dalam pengujian
  switchDemoRole(role) {
    const target = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(target));
    return target;
  }
};
