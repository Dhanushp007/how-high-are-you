import {
  DiagnosticVerdict,
  Round1Result,
  Round2Result,
  Round3Result,
  Round4Result,
  Round5Result,
  TierTitle,
} from '../types/game';

export function scoreRound1(reactionMs: number, falseStarts: number): number {
  // 180ms or under = 100 sharpness, 750ms+ = 0 sharpness, -18 per false start
  const effectiveMs = reactionMs + falseStarts * 140;
  const clamped = Math.max(180, Math.min(780, effectiveMs));
  const raw = 100 - ((clamped - 180) / (780 - 180)) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function scoreRound2(actualSec: number): {
  deltaSec: number;
  score: number;
} {
  const deltaSec = Number((actualSec - 7.0).toFixed(2));
  const absDelta = Math.abs(deltaSec);
  // <= 0.10s off = 100 sharpness, >= 2.80s off = 0 sharpness
  const clamped = Math.max(0.1, Math.min(2.8, absDelta));
  const raw = 100 - ((clamped - 0.1) / (2.8 - 0.1)) * 100;
  return {
    deltaSec,
    score: Math.max(0, Math.min(100, Math.round(raw))),
  };
}

export function scoreRound3(
  correct: number,
  total: number,
  avgMs: number
): number {
  if (correct === 0) return 0;
  const accuracyBase = (correct / total) * 85;
  // Up to 15 bonus points for quick processing (< 900ms avg -> 15, >= 2600ms -> 0)
  const clampedSpeed = Math.max(700, Math.min(2600, avgMs));
  const speedBonus =
    (1 - (clampedSpeed - 700) / (2600 - 700)) * 15 * (correct / total);
  return Math.max(0, Math.min(100, Math.round(accuracyBase + speedBonus)));
}

export function scoreRound4(correctTiles: number, totalTiles: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round((correctTiles / totalTiles) * 100))
  );
}

export function computeDiagnosticVerdict(
  r1: Round1Result,
  r2: Round2Result,
  r3: Round3Result,
  r4: Round4Result,
  r5: Round5Result
): DiagnosticVerdict {
  // Weights: Reflexes 25%, Blind Clock 25%, Stroop 25%, Memory 15%, Truth/Dare 10%
  const weightedSharpness =
    r1.score * 0.25 +
    r2.score * 0.25 +
    r3.score * 0.25 +
    r4.score * 0.15 +
    r5.score * 0.1;

  const cookedPercent = Math.max(
    0,
    Math.min(100, Math.round(100 - weightedSharpness))
  );

  let tierTitle: TierTitle;
  let tierEmoji: string;
  let roast: string;
  let accentColor: string;

  if (cookedPercent < 25) {
    tierTitle = 'Stone Cold Sober';
    tierEmoji = '🧊';
    accentColor = '#CCFF00';
    roast =
      'Suspiciously locked in. Either your nervous system runs on pure espresso, or you are secretly auditing everyone else’s questionable decisions tonight.';
  } else if (cookedPercent < 50) {
    tierTitle = 'Pleasantly Buzzed';
    tierEmoji = '✨';
    accentColor = '#00F0FF';
    roast =
      'Cruising at optimal party altitude. Your thumbs still remember your unlock PIN, even if your internal clock is starting to freelance.';
  } else if (cookedPercent < 75) {
    tierTitle = 'Certified Astronaut';
    tierEmoji = '🛸';
    accentColor = '#FFB800';
    roast =
      'Houston, we have noticeable turbulence. You are operating purely on vibes and muscle memory—please do not send any risky texts right now.';
  } else {
    tierTitle = 'Orbiting Saturn';
    tierEmoji = '🪐';
    accentColor = '#FF007F';
    roast =
      'Completely detached from Earth’s gravitational pull. Somebody hide the car keys and order a large pizza before you try to microwave your phone.';
  }

  return {
    cookedPercent,
    tierTitle,
    tierEmoji,
    roast,
    accentColor,
  };
}
