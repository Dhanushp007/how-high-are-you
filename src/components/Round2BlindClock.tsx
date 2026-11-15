import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, EyeOff, Play, Square } from 'lucide-react';
import { Round2Result, VibeMode } from '../types/game';
import { scoreRound2 } from '../utils/scoring';
import { playSound, triggerHaptic } from '../utils/sound';

interface Round2BlindClockProps {
  vibeMode: VibeMode;
  onComplete: (result: Round2Result) => void;
}

type ClockPhase = 'idle' | 'running' | 'stopped';

export function Round2BlindClock({
  vibeMode,
  onComplete,
}: Round2BlindClockProps) {
  const [phase, setPhase] = useState<ClockPhase>('idle');
  const [elapsedSec, setElapsedSec] = useState<number>(0);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastWholeSecRef = useRef<number>(0);

  const blindThreshold = vibeMode === 'unhinged' ? 2.5 : 3.0;

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  const handleStart = () => {
    if (phase !== 'idle') return;
    playSound('go');
    triggerHaptic(18);
    startTimeRef.current = performance.now();
    lastWholeSecRef.current = 0;
    setPhase('running');

    const tick = (now: number) => {
      const sec = (now - startTimeRef.current) / 1000;
      setElapsedSec(sec);

      const whole = Math.floor(sec);
      if (whole > lastWholeSecRef.current && sec <= blindThreshold + 0.1) {
        lastWholeSecRef.current = whole;
        playSound('tick');
      }

      // Safety cap at 18 seconds
      if (sec >= 18.0) {
        stopLoop();
        setElapsedSec(18.0);
        setPhase('stopped');
        playSound('error');
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const handleStop = () => {
    if (phase !== 'running') return;
    const finalSec = Number(
      ((performance.now() - startTimeRef.current) / 1000).toFixed(2)
    );
    stopLoop();
    setElapsedSec(finalSec);
    setPhase('stopped');

    const { score } = scoreRound2(finalSec);
    if (score >= 70) {
      playSound('success');
    } else {
      playSound('tap');
    }
    triggerHaptic(25);
  };

  const isHidden = phase === 'running' && elapsedSec >= blindThreshold;
  const formattedTime = elapsedSec.toFixed(2).padStart(5, '0');
  const resultMetrics =
    phase === 'stopped' ? scoreRound2(elapsedSec) : { deltaSec: 0, score: 0 };

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-8 flex-1">
      <div className="space-y-1.5">
        <span className="font-mono-tabular text-xs font-bold tracking-wider text-[#00F0FF] uppercase">
          Blind 7-Second Clock
        </span>
        <h2 className="font-display text-2xl font-bold text-white">
          Trust Your Internal Clock
        </h2>
        <p className="text-sm text-zinc-400">
          Digits disappear at{' '}
          <span className="font-mono-tabular text-white">
            {blindThreshold.toFixed(2)}s
          </span>
          . Stop the clock right when you think{' '}
          <span className="font-mono-tabular text-[#CCFF00]">7.00s</span> has
          passed.
        </p>
      </div>

      {/* LED Timer Card */}
      <div
        className={`flex-1 min-h-[250px] max-h-[340px] rounded-xl bg-[#18181B]/85 backdrop-blur-md border flex flex-col items-center justify-center p-6 text-center transition-colors ${
          isHidden
            ? 'border-[#FF007F]/70 shadow-[0_0_32px_rgba(255,0,127,0.2)]'
            : phase === 'running'
              ? 'border-[#00F0FF]/70 shadow-[0_0_32px_rgba(0,240,255,0.2)]'
              : 'border-white/10'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 font-mono-tabular text-xs uppercase tracking-widest">
            {isHidden ? (
              <span className="flex items-center gap-1.5 text-[#FF007F] animate-neon-pulse">
                <EyeOff className="w-4 h-4" />
                DISPLAY BLACKED OUT
              </span>
            ) : phase === 'running' ? (
              <span className="text-[#00F0FF]">CLOCK RUNNING...</span>
            ) : phase === 'stopped' ? (
              <span className="text-[#CCFF00]">TIME LOCKED</span>
            ) : (
              <span className="text-zinc-500">TARGET · 07.00s</span>
            )}
          </div>

          <p
            aria-live="off"
            className={`font-mono-tabular text-6xl font-bold tracking-tight ${
              isHidden
                ? 'text-[#FF007F] animate-neon-pulse drop-shadow-[0_0_20px_rgba(255,0,127,0.45)]'
                : phase === 'stopped'
                  ? 'text-[#CCFF00]'
                  : phase === 'running'
                    ? 'text-[#00F0FF] drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                    : 'text-zinc-300'
            }`}
          >
            {isHidden ? '??.??' : formattedTime}
            <span className="text-2xl ml-1 text-zinc-400">s</span>
          </p>

          {phase === 'stopped' && (
            <div className="pt-2 space-y-1 font-mono-tabular text-sm">
              <p className="text-zinc-300">
                Error Delta:{' '}
                <span
                  className={
                    Math.abs(resultMetrics.deltaSec) <= 0.5
                      ? 'text-[#CCFF00] font-bold'
                      : 'text-[#FF007F] font-bold'
                  }
                >
                  {resultMetrics.deltaSec >= 0 ? '+' : ''}
                  {resultMetrics.deltaSec.toFixed(2)}s
                </span>
              </p>
              <p className="text-xs text-zinc-400">
                SHARPNESS: {resultMetrics.score}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Control */}
      {phase === 'idle' && (
        <button
          type="button"
          onClick={handleStart}
          className="w-full min-h-[60px] flex items-center justify-center gap-2.5 rounded-xl bg-[#CCFF00] text-[#09090B] font-display text-base font-bold shadow-[0_0_24px_rgba(204,255,0,0.3)] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Clock</span>
        </button>
      )}

      {phase === 'running' && (
        <button
          type="button"
          onPointerDown={handleStop}
          className="w-full min-h-[64px] flex items-center justify-center gap-2.5 rounded-xl bg-[#FF007F] text-white font-display text-lg font-bold shadow-[0_0_28px_rgba(255,0,127,0.45)] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Square className="w-5 h-5 fill-current" />
          <span>STOP AT 7.00s</span>
        </button>
      )}

      {phase === 'stopped' && (
        <button
          type="button"
          onClick={() => {
            playSound('tap');
            triggerHaptic(15);
            onComplete({
              actualSec: elapsedSec,
              deltaSec: resultMetrics.deltaSec,
              score: resultMetrics.score,
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
