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
  DASH: "dash",
  CHARGE: "charge",
  BLOCK: "block",
  PLAYER_HURT: "playerHurt",
  ENEMY_DEFEAT: "enemyDefeat",
  BOSS_PHASE: "bossPhase",
  BOSS_DEFEAT: "bossDefeat",
  SECRET: "secret",
  SWITCH: "switch",
  DOOR: "door",
  LOCKED: "locked",
  UI_MOVE: "uiMove",
  UI_CONFIRM: "uiConfirm",
  UI_CANCEL: "uiCancel",
  SAVE: "save",
  BUY: "buy",
  ERROR: "error",
  MAGIC: "magic",
  FIRE: "fire",
  ICE: "ice",
  BOMB: "bomb",
  GRAPPLE: "grapple",
  KEY: "key",
  HEART: "heart",
  COIN: "coin",
});

const tone = (wave, start, duration, from, to, gain, extra = {}) => Object.freeze({
  wave, start, duration, from, to, gain, ...extra,
});
const noise = (start, duration, gain, extra = {}) => Object.freeze({
  noise: true, start, duration, gain, ...extra,
});

const PATTERNS = Object.freeze({
  [GAME_SFX.SWORD]: Object.freeze([
    noise(0, 0.055, 0.018, { filter: 1900 }),
    tone("triangle", 0, 0.075, 560, 235, 0.055, { pan: -0.08 }),
    tone("sine", 0.018, 0.065, 260, 170, 0.022, { pan: 0.08 }),
  ]),
  [GAME_SFX.HIT]: Object.freeze([
    noise(0, 0.05, 0.026, { filter: 850 }),
    tone("square", 0, 0.055, 150, 88, 0.060),
    tone("triangle", 0.016, 0.065, 380, 165, 0.032),
  ]),
  [GAME_SFX.PICKUP]: Object.freeze([
    tone("triangle", 0, 0.07, 523, 523, 0.043),
    tone("triangle", 0.068, 0.07, 659, 659, 0.047),
    tone("triangle", 0.136, 0.11, 784, 784, 0.052),
  ]),
  [GAME_SFX.CHEST]: Object.freeze([
    tone("triangle", 0, 0.08, 392, 392, 0.040),
    tone("triangle", 0.085, 0.08, 523, 523, 0.046),
    tone("triangle", 0.17, 0.14, 659, 659, 0.052),
    tone("sine", 0.18, 0.20, 196, 262, 0.018),
  ]),
  [GAME_SFX.HOP]: Object.freeze([
    tone("triangle", 0, 0.11, 215, 405, 0.038),
    noise(0.01, 0.045, 0.009, { filter: 1300 }),
  ]),
  [GAME_SFX.FALL]: Object.freeze([
    tone("sine", 0, 0.24, 300, 78, 0.052),
    noise(0.07, 0.19, 0.012, { filter: 500 }),
  ]),
  [GAME_SFX.THROW]: Object.freeze([
    noise(0, 0.075, 0.012, { filter: 1450 }),
    tone("triangle", 0, 0.12, 315, 138, 0.042),
  ]),
  [GAME_SFX.SPLASH]: Object.freeze([
    noise(0, 0.18, 0.030, { filter: 950 }),
    tone("sine", 0, 0.13, 175, 102, 0.035),
    tone("triangle", 0.025, 0.09, 315, 185, 0.022),
  ]),
  [GAME_SFX.ROOM]: Object.freeze([
    tone("sine", 0, 0.11, 178, 236, 0.020),
    tone("triangle", 0.035, 0.12, 355, 472, 0.018),
  ]),
  [GAME_SFX.DASH]: Object.freeze([
    noise(0, 0.11, 0.020, { filter: 1650 }),
    tone("triangle", 0, 0.10, 250, 610, 0.028),
  ]),
  [GAME_SFX.CHARGE]: Object.freeze([
    tone("sine", 0, 0.32, 160, 410, 0.025),
    tone("triangle", 0.06, 0.28, 320, 760, 0.018),
  ]),
  [GAME_SFX.BLOCK]: Object.freeze([
    noise(0, 0.035, 0.017, { filter: 2300 }),
    tone("square", 0, 0.075, 820, 520, 0.034),
    tone("sine", 0.012, 0.13, 310, 230, 0.019),
  ]),
  [GAME_SFX.PLAYER_HURT]: Object.freeze([
    tone("sawtooth", 0, 0.14, 220, 105, 0.038),
    noise(0.015, 0.09, 0.020, { filter: 720 }),
  ]),
  [GAME_SFX.ENEMY_DEFEAT]: Object.freeze([
    tone("triangle", 0, 0.09, 250, 185, 0.030),
    tone("triangle", 0.06, 0.12, 185, 92, 0.026),
    noise(0.025, 0.10, 0.016, { filter: 800 }),
  ]),
  [GAME_SFX.BOSS_PHASE]: Object.freeze([
    tone("sawtooth", 0, 0.42, 92, 185, 0.030),
    tone("square", 0.12, 0.30, 138, 277, 0.025),
    tone("triangle", 0.22, 0.26, 277, 554, 0.020),
  ]),
  [GAME_SFX.BOSS_DEFEAT]: Object.freeze([
    tone("sine", 0, 0.35, 110, 73, 0.035),
    tone("triangle", 0.16, 0.16, 392, 523, 0.036),
    tone("triangle", 0.31, 0.16, 523, 659, 0.038),
    tone("triangle", 0.46, 0.28, 659, 784, 0.043),
  ]),
  [GAME_SFX.SECRET]: Object.freeze([
    tone("triangle", 0, 0.08, 440, 440, 0.036),
    tone("triangle", 0.08, 0.08, 554, 554, 0.038),
    tone("triangle", 0.16, 0.12, 659, 659, 0.042),
    tone("sine", 0.20, 0.20, 880, 880, 0.020),
  ]),
  [GAME_SFX.SWITCH]: Object.freeze([
    tone("square", 0, 0.055, 220, 165, 0.028),
    tone("triangle", 0.065, 0.08, 330, 440, 0.027),
  ]),
  [GAME_SFX.DOOR]: Object.freeze([
    noise(0, 0.18, 0.022, { filter: 520 }),
    tone("sine", 0.02, 0.18, 145, 92, 0.025),
  ]),
  [GAME_SFX.LOCKED]: Object.freeze([
    tone("square", 0, 0.07, 180, 145, 0.032),
    tone("square", 0.09, 0.07, 180, 145, 0.028),
  ]),
  [GAME_SFX.UI_MOVE]: Object.freeze([
    tone("triangle", 0, 0.045, 520, 610, 0.018),
  ]),
  [GAME_SFX.UI_CONFIRM]: Object.freeze([
    tone("triangle", 0, 0.05, 523, 523, 0.022),
    tone("triangle", 0.055, 0.07, 659, 659, 0.024),
  ]),
  [GAME_SFX.UI_CANCEL]: Object.freeze([
    tone("triangle", 0, 0.05, 440, 330, 0.022),
  ]),
  [GAME_SFX.SAVE]: Object.freeze([
    tone("sine", 0, 0.08, 392, 392, 0.025),
    tone("triangle", 0.075, 0.08, 523, 523, 0.027),
    tone("triangle", 0.15, 0.10, 698, 698, 0.030),
  ]),
  [GAME_SFX.BUY]: Object.freeze([
    tone("triangle", 0, 0.055, 659, 659, 0.026),
    tone("triangle", 0.05, 0.055, 784, 784, 0.028),
    tone("triangle", 0.10, 0.09, 988, 988, 0.030),
  ]),
  [GAME_SFX.ERROR]: Object.freeze([
    tone("square", 0, 0.08, 185, 150, 0.028),
    tone("square", 0.09, 0.10, 150, 110, 0.026),
  ]),
  [GAME_SFX.MAGIC]: Object.freeze([
    tone("sine", 0, 0.22, 330, 660, 0.028),
    tone("triangle", 0.035, 0.18, 495, 990, 0.020),
  ]),
  [GAME_SFX.FIRE]: Object.freeze([
    noise(0, 0.20, 0.022, { filter: 1200 }),
    tone("sawtooth", 0, 0.14, 170, 260, 0.018),
  ]),
  [GAME_SFX.ICE]: Object.freeze([
    tone("triangle", 0, 0.12, 1046, 659, 0.026),
    tone("sine", 0.05, 0.18, 1318, 784, 0.017),
    noise(0.06, 0.09, 0.010, { filter: 2600 }),
  ]),
  [GAME_SFX.BOMB]: Object.freeze([
    tone("sine", 0, 0.16, 105, 48, 0.055),
    noise(0, 0.22, 0.042, { filter: 430 }),
    noise(0.025, 0.10, 0.020, { filter: 1800 }),
  ]),
  [GAME_SFX.GRAPPLE]: Object.freeze([
    noise(0, 0.09, 0.012, { filter: 1900 }),
    tone("square", 0, 0.15, 390, 210, 0.025),
  ]),
  [GAME_SFX.KEY]: Object.freeze([
    tone("triangle", 0, 0.06, 784, 784, 0.028),
    tone("triangle", 0.055, 0.09, 1046, 1046, 0.032),
  ]),
  [GAME_SFX.HEART]: Object.freeze([
    tone("sine", 0, 0.08, 130, 150, 0.027),
    tone("sine", 0.10, 0.11, 130, 165, 0.030),
  ]),
  [GAME_SFX.COIN]: Object.freeze([
    tone("triangle", 0, 0.055, 988, 1175, 0.027),
  ]),
});

