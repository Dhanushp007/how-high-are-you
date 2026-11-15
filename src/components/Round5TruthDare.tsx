import { useEffect, useState } from 'react';
import { CheckCircle2, Flame, RefreshCw, ShieldAlert } from 'lucide-react';
import { PartyPrompt, pickRandomPrompt } from '../data/prompts';
import { Round5Result, VibeMode } from '../types/game';
import { playSound, triggerHaptic } from '../utils/sound';

interface Round5TruthDareProps {
  vibeMode: VibeMode;
  seenPromptIds: string[];
  onPromptSeen: (id: string) => void;
  onComplete: (result: Round5Result) => void;
}

export function Round5TruthDare({
  vibeMode,
  seenPromptIds,
  onPromptSeen,
  onComplete,
}: Round5TruthDareProps) {
  const [card, setCard] = useState<PartyPrompt>(() =>
    pickRandomPrompt(vibeMode, seenPromptIds)
  );

  useEffect(() => {
    onPromptSeen(card.id);
  }, [card.id, onPromptSeen]);

  const handleSwap = () => {
    playSound('tap');
    triggerHaptic(12);
    const next = pickRandomPrompt(vibeMode, [...seenPromptIds, card.id]);
    setCard(next);
  };

  const handleResolve = (completed: boolean) => {
    if (completed) {
      playSound('fanfare');
      triggerHaptic([20, 30, 35]);
    } else {
      playSound('error');
      triggerHaptic([40, 25, 40]);
    }

    onComplete({
      type: card.type,
      prompt: card.text,
      completed,
      score: completed ? 100 : 0,
    });
  };

  const isDare = card.type === 'Dare';

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-8 flex-1">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span
            className={`font-mono-tabular text-xs font-bold tracking-wider uppercase ${
              isDare ? 'text-[#FF007F]' : 'text-[#00F0FF]'
            }`}
          >
            Final Test · {card.type}
          </span>
          <span className="font-mono-tabular text-xs text-zinc-400 uppercase">
            {vibeMode} DECK
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          Execute or Fold
        </h2>
        <p className="text-sm text-zinc-400">
          Read the card aloud to the room. Chickening out bumps your Cooked
          score by +10%.
        </p>
      </div>

      {/* Truth or Dare Neon Card */}
      <div
        className={`relative flex-1 min-h-[240px] rounded-xl bg-[#18181B]/90 backdrop-blur-md border p-6 flex flex-col justify-between transition-colors ${
          isDare
            ? 'border-[#FF007F]/70 shadow-[0_0_36px_rgba(255,0,127,0.2)]'
            : 'border-[#00F0FF]/70 shadow-[0_0_36px_rgba(0,240,255,0.18)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDare ? (
              <Flame className="w-5 h-5 text-[#FF007F]" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-[#00F0FF]" />
            )}
            <span
              className={`font-display text-sm font-bold tracking-widest uppercase ${
                isDare ? 'text-[#FF007F]' : 'text-[#00F0FF]'
              }`}
            >
              {card.type}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono-tabular text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
        </div>

        <p className="font-body text-xl font-medium leading-relaxed text-white my-6">
          {card.text}
        </p>

        <p className="font-mono-tabular text-[11px] uppercase tracking-wider text-zinc-500">
          GROUP WITNESS REQUIRED
        </p>
      </div>

      {/* Chickened Out / Nailed It Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          type="button"
          onClick={() => handleResolve(false)}
          className="min-h-[58px] px-4 rounded-xl bg-[#18181B] border border-[#FF007F]/70 text-[#FF007F] font-display text-sm font-bold hover:bg-[#FF007F]/10 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007F]"
        >
          Chickened Out
        </button>
        <button
          type="button"
          onClick={() => handleResolve(true)}
          className="min-h-[58px] px-4 flex items-center justify-center gap-2 rounded-xl bg-[#CCFF00] text-[#09090B] font-display text-sm font-bold shadow-[0_0_24px_rgba(204,255,0,0.3)] hover:brightness-105 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Nailed It</span>
        </button>
      </div>
    </div>
  );
}
