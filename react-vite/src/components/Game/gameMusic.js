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
  FLUX_BOSS: "fluxBoss",
  ROOT_WARDEN_BOSS: "rootWardenBoss",
});

const profile = ({
  barSeconds,
  rootMidi,
  scale,
  bars,
  drone,
  wave = "triangle",
  gain = 0.009,
  bass = [0, 0, 2, 0],
  harmony = [0, 2],
  pulse = 0,
  texture = 0,
  melodyOctave = 12,
}) => Object.freeze({
  barSeconds,
  rootMidi,
  scale: Object.freeze(scale),
  bars: Object.freeze(bars.map((bar) => Object.freeze(bar))),
  drone: Object.freeze(drone),
  wave,
  gain,
  bass: Object.freeze(bass),
  harmony: Object.freeze(harmony),
  pulse,
  texture,
  melodyOctave,
});

const PROFILES = Object.freeze({
  [MUSIC_SCENE.VILLAGE]: profile({
    barSeconds: 3.45, rootMidi: 50, scale: [0, 4, 7, 9, 12],
    bars: [[0, 2, 1, 3], [0, 1, 2, 4], [2, 3, 1, 0], [0, 2, 4, 3]],
    drone: [0, 2], wave: "triangle", gain: 0.0095,
    bass: [0, 0, 2, 0], harmony: [0, 1], pulse: 0.22, texture: 0.18,
  }),
  [MUSIC_SCENE.FOREST]: profile({
    barSeconds: 3.72, rootMidi: 50, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 2, 4, 3], [1, 3, 2, 5], [0, 4, 2, 3], [2, 1, 5, 3]],
    drone: [0, 3], wave: "triangle", gain: 0.0098,
    bass: [0, 3, 0, 2], harmony: [0, 2], pulse: 0.13, texture: 0.32,
  }),
  [MUSIC_SCENE.FIELDS]: profile({
    barSeconds: 3.28, rootMidi: 52, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 2, 3, 5], [2, 1, 3, 4], [0, 3, 5, 2], [1, 4, 3, 5]],
    drone: [0, 3], wave: "triangle", gain: 0.0092,
    bass: [0, 2, 3, 2], harmony: [0, 2], pulse: 0.28, texture: 0.12,
  }),
  [MUSIC_SCENE.WATER]: profile({
    barSeconds: 4.18, rootMidi: 47, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 3, 2, 4], [1, 2, 5, 3], [0, 4, 3, 5], [2, 1, 4, 3]],
    drone: [0, 4], wave: "sine", gain: 0.0088,
    bass: [0, 4, 0, 2], harmony: [0, 3], pulse: 0.08, texture: 0.38,
  }),
  [MUSIC_SCENE.DESERT]: profile({
    barSeconds: 3.48, rootMidi: 45, scale: [0, 1, 5, 7, 8, 12],
    bars: [[0, 2, 1, 4], [0, 3, 2, 5], [1, 4, 3, 2], [0, 2, 5, 4]],
    drone: [0, 3], wave: "triangle", gain: 0.0093,
    bass: [0, 2, 0, 3], harmony: [0, 1], pulse: 0.34, texture: 0.16,
  }),
  [MUSIC_SCENE.MOUNTAIN]: profile({
    barSeconds: 4.0, rootMidi: 43, scale: [0, 5, 7, 10, 12],
    bars: [[0, 1, 2, 4], [0, 2, 3, 1], [2, 4, 3, 1], [0, 3, 2, 4]],
    drone: [0, 2], wave: "sine", gain: 0.0090,
    bass: [0, 0, 2, 3], harmony: [0, 2], pulse: 0.18, texture: 0.30,
  }),
  [MUSIC_SCENE.CAVE]: profile({
    barSeconds: 4.58, rootMidi: 40, scale: [0, 3, 7, 10, 12],
    bars: [[0, 2, 1, 3], [0, 1, 4, 2], [3, 1, 0, 2], [0, 2, 4, 1]],
    drone: [0, 2], wave: "sine", gain: 0.0078,
    bass: [0, 0, 2, 0], harmony: [0, 1], pulse: 0.04, texture: 0.46,
  }),
  [MUSIC_SCENE.TEMPLE]: profile({
    barSeconds: 3.76, rootMidi: 38, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 3, 2, 4], [1, 2, 0, 5], [0, 4, 3, 1], [2, 0, 5, 3]],
    drone: [0, 3], wave: "triangle", gain: 0.0100,
    bass: [0, 3, 0, 2], harmony: [0, 2], pulse: 0.38, texture: 0.20,
  }),
  [MUSIC_SCENE.FIRE_TEMPLE]: profile({
    barSeconds: 3.08, rootMidi: 40, scale: [0, 1, 5, 7, 8, 12],
    bars: [[0, 2, 1, 4], [3, 1, 2, 5], [0, 4, 1, 3, 2, 5], [2, 1, 4, 3]],
    drone: [0, 3], wave: "sawtooth", gain: 0.0098,
    bass: [0, 3, 2, 3], harmony: [0, 1], pulse: 0.62, texture: 0.18,
  }),
  [MUSIC_SCENE.WATER_TEMPLE]: profile({
    barSeconds: 3.92, rootMidi: 42, scale: [0, 3, 5, 7, 10, 12],
    bars: [[0, 4, 2, 3], [1, 3, 5, 2], [0, 2, 5, 4], [3, 1, 4, 2]],
    drone: [0, 4], wave: "sine", gain: 0.0095,
    bass: [0, 4, 2, 4], harmony: [0, 3], pulse: 0.22, texture: 0.42,
  }),
  [MUSIC_SCENE.BOSS]: profile({
    barSeconds: 2.34, rootMidi: 38, scale: [0, 1, 3, 6, 7, 10, 12],
    bars: [[0, 3, 1, 4, 2, 5], [0, 4, 3, 6, 2, 1], [5, 2, 4, 1, 6, 3], [0, 6, 4, 2, 5, 1]],
    drone: [0, 4], wave: "sawtooth", gain: 0.0116,
    bass: [0, 4, 3, 4], harmony: [0, 2], pulse: 0.82, texture: 0.12,
  }),
  [MUSIC_SCENE.ROOTBOUND_BOSS]: profile({
    barSeconds: 2.18, rootMidi: 38, scale: [0, 3, 5, 6, 7, 10, 12],
    bars: [[0, 3, 2, 4, 1, 5], [0, 4, 3, 6, 2, 1], [5, 2, 4, 6, 3, 1], [0, 6, 2, 5, 4, 1]],
    drone: [0, 4], wave: "triangle", gain: 0.0128,
    bass: [0, 3, 4, 3], harmony: [0, 2], pulse: 0.86, texture: 0.26,
  }),
  [MUSIC_SCENE.FLUX_BOSS]: profile({
    barSeconds: 2.06, rootMidi: 40, scale: [0, 1, 4, 6, 7, 10, 12],
    bars: [[0, 2, 5, 1, 4, 6], [3, 1, 5, 2, 6, 4], [0, 6, 3, 5, 1, 4], [2, 5, 1, 6, 3, 4]],
    drone: [0, 4], wave: "square", gain: 0.0118,
    bass: [0, 4, 2, 4], harmony: [0, 1], pulse: 0.94, texture: 0.10,
  }),
  [MUSIC_SCENE.ROOT_WARDEN_BOSS]: profile({
    barSeconds: 2.52, rootMidi: 36, scale: [0, 2, 3, 7, 8, 10, 12],
    bars: [[0, 3, 2, 5, 1, 4], [0, 4, 1, 5, 3, 6], [2, 5, 3, 1, 4, 0], [0, 6, 4, 2, 5, 3]],
    drone: [0, 3], wave: "triangle", gain: 0.0115,
    bass: [0, 3, 0, 4], harmony: [0, 2], pulse: 0.72, texture: 0.34,
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
    if (bossType === "bossCacheColossus") return MUSIC_SCENE.ROOTBOUND_BOSS;
    if (bossType === "bossFluxSovereign") return MUSIC_SCENE.FLUX_BOSS;
    if (bossType === "bossRootWarden") return MUSIC_SCENE.ROOT_WARDEN_BOSS;
    return MUSIC_SCENE.BOSS;
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
    barSeconds: 1.78,
    gain: 0.0142,
    pulse: 1,
    texture: 0.34,
    bars: [
      [0, 3, 5, 2, 4, 6, 1, 5],
      [0, 4, 2, 6, 3, 5, 1, 4],
      [5, 2, 6, 3, 1, 4, 0, 5],
      [0, 6, 4, 1, 5, 2, 3, 6],
    ],
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
let musicVolume = 0.68;
const activeOscillators = new Set();

export function setGameMusicVolume(value) {
  musicVolume = Math.max(0, Math.min(1, Number(value) || 0));
  if (masterGain && masterContext) {
    masterGain.gain.setTargetAtTime(musicVolume, masterContext.currentTime, 0.08);
  }
  return musicVolume;
}

function stopActiveOscillators() {
  activeOscillators.forEach((oscillator) => {
    try { oscillator.stop(); } catch { /* already stopped */ }
  });
  activeOscillators.clear();
}

function ensureMaster(context) {
  if (masterGain && masterContext === context) return masterGain;
  masterGain = context.createGain();
  masterGain.gain.setValueAtTime(musicVolume, context.currentTime);
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
  attack = 0.08,
  detune = 0,
}) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(Math.max(24, frequency), start);
  if (oscillator.detune) oscillator.detune.setValueAtTime(detune, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(
    Math.max(0.0002, gain),
    start + Math.min(attack, duration * 0.32),
  );
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  envelope.connect(destination);
  activeOscillators.add(oscillator);
  oscillator.onended = () => activeOscillators.delete(oscillator);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function scheduleChord(context, destination, profileData, at, scaleIndex, duration, gainScale = 1) {
  const rootOffset = profileData.scale[scaleIndex % profileData.scale.length];
  profileData.harmony.forEach((harmonyOffset, harmonyIndex) => {
    const harmonyScaleIndex = (scaleIndex + harmonyOffset) % profileData.scale.length;
    const offset = profileData.scale[harmonyScaleIndex];
    scheduleNote(context, destination, {
      frequency: midiToFrequency(profileData.rootMidi + offset + (harmonyIndex ? 0 : 12)),
      start: at,
      duration,
      wave: harmonyIndex ? "sine" : profileData.wave,
      gain: profileData.gain * gainScale * (harmonyIndex ? 0.32 : 0.48),
      attack: 0.12,
      detune: harmonyIndex ? 4 : -3,
    });
  });
  if (profileData.texture > 0) {
    scheduleNote(context, destination, {
      frequency: midiToFrequency(profileData.rootMidi + rootOffset - 12),
      start: at,
      duration: Math.max(duration, profileData.barSeconds * 0.48),
      wave: "sine",
      gain: profileData.gain * profileData.texture * 0.42,
      attack: 0.20,
      detune: 7,
    });
  }
}

function schedulePulse(context, destination, profileData, at, stepSeconds, stepCount) {
  if (!profileData.pulse) return;
  const pulseGain = profileData.gain * profileData.pulse;
  for (let index = 0; index < stepCount; index += 1) {
    const beatAt = at + index * stepSeconds;
    if (index % 2 === 0) {
      scheduleNote(context, destination, {
        frequency: midiToFrequency(profileData.rootMidi - 24),
        start: beatAt,
        duration: Math.min(0.11, stepSeconds * 0.32),
        wave: "sine",
        gain: pulseGain * 0.42,
        attack: 0.012,
      });
    }
    if (profileData.pulse > 0.3) {
      scheduleNote(context, destination, {
        frequency: midiToFrequency(profileData.rootMidi + 24),
        start: beatAt + stepSeconds * 0.5,
        duration: Math.min(0.045, stepSeconds * 0.16),
        wave: "square",
        gain: pulseGain * 0.10,
        attack: 0.008,
      });
    }
  }
}

function scheduleBar(context, profileData, at, index) {
  const destination = ensureMaster(context);
  const melody = profileData.bars[index % profileData.bars.length];
  const stepSeconds = profileData.barSeconds / melody.length;

  profileData.drone.forEach((scaleIndex, droneIndex) => {
    const offset = profileData.scale[scaleIndex % profileData.scale.length];
    scheduleNote(context, destination, {
      frequency: midiToFrequency(profileData.rootMidi + offset - (droneIndex ? 0 : 12)),
      start: at,
      duration: profileData.barSeconds * 0.95,
      wave: "sine",
      gain: profileData.gain * (droneIndex ? 0.21 : 0.32),
      attack: 0.22,
      detune: droneIndex ? 5 : -4,
    });
  });

  const bassStepSeconds = profileData.barSeconds / profileData.bass.length;
  profileData.bass.forEach((scaleIndex, bassIndex) => {
    const offset = profileData.scale[scaleIndex % profileData.scale.length];
    scheduleNote(context, destination, {
      frequency: midiToFrequency(profileData.rootMidi + offset - 12),
      start: at + bassIndex * bassStepSeconds,
      duration: Math.max(0.22, bassStepSeconds * 0.64),
      wave: "triangle",
      gain: profileData.gain * 0.52,
      attack: 0.035,
    });
  });

  melody.forEach((scaleIndex, noteIndex) => {
    const offset = profileData.scale[scaleIndex % profileData.scale.length];
    const noteAt = at + noteIndex * stepSeconds;
    const lift = index % 4 === 3 && noteIndex === melody.length - 1 ? 12 : 0;
    scheduleNote(context, destination, {
      frequency: midiToFrequency(profileData.rootMidi + offset + profileData.melodyOctave + lift),
      start: noteAt,
      duration: Math.max(0.28, stepSeconds * 0.70),
      wave: profileData.wave,
      gain: profileData.gain,
      attack: 0.055,
    });
    if (noteIndex === 0 || (profileData.pulse > 0.6 && noteIndex % 2 === 0)) {
      scheduleChord(
        context,
        destination,
        profileData,
        noteAt,
        scaleIndex,
        Math.max(0.30, stepSeconds * 0.82),
        noteIndex === 0 ? 0.72 : 0.42,
      );
    }
  });

  schedulePulse(context, destination, profileData, at, stepSeconds, melody.length);
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
    nextBarAt = context.currentTime + 0.055;
    barIndex = 0;
    stopActiveOscillators();
  }
  if (scene === MUSIC_SCENE.SILENT || context.state !== "running") return false;
  const profileData = musicProfileFor(scene, normalizedPhase);
  if (!profileData) return false;
  if (context.currentTime > nextBarAt + profileData.barSeconds * 1.5) {
    nextBarAt = context.currentTime + 0.055;
  }
  if (context.currentTime + 0.14 >= nextBarAt) {
    scheduleBar(context, profileData, nextBarAt, barIndex);
    nextBarAt += profileData.barSeconds;
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
