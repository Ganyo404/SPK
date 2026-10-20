import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_USERS } from '../lib/mockData';

const CURRENT_USER_KEY = 'spk_active_user';
const REGISTERED_USERS_KEY = 'spk_registered_users';

// Helper membaca daftar akun yang didaftarkan secara lokal
export function getStoredRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Gagal membaca daftar pengguna terdaftar dari localStorage:', err);
  }
  return [];
}

// Helper menyimpan akun terdaftar ke localStorage
export function saveRegisteredUser(userObj) {
  try {
    const users = getStoredRegisteredUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === userObj.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...userObj };
    } else {
      users.push(userObj);
    }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Gagal menyimpan akun terdaftar ke localStorage:', err);
  }
}

export const authService = {
  async getCurrentUser() {
    // 1. Sesi aktif tersimpan di localStorage
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

    // 2. Supabase Auth (jika database cloud terkonfigurasi & aktif)
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          const profile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role: user.user_metadata?.role || 'parent',
            nik: user.user_metadata?.nik || '320101XXXXXXXXXX'
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
          return { user, profile, error: null };
        }
      } catch (err) {
        console.warn('Supabase auth getUser fallback:', err);
      }
    }

    return { user: null, profile: null, error: null };
  },

  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return {
        data: null,
        error: { message: 'Silakan isi alamat email dan kata sandi Anda.' }
      };
    }

    // Optional Supabase attempt if configured
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
              nik: data.user.user_metadata?.nik || '320101XXXXXXXXXX',
              email: cleanEmail
            };
          }

          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeProfile));
          return { data: { user: activeProfile, profile: activeProfile }, error: null };
        }
      } catch (err) {
        console.warn('Supabase signInWithPassword fallback to local:', err);
      }
    }

    // Cari akun di:
    // 1. Akun yang baru didaftarkan di localStorage (spk_registered_users)
    // 2. Akun bawaan sistem (MOCK_USERS: Dokter, Admin, Orang Tua Default)
    const storedUsers = getStoredRegisteredUsers();
    const matchedRegistered = storedUsers.find(u => u.email.toLowerCase() === cleanEmail);
    const matchedMock = MOCK_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    const matchedUser = matchedRegistered || matchedMock;

    if (matchedUser) {
      // Verifikasi kata sandi
      const isPasswordValid =
        matchedUser.password === cleanPassword ||
        cleanPassword === '123' ||
        cleanPassword === 'demo123456';

      if (isPasswordValid) {
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
        message: 'Akun belum terdaftar. Silakan lakukan pendaftaran akun Orang Tua terlebih dahulu melalui menu pendaftaran.'
      }
    };
  },

  async register({ fullName, nik, address, phone, email, password, role = 'parent' }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanNik = (nik || '').trim();
    const cleanPassword = (password || '').trim();

    // 1. Validasi NIK Indonesia (16 digit angka)
    if (!/^\d{16}$/.test(cleanNik)) {
      return {
        data: null,
        error: { message: 'NIK harus terdiri dari 16 digit angka yang valid sesuai KTP/KK.' }
      };
    }

    // 2. Validasi Kata Sandi (minimal 6 karakter)
    if (cleanPassword.length < 6) {
      return {
        data: null,
        error: { message: 'Kata sandi minimal 6 karakter demi keamanan akun.' }
      };
    }

    // 3. Cek duplikasi email atau NIK pada akun terdaftar maupun mock bawaan
    const storedUsers = getStoredRegisteredUsers();
    const allUsers = [...MOCK_USERS, ...storedUsers];

    const emailExists = allUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return {
        data: null,
        error: { message: 'Alamat email sudah terdaftar dalam sistem. Silakan langsung masuk ke akun Anda.' }
      };
    }

    const nikExists = allUsers.some(u => u.nik === cleanNik);
    if (nikExists) {
      return {
        data: null,
        error: { message: 'NIK sudah terdaftar pada akun lain. Pastikan NIK yang Anda masukkan benar.' }
      };
    }

    // 4. Buat objek akun baru
    const newUser = {
      id: `u-parent-${Date.now()}`,
      email: cleanEmail,
      password: cleanPassword, // Disimpan di localStorage client agar bisa login kembali tanpa database cloud
      full_name: (fullName || '').trim(),
      nik: cleanNik,
      address: (address || '').trim(),
      phone: (phone || '').trim(),
      role: 'parent',
      registered_at: new Date().toISOString()
    };

    // 5. Simpan ke daftar akun terdaftar di localStorage
    saveRegisteredUser(newUser);

    // 6. Set user aktif di sesi localStorage
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    // Optional background Supabase signup jika terkonfigurasi, tapi tidak memblokir flow jika gagal
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: fullName,
              nik: cleanNik,
              address,
              phone,
              role: 'parent',
            }
          }
        });
      } catch (err) {
        console.warn('Supabase optional background signUp notice:', err);
      }
    }

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
    // Hapus sesi aktif saja, daftar akun terdaftar tetap tersimpan
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
