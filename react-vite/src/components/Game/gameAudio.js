export const GAME_SFX = Object.freeze({
  SWORD: "sword",
  HIT: "hit",
  PICKUP: "pickup",
  CHEST: "chest",
  HOP: "hop",
  FALL: "fall",
  THROW: "throw",
  SPLASH: "splash",
  ROOM: "room",
});

const PATTERNS = Object.freeze({
  [GAME_SFX.SWORD]: [
    { wave: "triangle", start: 0, duration: 0.075, from: 520, to: 250, gain: 0.055 },
  ],
  [GAME_SFX.HIT]: [
    { wave: "square", start: 0, duration: 0.055, from: 145, to: 92, gain: 0.065 },
    { wave: "triangle", start: 0.018, duration: 0.06, from: 360, to: 180, gain: 0.035 },
  ],
  [GAME_SFX.PICKUP]: [
    { wave: "triangle", start: 0, duration: 0.07, from: 523, to: 523, gain: 0.05 },
    { wave: "triangle", start: 0.075, duration: 0.07, from: 659, to: 659, gain: 0.05 },
    { wave: "triangle", start: 0.15, duration: 0.1, from: 784, to: 784, gain: 0.055 },
  ],
  [GAME_SFX.CHEST]: [
    { wave: "triangle", start: 0, duration: 0.08, from: 392, to: 392, gain: 0.045 },
    { wave: "triangle", start: 0.09, duration: 0.08, from: 523, to: 523, gain: 0.05 },
    { wave: "triangle", start: 0.18, duration: 0.13, from: 659, to: 659, gain: 0.055 },
  ],
  [GAME_SFX.HOP]: [
    { wave: "triangle", start: 0, duration: 0.11, from: 220, to: 390, gain: 0.04 },
  ],
  [GAME_SFX.FALL]: [
    { wave: "sine", start: 0, duration: 0.24, from: 290, to: 82, gain: 0.055 },
  ],
  [GAME_SFX.THROW]: [
    { wave: "triangle", start: 0, duration: 0.12, from: 300, to: 145, gain: 0.045 },
  ],
  [GAME_SFX.SPLASH]: [
    { wave: "sine", start: 0, duration: 0.13, from: 170, to: 105, gain: 0.04 },
    { wave: "triangle", start: 0.025, duration: 0.09, from: 310, to: 190, gain: 0.025 },
  ],
  [GAME_SFX.ROOM]: [
    { wave: "sine", start: 0, duration: 0.12, from: 185, to: 245, gain: 0.025 },
  ],
});

export function sfxPatternFor(type) {
  return PATTERNS[type] || [];
}

let audioContext = null;

function contextConstructor() {
  if (typeof window === "undefined") return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

export function unlockGameAudio() {
  const AudioContextClass = contextConstructor();
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function playTone(context, note) {
  const start = context.currentTime + note.start;
  const end = start + note.duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = note.wave;
  oscillator.frequency.setValueAtTime(note.from, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, note.to), end);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(note.gain, start + Math.min(0.012, note.duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.01);
}

export function playGameSfx(type) {
  const pattern = sfxPatternFor(type);
  if (!pattern.length) return false;
  const context = unlockGameAudio();
  if (!context) return false;
  pattern.forEach((note) => playTone(context, note));
  return true;
}
