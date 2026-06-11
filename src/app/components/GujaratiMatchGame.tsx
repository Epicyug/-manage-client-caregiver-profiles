import { useState, useEffect, useRef } from 'react';

type GameScreen = 'welcome' | 'category' | 'difficulty' | 'playing' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';
type CategoryKey = 'animals' | 'fruits' | 'colors' | 'numbers';

interface WordPair {
  id: string;
  gujarati: string;
  pronunciation: string;
  emoji: string;
  english: string;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  time: number;
  moves: number;
  wrongMoves: number;
  date: string;
}

const CATEGORIES: Record<CategoryKey, { name: string; nameEn: string; icon: string; gradient: string; pairs: WordPair[] }> = {
  animals: {
    name: 'પ્રાણીઓ',
    nameEn: 'Animals',
    icon: '🦁',
    gradient: 'linear-gradient(135deg,#f97316,#f59e0b)',
    pairs: [
      { id: 'cow',      gujarati: 'ગાય',     pronunciation: 'gāy',      emoji: '🐄', english: 'Cow'      },
      { id: 'elephant', gujarati: 'હાથી',    pronunciation: 'hāthī',    emoji: '🐘', english: 'Elephant' },
      { id: 'goat',     gujarati: 'બકરી',    pronunciation: 'bakarī',   emoji: '🐐', english: 'Goat'     },
      { id: 'snake',    gujarati: 'સાપ',     pronunciation: 'sāp',      emoji: '🐍', english: 'Snake'    },
      { id: 'horse',    gujarati: 'ઘોડો',    pronunciation: 'ghoḍo',    emoji: '🐴', english: 'Horse'    },
      { id: 'lion',     gujarati: 'સિંહ',    pronunciation: 'sinh',     emoji: '🦁', english: 'Lion'     },
      { id: 'tiger',    gujarati: 'વાઘ',     pronunciation: 'vāgh',     emoji: '🐯', english: 'Tiger'    },
      { id: 'monkey',   gujarati: 'વાંદરો',  pronunciation: 'vāndaro',  emoji: '🐒', english: 'Monkey'   },
      { id: 'rabbit',   gujarati: 'સસલો',   pronunciation: 'sasalo',   emoji: '🐰', english: 'Rabbit'   },
      { id: 'dog',      gujarati: 'કૂતરો',   pronunciation: 'kūtaro',   emoji: '🐕', english: 'Dog'      },
    ],
  },
  fruits: {
    name: 'ફળો',
    nameEn: 'Fruits',
    icon: '🍎',
    gradient: 'linear-gradient(135deg,#ef4444,#f43f5e)',
    pairs: [
      { id: 'apple',       gujarati: 'સફરજન',    pronunciation: 'safarajan', emoji: '🍎', english: 'Apple'      },
      { id: 'banana',      gujarati: 'કેળું',     pronunciation: 'keḷum',     emoji: '🍌', english: 'Banana'     },
      { id: 'mango',       gujarati: 'કેરી',      pronunciation: 'kerī',      emoji: '🥭', english: 'Mango'      },
      { id: 'grapes',      gujarati: 'દ્રાક્ષ',  pronunciation: 'drākṣa',   emoji: '🍇', english: 'Grapes'     },
      { id: 'orange',      gujarati: 'નારંગી',   pronunciation: 'nārangi',   emoji: '🍊', english: 'Orange'     },
      { id: 'watermelon',  gujarati: 'તરબૂચ',    pronunciation: 'tarabūch',  emoji: '🍉', english: 'Watermelon' },
      { id: 'cherry',      gujarati: 'ચેરી',      pronunciation: 'cherī',     emoji: '🍒', english: 'Cherry'     },
      { id: 'strawberry',  gujarati: 'સ્ટ્રોબેરી', pronunciation: 'sṭroberi', emoji: '🍓', english: 'Strawberry' },
      { id: 'coconut',     gujarati: 'નાળિયેર',   pronunciation: 'nāḷiyer',  emoji: '🥥', english: 'Coconut'    },
      { id: 'lemon',       gujarati: 'લીંબુ',     pronunciation: 'limbū',     emoji: '🍋', english: 'Lemon'      },
    ],
  },
  colors: {
    name: 'રંગો',
    nameEn: 'Colors',
    icon: '🎨',
    gradient: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    pairs: [
      { id: 'red',    gujarati: 'લાલ',    pronunciation: 'lāl',     emoji: '🔴', english: 'Red'    },
      { id: 'blue',   gujarati: 'વાદળી',  pronunciation: 'vādaḷī', emoji: '🔵', english: 'Blue'   },
      { id: 'green',  gujarati: 'લીલો',   pronunciation: 'līlo',    emoji: '🟢', english: 'Green'  },
      { id: 'yellow', gujarati: 'પીળો',   pronunciation: 'pīḷo',    emoji: '🟡', english: 'Yellow' },
      { id: 'col_o',  gujarati: 'નારંગો', pronunciation: 'nāranго', emoji: '🟠', english: 'Orange' },
      { id: 'purple', gujarati: 'જાંબુડી', pronunciation: 'jāmbuḍī', emoji: '🟣', english: 'Purple' },
      { id: 'pink',   gujarati: 'ગુલાબી', pronunciation: 'gulābī',  emoji: '🩷', english: 'Pink'   },
      { id: 'brown',  gujarati: 'ભૂરો',   pronunciation: 'bhūro',   emoji: '🟫', english: 'Brown'  },
      { id: 'white',  gujarati: 'સફેદ',   pronunciation: 'sapheda', emoji: '⬜', english: 'White'  },
      { id: 'black',  gujarati: 'કાળો',   pronunciation: 'kāḷo',   emoji: '⬛', english: 'Black'  },
    ],
  },
  numbers: {
    name: 'સંખ્યા',
    nameEn: 'Numbers',
    icon: '🔢',
    gradient: 'linear-gradient(135deg,#0891b2,#0284c7)',
    pairs: [
      { id: 'one',   gujarati: 'એક',  pronunciation: 'ek',   emoji: '1️⃣', english: 'One'   },
      { id: 'two',   gujarati: 'બે',   pronunciation: 'be',   emoji: '2️⃣', english: 'Two'   },
      { id: 'three', gujarati: 'ત્રણ', pronunciation: 'traṇ', emoji: '3️⃣', english: 'Three' },
      { id: 'four',  gujarati: 'ચાર',  pronunciation: 'cār',  emoji: '4️⃣', english: 'Four'  },
      { id: 'five',  gujarati: 'પાંચ', pronunciation: 'pānc', emoji: '5️⃣', english: 'Five'  },
      { id: 'six',   gujarati: 'છ',    pronunciation: 'cha',  emoji: '6️⃣', english: 'Six'   },
      { id: 'seven', gujarati: 'સાત',  pronunciation: 'sāt',  emoji: '7️⃣', english: 'Seven' },
      { id: 'eight', gujarati: 'આઠ',  pronunciation: 'āṭh',  emoji: '8️⃣', english: 'Eight' },
      { id: 'nine',  gujarati: 'નવ',   pronunciation: 'nav',  emoji: '9️⃣', english: 'Nine'  },
      { id: 'ten',   gujarati: 'દસ',   pronunciation: 'das',  emoji: '🔟', english: 'Ten'   },
    ],
  },
};

