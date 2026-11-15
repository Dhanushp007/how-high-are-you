import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArcadeHeader } from './components/ArcadeHeader';
import { HomeScreen } from './components/HomeScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { Round1Reflex } from './components/Round1Reflex';
import { Round2BlindClock } from './components/Round2BlindClock';
import { Round3Stroop } from './components/Round3Stroop';
import { Round4Memory } from './components/Round4Memory';
import { Round5TruthDare } from './components/Round5TruthDare';
import {
  GameScreen,
  Round1Result,
  Round2Result,
  Round3Result,
  Round4Result,
  Round5Result,
  SessionRun,
  VibeMode,
} from './types/game';
import { computeDiagnosticVerdict } from './utils/scoring';
import { playSound, setSoundMuted, triggerHaptic } from './utils/sound';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('home');
  const [playerName, setPlayerName] = useState('');
  const [vibeMode, setVibeMode] = useState<VibeMode>('chill');
  const [isMuted, setIsMuted] = useState(false);

  const [r1, setR1] = useState<Round1Result | null>(null);
  const [r2, setR2] = useState<Round2Result | null>(null);
  const [r3, setR3] = useState<Round3Result | null>(null);
  const [r4, setR4] = useState<Round4Result | null>(null);
  const [r5, setR5] = useState<Round5Result | null>(null);

  const [seenPromptIds, setSeenPromptIds] = useState<string[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionRun[]>([]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
    if (!next) {
      playSound('tap');
    }
    triggerHaptic(10);
  };

  const handleStartGame = () => {
    setR1(null);
    setR2(null);
    setR3(null);
    setR4(null);
    setR5(null);
    setScreen('round1');
  };

  const handleExitToHome = () => {
    playSound('tap');
    triggerHaptic(10);
    setScreen('home');
  };

  const handlePromptSeen = useCallback((id: string) => {
    setSeenPromptIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleRound5Complete = (result5: Round5Result) => {
    setR5(result5);
    if (r1 && r2 && r3 && r4) {
      const verdict = computeDiagnosticVerdict(r1, r2, r3, r4, result5);
      const run: SessionRun = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        playerName: playerName.trim() || `Player ${sessionHistory.length + 1}`,
        vibeMode,
        cookedPercent: verdict.cookedPercent,
        tierTitle: verdict.tierTitle,
        timestamp: Date.now(),
      };
      setSessionHistory((prev) => [run, ...prev]);
    }
    setScreen('results');
  };

  const handlePassThePhone = () => {
    setPlayerName('');
    setR1(null);
    setR2(null);
    setR3(null);
    setR4(null);
    setR5(null);
    setScreen('home');
  };

  return (
    <div className="min-h-screen w-full bg-[#09090B] text-white">
      <div className="max-w-md mx-auto min-h-screen bg-[#09090B] text-white flex flex-col sm:border-x sm:border-white/10">
        <ArcadeHeader
          screen={screen}
          playerName={playerName}
          vibeMode={vibeMode}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onExitToHome={handleExitToHome}
        />

        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              {screen === 'home' && (
                <HomeScreen
                  playerName={playerName}
                  vibeMode={vibeMode}
                  sessionHistory={sessionHistory}
                  onPlayerNameChange={setPlayerName}
                  onVibeModeChange={setVibeMode}
                  onStartGame={handleStartGame}
                />
              )}

              {screen === 'round1' && (
                <Round1Reflex
                  vibeMode={vibeMode}
                  onComplete={(res) => {
                    setR1(res);
                    setScreen('round2');
                  }}
                />
              )}

              {screen === 'round2' && (
                <Round2BlindClock
                  vibeMode={vibeMode}
                  onComplete={(res) => {
                    setR2(res);
                    setScreen('round3');
                  }}
                />
              )}

              {screen === 'round3' && (
                <Round3Stroop
                  vibeMode={vibeMode}
                  onComplete={(res) => {
                    setR3(res);
                    setScreen('round4');
                  }}
                />
              )}

              {screen === 'round4' && (
                <Round4Memory
                  vibeMode={vibeMode}
                  onComplete={(res) => {
                    setR4(res);
                    setScreen('round5');
                  }}
                />
              )}

              {screen === 'round5' && (
                <Round5TruthDare
                  vibeMode={vibeMode}
                  seenPromptIds={seenPromptIds}
                  onPromptSeen={handlePromptSeen}
                  onComplete={handleRound5Complete}
                />
              )}

              {screen === 'results' && r1 && r2 && r3 && r4 && r5 && (
                <ResultsScreen
                  playerName={playerName}
                  vibeMode={vibeMode}
                  r1={r1}
                  r2={r2}
                  r3={r3}
                  r4={r4}
                  r5={r5}
                  onPassThePhone={handlePassThePhone}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
