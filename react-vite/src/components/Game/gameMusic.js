import { currentGameAudioContext } from "./gameAudio";

export const MUSIC_SCENE = Object.freeze({
  SILENT: "silent",
  VILLAGE: "village",
  FOREST: "forest",
  FIELDS: "fields",
  WATER: "water",
  DESERT: "desert",
  MOUNTAIN: "mountain",
  CAVE: "cave",
  TEMPLE: "temple",
  FIRE_TEMPLE: "fireTemple",
  WATER_TEMPLE: "waterTemple",
  BOSS: "boss",
  ROOTBOUND_BOSS: "rootboundBoss",
});

const PROFILES = Object.freeze({
  [MUSIC_SCENE.VILLAGE]: Object.freeze({
    barSeconds: 3.4, rootMidi: 50, scale: [0, 4, 7, 9, 12],
    bars: [[0, 2, 1, 3], [0, 1, 2, 4]], drone: [0, 2], wave: "triangle", gain: 0.010,
  }),
  [MUSIC_SCENE.FOREST]: Object.freeze({
    barSeconds: 3.7, rootMidi: 50, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 2, 4, 3], [1, 3, 2, 5]], drone: [0, 3], wave: "triangle", gain: 0.010,
  }),
  [MUSIC_SCENE.FIELDS]: Object.freeze({
    barSeconds: 3.25, rootMidi: 52, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 2, 3, 5], [2, 1, 3, 4]], drone: [0, 3], wave: "triangle", gain: 0.009,
  }),
  [MUSIC_SCENE.WATER]: Object.freeze({
    barSeconds: 4.2, rootMidi: 47, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 3, 2, 4], [1, 2, 5, 3]], drone: [0, 4], wave: "sine", gain: 0.009,
  }),
  [MUSIC_SCENE.DESERT]: Object.freeze({
    barSeconds: 3.5, rootMidi: 45, scale: [0, 1, 5, 7, 8, 12],
    bars: [[0, 2, 1, 4], [0, 3, 2, 5]], drone: [0, 3], wave: "triangle", gain: 0.009,
  }),
  [MUSIC_SCENE.MOUNTAIN]: Object.freeze({
    barSeconds: 4.0, rootMidi: 43, scale: [0, 5, 7, 10, 12],
    bars: [[0, 1, 2, 4], [0, 2, 3, 1]], drone: [0, 2], wave: "sine", gain: 0.009,
  }),
  [MUSIC_SCENE.CAVE]: Object.freeze({
    barSeconds: 4.6, rootMidi: 40, scale: [0, 3, 7, 10, 12],
    bars: [[0, 2, 1, 3], [0, 1, 4, 2]], drone: [0, 2], wave: "sine", gain: 0.008,
  }),
  [MUSIC_SCENE.TEMPLE]: Object.freeze({
    barSeconds: 3.8, rootMidi: 38, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 3, 2, 4], [1, 2, 0, 5]], drone: [0, 3], wave: "triangle", gain: 0.010,
  }),
  [MUSIC_SCENE.FIRE_TEMPLE]: Object.freeze({
    barSeconds: 3.1, rootMidi: 40, scale: [0, 1, 5, 7, 8, 12],
    bars: [[0, 2, 1, 4], [3, 1, 2, 5]], drone: [0, 3], wave: "triangle", gain: 0.010,
  }),
  [MUSIC_SCENE.WATER_TEMPLE]: Object.freeze({
    barSeconds: 3.9, rootMidi: 42, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 4, 2, 3], [1, 3, 5, 2]], drone: [0, 4], wave: "sine", gain: 0.010,
  }),
  [MUSIC_SCENE.BOSS]: Object.freeze({
    barSeconds: 2.35, rootMidi: 38, scale: [0, 1, 3, 6, 7, 10, 12],
    bars: [[0, 3, 1, 4, 2, 5], [0, 4, 3, 6, 2, 1]], drone: [0, 4], wave: "triangle", gain: 0.012,
  }),
  [MUSIC_SCENE.ROOTBOUND_BOSS]: Object.freeze({
    barSeconds: 2.2, rootMidi: 38, scale: [0, 3, 5, 6, 7, 10, 12],
    bars: [[0, 3, 2, 4, 1, 5], [0, 4, 3, 6, 2, 1]], drone: [0, 4], wave: "triangle", gain: 0.013,
  }),
});

function includesAny(value, tokens) {
  const lower = String(value || "").toLowerCase();
  return tokens.some((token) => lower.includes(token));
}