const DIFFICULTY: Record<Difficulty, { pairs: number; labelGu: string; labelEn: string; showPronunciation: boolean }> = {
  easy:   { pairs: 6,  labelGu: 'સહેલું',  labelEn: 'Easy',   showPronunciation: true  },
  medium: { pairs: 8,  labelGu: 'મધ્યમ',  labelEn: 'Medium', showPronunciation: true  },
  hard:   { pairs: 10, labelGu: 'મુશ્કેલ', labelEn: 'Hard',   showPronunciation: false },
};

const GU_FONT = { fontFamily: "'Noto Sans Gujarati', 'Shruti', sans-serif" };
const BG     = { background: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 50%,#4338ca 100%)' };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, '0')}s`;
}

function calcScore(pairs: number, t: number, wrong: number) {
  return pairs * 100 + Math.max(0, 300 - t) * 2 + Math.max(0, 30 - wrong) * 5 + (wrong === 0 ? 200 : 0);
}

function playBeep(type: 'match' | 'wrong' | 'win') {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const play = (freq: number, start: number, dur: number, wave: OscillatorType = 'sine') => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = wave;
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.2, ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur);
    };
    if (type === 'match') { play(523, 0, 0.18); play(659, 0.14, 0.25); }
    else if (type === 'wrong') play(160, 0, 0.25, 'sawtooth');
    else [523, 659, 784, 1047].forEach((f, i) => play(f, i * 0.14, 0.4));
  } catch { /* AudioContext not available */ }
}

