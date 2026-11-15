import { useEffect, useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import {
  Round1Result,
  Round2Result,
  Round3Result,
  Round4Result,
  Round5Result,
  VibeMode,
} from '../types/game';
import { computeDiagnosticVerdict } from '../utils/scoring';
import { playSound, triggerHaptic } from '../utils/sound';

interface ResultsScreenProps {
  playerName: string;
  vibeMode: VibeMode;
  r1: Round1Result;
  r2: Round2Result;
  r3: Round3Result;
  r4: Round4Result;
  r5: Round5Result;
  onPassThePhone: () => void;
}

export function ResultsScreen({
  playerName,
  vibeMode,
  r1,
  r2,
  r3,
  r4,
  r5,
  onPassThePhone,
}: ResultsScreenProps) {
  const verdict = computeDiagnosticVerdict(r1, r2, r3, r4, r5);
  const [animatedPct, setAnimatedPct] = useState(0);
  const [copied, setCopied] = useState(false);

  const displayName = playerName.trim() || 'Player 1';

  useEffect(() => {
    let rafId: number;
    const duration = 900;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPct(Math.round(eased * verdict.cookedPercent));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [verdict.cookedPercent]);

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset =
    circumference - (animatedPct / 100) * circumference;

  const breakdown = [
    {
      label: 'Reflexes',
      weight: '25%',
      score: r1.score,
      detail: `${r1.reactionMs}ms${r1.falseStarts > 0 ? ` (${r1.falseStarts} early)` : ''}`,
      color: '#CCFF00',
    },
    {
      label: 'Blind Clock',
      weight: '25%',
      score: r2.score,
      detail: `${r2.actualSec.toFixed(2)}s (${r2.deltaSec >= 0 ? '+' : ''}${r2.deltaSec.toFixed(2)}s)`,
      color: '#00F0FF',
    },
    {
      label: 'Color Trap',
      weight: '25%',
      score: r3.score,
      detail: `${r3.correct}/${r3.total} · ${r3.avgMs}ms avg`,
      color: '#CCFF00',
    },
    {
      label: 'Pattern Grid',
      weight: '15%',
      score: r4.score,
      detail: `${r4.correctTiles}/${r4.totalTiles} tiles`,
      color: '#00F0FF',
    },
    {
      label: r5.type,
      weight: '10%',
      score: r5.score,
      detail: r5.completed ? 'Nailed It' : 'Chickened Out',
      color: r5.completed ? '#CCFF00' : '#FF007F',
    },
  ];

  const handleCopyVerdict = async () => {
    const summary = `${verdict.tierEmoji} HOW HIGH ARE YOU? (${displayName} · ${vibeMode.toUpperCase()})\nVerdict: ${verdict.cookedPercent}% COOKED — ${verdict.tierTitle}\n⚡ Reflex: ${r1.reactionMs}ms | ⏱️ Clock: ${r2.actualSec.toFixed(2)}s | 🎨 Stroop: ${r3.correct}/${r3.total} | 🧩 Memory: ${r4.correctTiles}/${r4.totalTiles} | 🃏 ${r5.type}: ${r5.completed ? 'Nailed It' : 'Chickened Out'}`;

    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = summary;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    playSound('success');
    triggerHaptic(20);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-10">
      {/* Animated Cooked Gauge */}
      <section className="relative rounded-xl bg-[#18181B]/85 backdrop-blur-md border border-white/10 p-6 flex flex-col items-center text-center">
        <span className="font-mono-tabular text-xs font-bold tracking-widest text-zinc-400 uppercase mb-3">
          {displayName} · DIAGNOSTIC RESULT
        </span>

        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 168 168"
            aria-hidden="true"
          >
            <circle
              cx="84"
              cy="84"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
            />
            <circle
              cx="84"
              cy="84"
              r={radius}
              fill="none"
              stroke={verdict.accentColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              style={{
                filter: `drop-shadow(0 0 10px ${verdict.accentColor}66)`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono-tabular text-5xl font-bold tracking-tight"
              style={{ color: verdict.accentColor }}
            >
              {animatedPct}%
            </span>
            <span className="font-mono-tabular text-xs font-bold tracking-widest text-zinc-400 mt-1">
              COOKED
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">
            {verdict.tierEmoji} {verdict.tierTitle}
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-sm">
            {verdict.roast}
          </p>
        </div>
      </section>

      {/* Individual Skill Breakdown */}
      <section className="rounded-xl bg-[#18181B]/80 backdrop-blur-md border border-white/10 p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="font-mono-tabular text-xs font-bold tracking-wider text-zinc-300 uppercase">
            Sharpness Breakdown
          </span>
          <span className="font-mono-tabular text-xs text-zinc-500">
            WEIGHTED
          </span>
        </div>

        <div className="space-y-3.5">
          {breakdown.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-white">
                    {item.label}
                  </span>
                  <span className="font-mono-tabular text-zinc-500">
                    {item.weight}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono-tabular">
                  <span className="text-zinc-400">{item.detail}</span>
                  <span className="font-bold text-white w-9 text-right">
                    {item.score}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.score}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleCopyVerdict}
          className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl bg-[#18181B] border border-[#00F0FF]/70 text-[#00F0FF] font-display text-base font-bold hover:bg-[#00F0FF]/10 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-[#CCFF00]" />
              <span className="text-[#CCFF00]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copy Verdict</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('tap');
            triggerHaptic(15);
            onPassThePhone();
          }}
          className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl bg-[#CCFF00] text-[#09090B] font-display text-base font-bold shadow-[0_0_24px_rgba(204,255,0,0.3)] hover:brightness-105 active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Pass the Phone</span>
        </button>
      </div>

      {/* Copied Toast */}
      {copied && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#CCFF00] text-[#09090B] font-mono-tabular text-xs font-bold shadow-[0_0_24px_rgba(204,255,0,0.45)]"
        >
          Verdict copied to clipboard!
        </div>
      )}
    </div>
  );
}
