import {
  Difficulty,
  LevelConfig,
  LinearFunction,
  MathSubQuestion,
  PuzzleData,
  SimpleQuizData,
} from './types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function formatLinear(name: 'f' | 'g' | 'h', a: number, b: number): LinearFunction {
  const sign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const aStr = a === 1 ? '' : a === -1 ? '-' : `${a}`;
  return {
    name,
    a,
    b,
    formulaText: `${name}(x) = ${aStr}x ${sign}`,
  };
}

export function evalLinear(fn: LinearFunction, x: number): number {
  return fn.a * x + fn.b;
}

export const LEVELS: Record<Difficulty, LevelConfig> = {
  EASY: {
    id: 'EASY',
    name: 'MUDAH (LEVEL 1)',
    badge: 'Pilih f(x) atau g(x) + Invers',
    desc: 'Level 1: Sebelum mengerjakan, kamu bisa memilih f(x) atau g(x), lalu hitung nilai fungsi & fungsi inversnya.',
    timeSeconds: 600,
    initialLives: 3,
  },
  MEDIUM: {
    id: 'MEDIUM',
    name: 'SEDANG (LEVEL 2)',
    badge: 'Komposisi f(x) & g(x)',
    desc: 'Level 2: Gabungan 2 fungsi f(x) dan g(x) bersamaan. Hitung (f ∘ g)(k) dan invers komposisi (f ∘ g)⁻¹(y).',
    timeSeconds: 600,
    initialLives: 3,
  },
  HARD: {
    id: 'HARD',
    name: 'SULIT (LEVEL 3)',
    badge: 'Komposisi 3 Fungsi f, g, h',
    desc: 'Level 3: Komposisi 3 fungsi bersarang f(g(h(x))) dan invers bertingkat tanpa kalkulator!',
    timeSeconds: 600,
    initialLives: 3,
  },
};

function buildSingleFunctionQuestions(fn: LinearFunction): [MathSubQuestion, MathSubQuestion] {
  // Slightly more challenging than basic entity quizzes: uses 2-step expression or negative/larger numbers
  const x1 = randInt(4, 9);
  const x2 = randInt(2, 6);
  const val1 = evalLinear(fn, x1); // f(x1)
  const fx2 = evalLinear(fn, x2); // f(x2) -> so f^-1(fx2) = x2
  const shift = randInt(2, 5);
  const q1Ans = val1 + shift;

  // Pick one target y for inverse: f^-1(y) = xInv
  const xInv = randInt(5, 11);
  const yInv = evalLinear(fn, xInv);

  return [
    {
      id: `${fn.name}-q1`,
      label: `Soal 1 (Evaluasi ${fn.name}(x))`,
      prompt: `Hitung nilai ${fn.name}(${x1}) + ${shift} = ...`,
      hint: `Substitusikan x = ${x1} ke ${fn.formulaText}, lalu tambah ${shift}.`,
      expectedAnswer: q1Ans,
    },
    {
      id: `${fn.name}-q2`,
      label: `Soal 2 (Invers ${fn.name}⁻¹(x))`,
      prompt: `Tentukan nilai ${fn.name}⁻¹(${yInv}) = ...`,
      hint: `Ubah y = ${fn.a}x ${fn.b >= 0 ? '+' : '-'} ${Math.abs(fn.b)} menjadi x = (y ${fn.b >= 0 ? '-' : '+'} ${Math.abs(fn.b)}) / ${fn.a} dengan y = ${yInv}. (Cek: ${fn.name}(${xInv}) = ${fx2 > -999 ? yInv : yInv})`,
      expectedAnswer: xInv,
    },
  ];
}