function getLb(cat: CategoryKey, diff: Difficulty): LeaderboardEntry[] {
  try { return JSON.parse(localStorage.getItem(`gm_lb_${cat}_${diff}`) ?? '[]'); } catch { return []; }
}

function saveLb(entry: LeaderboardEntry, existing: LeaderboardEntry[], cat: CategoryKey, diff: Difficulty) {
  const updated = [...existing, entry]
    .sort((a, b) => b.score !== a.score ? b.score - a.score : a.time - b.time)
    .slice(0, 10);
  localStorage.setItem(`gm_lb_${cat}_${diff}`, JSON.stringify(updated));
  return updated;
}

export function GujaratiMatchGame({ onBack }: { onBack: () => void }) {
  const [screen,   setScreen]   = useState<GameScreen>('welcome');
  const [name,     setName]     = useState('');
  const [category, setCategory] = useState<CategoryKey>('animals');
  const [diff,     setDiff]     = useState<Difficulty>('easy');

  const [words,   setWords]   = useState<WordPair[]>([]);
  const [emojis,  setEmojis]  = useState<WordPair[]>([]);
  const [selWord,  setSelWord]  = useState<string | null>(null);
  const [selEmoji, setSelEmoji] = useState<string | null>(null);
  const [matched,  setMatched]  = useState<Set<string>>(new Set());
  const [wrongId,  setWrongId]  = useState<string | null>(null);
  const [locked,   setLocked]   = useState(false);
  const [moves,    setMoves]    = useState(0);
  const [wrongs,   setWrongs]   = useState(0);
  const [time,     setTime]     = useState(0);
  const [running,  setRunning]  = useState(false);
  const [hints,    setHints]    = useState(3);
  const [hintId,   setHintId]   = useState<string | null>(null);

  const [score,  setScore]  = useState(0);
  const [lb,     setLb]     = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      timerRef.current = window.setInterval(() => setTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  useEffect(() => {
    if (words.length > 0 && matched.size === words.length) {
      setRunning(false);
      playBeep('win');
      const s = calcScore(words.length, time, wrongs);
      setScore(s);
      const existing = getLb(category, diff);
      const entry: LeaderboardEntry = { name, score: s, time, moves, wrongMoves: wrongs, date: new Date().toLocaleDateString('en-IN') };
      const newLb = saveLb(entry, existing, category, diff);
      setLb(newLb);
      const rank = newLb.findIndex(e => e.name === name && e.score === s && e.time === time) + 1;
      setMyRank(rank > 0 ? rank : newLb.length);
      setTimeout(() => setScreen('results'), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched, words.length]);

  function startGame(cat: CategoryKey, d: Difficulty) {
    const pairs = shuffle(CATEGORIES[cat].pairs).slice(0, DIFFICULTY[d].pairs);
    setWords(shuffle([...pairs]));
    setEmojis(shuffle([...pairs]));
    setSelWord(null); setSelEmoji(null);
    setMatched(new Set());
    setWrongId(null); setLocked(false);
    setMoves(0); setWrongs(0); setTime(0);
    setHints(3); setHintId(null);
    setRunning(true);
    setScreen('playing');
  }

  function handleWord(id: string) {
    if (locked || matched.has(id)) return;
    if (selWord === id) { setSelWord(null); return; }
    setSelWord(id);
    if (selEmoji) doCheck(id, selEmoji);
  }

  function handleEmoji(id: string) {
    if (locked || matched.has(id)) return;
    if (selEmoji === id) { setSelEmoji(null); return; }
    setSelEmoji(id);
    if (selWord) doCheck(selWord, id);
  }

  function doCheck(wordId: string, emojiId: string) {
    setLocked(true);
    setMoves(m => m + 1);
    if (wordId === emojiId) {
      playBeep('match');
      setMatched(prev => new Set([...prev, wordId]));
      setSelWord(null); setSelEmoji(null);
      setLocked(false);
    } else {
      playBeep('wrong');
      setWrongs(w => w + 1);
      setWrongId(wordId);
      setTimeout(() => {
        setWrongId(null);
        setSelWord(null); setSelEmoji(null);
        setLocked(false);
      }, 700);
    }
  }

  function doHint() {
    if (hints <= 0) return;
    const unmatched = words.filter(w => !matched.has(w.id));
    if (!unmatched.length) return;
    const target = selWord ? (unmatched.find(w => w.id === selWord) ?? unmatched[0]) : unmatched[0];
    setHintId(target.id);
    setHints(h => h - 1);
    setTimeout(() => setHintId(null), 2500);
  }

  const totalPairs    = words.length;
  const matchedCount  = matched.size;
  const progress      = totalPairs > 0 ? (matchedCount / totalPairs) * 100 : 0;
  const diffCfg       = DIFFICULTY[diff];
  const MEDALS        = ['🥇', '🥈', '🥉'];
  const CONFETTI_COLS = ['#fbbf24','#34d399','#60a5fa','#f472b6','#a78bfa','#fb923c'];

  /* ── WELCOME ── */
  if (screen === 'welcome') return (
    <div style={BG} className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <button onClick={onBack} className="absolute top-4 left-4 text-white/60 hover:text-white text-sm transition-colors z-10">← Back</button>

      {['🎯','⭐','🏆','✨','🎮','💫'].map((ic, i) => (
        <div key={i} className="absolute text-4xl opacity-20 animate-bounce pointer-events-none select-none"
          style={{ left:`${[8,85,12,80,5,92][i]}%`, top:`${[12,18,78,72,45,48][i]}%`, animationDelay:`${i*0.4}s` }}>
          {ic}
        </div>
      ))}

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/20 relative z-10">
        <div className="text-center mb-7">
          <div className="text-6xl mb-3">🎮</div>
          <h1 className="text-4xl font-extrabold text-white mb-1" style={GU_FONT}>ગુજરાતી</h1>
          <h2 className="text-xl font-bold text-yellow-300 mb-1" style={GU_FONT}>શબ્દ મેળ રમત</h2>
          <p className="text-white/50 text-sm">Gujarati Word Matching Game</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm block mb-2">
              <span style={GU_FONT}>તમારું નામ</span> / Your Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && setScreen('category')}
              maxLength={20}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/20 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg transition-all"
            />
          </div>
          <button
            onClick={() => name.trim() && setScreen('category')}
            disabled={!name.trim()}
            style={{ background: name.trim() ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,0.2)', color: name.trim() ? '#1e1b4b' : '#ffffff66' }}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 disabled:cursor-not-allowed">
            <span style={GU_FONT}>રમત શરૂ કરો</span> 🚀
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-3 text-white/40 text-xs">
          <span>4 Categories</span><span>•</span><span>3 Levels</span><span>•</span><span>Leaderboard</span>
        </div>
      </div>
    </div>
  );

  /* ── CATEGORY ── */
  if (screen === 'category') return (
    <div style={BG} className="min-h-screen flex flex-col items-center justify-center p-4">
      <button onClick={() => setScreen('welcome')} className="absolute top-4 left-4 text-white/60 hover:text-white text-sm">← Back</button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-white/60 text-sm mb-1"><span style={GU_FONT}>નમસ્તે</span>, {name}! 👋</p>
          <h2 className="text-3xl font-extrabold text-white" style={GU_FONT}>વર્ગ પસંદ કરો</h2>
          <p className="text-white/50 text-sm">Choose a Category</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map(key => {
            const cat = CATEGORIES[key];
            return (
              <button key={key} onClick={() => { setCategory(key); setScreen('difficulty'); }}
                style={{ background: cat.gradient }}
                className="p-5 rounded-3xl shadow-xl text-white text-center transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-2xl">
                <div className="text-5xl mb-2">{cat.icon}</div>
                <div className="font-bold text-xl leading-tight" style={GU_FONT}>{cat.name}</div>
                <div className="text-sm opacity-80">{cat.nameEn}</div>
                <div className="text-xs opacity-60 mt-1">{cat.pairs.length} words</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── DIFFICULTY ── */
  if (screen === 'difficulty') {
    const cat = CATEGORIES[category];
    const DIFF_GRADS: Record<Difficulty, string> = {
      easy:   'linear-gradient(135deg,#10b981,#059669)',
      medium: 'linear-gradient(135deg,#f59e0b,#d97706)',
      hard:   'linear-gradient(135deg,#ef4444,#dc2626)',
    };
    const DIFF_ICONS: Record<Difficulty, string> = { easy: '😊', medium: '🤔', hard: '😤' };
    return (
      <div style={BG} className="min-h-screen flex flex-col items-center justify-center p-4">
        <button onClick={() => setScreen('category')} className="absolute top-4 left-4 text-white/60 hover:text-white text-sm">← Back</button>

        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{cat.icon}</div>
            <h2 className="text-3xl font-extrabold text-white" style={GU_FONT}>{cat.name}</h2>
            <p className="text-white/50 text-sm"><span style={GU_FONT}>કઠિનાઈ</span> / Difficulty</p>
          </div>

          <div className="space-y-3">
            {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => {
              const cfg  = DIFFICULTY[d];
              const best = getLb(category, d)[0];
              return (
                <button key={d} onClick={() => { setDiff(d); startGame(category, d); }}
                  style={{ background: DIFF_GRADS[d] }}
                  className="w-full p-4 rounded-2xl shadow-lg text-white flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95">
                  <div className="text-3xl">{DIFF_ICONS[d]}</div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-base">
                      <span style={GU_FONT}>{cfg.labelGu}</span>
                      <span className="opacity-70 font-normal text-sm"> / {cfg.labelEn}</span>
                    </div>
                    <div className="text-sm opacity-75">
                      {cfg.pairs} pairs · {cfg.showPronunciation ? 'pronunciation shown' : 'no pronunciation'}
                    </div>
                  </div>
                  {best && (
                    <div className="text-right text-xs opacity-80 leading-tight">
                      <div>Best</div>
                      <div className="font-bold text-sm">{best.score}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── PLAYING ── */
  if (screen === 'playing') return (
    <div style={BG} className="min-h-screen flex flex-col">

      {/* Header */}
      <div className="bg-black/25 backdrop-blur-sm px-4 py-2.5 flex items-center gap-2 border-b border-white/10 flex-wrap">
        <button onClick={() => { setRunning(false); setScreen('category'); }} className="text-white/60 hover:text-white text-sm flex-shrink-0">✕</button>

        <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
          <Pill icon="⏱" val={fmt(time)} />
          <Pill icon="✅" val={`${matchedCount}/${totalPairs}`} />
          <Pill icon="👆" val={`${moves}`} />
          {wrongs > 0 && <Pill icon="❌" val={`${wrongs}`} red />}
        </div>

        <button onClick={doHint} disabled={hints === 0}
          style={{ background: hints > 0 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)', color: '#fde68a' }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-all disabled:opacity-30 flex-shrink-0">
          💡 {hints}
        </button>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-black/20">
        <div className="h-full transition-all duration-500"
          style={{ width:`${progress}%`, background:'linear-gradient(90deg,#fbbf24,#34d399)' }} />
      </div>

      {/* Label */}
      <div className="text-center py-1.5">
        <span className="text-white/50 text-xs">{CATEGORIES[category].icon}&nbsp;
          <span style={GU_FONT}>{CATEGORIES[category].name}</span>
          &nbsp;·&nbsp;{diffCfg.labelEn}
        </span>
      </div>

      {/* Two columns */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex gap-3 max-w-md mx-auto">

          {/* Words */}
          <div className="flex-1 space-y-2.5">
            <ColHeader>
              <span style={GU_FONT}>ગુજરાતી</span>
            </ColHeader>
            {words.map(card => {
              const isMatched = matched.has(card.id);
              const isSel     = selWord === card.id;
              const isWrong   = wrongId === card.id;
              return (
                <button key={card.id} onClick={() => handleWord(card.id)}
                  disabled={isMatched || locked}
                  className="w-full py-3 px-3 rounded-2xl text-center text-white disabled:cursor-default gm-card"
                  style={cardStyle(isMatched, isSel, isWrong)}
                  data-wrong={isWrong ? 'true' : undefined}>
                  {isMatched
                    ? <span className="text-green-300 text-xl font-bold">✓</span>
                    : <>
                        <div className="font-bold text-xl" style={GU_FONT}>{card.gujarati}</div>
                        {diffCfg.showPronunciation && <div className="text-xs text-white/50 mt-0.5 italic">{card.pronunciation}</div>}
                      </>
                  }
                </button>
              );
            })}
          </div>

          {/* Emojis */}
          <div className="flex-1 space-y-2.5">
            <ColHeader>
              <span style={GU_FONT}>ચિત્ર</span>
            </ColHeader>
            {emojis.map(card => {
              const isMatched = matched.has(card.id);
              const isSel     = selEmoji === card.id;
              const isHinted  = hintId === card.id;
              return (
                <button key={card.id} onClick={() => handleEmoji(card.id)}
                  disabled={isMatched || locked}
                  className="w-full py-3 px-3 rounded-2xl text-center text-white disabled:cursor-default gm-card"
                  style={cardStyle(isMatched, isSel, false, isHinted)}>
                  {isMatched
                    ? <span className="text-green-300 text-xl font-bold">✓</span>
                    : <>
                        <div className="text-3xl">{card.emoji}</div>
                        {diffCfg.showPronunciation && <div className="text-xs text-white/40 mt-0.5">{card.english}</div>}
                      </>
                  }
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );

  /* ── RESULTS ── */
  if (screen === 'results') return (
    <div style={BG} className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Confetti */}
      {Array.from({ length: 28 }).map((_, i) => (
        <div key={i} className="absolute pointer-events-none rounded-sm"
          style={{
            width: Math.random() > 0.5 ? 8 : 6,
            height: Math.random() > 0.5 ? 8 : 14,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: CONFETTI_COLS[i % CONFETTI_COLS.length],
            opacity: 0.75,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `gmFall ${1.5 + Math.random() * 2}s ease-in-out ${Math.random() * 1.5}s infinite alternate`,
          }}
        />
      ))}

      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative z-10">

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-6xl mb-2">{myRank === 1 ? '🏆' : MEDALS[myRank - 1] ?? '🎉'}</div>
          <h2 className="text-2xl font-extrabold text-violet-700" style={GU_FONT}>
            {myRank === 1 ? 'અભિનંદન!' : 'સારી રમત!'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {myRank === 1 ? "🌟 You're #1 on the leaderboard!" : `Great job! You ranked #${myRank}`}
          </p>
        </div>

        {/* Stats */}
        <div className="rounded-2xl p-4 mb-4 space-y-2.5" style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Score</span>
            <span className="font-extrabold text-violet-700 text-2xl">{score} <span className="text-sm font-normal">pts</span></span>
          </div>
          <div className="h-px bg-violet-100" />
          <StatRow label="Time"         val={fmt(time)} />
          <StatRow label="Pairs"        val={`${matchedCount}/${totalPairs} ✓`} green />
          <StatRow label="Moves"        val={`${moves}`} />
          <StatRow label="Wrong Guesses" val={wrongs === 0 ? '0 — Perfect! 🎯' : `${wrongs}`} red={wrongs > 0} green={wrongs === 0} />
        </div>

        {/* Leaderboard */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span>🏆</span>
            <span className="font-bold text-gray-700">Leaderboard</span>
            <span className="text-xs text-gray-400 ml-auto">
              {CATEGORIES[category].nameEn} · {DIFFICULTY[diff].labelEn}
            </span>
          </div>
          <div className="space-y-2">
            {lb.slice(0, 5).map((entry, i) => (
              <div key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${i === myRank - 1 ? 'border-2 border-yellow-400 bg-yellow-50' : 'bg-gray-50'}`}>
                <span className="text-base w-6 text-center">{MEDALS[i] ?? `${i + 1}`}</span>
                <span className="flex-1 font-medium text-gray-800 truncate">
                  {entry.name}
                  {i === myRank - 1 && <span className="text-xs text-violet-500 ml-1">← You</span>}
                </span>
                <span className="font-bold text-violet-600">{entry.score}</span>
                <span className="text-gray-400 text-xs">{fmt(entry.time)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={() => startGame(category, diff)}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
            className="flex-1 py-3 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95">
            <span style={GU_FONT}>ફરી રમો</span> 🔄
          </button>
          <button onClick={() => setScreen('category')}
            className="flex-1 py-3 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-95">
            Change 📚
          </button>
        </div>
      </div>
    </div>
  );

  return null;
}

/* ── Small reusable pieces ── */

function Pill({ icon, val, red }: { icon: string; val: string; red?: boolean }) {
  return (
    <div className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm"
      style={{ background: red ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.12)', color: red ? '#fca5a5' : '#fff' }}>
      <span>{icon}</span><span className="font-bold">{val}</span>
    </div>
  );
}

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center text-white/50 text-xs font-semibold uppercase tracking-wider mb-0.5">
      {children}
    </div>
  );
}

function StatRow({ label, val, green, red }: { label: string; val: string; green?: boolean; red?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${green ? 'text-green-600' : red ? 'text-red-500' : 'text-gray-800'}`}>{val}</span>
    </div>
  );
}

function cardStyle(isMatched: boolean, isSel: boolean, isWrong: boolean, isHinted = false): React.CSSProperties {
  if (isMatched) return { background: 'rgba(52,211,153,0.22)', border: '2px solid #34d399', transform: 'scale(0.97)', transition: 'all 0.2s ease' };
  if (isWrong)   return { background: 'rgba(239,68,68,0.25)',   border: '2px solid #ef4444', animation: 'gmShake 0.4s ease', transition: 'background 0.2s, border 0.2s' };
  if (isHinted)  return { background: 'rgba(96,165,250,0.28)',  border: '2px solid #60a5fa', transform: 'scale(1.06)', transition: 'all 0.2s ease', animation: 'gmPulse 0.6s ease infinite alternate' };
  if (isSel)     return { background: 'rgba(251,191,36,0.28)',  border: '2px solid #fbbf24', transform: 'scale(1.04)', transition: 'all 0.15s ease', boxShadow: '0 4px 20px rgba(251,191,36,0.3)' };
  return { background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.15)', transition: 'all 0.15s ease' };
}
