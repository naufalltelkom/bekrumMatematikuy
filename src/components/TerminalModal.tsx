import React, { useState, useEffect, useRef } from 'react';
import { PuzzleData } from '../game/types';
import { sound } from '../game/audio';
import {
  X,
  Terminal as TerminalIcon,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FunctionSquare,
} from 'lucide-react';

interface TerminalModalProps {
  puzzle: PuzzleData;
  lives: number;
  onClose: () => void;
  onSolve: () => void;
  onWrongAnswer: () => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({
  puzzle,
  lives,
  onClose,
  onSolve,
  onWrongAnswer,
}) => {
  // For EASY level, player picks 'f' or 'g' before solving
  const [selectedBranch, setSelectedBranch] = useState<'f' | 'g' | null>(
    puzzle.difficulty === 'EASY' ? null : 'f'
  );
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [activeTab, setActiveTab] = useState<'puzzle' | 'helper'>('puzzle');

  const input1Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sound.playTerminalOpen();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      setTimeout(() => input1Ref.current?.focus(), 60);
    }
  }, [selectedBranch]);

  // Resolve active questions and displayed functions based on difficulty & choice
  const activeQuestions =
    puzzle.difficulty === 'EASY' && puzzle.easyBranches && selectedBranch
      ? puzzle.easyBranches[selectedBranch].questions
      : puzzle.questions;

  const activeFunctions =
    puzzle.difficulty === 'EASY' && puzzle.easyBranches && selectedBranch
      ? [puzzle.easyBranches[selectedBranch].fn]
      : puzzle.functions;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (ans1.trim() === '' || ans2.trim() === '') {
      setFeedback({
        type: 'error',
        message: 'Isi kedua jawaban angka terlebih dahulu (hitung mandiri tanpa kalkulator).',
      });
      return;
    }

    const num1 = Number(ans1.trim());
    const num2 = Number(ans2.trim());

    if (Number.isNaN(num1) || Number.isNaN(num2)) {
      setFeedback({
        type: 'error',
        message: 'Masukkan angka bulat yang valid.',
      });
      return;
    }

    const q1 = activeQuestions[0];
    const q2 = activeQuestions[1];

    if (num1 === q1.expectedAnswer && num2 === q2.expectedAnswer) {
      sound.playSuccess();
      setFeedback({
        type: 'success',
        message: 'JAWABAN BENAR! PINTU KELUAR TERBUKA!',
      });
      setTimeout(() => {
        onSolve();
      }, 850);
    } else {
      sound.playError();
      const nextLives = Math.max(0, lives - 1);
      setFeedback({
        type: 'error',
        message:
          nextLives > 0
            ? `JAWABAN SALAH! Cek lagi hitunganmu. Sisa nyawa: ${nextLives}♥`
            : 'SEMUA NYAWA HABIS! Backrooms terkunci permanen.',
      });
      onWrongAnswer();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85">
      <div className="relative w-full max-w-2xl bg-[#0b120f] border border-[#6fffea]/40 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Terminal Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#070b09] border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-mono text-[#6fffea] font-semibold tracking-wider">
            <TerminalIcon size={16} />
            <span>TERMINAL PINTU KELUAR // KOMPOSISI &amp; INVERS</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Tutup Terminal"
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs (Calculator tab removed per teacher instruction) */}
        <div className="flex border-b border-neutral-800 bg-[#080d0a] text-xs font-mono">
          <button
            onClick={() => setActiveTab('puzzle')}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'puzzle'
                ? 'border-[#6fffea] text-[#6fffea] bg-neutral-900/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TerminalIcon size={14} /> SOAL PINTU KELUAR
          </button>

          <button
            onClick={() => setActiveTab('helper')}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'helper'
                ? 'border-[#6fffea] text-[#6fffea] bg-neutral-900/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <HelpCircle size={14} /> RUMUS KOMPOSISI &amp; INVERS
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-neutral-200">
          {activeTab === 'puzzle' && (
            <>
              <div>
                <p className="text-[10px] font-mono text-[#6fffea] tracking-widest uppercase">
                  KUNCI MATEMATIKA // LEVEL: {puzzle.difficulty}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  PECAHKAN FUNGSI UNTUK KELUAR
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Hitung secara mandiri tanpa kalkulator. Masukkan kedua nilai angka dengan tepat untuk membuka pintu keluar.
                </p>
              </div>

              {/* LEVEL 1 (EASY): Choose f(x) or g(x) before solving */}
              {puzzle.difficulty === 'EASY' && puzzle.easyBranches && (
                <div className="bg-[#07110d] border border-[#d6c77a]/40 rounded-lg p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#d6c77a] flex items-center gap-1.5">
                      <FunctionSquare size={15} />
                      {selectedBranch
                        ? `FUNGSI DIPILIH: ${selectedBranch}(x)`
                        : 'PILIH FUNGSI TERLEBIH DAHULU: f(x) ATAU g(x)'}
                    </span>
                    {selectedBranch && (
                      <span className="text-[10px] font-mono text-neutral-400">
                        Boleh ganti pilihan sebelum submit
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {(['f', 'g'] as const).map((branchKey) => {
                      const branch = puzzle.easyBranches![branchKey];
                      const active = selectedBranch === branchKey;
                      return (
                        <button
                          key={branchKey}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedBranch(branchKey);
                            setAns1('');
                            setAns2('');
                            setFeedback({ type: null, message: '' });
                          }}
                          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-[#6fffea]/15 border-[#6fffea] text-white shadow-[0_0_12px_rgba(111,255,234,0.2)]'
                              : 'bg-neutral-900/80 border-neutral-700 text-neutral-300 hover:border-[#d6c77a] hover:text-white'
                          }`}
                        >
                          <div className="font-mono text-xs text-[#6fffea] font-bold">
                            PILIH {branchKey}(x)
                          </div>
                          <div className="font-mono text-sm font-bold mt-1 text-[#ffde69]">
                            {branch.fn.formulaText}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Function Definitions + Questions */}
              {selectedBranch ? (
                <>
                  <div className="bg-neutral-950/90 border border-neutral-800 rounded-lg p-4 space-y-2 font-mono">
                    <div className="text-[10px] text-neutral-400 tracking-wider">
                      DIKETAHUI FUNGSI:
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {activeFunctions.map((fn) => (
                        <div
                          key={fn.name}
                          className="px-3 py-1.5 bg-[#050a08] border border-[#6fffea]/30 rounded text-base font-bold text-[#ffde69]"
                        >
                          {fn.formulaText}
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3.5 bg-[#070d0a] border border-neutral-800 rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#6fffea]">
                          <span className="font-bold">{q.label}</span>
                        </div>
                        <div className="font-mono text-sm sm:text-base font-bold text-white">
                          {q.prompt}
                        </div>
                        <p className="text-[11px] text-neutral-400">{q.hint}</p>
                        <input
                          ref={idx === 0 ? input1Ref : undefined}
                          type="number"
                          value={idx === 0 ? ans1 : ans2}
                          onChange={(e) =>
                            idx === 0 ? setAns1(e.target.value) : setAns2(e.target.value)
                          }
                          placeholder={`Ketik hasil angka Soal ${idx + 1}...`}
                          className="w-full px-3.5 py-2.5 bg-[#040706] border border-neutral-700 focus:border-[#6fffea] rounded font-mono text-base text-white outline-none transition-colors"
                        />
                      </div>
                    ))}

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#d6c77a] hover:bg-[#e6d88c] text-neutral-950 font-mono font-bold text-xs sm:text-sm tracking-wider rounded transition-colors cursor-pointer shadow-md"
                    >
                      BUKA PINTU KELUAR (PERIKSA JAWABAN)
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-6 text-center bg-neutral-950/60 border border-dashed border-neutral-700 rounded-lg font-mono text-xs text-neutral-400">
                  Klik pilihan <strong className="text-[#6fffea]">f(x)</strong> atau{' '}
                  <strong className="text-[#6fffea]">g(x)</strong> di atas untuk memunculkan soal Level 1!
                </div>
              )}

              {feedback.type && (
                <div
                  className={`flex items-center gap-2 p-3 rounded text-xs font-mono ${
                    feedback.type === 'success'
                      ? 'bg-[#42e6bf]/15 text-[#42e6bf] border border-[#42e6bf]/30'
                      : 'bg-[#ff5252]/15 text-[#ff5252] border border-[#ff5252]/30'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
            </>
          )}

          {activeTab === 'helper' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lightbulb size={16} className="text-[#6fffea]" /> Konsep Fungsi Komposisi &amp; Invers
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Gunakan catatan rumus di bawah ini untuk menghitung sendiri secara manual di kertas:
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-black/60 border border-neutral-800 rounded space-y-1">
                  <div className="text-[#d6c77a] font-bold">1. EVALUASI FUNGSI</div>
                  <div className="text-neutral-300">
                    Jika f(x) = ax + b, maka f(k) dihitung dengan mengganti x = k ➔ a(k) + b.
                  </div>
                </div>

                <div className="p-3 bg-black/60 border border-neutral-800 rounded space-y-1">
                  <div className="text-[#6fffea] font-bold">2. FUNGSI INVERS f⁻¹(y)</div>
                  <div className="text-neutral-300">
                    Misalkan y = f(x) = ax + b, maka f⁻¹(y) = (y - b) / a.
                  </div>
                  <div className="text-neutral-400 text-[11px]">
                    Contoh: f(x) = 3x + 6, cari f⁻¹(15) ➔ 3x + 6 = 15 ➔ 3x = 9 ➔ x = 3.
                  </div>
                </div>

                <div className="p-3 bg-black/60 border border-neutral-800 rounded space-y-1">
                  <div className="text-[#42e6bf] font-bold">3. KOMPOSISI FUNGSI</div>
                  <div className="text-neutral-300">
                    • (f ∘ g)(x) = f(g(x)) — hitung g(x) dulu, lalu masukkan ke f.
                  </div>
                  <div className="text-neutral-300">
                    • (f ∘ g ∘ h)(x) = f(g(h(x))) — kerjakan dari fungsi paling kanan h(x) ke kiri.
                  </div>
                  <div className="text-neutral-300">
                    • (f ∘ g)⁻¹(y) = g⁻¹(f⁻¹(y)) — inverskan dari luar ke dalam.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-[#070b09] border-t border-neutral-800 flex justify-between items-center text-[11px] font-mono text-neutral-400">
          <span>TEKAN ESC UNTUK KEMBALI BERLARI</span>
          <span className="text-neutral-500">TANPA KALKULATOR UJI • HITUNG MANDIRI</span>
        </div>
      </div>
    </div>
  );
};