export function musicSceneFor({
  mapId,
  mapTheme,
  roomTitle,
  bossType,
} = {}) {
  if (bossType) {
    return bossType === "bossCacheColossus"
      ? MUSIC_SCENE.ROOTBOUND_BOSS
      : MUSIC_SCENE.BOSS;
  }
  if (mapId === "debugLab") return MUSIC_SCENE.SILENT;
  if (mapId === "willowCave") return MUSIC_SCENE.CAVE;
  if (mapId === "d01") return MUSIC_SCENE.TEMPLE;
  if (mapId === "d02") return MUSIC_SCENE.FIRE_TEMPLE;
  if (mapId === "d03") return MUSIC_SCENE.WATER_TEMPLE;
  if (mapId !== "overworld") {
    if (mapTheme === "cave") return MUSIC_SCENE.CAVE;
    if (mapTheme === "fire") return MUSIC_SCENE.FIRE_TEMPLE;
    if (mapTheme === "water") return MUSIC_SCENE.WATER_TEMPLE;
  }
  if (includesAny(roomTitle, ["village", "hamlet", "willowbrook"])) return MUSIC_SCENE.VILLAGE;
  if (includesAny(roomTitle, ["water", "pond", "ford", "coast", "lake", "silverwater"])) return MUSIC_SCENE.WATER;
  if (includesAny(roomTitle, ["desert", "wastes", "sunscar", "amber"])) return MUSIC_SCENE.DESERT;
  if (includesAny(roomTitle, ["mountain", "highland", "crown", "keep"])) return MUSIC_SCENE.MOUNTAIN;
  if (includesAny(roomTitle, ["grove", "wood", "forest", "orchard", "oldgrowth", "briar"])) return MUSIC_SCENE.FOREST;
  return MUSIC_SCENE.FIELDS;
}

export function musicProfileFor(scene, bossPhase = 1) {
  const base = PROFILES[scene] || null;
  if (!base) return null;
  if (scene !== MUSIC_SCENE.ROOTBOUND_BOSS || bossPhase < 2) return base;
  return {
    ...base,
    barSeconds: 1.82,
    gain: 0.014,
    bars: [[0, 3, 5, 2, 4, 6, 1, 5], [0, 4, 2, 6, 3, 5, 1, 4]],
  };
}

export function midiToFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

let currentScene = MUSIC_SCENE.SILENT;
let currentPhase = 1;
let nextBarAt = 0;
let barIndex = 0;
let masterGain = null;
let masterContext = null;
const activeOscillators = new Set();

function stopActiveOscillators() {
  activeOscillators.forEach((oscillator) => {
    try { oscillator.stop(); } catch { /* already stopped */ }
  });
  activeOscillators.clear();
}

function ensureMaster(context) {
  if (masterGain && masterContext === context) return masterGain;
  masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.72, context.currentTime);
  masterGain.connect(context.destination);
  masterContext = context;
  return masterGain;
}

function scheduleNote(context, destination, {
  frequency,
  start,
  duration,
  wave,
  gain,
}) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(Math.max(24, frequency), start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.16, duration * 0.25));
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  envelope.connect(destination);
  activeOscillators.add(oscillator);
  oscillator.onended = () => activeOscillators.delete(oscillator);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function scheduleBar(context, profile, at, index) {
  const destination = ensureMaster(context);
  const melody = profile.bars[index % profile.bars.length];
  const stepSeconds = profile.barSeconds / melody.length;

  profile.drone.forEach((scaleIndex, droneIndex) => {
    const offset = profile.scale[scaleIndex % profile.scale.length];
    scheduleNote(context, destination, {
      frequency: midiToFrequency(profile.rootMidi + offset - (droneIndex ? 0 : 12)),
      start: at,
      duration: profile.barSeconds * 0.94,
      wave: "sine",
      gain: profile.gain * 0.42,
    });
  });

  melody.forEach((scaleIndex, noteIndex) => {
    const offset = profile.scale[scaleIndex % profile.scale.length];
    scheduleNote(context, destination, {
      frequency: midiToFrequency(profile.rootMidi + offset + 12),
      start: at + noteIndex * stepSeconds,
      duration: Math.max(0.34, stepSeconds * 0.72),
      wave: profile.wave,
      gain: profile.gain,
    });
  });
}

export function syncAdaptiveMusic({
  mapId,
  mapTheme,
  roomTitle,
  bossType,
  bossPhase = 1,
} = {}) {
  const context = currentGameAudioContext();
  if (!context || context.state === "closed") return false;
  const scene = musicSceneFor({ mapId, mapTheme, roomTitle, bossType });
  const normalizedPhase = scene === MUSIC_SCENE.ROOTBOUND_BOSS ? bossPhase : 1;
  if (scene !== currentScene || normalizedPhase !== currentPhase) {
    currentScene = scene;
    currentPhase = normalizedPhase;
    nextBarAt = context.currentTime + 0.06;
    barIndex = 0;
    stopActiveOscillators();
  }
  if (scene === MUSIC_SCENE.SILENT || context.state !== "running") return false;
  const profile = musicProfileFor(scene, normalizedPhase);
  if (!profile) return false;
  if (context.currentTime > nextBarAt + profile.barSeconds * 1.5) {
    nextBarAt = context.currentTime + 0.06;
  }
  if (context.currentTime + 0.12 >= nextBarAt) {
    scheduleBar(context, profile, nextBarAt, barIndex);
    nextBarAt += profile.barSeconds;
    barIndex += 1;
  }
  return true;
}

export function stopAdaptiveMusic() {
  stopActiveOscillators();
  currentScene = MUSIC_SCENE.SILENT;
  currentPhase = 1;
  nextBarAt = 0;
  barIndex = 0;
}