export function sfxPatternFor(type) {
  return PATTERNS[type] || [];
}

let audioContext = null;
let sfxMaster = null;
let sfxMasterContext = null;
let sfxVolume = 0.88;

function contextConstructor() {
  if (typeof window === "undefined") return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

export function currentGameAudioContext() {
  return audioContext;
}

export function setGameSfxVolume(value) {
  sfxVolume = Math.max(0, Math.min(1, Number(value) || 0));
  if (sfxMaster && sfxMasterContext) {
    sfxMaster.gain.setTargetAtTime(sfxVolume, sfxMasterContext.currentTime, 0.025);
  }
  return sfxVolume;
}

function ensureSfxMaster(context) {
  if (sfxMaster && sfxMasterContext === context) return sfxMaster;
  sfxMaster = context.createGain();
  sfxMaster.gain.setValueAtTime(sfxVolume, context.currentTime);
  sfxMaster.connect(context.destination);
  sfxMasterContext = context;
  return sfxMaster;
}

export function unlockGameAudio() {
  const AudioContextClass = contextConstructor();
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  ensureSfxMaster(audioContext);
  return audioContext;
}

function connectWithPan(context, source, destination, pan = 0) {
  if (!context.createStereoPanner || !pan) {
    source.connect(destination);
    return;
  }
  const panner = context.createStereoPanner();
  panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), context.currentTime);
  source.connect(panner);
  panner.connect(destination);
}

