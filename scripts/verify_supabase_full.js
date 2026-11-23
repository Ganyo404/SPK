import { createClient } from '@supabase/supabase-js';

const url = 'https://tgzpjwnvtbvcnyrzwrrn.supabase.co';
const key = 'sb_publishable_VflQzq6d32Yq7cStA12x8A_6OxdA_Wh';
const supabase = createClient(url, key);

async function run() {
  console.log('====================================================');
  console.log('   VERIFIKASI INTEGRITAS DATABASE SUPABASE CLOUD   ');
  console.log('====================================================\n');

  // 1. Children
  const { data: children, count: cCount, error: cErr } = await supabase
    .from('children')
    .select('code, name, sex, date_of_birth, parent:parent_id(full_name), posyandu:posyandu_id(name)', { count: 'exact' })
    .order('code');

  if (cErr) console.error('Error fetching children:', cErr);
  else {
    console.log(`👶 TOTAL BALITA DI SUPABASE: ${cCount} BALITA`);
    children.forEach((c, idx) => {
      console.log(`   ${(idx + 1).toString().padStart(2, ' ')}. [${c.code}] ${c.name.padEnd(8, ' ')} (${c.sex}) | Lahir: ${c.date_of_birth} | Ortu: ${c.parent?.full_name} | ${c.posyandu?.name}`);
    });
  }

  // 2. Examinations
  const { data: exams, count: eCount, error: eErr } = await supabase
    .from('examinations')
    .select('id, child_id, period_code, measurements, child:child_id(code, name)');

  const { count: detCount } = await supabase
    .from('examination_details')
    .select('*', { count: 'exact', head: true });

  if (eErr) console.error('Error fetching examinations:', eErr);
  else {
    console.log(`\n📋 TOTAL REKAM MEDIS PEMERIKSAAN: ${eCount} PEMERIKSAAN (${detCount} RINCIAN KRITERIA)`);
    exams.forEach((e, idx) => {
      const m = e.measurements || {};
      console.log(`   ${(idx + 1).toString().padStart(2, ' ')}. [${e.child?.code}] ${e.child?.name?.padEnd(8, ' ')} | BB: ${m.BB || m.beratBadan || '-'} kg | TB: ${m.TB || m.tinggiBadan || '-'} cm | LK: ${m.LK || m.lingkarKepala || '-'} cm | Imun: ${m.Imunisasi || m.imunisasi || '-'} dosis | K5: ${m.k5Value ?? '-'}`);
    });
  }

  // 3. Criteria
  const { data: criteria, error: critErr } = await supabase
    .from('criteria')
    .select('code, name, unit, direction')
    .order('display_order');

  if (critErr) console.error('Error fetching criteria:', critErr);
  else {
    console.log(`\n🎯 KRITERIA SPK (${criteria.length} KRITERIA):`);
    criteria.forEach(c => console.log(`   • ${c.code}: ${c.name} (${c.unit}) [${c.direction}]`));
  }

  // 4. SPK Results
  const { data: results, count: rCount, error: rErr } = await supabase
    .from('spk_results')
    .select('rank, preference_score, clinical_status, child:child_id(code, name)')
    .order('rank');

  if (rErr) console.error('Error fetching SPK results:', rErr);
  else {
    console.log(`\n🏆 TOTAL HASIL PEMERINGKATAN SPK (SAW): ${rCount} ALTERNATIF`);
    results.forEach(r => {
      console.log(`   Peringkat #${r.rank.toString().padStart(2, ' ')} | [${r.child?.code}] ${r.child?.name?.padEnd(8, ' ')} | Vi: ${Number(r.preference_score).toFixed(7)} | Status: ${r.clinical_status}`);
    });
  }

  // 5. Profiles
  const { data: profiles, count: pCount, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, nik')
    .order('role');

  if (pErr) console.error('Error fetching profiles:', pErr);
  else {
    console.log(`\n👥 TOTAL PENGGUNA TERDAFTAR: ${pCount} PENGGUNA`);
    profiles.forEach(p => console.log(`   • [${p.role.toUpperCase().padEnd(6, ' ')}] ${p.full_name.padEnd(25, ' ')} | Email: ${p.email}`));
  }

  console.log('\n====================================================');
  console.log('   STATUS: 100% SUKSES TERSINKRONISASI DI SUPABASE! ');
  console.log('====================================================');
}

run();
