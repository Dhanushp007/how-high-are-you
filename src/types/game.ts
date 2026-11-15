export type VibeMode = 'chill' | 'unhinged';

export type GameScreen =
  | 'home'
  | 'round1'
  | 'round2'
  | 'round3'
  | 'round4'
  | 'round5'
  | 'results';

export interface Round1Result {
  reactionMs: number;
  falseStarts: number;
  score: number; // 0-100 sharpness score
}

export interface Round2Result {
  actualSec: number;
  deltaSec: number;
  score: number; // 0-100 sharpness score
}

export interface Round3Result {
  correct: number;
  total: number;
  avgMs: number;
  score: number; // 0-100 sharpness score
}

export interface Round4Result {
  correctTiles: number;
  totalTiles: number;
  completed: boolean;
  score: number; // 0-100 sharpness score
}

export interface Round5Result {
  type: 'Truth' | 'Dare';
  prompt: string;
  completed: boolean;
  score: number; // 0 or 100
}

export interface SessionRun {
  id: string;
  playerName: string;
  vibeMode: VibeMode;
  cookedPercent: number;
  tierTitle: TierTitle;
  timestamp: number;
}

export type TierTitle =
  | 'Stone Cold Sober'
  | 'Pleasantly Buzzed'
  | 'Certified Astronaut'
  | 'Orbiting Saturn';

export interface DiagnosticVerdict {
  cookedPercent: number;
  tierTitle: TierTitle;
  tierEmoji: string;
  roast: string;
  accentColor: string;
}
