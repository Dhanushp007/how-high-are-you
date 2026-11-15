Build a complete, interactive, single-page React web application (using Tailwind CSS and Lucide React icons) for a mobile party game called **"How High Are You?"**, strictly following the provided Stitch UI design and layout.

### Technical & UX Requirements:
1. **Mobile-First Wrapper:** Center the app in a `max-w-md mx-auto min-h-screen bg-[#09090B] text-white` container with smooth screen transitions, neon accents (`#CCFF00`, `#FF007F`, `#00F0FF`), and large thumb-friendly buttons.
2. **Zero-Asset Sound & Haptics:** Build a lightweight Web Audio API helper (`playSound(type)`) that synthesizes crisp arcade tones (tap blip, countdown tick, error buzz, victory fanfare) with a mute toggle in the top header, plus `navigator.vibrate?.()` triggers on errors and taps.
3. **Complete 5-Round Game Loop:**
   - **Home Screen:** Player name input (optional), Vibe Mode toggle (`Chill` vs `Unhinged` — Unhinged makes timers faster and Truth/Dares wilder), and "Start Vibe Check" button.
   - **Round 1: Reflex Tap:** Card turns Hot Magenta ("WAIT FOR GREEN...") for a random 1.5s–3.5s delay, then flashes Acid Lime ("TAP NOW!"). Record reaction time in `ms`. Penalize early taps!
   - **Round 2: Blind 7-Second Clock:** Live monospace timer counts up from `0.00s`. At `3.00s`, hide the digits (`??.??`) while the clock keeps running internally. Player taps "STOP AT 7.00s" when they think 7 seconds have elapsed. Reveal their actual time and error delta.
   - **Round 3: Stroop Color Trap (3 rapid sub-rounds):** Show a color name (`RED`, `BLUE`, `GREEN`, `YELLOW`) styled in a *different* CSS text color. Player must tap the button matching the **text color** (not the word) within 3 seconds per card.
   - **Round 4: Pattern Memory:** Display a 3x3 grid of dark tiles. Flash a sequence of 4 tiles in Electric Cyan one by one, then let the player tap the 4 tiles back in order.
   - **Round 5: Truth or Dare Card:** Randomly deal a Truth or Dare tailored to the selected Vibe Mode (`Chill` vs `Unhinged`) from a rich built-in array of 20+ hilarious party prompts. Buttons: "Chickened Out" or "Nailed It".
4. **Scoring & Diagnostic Results Screen:**
   - Compute a final **"Cooked Percentage" (0% to 100%)** weighted across Reflexes (25%), Blind Clock accuracy (25%), Stroop accuracy (25%), Pattern Memory (15%), and Truth/Dare completion (10%).
   - Display an animated gauge, a tier title (*Stone Cold Sober*, *Pleasantly Buzzed*, *Certified Astronaut*, or *Orbiting Saturn*), a funny diagnostic roast, and individual breakdown bars for each skill.
   - Add a **"Copy Verdict"** button that copies a formatted emoji summary (e.g., *"🛸 HOW HIGH ARE YOU? Verdict: 78% COOKED (Certified Astronaut)"*) to the clipboard with a "Copied!" toast, and a **"Pass the Phone"** button to restart for the next player.

Ensure all state transitions, timers, and cleanup hooks (`useEffect`) are rock-solid with zero bugs so the game is immediately playable.