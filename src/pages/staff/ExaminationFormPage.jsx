import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { childService } from '../../services/childService';
import { examinationService } from '../../services/examinationService';
import { spkService } from '../../services/spkService';
import { MOCK_CRITERIA } from '../../lib/mockData';
import {
  Stethoscope,
  Baby,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  Scale,
  Ruler,
  Brain,
  Activity,
  Heart,
  ShieldAlert,
  Info,
  History,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export function ExaminationFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('childId');

  const { user, profile } = useAuth();

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(childIdParam || '');
  const [previousExam, setPreviousExam] = useState(null);
  const [periodCode, setPeriodCode] = useState('2026-10');
  const [notes, setNotes] = useState('');

  // 6 Kriteria Nilai
  const [values, setValues] = useState({
    C1: '', // Berat Badan (kg)
    C2: '', // Tinggi Badan (cm)
    C3: '', // Lingkar Kepala (cm)
    C4: '', // LiLA (cm)
    C5: '100', // Imunisasi (%)
    C6: '0',   // Sakit (kali)
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      const { data } = await childService.getAllChildren();
      if (data) {
        setChildren(data);
        if (!selectedChildId && data.length > 0) {
          setSelectedChildId(data[0].id);
        }
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function loadPreviousExam() {
      if (selectedChildId) {
        const { data } = await examinationService.getLatestVerifiedExamination(selectedChildId);
        setPreviousExam(data || null);
      } else {
        setPreviousExam(null);
      }
    }
    loadPreviousExam();
  }, [selectedChildId]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  const handleInputChange = (code, val) => {
    setValues(prev => ({ ...prev, [code]: val }));
  };

  const validateAllCriteria = () => {
    for (const crit of MOCK_CRITERIA) {
      const val = Number(values[crit.code]);
      if (isNaN(val) || values[crit.code] === '') {
        return `Kriteria ${crit.code} (${crit.name}) wajib diisi angka.`;
      }
      const rules = crit.validation_rules || {};
      if (rules.min !== undefined && val < rules.min) {
        return `Nilai ${crit.name} tidak boleh kurang dari ${rules.min} ${crit.unit}.`;
      }
      if (rules.max !== undefined && val > rules.max) {
        return `Nilai ${crit.name} tidak boleh melebihi ${rules.max} ${crit.unit}.`;
      }
    }
    return null;
  };

  // Simpan sebagai draf / pending verification
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErr = validateAllCriteria();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    try {
      const res = await examinationService.saveExaminationDraft({
        childId: selectedChildId,
        periodCode,
        notes,
        values,
        recordedBy: user?.id || 'u-staff-1',
        recordedByName: profile?.full_name || 'Bdn. Dewi Anggraini, S.Tr.Keb'
      });

      if (res.error) {
        setError(res.error.message || 'Gagal menyimpan draf pemeriksaan.');
      } else {
        setSuccess('Draf pemeriksaan berhasil disimpan.');
        setTimeout(() => {
          navigate('/staff/examinations/pending');
        }, 1000);
      }
    } catch (err) {
      setError('Terjadi kendala saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  // Verifikasi langsung dan hitung
  const handleVerifyAndCalculate = async () => {
    setError('');
    setSuccess('');

    const validationErr = validateAllCriteria();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setVerifying(true);
    try {
      // 1. Simpan pemeriksaan
      const draftRes = await examinationService.saveExaminationDraft({
        childId: selectedChildId,
        periodCode,
        notes,
        values,
        recordedBy: user?.id || 'u-staff-1',
        recordedByName: profile?.full_name || 'Bdn. Dewi Anggraini, S.Tr.Keb'
      });

      if (draftRes.error) {
        setError(draftRes.error.message);
        setVerifying(false);
        return;
      }

      // 2. Verifikasi status menjadi 'verified'
      await examinationService.verifyExamination(
        draftRes.data.id,
        user?.id || 'u-staff-1',
        profile?.full_name || 'Bdn. Dewi Anggraini, S.Tr.Keb'
      );

      // 3. Picu perhitungan AHP+SAW untuk kelompok tahun kelahiran anak & periode tersebut
      const birthYear = selectedChild ? new Date(selectedChild.date_of_birth).getFullYear() : 2024;
      await spkService.runCalculationForCohort({
        birthYear,
        periodCode,
        createdBy: profile?.full_name || 'Petugas Posyandu'
      });

      setSuccess('Pemeriksaan berhasil diverifikasi dan hasil SPK berhasil diperbarui!');
      setTimeout(() => {
        navigate(`/parent/children/${selectedChildId}`);
      }, 1200);
    } catch (err) {
      setError('Terjadi kendala saat memproses verifikasi dan perhitungan SPK.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-teal-600" />
          <span>Form Pencatatan Pemeriksaan Balita</span>
        </h1>
        <p className="text-sm text-slate-500">
          Pencatatan 6 kriteria fisik tumbuh kembang balita sesuai standar KMS dan Posyandu
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSaveDraft} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Pilih Balita & Periode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pilih Balita yang Diperiksa
            </label>
            <div className="relative">
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:border-teal-600 outline-hidden"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Lahir: {c.date_of_birth} — Orang Tua: {c.parent_name || 'Ibu'})
                  </option>
                ))}
              </select>
            </div>
            {selectedChild && (
              <p className="mt-1.5 text-xs text-slate-500">
                Tahun Kelahiran: <strong className="text-teal-700">{new Date(selectedChild.date_of_birth).getFullYear()}</strong> • 
                Jenis Kelamin: <strong>{selectedChild.sex === 'P' ? 'Perempuan' : 'Laki-Laki'}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Periode Pemeriksaan (Bulan - Tahun)
            </label>
            <div className="relative">
              <select
                value={periodCode}
                onChange={(e) => setPeriodCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono focus:border-teal-600 outline-hidden"
              >
                <option value="2026-10">2026-10 (Oktober 2026)</option>
                <option value="2026-09">2026-09 (September 2026)</option>
                <option value="2026-08">2026-08 (Agustus 2026)</option>
                <option value="2026-07">2026-07 (Juli 2026)</option>
              </select>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Aturan isolasi: alternatif hanya dibandingkan dalam periode yang sama.
            </p>
          </div>
        </div>

        {/* Banner Riwayat Kunjungan Bulan Sebelumnya */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-slate-50 to-blue-50/80 border border-teal-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Riwayat Kunjungan & Timbangan Bulan Sebelumnya
                </h4>
                <p className="text-xs text-slate-500">
                  Data antropometri historis balita untuk rujukan perbandingan dokter/nakes
                </p>
              </div>
            </div>

            {selectedChildId && (
              <button
                type="button"
                onClick={() => navigate(`/staff/children/${selectedChildId}`)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Buka Grafik & Riwayat Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {previousExam ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Periode Terakhir</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {previousExam.period_code}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Tgl: {previousExam.examined_at?.split('T')[0]}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-teal-200 shadow-2xs">
                <span className="text-teal-700 block text-[11px] font-semibold">BB Bulan Lalu</span>
                <span className="font-bold text-teal-900 text-base">
                  {previousExam.values?.C1} <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
                {values.C1 && !isNaN(Number(values.C1)) && (
                  <span className={`block text-[10px] font-bold mt-0.5 ${
                    Number(values.C1) >= Number(previousExam.values?.C1) ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {Number(values.C1) >= Number(previousExam.values?.C1)
                      ? `▲ +${(Number(values.C1) - Number(previousExam.values?.C1)).toFixed(2)} kg`
                      : `▼ ${(Number(values.C1) - Number(previousExam.values?.C1)).toFixed(2)} kg`}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs">
                <span className="text-blue-700 block text-[11px] font-semibold">TB Bulan Lalu</span>
                <span className="font-bold text-blue-900 text-base">
                  {previousExam.values?.C2} <span className="text-xs font-normal text-slate-500">cm</span>
                </span>
                {values.C2 && !isNaN(Number(values.C2)) && (
                  <span className="block text-[10px] font-bold text-blue-600 mt-0.5">
                    {Number(values.C2) >= Number(previousExam.values?.C2)
                      ? `▲ +${(Number(values.C2) - Number(previousExam.values?.C2)).toFixed(1)} cm`
                      : `${(Number(values.C2) - Number(previousExam.values?.C2)).toFixed(1)} cm`}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white border border-purple-200 shadow-2xs">
                <span className="text-purple-700 block text-[11px] font-semibold">LiLA Bulan Lalu</span>
                <span className="font-bold text-purple-900 text-base">
                  {previousExam.values?.C4} <span className="text-xs font-normal text-slate-500">cm</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-400 mt-0.5">
                  {previousExam.values?.C4 >= 12.5 ? 'Gizi Cukup' : 'Waspada Kurang'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-500 italic">
              Balita ini belum memiliki riwayat pemeriksaan fisik terverifikasi (kunjungan pertama).
            </div>
          )}
        </div>

        {/* 6 Kriteria Input */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Pengukuran Enam Kriteria Fisik</h3>
              <p className="text-xs text-slate-500">Isi data antropometri dan riwayat kesehatan secara akurat</p>
            </div>
            <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Standar KMS / Posyandu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* C1: Berat Badan */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">C1. Berat Badan</span>
                <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100/60 px-1.5 py-0.5 rounded">Benefit</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  required
                  placeholder="Misal: 12.5"
                  value={values.C1}
                  onChange={(e) => handleInputChange('C1', e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">kg</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Rentang valid: 2.0 s/d 30.0 kg</p>
            </div>

            {/* C2: Tinggi Badan */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">C2. Tinggi / Panjang</span>
                <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100/60 px-1.5 py-0.5 rounded">Benefit</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Misal: 88.5"
                  value={values.C2}
                  onChange={(e) => handleInputChange('C2', e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Rentang valid: 45.0 s/d 130.0 cm</p>
            </div>

            {/* C3: Lingkar Kepala */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">C3. Lingkar Kepala</span>
                <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100/60 px-1.5 py-0.5 rounded">Benefit</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Misal: 47.0"
                  value={values.C3}
                  onChange={(e) => handleInputChange('C3', e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Rentang valid: 30.0 s/d 60.0 cm</p>
            </div>

            {/* C4: LiLA */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">C4. LiLA Gizi</span>
                <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100/60 px-1.5 py-0.5 rounded">Benefit</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Misal: 15.5"
                  value={values.C4}
                  onChange={(e) => handleInputChange('C4', e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Ambang waspada gizi: &lt; 12.5 cm</p>
            </div>

            {/* C5: Imunisasi Dasar */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">C5. Cakupan Imunisasi</span>
                <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100/60 px-1.5 py-0.5 rounded">Benefit</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="Misal: 100"
                  value={values.C5}
                  onChange={(e) => handleInputChange('C5', e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Persentase lengkap (0 - 100%)</p>
            </div>

            {/* C6: Frekuensi Sakit (Cost) */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">C6. Sakit (6 Bln Terakhir)</span>
                <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-1.5 py-0.5 rounded">Cost</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="15"
                  required
                  placeholder="0 jika sehat"
                  value={values.C6}
                  onChange={(e) => handleInputChange('C6', e.target.value)}
                  className="w-full p-2.5 pr-12 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">kali</span>
              </div>
              <p className="mt-1.5 text-[11px] text-rose-800">Makin sedikit makin baik (0 = prima)</p>
            </div>
          </div>
        </div>

        {/* Catatan Petugas */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Catatan Tambahan & Tindak Lanjut Petugas
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan catatan kondisi khusus, nafsu makan, kebiasaan MPASI, atau instruksi pemantauan berikutnya..."
            className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:border-teal-600 outline-hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading || verifying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Menyimpan...' : 'Simpan sebagai Draf'}</span>
          </button>

          <button
            type="button"
            onClick={handleVerifyAndCalculate}
            disabled={loading || verifying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{verifying ? 'Memverifikasi & Menghitung SPK...' : 'Verifikasi & Hitung SAW'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
