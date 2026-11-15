import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { Round4Result, VibeMode } from '../types/game';
import { scoreRound4 } from '../utils/scoring';
import { playSound, triggerHaptic } from '../utils/sound';

interface Round4MemoryProps {
  vibeMode: VibeMode;
  onComplete: (result: Round4Result) => void;
}

type MemoryPhase = 'showing' | 'input' | 'done';

const SEQUENCE_LENGTH = 4;

function generatePattern(): number[] {
  const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, SEQUENCE_LENGTH);
}

export function Round4Memory({ vibeMode, onComplete }: Round4MemoryProps) {
  const [pattern] = useState<number[]>(() => generatePattern());
  const [phase, setPhase] = useState<MemoryPhase>('showing');
  const [litTile, setLitTile] = useState<number | null>(null);
  const [tappedTiles, setTappedTiles] = useState<number[]>([]);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [expectedTile, setExpectedTile] = useState<number | null>(null);

  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const onDuration = vibeMode === 'unhinged' ? 270 : 420;
    const gapDuration = vibeMode === 'unhinged' ? 115 : 170;
    const initialDelay = 550;

    const scheduled: number[] = [];

    pattern.forEach((tileIndex, step) => {
      const startAt = initialDelay + step * (onDuration + gapDuration);
      const endAt = startAt + onDuration;

      scheduled.push(
        window.setTimeout(() => {
          setLitTile(tileIndex);
          playSound('flash', tileIndex);
        }, startAt)
      );

      scheduled.push(
        window.setTimeout(() => {
          setLitTile(null);
        }, endAt)
      );
    });

    const inputStartAt =
      initialDelay + pattern.length * (onDuration + gapDuration) + 80;
    scheduled.push(
      window.setTimeout(() => {
        setPhase('input');
      }, inputStartAt)
    );

    timeoutsRef.current = scheduled;

    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [pattern, vibeMode]);

  const handleTileTap = (tileIndex: number) => {
    if (phase !== 'input') return;

    const currentStep = tappedTiles.length;
    const targetTile = pattern[currentStep];

    if (tileIndex === targetTile) {
      const nextTapped = [...tappedTiles, tileIndex];
      setTappedTiles(nextTapped);
      playSound('flash', tileIndex);
      triggerHaptic(15);

      if (nextTapped.length === SEQUENCE_LENGTH) {
        setPhase('done');
        playSound('success');
        triggerHaptic([20, 25, 25]);
      }
    } else {
      setWrongTile(tileIndex);
      setExpectedTile(targetTile);
      setPhase('done');
      playSound('error');
      triggerHaptic([45, 30, 45]);
    }
  };

  const correctCount = tappedTiles.length;
  const completedAll = correctCount === SEQUENCE_LENGTH && wrongTile === null;
  const roundScore = scoreRound4(correctCount, SEQUENCE_LENGTH);

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-8 flex-1">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono-tabular text-xs font-bold tracking-wider text-[#00F0FF] uppercase">
            Pattern Memory
          </span>
          <span className="font-mono-tabular text-xs font-bold text-zinc-300">
            {phase === 'showing'
              ? 'WATCH SEQUENCE'
              : `${correctCount} / ${SEQUENCE_LENGTH} LOCKED`}
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          Repeat the Neon Sequence
        </h2>
        <p className="text-sm text-zinc-400">
          {phase === 'showing'
            ? 'Watch all 4 Electric Cyan flashes carefully...'
            : phase === 'input'
              ? 'Now tap the 4 tiles back in exact order.'
              : completedAll
                ? 'Clean sweep! Your short-term memory is intact.'
                : 'Sequence broken—the missed tile is highlighted in cyan.'}
        </p>
      </div>

      {/* 3x3 Neon Tile Grid */}
      <div
        className="grid grid-cols-3 gap-3 my-auto py-2"
        role="group"
        aria-label="3 by 3 memory tile grid"
      >
        {Array.from({ length: 9 }).map((_, idx) => {
          const isShowingLit = litTile === idx;
          const stepTappedIdx = tappedTiles.indexOf(idx);
          const isUserMatched = stepTappedIdx !== -1;
          const isWrong = wrongTile === idx;
          const isExpected = expectedTile === idx;

          return (
            <button
              key={idx}
              type="button"
              disabled={phase !== 'input' || isUserMatched}
              onPointerDown={() => handleTileTap(idx)}
              aria-label={`Tile ${idx + 1}`}
              className={`aspect-square rounded-xl border flex items-center justify-center font-mono-tabular text-lg font-bold transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isShowingLit
                  ? 'bg-[#00F0FF] border-[#00F0FF] text-[#09090B] shadow-[0_0_28px_rgba(0,240,255,0.65)] scale-[0.97]'
                  : isWrong
                    ? 'bg-[#FF007F] border-[#FF007F] text-white shadow-[0_0_24px_rgba(255,0,127,0.55)]'
                    : isExpected
                      ? 'bg-[#00F0FF]/25 border-[#00F0FF] text-[#00F0FF]'
                      : isUserMatched
                        ? 'bg-[#CCFF00] border-[#CCFF00] text-[#09090B] shadow-[0_0_20px_rgba(204,255,0,0.45)]'
                        : 'bg-[#18181B]/90 border-white/15 text-zinc-600 hover:border-white/30 active:scale-[0.96]'
              }`}
            >
              {isUserMatched ? (
                <span>{stepTappedIdx + 1}</span>
              ) : isWrong ? (
                <X className="w-6 h-6" />
              ) : isExpected ? (
                <span>{tappedTiles.length + 1}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {phase === 'done' && (
        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#18181B]/80 border border-white/10 font-mono-tabular text-xs">
            <span
              className={`flex items-center gap-1.5 font-bold ${
                completedAll ? 'text-[#CCFF00]' : 'text-[#FF007F]'
              }`}
            >
              {completedAll ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {correctCount}/{SEQUENCE_LENGTH} TILES CORRECT
            </span>
            <span className="text-zinc-400">SHARPNESS: {roundScore}%</span>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound('tap');
              triggerHaptic(15);
              onComplete({
                correctTiles: correctCount,
                totalTiles: SEQUENCE_LENGTH,
                completed: completedAll,
                score: roundScore,
              });
            }}
            className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl bg-[#CCFF00] text-[#09090B] font-display text-base font-bold shadow-[0_0_24px_rgba(204,255,0,0.28)] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Final Round</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
