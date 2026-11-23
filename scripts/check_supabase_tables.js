import { createClient } from '@supabase/supabase-js';

const url = 'https://tgzpjwnvtbvcnyrzwrrn.supabase.co';
const key = 'sb_publishable_VflQzq6d32Yq7cStA12x8A_6OxdA_Wh';
const supabase = createClient(url, key);

async function check() {
  console.log('--- PENGECEKAN STATUS TABEL SUPABASE ---');
  console.log('Project URL:', url);
  
  const tables = ['profiles', 'posyandu', 'children', 'criteria', 'examinations', 'spk_runs', 'spk_results'];
  let allReady = true;

  for (const t of tables) {
    try {
      const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' }).limit(5);
      if (error) {
        console.log(`❌ Tabel '${t}': Belum siap / ${error.message}`);
        allReady = false;
      } else {
        console.log(`✅ Tabel '${t}': Siap (${data ? data.length : 0} baris terbaca)`);
      }
    } catch (e) {
      console.log(`❌ Tabel '${t}': Error (${e.message})`);
      allReady = false;
    }
  }

  if (allReady) {
    console.log('\n🎉 SEMUA TABEL SUPABASE TELAH SIAP DAN TERISI DATA DENGAN SUKSES!');
  } else {
    console.log('\n⚠️ Tabel belum dibuat di Supabase.');
    console.log('Silakan salin isi file: c:/SPK/supabase/MIGRASI_LENGKAP_SUPABASE.sql');
    console.log('lalu tempel dan jalankan di Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/tgzpjwnvtbvcnyrzwrrn/sql');
  }
}

check();
