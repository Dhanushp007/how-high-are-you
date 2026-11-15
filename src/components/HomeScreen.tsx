import { Flame, Play, Sparkles, Trophy } from 'lucide-react';
import { SessionRun, VibeMode } from '../types/game';
import { playSound, triggerHaptic } from '../utils/sound';

interface HomeScreenProps {
  playerName: string;
  vibeMode: VibeMode;
  sessionHistory: SessionRun[];
  onPlayerNameChange: (name: string) => void;
  onVibeModeChange: (mode: VibeMode) => void;
  onStartGame: () => void;
}

const ROUNDS_PREVIEW = [
  { num: '01', name: 'Reflex Tap', desc: 'Reaction speed under pressure' },
  { num: '02', name: 'Blind 7s Clock', desc: 'Hidden internal time sense' },
  { num: '03', name: 'Color Trap', desc: 'Stroop focus override' },
  { num: '04', name: 'Pattern Grid', desc: '4-tile neon memory lock' },
  { num: '05', name: 'Truth or Dare', desc: 'Final party verdict card' },
];

export function HomeScreen({
  playerName,
  vibeMode,
  sessionHistory,
  onPlayerNameChange,
  onVibeModeChange,
  onStartGame,
}: HomeScreenProps) {
  const handleModeSelect = (mode: VibeMode) => {
    if (mode !== vibeMode) {
      playSound('tap');
      triggerHaptic(12);
      onVibeModeChange(mode);
    }
  };

  const handleStart = () => {
    playSound('go');
    triggerHaptic([15, 25, 20]);
    onStartGame();
  };

  return (
    <div className="relative flex flex-col gap-5 px-4 pt-5 pb-8">
      {/* Subtle Neon Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full bg-[#CCFF00]/10 blur-3xl"
      />

      {/* Hero Title */}
      <section className="relative text-center space-y-2.5 pt-1">
        <p className="font-mono-tabular text-xs font-bold tracking-[0.14em] text-[#00F0FF] uppercase">
          5-Round Sobriety &amp; Vibe Diagnostic
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight leading-[1.06] text-white [text-wrap:balance]">
          How High{' '}
          <span className="text-[#CCFF00] drop-shadow-[0_0_16px_rgba(204,255,0,0.35)]">
            Are You?
          </span>
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
          Pass the phone, survive five arcade tests, and get your official
          Cooked Percentage.
        </p>
      </section>

      {/* Player & Vibe Mode Setup Card */}
      <section className="relative bg-[#18181B]/85 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="player-name-input"
            className="block font-mono-tabular text-xs font-bold tracking-wider text-zinc-400 uppercase"
          >
            Contestant Name
          </label>
          <input
            id="player-name-input"
            type="text"
            maxLength={20}
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            placeholder="PLAYER 1 (OPTIONAL)"
            className="w-full min-h-[48px] px-3.5 rounded-lg bg-[#09090B] border border-white/15 font-mono-tabular text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F0FF] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.16)] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <span className="block font-mono-tabular text-xs font-bold tracking-wider text-zinc-400 uppercase">
            Vibe Mode
          </span>
          <div
            role="radiogroup"
            aria-label="Vibe Mode"
            className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#09090B] border border-white/10"
          >
            <button
              type="button"
              role="radio"
              aria-checked={vibeMode === 'chill'}
              onClick={() => handleModeSelect('chill')}
              className={`min-h-[46px] flex items-center justify-center gap-2 rounded-md font-display text-sm font-bold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] ${
                vibeMode === 'chill'
                  ? 'bg-[#00F0FF] text-[#09090B] shadow-[0_0_16px_rgba(0,240,255,0.35)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Chill</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={vibeMode === 'unhinged'}
              onClick={() => handleModeSelect('unhinged')}
              className={`min-h-[46px] flex items-center justify-center gap-2 rounded-md font-display text-sm font-bold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007F] ${
                vibeMode === 'unhinged'
                  ? 'bg-[#FF007F] text-white shadow-[0_0_18px_rgba(255,0,127,0.45)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span>Unhinged</span>
            </button>
          </div>
          <p className="text-xs text-zinc-400 leading-snug pt-0.5">
            {vibeMode === 'chill'
              ? 'Standard arcade timers and playful party Truth or Dare cards.'
              : 'Faster countdowns, rapid memory flashes, and chaotic Truth or Dares.'}
          </p>
        </div>
      </section>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleStart}
        className="w-full min-h-[56px] flex items-center justify-center gap-2.5 rounded-xl bg-[#CCFF00] text-[#09090B] font-display text-base font-bold tracking-tight shadow-[0_0_24px_rgba(204,255,0,0.32)] hover:brightness-105 active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>Start Vibe Check</span>
      </button>

      {/* 5-Round Gauntlet List */}
      <section className="bg-[#18181B]/65 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="font-mono-tabular text-xs font-bold tracking-wider text-zinc-300 uppercase">
            Test Circuit
          </span>
          <span className="font-mono-tabular text-xs text-zinc-500">
            ~60 SEC
          </span>
        </div>
        <ul className="divide-y divide-white/5">
          {ROUNDS_PREVIEW.map((round) => (
            <li
              key={round.num}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono-tabular text-xs font-bold text-[#00F0FF] shrink-0">
                  {round.num}
                </span>
                <span className="font-display font-semibold text-white whitespace-nowrap">
                  {round.name}
                </span>
              </div>
              <span className="text-xs text-zinc-400 truncate pl-3">
                {round.desc}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Session Party Leaderboard (if players already completed runs) */}
      {sessionHistory.length > 0 && (
        <section className="bg-[#18181B]/75 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#CCFF00]" />
              <span className="font-mono-tabular text-xs font-bold tracking-wider text-zinc-200 uppercase">
                Tonight&apos;s Scoreboard
              </span>
            </div>
            <span className="font-mono-tabular text-xs text-zinc-500">
              {sessionHistory.length}{' '}
              {sessionHistory.length === 1 ? 'RUN' : 'RUNS'}
            </span>
          </div>
          <ul className="divide-y divide-white/5">
            {sessionHistory.slice(0, 6).map((run) => (
              <li
                key={run.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-white truncate">
                    {run.playerName}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {run.tierTitle}{' '}
                    <span className="text-zinc-600" aria-hidden="true">
                      ·
                    </span>{' '}
                    <span className="capitalize">{run.vibeMode}</span>
                  </p>
                </div>
                <span
                  className={`font-mono-tabular text-base font-bold shrink-0 pl-3 ${
                    run.cookedPercent >= 75
                      ? 'text-[#FF007F]'
                      : run.cookedPercent >= 50
                        ? 'text-amber-400'
                        : run.cookedPercent >= 25
                          ? 'text-[#00F0FF]'
                          : 'text-[#CCFF00]'
                  }`}
                >
                  {run.cookedPercent}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
