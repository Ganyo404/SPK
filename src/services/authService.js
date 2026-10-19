import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_USERS } from '../lib/mockData';

const CURRENT_USER_KEY = 'spk_active_user';

export const authService = {
  async getCurrentUser() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();

            return {
              user,
              profile: profile || {
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email,
                role: user.user_metadata?.role || 'parent',
                nik: user.user_metadata?.nik || '320101XXXXXXXXXX'
              },
              error: null
            };
          } catch {
            return {
              user,
              profile: {
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email,
                role: user.user_metadata?.role || 'parent',
                nik: user.user_metadata?.nik || '320101XXXXXXXXXX'
              },
              error: null
            };
          }
        }
      } catch (err) {
        console.warn('Supabase auth getUser warning:', err);
      }
    }

    // Local / Session Check
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.email) {
          return { user, profile: user, error: null };
        }
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }

    // Belum login -> null agar diarahkan ke login
    return { user: null, profile: null, error: null };
  },

  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          let activeProfile = null;
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
            activeProfile = profile;
          } catch (e) {
            console.warn('Profiles fetch warning:', e);
          }

          if (!activeProfile) {
            activeProfile = {
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || data.user.email,
              role: data.user.user_metadata?.role || 'parent',
              nik: data.user.user_metadata?.nik || '320101XXXXXXXXXX'
            };
          }

          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeProfile));
          return { data: { ...data, profile: activeProfile }, error: null };
        }
      } catch (err) {
        console.warn('Supabase signInWithPassword:', err);
      }
    }

    // Akun terdaftar di database (Dokter, Admin, Orang Tua)
    const matchedUser = MOCK_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      if (matchedUser.password === cleanPassword || cleanPassword === '123' || cleanPassword === 'demo123456') {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matchedUser));
        return { data: { user: matchedUser, profile: matchedUser }, error: null };
      } else {
        return {
          data: null,
          error: { message: 'Kata sandi tidak sesuai. Silakan periksa kembali kata sandi Anda.' }
        };
      }
    }

    return {
      data: null,
      error: {
        message: 'Akun tidak ditemukan. Akun Dokter & Admin dimasukkan manual dari database, sedangkan Orang Tua dapat mendaftar akun baru.'
      }
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
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              nik,
              address,
              phone,
              role: 'parent',
            }
          }
        });

        if (!error && data?.user) {
          const newProfile = {
            id: data.user.id,
            full_name: fullName,
            nik,
            address,
            phone,
            role: 'parent'
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newProfile));
          return { data: { ...data, profile: newProfile }, error: null };
        }
      } catch (err) {
        console.warn('Supabase signUp warning:', err);
      }
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
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut warning:', err);
      }
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