function playNoise(context, destination, note, options) {
  if (!context.createBuffer || !context.createBufferSource) return;
  const sampleRate = context.sampleRate || 44100;
  const frameCount = Math.max(1, Math.ceil(sampleRate * note.duration));
  const buffer = context.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < frameCount; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  const source = context.createBufferSource();
  const gain = context.createGain();
  const start = context.currentTime + note.start;
  const end = start + note.duration;
  const finalGain = Math.max(0.0001, note.gain * options.volume);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(finalGain, start + Math.min(0.012, note.duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  source.buffer = buffer;

  let output = gain;
  if (note.filter && context.createBiquadFilter) {
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(note.filter * options.pitch, start);
    gain.connect(filter);
    output = filter;
  }
  source.connect(gain);
  connectWithPan(context, output, destination, options.pan + (note.pan || 0));
  source.start(start);
  source.stop(end + 0.01);
}

function playTone(context, destination, note, options) {
  if (note.noise) {
    playNoise(context, destination, note, options);
    return;
  }
  const start = context.currentTime + note.start;
  const end = start + note.duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = note.wave;
  oscillator.frequency.setValueAtTime(Math.max(20, note.from * options.pitch), start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, note.to * options.pitch), end);
  if (note.detune && oscillator.detune) {
    oscillator.detune.setValueAtTime(note.detune, start);
  }
  const finalGain = Math.max(0.0001, note.gain * options.volume);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(finalGain, start + Math.min(0.012, note.duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(gain);
  connectWithPan(context, gain, destination, options.pan + (note.pan || 0));
  oscillator.start(start);
  oscillator.stop(end + 0.01);
}

export function playGameSfx(type, {
  volume = 1,
  pitch = 1,
  pan = 0,
} = {}) {
  const pattern = sfxPatternFor(type);
  if (!pattern.length) return false;
  const context = unlockGameAudio();
  if (!context) return false;
  const destination = ensureSfxMaster(context);
  const options = {
    volume: Math.max(0, Math.min(2, Number(volume) || 0)),
    pitch: Math.max(0.5, Math.min(2, Number(pitch) || 1)),
    pan: Math.max(-1, Math.min(1, Number(pan) || 0)),
  };
  pattern.forEach((note) => playTone(context, destination, note, options));
  return true;
}
