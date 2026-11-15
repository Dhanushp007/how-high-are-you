import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { Round1Result, VibeMode } from '../types/game';
import { scoreRound1 } from '../utils/scoring';
import { playSound, triggerHaptic } from '../utils/sound';

interface Round1ReflexProps {
  vibeMode: VibeMode;
  onComplete: (result: Round1Result) => void;
}

type ReflexPhase = 'waiting' | 'ready' | 'done';

export function Round1Reflex({ vibeMode, onComplete }: Round1ReflexProps) {
  const [phase, setPhase] = useState<ReflexPhase>('waiting');
  const [falseStarts, setFalseStarts] = useState(0);
  const [earlyBanner, setEarlyBanner] = useState(false);
  const [reactionMs, setReactionMs] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const guardTimerRef = useRef<number | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const greenAtRef = useRef<number>(0);
  const inputArmedRef = useRef<boolean>(false);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (guardTimerRef.current !== null) {
      window.clearTimeout(guardTimerRef.current);
      guardTimerRef.current = null;
    }
    if (bannerTimerRef.current !== null) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
  }, []);

  const scheduleGreen = useCallback(() => {
    clearAllTimers();
    setPhase('waiting');
    inputArmedRef.current = false;

    // Short 220ms guard so carry-over tap from Start button never penalizes
    guardTimerRef.current = window.setTimeout(() => {
      inputArmedRef.current = true;
    }, 220);

    const minDelay = vibeMode === 'unhinged' ? 1200 : 1500;
    const maxDelay = vibeMode === 'unhinged' ? 3700 : 3500;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    timerRef.current = window.setTimeout(() => {
      greenAtRef.current = performance.now();
      inputArmedRef.current = true;
      setPhase('ready');
      setEarlyBanner(false);
      playSound('go');
      triggerHaptic(20);
    }, delay);
  }, [clearAllTimers, vibeMode]);

  useEffect(() => {
    scheduleGreen();
    return () => {
      clearAllTimers();
    };
  }, [scheduleGreen, clearAllTimers]);

  const handlePadPress = () => {
    if (phase === 'done') return;

    if (phase === 'waiting') {
      if (!inputArmedRef.current) return;
      playSound('error');
      triggerHaptic([45, 30, 45]);
      setFalseStarts((prev) => prev + 1);
      setEarlyBanner(true);
      scheduleGreen();
      bannerTimerRef.current = window.setTimeout(() => {
        setEarlyBanner(false);
      }, 1200);
      return;
    }

    if (phase === 'ready') {
      const elapsed = Math.max(
        60,
        Math.round(performance.now() - greenAtRef.current)
      );
      clearAllTimers();
      setReactionMs(elapsed);
      setPhase('done');
      playSound('success');
      triggerHaptic(25);
    }
  };

  const finalScore =
    reactionMs !== null ? scoreRound1(reactionMs, falseStarts) : 0;

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-8 flex-1">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono-tabular text-xs font-bold tracking-wider text-[#00F0FF] uppercase">
            Reflex Tap
          </span>
          {falseStarts > 0 && (
            <span className="font-mono-tabular text-xs font-bold text-[#FF007F]">
              FALSE STARTS: {falseStarts}
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          Test Your Trigger Speed
        </h2>
        <p className="text-sm text-zinc-400">
          Hold steady while the zone is Hot Magenta. Tap the instant it flashes
          Acid Lime.
        </p>
      </div>

      {/* Main Interactive Reflex Pad */}
      <button
        type="button"
        onPointerDown={handlePadPress}
        disabled={phase === 'done'}
        aria-live="polite"
        className={`relative w-full min-h-[300px] flex-1 max-h-[380px] rounded-xl border flex flex-col items-center justify-center p-6 text-center select-none transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          phase === 'waiting'
            ? 'bg-[#FF007F] border-[#FF007F] text-white shadow-[0_0_40px_rgba(255,0,127,0.35)] active:brightness-95'
            : phase === 'ready'
              ? 'bg-[#CCFF00] border-[#CCFF00] text-[#09090B] shadow-[0_0_48px_rgba(204,255,0,0.45)] active:scale-[0.99]'
              : 'bg-[#18181B]/85 backdrop-blur-md border-white/15 text-white cursor-default'
        }`}
      >
        {phase === 'waiting' && (
          <div className="space-y-3">
            <Zap className="w-10 h-10 mx-auto opacity-90" />
            <p className="font-display text-3xl font-bold tracking-tight">
              WAIT FOR GREEN...
            </p>
            <p className="font-mono-tabular text-xs uppercase tracking-wider text-white/85">
              {earlyBanner
                ? 'TOO EARLY! +140ms PENALTY — RESETTING'
                : 'DO NOT TAP YET'}
            </p>
          </div>
        )}

        {phase === 'ready' && (
          <div className="space-y-2">
            <Zap className="w-12 h-12 mx-auto fill-current" />
            <p className="font-display text-4xl font-bold tracking-tight">
              TAP NOW!
            </p>
            <p className="font-mono-tabular text-xs font-bold uppercase tracking-wider text-[#09090B]/80">
              HIT ANYWHERE IN THIS BOX
            </p>
          </div>
        )}

        {phase === 'done' && reactionMs !== null && (
          <div className="space-y-4 w-full">
            <p className="font-mono-tabular text-xs font-bold uppercase tracking-widest text-[#00F0FF]">
              REACTION RECORDED
            </p>
            <p className="font-mono-tabular text-6xl font-bold text-[#CCFF00] tracking-tight">
              {reactionMs}
              <span className="text-2xl ml-1 text-zinc-300">ms</span>
            </p>
            <div className="flex items-center justify-center gap-3 text-xs font-mono-tabular text-zinc-400">
              <span>SHARPNESS: {finalScore}%</span>
              {falseStarts > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#FF007F]">
                    {falseStarts} EARLY {falseStarts === 1 ? 'TAP' : 'TAPS'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </button>

      {phase === 'done' && reactionMs !== null && (
        <button
          type="button"
          onClick={() => {
            playSound('tap');
            triggerHaptic(15);
            onComplete({
              reactionMs,
              falseStarts,
              score: finalScore,
            });
          }}
          className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl bg-[#CCFF00] text-[#09090B] font-display text-base font-bold shadow-[0_0_24px_rgba(204,255,0,0.28)] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span>Next Round</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
