import React, { useState } from 'react';
import { spkService } from '../../services/spkService';
import { adminService } from '../../services/adminService';
import {
  calculateAHP,
  DEFAULT_AHP_5X5_MATRIX,
  DEFAULT_5_CRITERIA_CODES,
  DEFAULT_AHP_4X4_MATRIX,
  DEFAULT_4_CRITERIA_CODES,
  SAATY_RANDOM_INDEX
} from '../../lib/spk/ahp';
import { Sliders, CheckCircle2, AlertCircle, Save, RotateCcw } from 'lucide-react';

const CRITERIA_5_NAMES = [
  'K1: Berat Badan (BB/U)',
  'K2: Tinggi/Panjang (PB/TB)',
  'K3: Lingkar Kepala (LK/U)',
  'K4: Kelengkapan Imunisasi',
  'K5: Asupan Gizi & PMBA',
];

const CRITERIA_4_NAMES = [
  'K1: Berat Badan (BB/U)',
  'K2: Tinggi/Panjang (PB/TB)',
  'K3: Lingkar Kepala (LK/U)',
  'K4: Kelengkapan Imunisasi',
];

export function AHPConfigPage() {
  const [activeModel, setActiveModel] = useState('5'); // '5' or '4'

  const [matrix5, setMatrix5] = useState(() => DEFAULT_AHP_5X5_MATRIX.map(row => [...row]));
  const [matrix4, setMatrix4] = useState(() => DEFAULT_AHP_4X4_MATRIX.map(row => [...row]));

  const [calculation5, setCalculation5] = useState(() => calculateAHP(DEFAULT_AHP_5X5_MATRIX, DEFAULT_5_CRITERIA_CODES));
  const [calculation4, setCalculation4] = useState(() => calculateAHP(DEFAULT_AHP_4X4_MATRIX, DEFAULT_4_CRITERIA_CODES));

  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const isModel4 = activeModel === '4';
  const currentMatrix = isModel4 ? matrix4 : matrix5;
  const currentCalc = isModel4 ? calculation4 : calculation5;
  const criteriaNames = isModel4 ? CRITERIA_4_NAMES : CRITERIA_5_NAMES;
  const criteriaCodes = isModel4 ? DEFAULT_4_CRITERIA_CODES : DEFAULT_5_CRITERIA_CODES;

  // Perbarui elemen sel [i, j] dan jaga sifat resiprokal [j, i] = 1 / [i, j]
  const handleCellChange = (i, j, value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;

    if (isModel4) {
      const newM = matrix4.map(r => [...r]);
      newM[i][j] = num;
      if (i !== j) newM[j][i] = Number((1 / num).toFixed(4));
      setMatrix4(newM);
      setCalculation4(calculateAHP(newM, DEFAULT_4_CRITERIA_CODES));
    } else {
      const newM = matrix5.map(r => [...r]);
      newM[i][j] = num;
      if (i !== j) newM[j][i] = Number((1 / num).toFixed(4));
      setMatrix5(newM);
      setCalculation5(calculateAHP(newM, DEFAULT_5_CRITERIA_CODES));
    }
  };

  const handleResetDefault = () => {
    if (isModel4) {
      const copy = DEFAULT_AHP_4X4_MATRIX.map(r => [...r]);
      setMatrix4(copy);
      setCalculation4(calculateAHP(copy, DEFAULT_4_CRITERIA_CODES));
    } else {
      const copy = DEFAULT_AHP_5X5_MATRIX.map(r => [...r]);
      setMatrix5(copy);
      setCalculation5(calculateAHP(copy, DEFAULT_5_CRITERIA_CODES));
    }
    setSaveSuccess('');
    setSaveError('');
  };

  const handleSaveConfiguration = () => {
    setSaveSuccess('');
    setSaveError('');

    if (!currentCalc.valid || !currentCalc.isConsistent) {
      setSaveError('Konfigurasi tidak dapat disimpan karena rasio konsistensi CR > 0.10 (Matriks tidak konsisten).');
      return;
    }

    const res = spkService.updateAHPMatrix(currentMatrix, isModel4 ? 1 : 4);
    if (res.error) {
      setSaveError(res.error.message);
    } else {
      adminService.logAudit({
        actorName: 'Administrator',
        action: 'UPDATE_AHP_CONFIG',
        entityType: 'ahp_configurations',
        entityId: isModel4 ? 'AHP-CONFIG-4K' : 'AHP-CONFIG-5K',
        reason: `Pembaruan matriks AHP ${isModel4 ? '4 Kriteria' : '5 Kriteria'} dengan CR ${currentCalc.cr} (Konsisten)`
      });
      setSaveSuccess(`Konfigurasi AHP (${isModel4 ? '4 Kriteria < 6 Bulan' : '5 Kriteria \u2265 6 Bulan'}) berhasil diperbarui! (CR = ${currentCalc.cr})`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-teal-600" />
            <span>Konfigurasi Bobot AHP</span>
          </h1>
          <p className="text-sm text-slate-500">
            Penetapan bobot prioritas kriteria balita dan verifikasi rasio konsistensi (CR &le; 0.10)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <button
            onClick={handleSaveConfiguration}
            disabled={!currentCalc.valid || !currentCalc.isConsistent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Versi Bobot</span>
          </button>
        </div>
      </div>

      {/* Model Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-max">
        <button
          onClick={() => { setActiveModel('5'); setSaveSuccess(''); setSaveError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !isModel4
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Model 5 Kriteria (Usia &ge; 6 Bulan)
        </button>
        <button
          onClick={() => { setActiveModel('4'); setSaveSuccess(''); setSaveError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isModel4
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Model 4 Kriteria (Usia &lt; 6 Bulan — ASI Eksklusif)
        </button>
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
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{currentCalc.lambdaMax}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs font-medium">Consistency Index (CI)</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{currentCalc.ci}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs font-medium">Consistency Ratio (CR)</span>
          <p className={`text-2xl font-bold font-mono mt-1 ${currentCalc.isConsistent ? 'text-emerald-600' : 'text-rose-600'}`}>
            {currentCalc.cr}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-slate-500 text-xs font-medium">Status Konsistensi</span>
          <div className="mt-1">
            {currentCalc.isConsistent ? (
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

      {/* Matriks Perbandingan Berpasangan Interaktif */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Matriks Perbandingan Berpasangan {isModel4 ? '4 \u00d7 4' : '5 \u00d7 5'}
            </h3>
            <p className="text-xs text-slate-500">
              {isModel4
                ? 'Model 4 Kriteria untuk balita usia < 6 bulan (Fase ASI Eksklusif, K5 nonaktif)'
                : 'Model 5 Kriteria Permenkes No. 2/2020 untuk balita usia \u2265 6 bulan'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Random Index n={currentMatrix.length}: {SAATY_RANDOM_INDEX[currentMatrix.length]}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3 text-left border-r border-slate-200">Kriteria</th>
                {criteriaCodes.map((code) => (
                  <th key={code} className="p-3 border-r border-slate-200 font-bold">{code}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-3 text-left font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50">
                    {criteriaNames[i]}
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

        <div className={`grid gap-3 ${isModel4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
          {criteriaCodes.map((code, idx) => {
            const weight = currentCalc.weights[idx] || 0;
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
