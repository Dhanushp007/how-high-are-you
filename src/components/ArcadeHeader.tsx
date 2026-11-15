import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { GameScreen, VibeMode } from '../types/game';

interface ArcadeHeaderProps {
  screen: GameScreen;
  playerName: string;
  vibeMode: VibeMode;
  isMuted: boolean;
  onToggleMute: () => void;
  onExitToHome: () => void;
}

const ROUND_INDEX: Record<GameScreen, number> = {
  home: 0,
  round1: 1,
  round2: 2,
  round3: 3,
  round4: 4,
  round5: 5,
  results: 6,
};

export function ArcadeHeader({
  screen,
  playerName,
  vibeMode,
  isMuted,
  onToggleMute,
  onExitToHome,
}: ArcadeHeaderProps) {
  const currentRound = ROUND_INDEX[screen];
  const isRound = currentRound >= 1 && currentRound <= 5;
  const displayName = playerName.trim() || 'Player 1';

  return (
    <header className="sticky top-0 z-30 bg-[#09090B]/90 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5 min-w-0">
          {screen !== 'home' ? (
            <button
              type="button"
              onClick={onExitToHome}
              aria-label="Return to Home"
              className="flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}

          {isRound ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono-tabular text-xs font-bold tracking-wider text-[#00F0FF] whitespace-nowrap">
                ROUND 0{currentRound}/05
              </span>
              <span className="text-zinc-600" aria-hidden="true">
                ·
              </span>
              <span className="text-xs text-zinc-300 truncate max-w-[140px]">
                {displayName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-display text-sm font-bold tracking-tight text-white whitespace-nowrap">
                HOW HIGH ARE YOU?
              </span>
              {screen === 'results' && (
                <>
                  <span className="text-zinc-600" aria-hidden="true">
                    ·
                  </span>
                  <span
                    className={`font-mono-tabular text-[11px] font-bold uppercase whitespace-nowrap ${
                      vibeMode === 'unhinged'
                        ? 'text-[#FF007F]'
                        : 'text-[#00F0FF]'
                    }`}
                  >
                    {vibeMode}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          className="flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-zinc-500" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#CCFF00]" />
          )}
        </button>
      </div>

      {isRound && (
        <div
          className="grid grid-cols-5 gap-1.5 px-4 pb-2.5"
          aria-label={`Round ${currentRound} of 5`}
        >
          {[1, 2, 3, 4, 5].map((step) => {
            const isDone = step < currentRound;
            const isActive = step === currentRound;
            return (
              <div
                key={step}
                className={`h-1 rounded-full transition-colors duration-200 ${
                  isDone
                    ? 'bg-[#CCFF00]'
                    : isActive
                      ? 'bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.65)]'
                      : 'bg-white/10'
                }`}
              />
            );
          })}
        </div>
      )}
    </header>
  );
}
