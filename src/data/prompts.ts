import { VibeMode } from '../types/game';

export interface PartyPrompt {
  id: string;
  type: 'Truth' | 'Dare';
  mode: VibeMode;
  text: string;
}

export const PARTY_PROMPTS: PartyPrompt[] = [
  // CHILL MODE (14 prompts)
  {
    id: 'c1',
    type: 'Truth',
    mode: 'chill',
    text: 'What is the dumbest thing you have ever searched on Google at 2 AM?',
  },
  {
    id: 'c2',
    type: 'Dare',
    mode: 'chill',
    text: 'Do your best slow-motion movie trailer voice and narrate what someone in the room is doing right now.',
  },
  {
    id: 'c3',
    type: 'Truth',
    mode: 'chill',
    text: 'If everyone in this room checked your Notes app right now, what is the weirdest note they would find?',
  },
  {
    id: 'c4',
    type: 'Dare',
    mode: 'chill',
    text: 'Hold eye contact with the person across from you and say a completely made-up fun fact with 100% confidence.',
  },
  {
    id: 'c5',
    type: 'Truth',
    mode: 'chill',
    text: 'What song on your playlist do you secretly skip only when other people are in the car?',
  },
  {
    id: 'c6',
    type: 'Dare',
    mode: 'chill',
    text: 'Balance this phone flat on your head for 10 full seconds without touching it.',
  },
  {
    id: 'c7',
    type: 'Truth',
    mode: 'chill',
    text: 'What is the pettiest reason you have ever left someone on read?',
  },
  {
    id: 'c8',
    type: 'Dare',
    mode: 'chill',
    text: 'Show the group the last 3 photos in your camera roll—no deleting or skipping.',
  },
  {
    id: 'c9',
    type: 'Truth',
    mode: 'chill',
    text: 'What completely normal food combo do you eat that makes other people judge you?',
  },
  {
    id: 'c10',
    type: 'Dare',
    mode: 'chill',
    text: 'Give a genuine 10-second TED Talk about why socks with sandals deserve respect.',
  },
  {
    id: 'c11',
    type: 'Truth',
    mode: 'chill',
    text: 'Which person in this room would survive the longest in a zombie apocalypse—and who goes first?',
  },
  {
    id: 'c12',
    type: 'Dare',
    mode: 'chill',
    text: 'Attempt to spell your full name backwards out loud in under 6 seconds.',
  },
  {
    id: 'c13',
    type: 'Truth',
    mode: 'chill',
    text: 'What is an impulse purchase you made recently that you still refuse to admit was a mistake?',
  },
  {
    id: 'c14',
    type: 'Dare',
    mode: 'chill',
    text: 'Let the person to your left pick a random contact in your phone—you have to send them a single thumbs-up emoji.',
  },

  // UNHINGED MODE (14 prompts)
  {
    id: 'u1',
    type: 'Dare',
    mode: 'unhinged',
    text: 'Open your screen time report and read your top 3 most-used apps out loud with exact hours.',
  },
  {
    id: 'u2',
    type: 'Truth',
    mode: 'unhinged',
    text: 'Who in this room do you think has the worst taste in partners, and why are you slightly right?',
  },
  {
    id: 'u3',
    type: 'Dare',
    mode: 'unhinged',
    text: 'Send a voice note to the 4th person in your recent chats saying only "We need to talk about the pigeon" with zero context.',
  },
  {
    id: 'u4',
    type: 'Truth',
    mode: 'unhinged',
    text: 'What is the most chaotic lie you told to get out of plans—and did you actually get caught?',
  },
  {
    id: 'u5',
    type: 'Dare',
    mode: 'unhinged',
    text: 'Let the group compose a 5-word text and send it to anyone of your choice—no explanations for 10 minutes.',
  },
  {
    id: 'u6',
    type: 'Truth',
    mode: 'unhinged',
    text: 'Read the most unhinged DM or text you sent this week out loud verbatim.',
  },
  {
    id: 'u7',
    type: 'Dare',
    mode: 'unhinged',
    text: 'Stand up and deliver a dramatic 15-second Oscar acceptance speech thanking your own bad decisions.',
  },
  {
    id: 'u8',
    type: 'Truth',
    mode: 'unhinged',
    text: 'If you had to delete one person’s group chat forever right now, which chat is getting nuked?',
  },
  {
    id: 'u9',
    type: 'Dare',
    mode: 'unhinged',
    text: 'Try to recite the alphabet backwards starting from Z while doing squats until you mess up.',
  },
  {
    id: 'u10',
    type: 'Truth',
    mode: 'unhinged',
    text: 'What is something you did at a party that you still pray nobody recorded on video?',
  },
  {
    id: 'u11',
    type: 'Dare',
    mode: 'unhinged',
    text: 'Hand your unlocked phone to the person across from you for 15 seconds—they can only open your Safari/Chrome tabs.',
  },
  {
    id: 'u12',
    type: 'Truth',
    mode: 'unhinged',
    text: 'Rank everyone in this room by how likely they are to accidentally join a cult.',
  },
  {
    id: 'u13',
    type: 'Dare',
    mode: 'unhinged',
    text: 'Drink a glass of water without using your hands, or confess your worst autocorrect disaster.',
  },
  {
    id: 'u14',
    type: 'Truth',
    mode: 'unhinged',
    text: 'What is the boldest thing you have ever texted someone after midnight that you immediately regretted the next morning?',
  },
];

export function pickRandomPrompt(
  mode: VibeMode,
  seenIds: string[]
): PartyPrompt {
  const pool = PARTY_PROMPTS.filter((p) => p.mode === mode);
  const unseen = pool.filter((p) => !seenIds.includes(p.id));
  const candidates = unseen.length > 0 ? unseen : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
