import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { Round3Result, VibeMode } from '../types/game';
import { scoreRound3 } from '../utils/scoring';
import { playSound, triggerHaptic } from '../utils/sound';

interface Round3StroopProps {
  vibeMode: VibeMode;
  onComplete: (result: Round3Result) => void;
}

type ColorKey = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';

interface StroopCard {
  word: ColorKey;
  ink: ColorKey;
}

const COLORS: Record<
  ColorKey,
  { label: ColorKey; hex: string; border: string; bg: string }
> = {
  RED: {
    label: 'RED',
    hex: '#FF2E54',
    border: 'border-[#FF2E54]/60',
    bg: 'bg-[#FF2E54]',
  },
  BLUE: {
    label: 'BLUE',
    hex: '#00B4FF',
    border: 'border-[#00B4FF]/60',
    bg: 'bg-[#00B4FF]',
  },
  GREEN: {
    label: 'GREEN',
    hex: '#22FF66',
    border: 'border-[#22FF66]/60',
    bg: 'bg-[#22FF66]',
  },
  YELLOW: {
    label: 'YELLOW',
    hex: '#FFE600',
    border: 'border-[#FFE600]/60',
    bg: 'bg-[#FFE600]',
  },
};

const COLOR_KEYS: ColorKey[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const TOTAL_CARDS = 3;

function buildCards(): StroopCard[] {
  const cards: StroopCard[] = [];
  for (let i = 0; i < TOTAL_CARDS; i++) {
    const word = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    const otherColors = COLOR_KEYS.filter((c) => c !== word);
    const ink = otherColors[Math.floor(Math.random() * otherColors.length)];
    cards.push({ word, ink });
  }
  return cards;
}

export function Round3Stroop({ vibeMode, onComplete }: Round3StroopProps) {
  const limitMs = vibeMode === 'unhinged' ? 2100 : 3000;

  const [cards] = useState<StroopCard[]>(() => buildCards());
  const [cardIndex, setCardIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(limitMs);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [results, setResults] = useState<{ ok: boolean; ms: number }[]>([]);
  const [finished, setFinished] = useState(false);

  const rafRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const cardStartRef = useRef<number>(0);
  const lockedRef = useRef<boolean>(false);

  const stopTimer = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const advanceOrFinish = useCallback(
    (nextResults: { ok: boolean; ms: number }[], currentIdx: number) => {
      feedbackTimerRef.current = window.setTimeout(() => {
        setFeedback(null);
        if (currentIdx + 1 >= TOTAL_CARDS) {
          setFinished(true);
        } else {
          setCardIndex(currentIdx + 1);
          setRemainingMs(limitMs);
          lockedRef.current = false;
        }
      }, 650);
    },
    [limitMs]
  );

  useEffect(() => {
    if (finished) return;
    lockedRef.current = false;
    cardStartRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - cardStartRef.current;
      const left = Math.max(0, limitMs - elapsed);
      setRemainingMs(left);

      if (left <= 0) {
        stopTimer();
        if (!lockedRef.current) {
          lockedRef.current = true;
          playSound('error');
          triggerHaptic([35, 25, 35]);
          const expected = cards[cardIndex].ink;
          setFeedback({ ok: false, message: `TIME UP · INK WAS ${expected}` });
          setResults((prev) => {
            const next = [...prev, { ok: false, ms: limitMs }];
            advanceOrFinish(next, cardIndex);
            return next;
          });
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopTimer();
    };
  }, [cardIndex, finished, limitMs, cards, stopTimer, advanceOrFinish]);

  useEffect(() => {
    return () => {
      stopTimer();
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [stopTimer]);

  const handlePick = (choice: ColorKey) => {
    if (lockedRef.current || finished) return;
    lockedRef.current = true;
    stopTimer();

    const elapsed = Math.min(
      limitMs,
      Math.max(100, Math.round(performance.now() - cardStartRef.current))
    );
    const currentCard = cards[cardIndex];
    const isCorrect = choice === currentCard.ink;

    if (isCorrect) {
      playSound('success');
      triggerHaptic(18);
      setFeedback({ ok: true, message: `CORRECT · ${elapsed}ms` });
    } else {
      playSound('error');
      triggerHaptic([35, 25, 35]);
      setFeedback({
        ok: false,
        message: `TRAP! INK WAS ${currentCard.ink}`,
      });
    }

    setResults((prev) => {
      const next = [...prev, { ok: isCorrect, ms: elapsed }];
      advanceOrFinish(next, cardIndex);
      return next;
    });
  };

  const correctCount = results.filter((r) => r.ok).length;
  const avgMs =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.ms, 0) / results.length)
      : limitMs;
  const roundScore = scoreRound3(correctCount, TOTAL_CARDS, avgMs);

  const currentCard = cards[cardIndex];
  const progressPct = Math.max(0, Math.min(100, (remainingMs / limitMs) * 100));

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-8 flex-1">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono-tabular text-xs font-bold tracking-wider text-[#00F0FF] uppercase">
            Stroop Color Trap
          </span>
          {!finished && (
            <span className="font-mono-tabular text-xs font-bold text-zinc-300">
              CARD {cardIndex + 1} / {TOTAL_CARDS}
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          Tap the Ink Color
        </h2>
        <p className="text-sm text-zinc-400">
          Ignore what the word spells. Select the actual{' '}
          <span className="text-white font-semibold">text color</span> before
          the bar runs out.
        </p>
      </div>

      {!finished ? (
        <>
          {/* Countdown Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono-tabular text-xs">
              <span className="text-zinc-400">TIME LEFT</span>
              <span
                className={
                  remainingMs < 900
                    ? 'text-[#FF007F] font-bold'
                    : 'text-[#00F0FF] font-bold'
                }
              >
                {(remainingMs / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-colors ${
                  remainingMs < 900 ? 'bg-[#FF007F]' : 'bg-[#00F0FF]'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Stroop Word Card */}
          <div className="relative min-h-[190px] rounded-xl bg-[#18181B]/90 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center p-6 text-center">
            <p
              className="font-display text-5xl font-bold tracking-tight select-none"
              style={{ color: COLORS[currentCard.ink].hex }}
            >
              {currentCard.word}
            </p>

            {feedback && (
              <div
                className={`mt-4 flex items-center gap-1.5 font-mono-tabular text-xs font-bold uppercase tracking-wider ${
                  feedback.ok ? 'text-[#CCFF00]' : 'text-[#FF007F]'
                }`}
              >
                {feedback.ok ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}
          </div>

          {/* 2x2 Color Answer Grid */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {COLOR_KEYS.map((key) => {
              const c = COLORS[key];
              return (
                <button
                  key={key}
                  type="button"
                  disabled={Boolean(feedback)}
                  onPointerDown={() => handlePick(key)}
                  className={`min-h-[68px] flex items-center justify-center gap-3 rounded-xl bg-[#18181B] border ${c.border} hover:bg-white/5 active:scale-[0.97] transition-transform disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-4 h-4 rounded-full ${c.bg}`}
                  />
                  <span className="font-display text-base font-bold tracking-wide text-white">
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-5 flex-1 justify-between">
          <div className="rounded-xl bg-[#18181B]/85 backdrop-blur-md border border-white/15 p-6 text-center space-y-4 my-auto">
            <p className="font-mono-tabular text-xs font-bold uppercase tracking-widest text-[#00F0FF]">
              FOCUS CHECK COMPLETE
            </p>
            <p className="font-mono-tabular text-5xl font-bold text-[#CCFF00]">
              {correctCount}/{TOTAL_CARDS}
            </p>
            <div className="flex items-center justify-center gap-3 font-mono-tabular text-xs text-zinc-400">
              <span>AVG SPEED: {avgMs}ms</span>
              <span aria-hidden="true">·</span>
              <span>SHARPNESS: {roundScore}%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound('tap');
              triggerHaptic(15);
              onComplete({
                correct: correctCount,
                total: TOTAL_CARDS,
                avgMs,
                score: roundScore,
              });
            }}
            className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl bg-[#CCFF00] text-[#09090B] font-display text-base font-bold shadow-[0_0_24px_rgba(204,255,0,0.28)] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Next Round</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