export function generatePuzzle(difficulty: Difficulty): PuzzleData {
  const level = LEVELS[difficulty];

  if (difficulty === 'EASY') {
    const f = formatLinear('f', randInt(3, 6), randInt(4, 14) * (Math.random() < 0.35 ? -1 : 1));
    const g = formatLinear('g', randInt(2, 5), randInt(5, 15) * (Math.random() < 0.35 ? -1 : 1));

    const fQs = buildSingleFunctionQuestions(f);
    const gQs = buildSingleFunctionQuestions(g);

    return {
      difficulty,
      level,
      functions: [f, g],
      easyBranches: {
        f: { branchName: 'f', fn: f, questions: fQs },
        g: { branchName: 'g', fn: g, questions: gQs },
      },
      questions: fQs,
      summaryText: `${f.formulaText} atau ${g.formulaText}`,
    };
  }

  if (difficulty === 'MEDIUM') {
    const f = formatLinear('f', randInt(2, 4), randInt(3, 9) * (Math.random() < 0.3 ? -1 : 1));
    const g = formatLinear('g', randInt(2, 4), randInt(1, 7));

    // Q1: (f o g)(x1)
    const x1 = randInt(2, 5);
    const gx1 = evalLinear(g, x1);
    const fgx1 = evalLinear(f, gx1);

    // Q2: (f o g)^-1(yInv) = xInv (exact integer!)
    const xInv = randInt(2, 6);
    const yInv = evalLinear(f, evalLinear(g, xInv));

    const q1: MathSubQuestion = {
      id: 'med-q1',
      label: 'Soal 1 (Komposisi Fungsi)',
      prompt: `Hitung nilai (f ∘ g)(${x1}) = f(g(${x1})) = ...`,
      hint: `Cari dulu g(${x1}), lalu hasilnya masukkan ke x pada f(x).`,
      expectedAnswer: fgx1,
    };

    const q2: MathSubQuestion = {
      id: 'med-q2',
      label: 'Soal 2 (Invers Komposisi)',
      prompt: `Tentukan nilai (f ∘ g)⁻¹(${yInv}) = ...`,
      hint: `Cari invers dari luar ke dalam: g⁻¹(f⁻¹(${yInv})), atau pecahkan f(g(x)) = ${yInv}.`,
      expectedAnswer: xInv,
    };

    return {
      difficulty,
      level,
      functions: [f, g],
      questions: [q1, q2],
      summaryText: `${f.formulaText}, ${g.formulaText}`,
    };
  }

  // HARD: 3-function composition f(g(h(x))) and inverse (no mod 26)
  const f = formatLinear('f', randInt(2, 3), randInt(2, 6));
  const g = formatLinear('g', randInt(2, 3), randInt(1, 5));
  const h = formatLinear('h', randInt(2, 3), randInt(1, 4));

  const x1 = randInt(1, 3);
  const hx1 = evalLinear(h, x1);
  const ghx1 = evalLinear(g, hx1);
  const fghx1 = evalLinear(f, ghx1);

  let xInv = randInt(2, 4);
  if (xInv === x1) xInv = x1 + 1;
  const yInv = evalLinear(f, evalLinear(g, evalLinear(h, xInv)));

  const q1: MathSubQuestion = {
    id: 'hard-q1',
    label: 'Soal 1 (Komposisi 3 Fungsi)',
    prompt: `Hitung nilai (f ∘ g ∘ h)(${x1}) = f(g(h(${x1}))) = ...`,
    hint: `Hitung bertahap dari dalam: h(${x1}) ➔ masukkan ke g ➔ masukkan ke f.`,
    expectedAnswer: fghx1,
  };

  const q2: MathSubQuestion = {
    id: 'hard-q2',
    label: 'Soal 2 (Invers 3 Fungsi)',
    prompt: `Tentukan nilai (f ∘ g ∘ h)⁻¹(${yInv}) = ...`,
    hint: `Cari bertahap dari luar: h⁻¹(g⁻¹(f⁻¹(${yInv}))).`,
    expectedAnswer: xInv,
  };

  return {
    difficulty,
    level,
    functions: [f, g, h],
    questions: [q1, q2],
    summaryText: `${f.formulaText}, ${g.formulaText}, ${h.formulaText}`,
  };
}

/**
 * Generates simple randomized math questions for:
 * - Exiting a Locker ('locker'): e.g. f(x) = 3x + 6, hitung f(2) = ...
 * - Escaping Chubby Entity ('chubby'): e.g. f(x) = 10x + 7, hitung f(5) = ...
 * Ensures no repeated question id if excludeIds is provided!
 */
export function generateSimpleQuiz(
  kind: 'locker' | 'chubby' | 'teacher_faint',
  excludeIds?: Set<string>
): SimpleQuizData {
  let a = 3;
  let b = 6;
  let x = 2;
  let qId = '';

  // Try up to 25 times to guarantee a fresh unique problem every death/retry
  for (let attempt = 0; attempt < 25; attempt++) {
    if (kind === 'locker') {
      a = randInt(2, 7);
      b = randInt(2, 12);
      x = randInt(2, 6);
    } else if (kind === 'teacher_faint') {
      a = randInt(3, 8);
      b = randInt(4, 15);
      x = randInt(2, 6);
    } else {
      a = randInt(4, 12);
      b = randInt(3, 15);
      x = randInt(2, 7);
    }
    qId = `${kind}-${a}x+${b}@${x}`;
    if (!excludeIds || !excludeIds.has(qId)) {
      break;
    }
  }

  const correctAnswer = a * x + b;
  const functionExpr = `f(x) = ${a}x + ${b}`;
  const questionPrompt = `Jika ${functionExpr}, maka nilai f(${x}) adalah ...`;

  // Generate 3 plausible distinct wrong choices
  const choiceSet = new Set<number>([correctAnswer]);
  const offsets = [-6, -4, -3, -2, 2, 3, 4, 6, 8, -a, a, b];
  let safety = 0;
  while (choiceSet.size < 4 && safety < 50) {
    safety++;
    const delta = pick(offsets);
    const candidate = correctAnswer + delta;
    if (candidate > 0 && candidate !== correctAnswer) {
      choiceSet.add(candidate);
    }
  }
  while (choiceSet.size < 4) {
    choiceSet.add(correctAnswer + choiceSet.size * 3);
  }

  const choices = Array.from(choiceSet).sort((u, v) => u - v);

  const titleMap: Record<typeof kind, string> = {
    locker: 'KUNCI LEMARI TERAKTIVASI',
    chubby: 'TERTANGKAP ENTITAS KEMEJA BIRU!',
    teacher_faint: 'PINGSAN TERKENA PENGGARIS GURU MTK!',
  };

  const subtitleMap: Record<typeof kind, string> = {
    locker:
      'Jawab soal sederhana ini untuk membuka kunci lemari dari dalam. Salah menjawab = -0.5♥ & tetap terkunci!',
    chubby:
      'Jawab soal matematika ini agar dia menjadi baik dan membiarkanmu pergi!',
    teacher_faint:
      'Kamu pingsan! Jawab soal ini untuk langsung bangun kembali. Jika SALAH: mati (-1♥) dan mengulang dari awal!',
  };

  return {
    id: qId,
    kind,
    title: titleMap[kind],
    subtitle: subtitleMap[kind],
    functionExpr,
    questionPrompt,
    correctAnswer,
    choices,
  };
}
