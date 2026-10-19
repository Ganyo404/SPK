import React, { useState } from 'react';
import { spkService } from '../../services/spkService';
import { adminService } from '../../services/adminService';
import { calculateAHP, DEFAULT_AHP_6X6_MATRIX, DEFAULT_CRITERIA_CODES, SAATY_RANDOM_INDEX } from '../../lib/spk/ahp';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Sliders, CheckCircle2, AlertCircle, Save, RotateCcw, ShieldCheck, Info } from 'lucide-react';

const CRITERIA_NAMES = [
  'C1: Berat Badan (BB)',
  'C2: Tinggi Badan (TB)',
  'C3: Lingkar Kepala (LK)',
  'C4: LiLA Gizi',
  'C5: Imunisasi Dasar',
  'C6: Frekuensi Sakit',
];

export function AHPConfigPage() {
  const [matrix, setMatrix] = useState(() => {
    return DEFAULT_AHP_6X6_MATRIX.map(row => [...row]);
  });

  const [calculation, setCalculation] = useState(() => {
    return calculateAHP(DEFAULT_AHP_6X6_MATRIX, DEFAULT_CRITERIA_CODES);
  });

  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Perbarui elemen sel [i, j] dan jaga sifat resiprokal [j, i] = 1 / [i, j]
  const handleCellChange = (i, j, value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;

    const newMatrix = matrix.map(r => [...r]);
    newMatrix[i][j] = num;
    if (i !== j) {
      newMatrix[j][i] = Number((1 / num).toFixed(4));
    }

    setMatrix(newMatrix);
    const newCalc = calculateAHP(newMatrix, DEFAULT_CRITERIA_CODES);
    setCalculation(newCalc);
  };

  const handleResetDefault = () => {
    const defaultCopy = DEFAULT_AHP_6X6_MATRIX.map(r => [...r]);
    setMatrix(defaultCopy);
    setCalculation(calculateAHP(defaultCopy, DEFAULT_CRITERIA_CODES));
    setSaveSuccess('');
    setSaveError('');
  };

  const handleSaveConfiguration = () => {
    setSaveSuccess('');
    setSaveError('');

    if (!calculation.valid || !calculation.isConsistent) {
      setSaveError('Konfigurasi tidak dapat disimpan karena rasio konsistensi CR > 0.10 (Matriks tidak konsisten).');
      return;
    }

    const res = spkService.updateAHPMatrix(matrix);
    if (res.error) {
      setSaveError(res.error.message);
    } else {
      adminService.logAudit({
        actorName: 'Administrator',
        action: 'UPDATE_AHP_CONFIG',
        entityType: 'ahp_configurations',
        entityId: 'AHP-CONFIG-CUSTOM',
        reason: `Pembaruan matriks AHP dengan CR ${calculation.cr} (Konsisten)`
      });
      setSaveSuccess(`Konfigurasi AHP berhasil diperbarui dan aktif! (CR = ${calculation.cr})`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-teal-600" />
            <span>Konfigurasi Matriks AHP (Analytic Hierarchy Process)</span>
          </h1>
          <p className="text-sm text-slate-500">
            Penetapan bobot prioritas 6 kriteria balita dengan verifikasi rasio konsistensi Saaty (RI = 1.24)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Matriks Default</span>
          </button>
          <button
            onClick={handleSaveConfiguration}
            disabled={!calculation.valid || !calculation.isConsistent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Versi Bobot</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Consistency Metric Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs font-medium">Nilai Lambda Max (&lambda;<sub>max</sub>)</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{calculation.lambdaMax}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs font-medium">Consistency Index (CI)</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{calculation.ci}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs font-medium">Consistency Ratio (CR)</span>
          <p className={`text-2xl font-bold font-mono mt-1 ${calculation.isConsistent ? 'text-emerald-600' : 'text-rose-600'}`}>
            {calculation.cr}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-slate-500 text-xs font-medium">Status Konsistensi</span>
          <div className="mt-1">
            {calculation.isConsistent ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Konsisten (CR &le; 0.10)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Tidak Konsisten (CR &gt; 0.10)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Matriks Perbandingan Berpasangan 6x6 Interaktif */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Matriks Perbandingan Berpasangan 6 &times; 6</h3>
            <p className="text-xs text-slate-500">Skala Saaty 1 (sama penting) sampai 9 (mutlak lebih penting)</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Random Index n=6: 1.24</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3 text-left border-r border-slate-200">Kriteria</th>
                {DEFAULT_CRITERIA_CODES.map((code) => (
                  <th key={code} className="p-3 border-r border-slate-200 font-bold">{code}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {matrix.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-3 text-left font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50">
                    {CRITERIA_NAMES[i]}
                  </td>
                  {row.map((val, j) => {
                    const isDiagonal = i === j;
                    return (
                      <td key={j} className="p-2 border-r border-slate-200">
                        {isDiagonal ? (
                          <span className="font-bold font-mono text-slate-500 block py-1.5 bg-slate-100 rounded-lg">
                            1.0
                          </span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0.05"
                            max="9"
                            value={val}
                            onChange={(e) => handleCellChange(i, j, e.target.value)}
                            className="w-16 p-1.5 text-center font-mono text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-hidden bg-white"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hasil Bobot Kriteria yang Dihasilkan */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Bobot Prioritas Hasil Perhitungan (Weights)</h3>
          <p className="text-xs text-slate-500">Bobot ini otomatis diterapkan dalam modul Simple Additive Weighting (SAW)</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DEFAULT_CRITERIA_CODES.map((code, idx) => {
            const weight = calculation.weights[idx] || 0;
            return (
              <div key={code} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-700 block mb-1">{code}</span>
                <span className="text-xl font-bold font-mono text-teal-700 block">
                  {(weight * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                  w = {weight.toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
