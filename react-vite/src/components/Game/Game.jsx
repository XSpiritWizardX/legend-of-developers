import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { csrfFetch } from "../../redux/csrf";
import { createGame } from "./engine";
import { GAME_SFX, playGameSfx, setGameSfxVolume } from "./gameAudio";
import { setGameMusicVolume } from "./gameMusic";
import "./Game.css";

const SLOTS = [1, 2, 3];
const legacyLocalKey = (slot) => `legend-of-devs-save-${slot}`;
const localIdentity = (user) => (user?.id ? `user-${user.id}` : "guest");
const localKey = (slot, user) => `legend-of-devs-save-${localIdentity(user)}-${slot}`;
const AUDIO_PREFERENCES_KEY = "legend-of-devs-audio";
const DEFAULT_AUDIO_PREFERENCES = Object.freeze({ music: 68, sfx: 88 });

function clampPercent(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : fallback;
}

function readAudioPreferences() {
  if (typeof localStorage === "undefined") return { ...DEFAULT_AUDIO_PREFERENCES };
  try {
    const saved = JSON.parse(localStorage.getItem(AUDIO_PREFERENCES_KEY));
    return {
      music: clampPercent(saved?.music, DEFAULT_AUDIO_PREFERENCES.music),
      sfx: clampPercent(saved?.sfx, DEFAULT_AUDIO_PREFERENCES.sfx),
    };
  } catch {
    return { ...DEFAULT_AUDIO_PREFERENCES };
  }
}

export function normalizeCompletedSave(data) {
  if (!data?.flags?.backendApi || data.flags.questComplete) return data;
  return {
    ...data,
    flags: { ...data.flags, questComplete: true },
    player: { ...data.player, hasEmber: true },
  };
}

function readLocal(slot, user) {
  if (typeof localStorage === "undefined") return null;
  try {
    const scoped = localStorage.getItem(localKey(slot, user));
    if (scoped) return normalizeCompletedSave(JSON.parse(scoped));

    // Preserve pre-release guest saves without ever importing an unscoped
    // browser save into a signed-in player's private fallback namespace.
    if (!user) {
      const legacy = localStorage.getItem(legacyLocalKey(slot));
      if (legacy) {
        const migrated = normalizeCompletedSave(JSON.parse(legacy));
        localStorage.setItem(localKey(slot, user), JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function writeLocal(slot, data, user) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(localKey(slot, user), JSON.stringify(data));
}

function removeLocal(slot, user) {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(localKey(slot, user));
  if (!user) localStorage.removeItem(legacyLocalKey(slot));
}

function AudioControls({ preferences, onChange }) {
  return (
    <div className="audio-controls" aria-label="Audio settings">
      <label>
        <span>Music {preferences.music}%</span>
        <input
          aria-label="Music volume"
          type="range"
          min="0"
          max="100"
          step="5"
          value={preferences.music}
          onChange={(event) => onChange("music", event.target.value)}
        />
      </label>
      <label>
        <span>SFX {preferences.sfx}%</span>
        <input
          aria-label="Sound effects volume"
          type="range"
          min="0"
          max="100"
          step="5"
          value={preferences.sfx}
          onChange={(event) => onChange("sfx", event.target.value)}
        />
      </label>
    </div>
  );
}

function TouchButton({ input, label, className = "", disabled, onPress, onRelease }) {
  function press(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onPress(input);
  }

  function release(event) {
    event.preventDefault();
    onRelease(input);
  }

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      aria-label={label}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );
}

function MobileControls({ disabled, onPress, onRelease }) {
  const buttonProps = { disabled, onPress, onRelease };
  return (
    <div className="mobile-controls" aria-label="Touch game controls">
      <div className="touch-dpad">
        <TouchButton {...buttonProps} input="arrowup" label="▲" className="touch-up" />
        <TouchButton {...buttonProps} input="arrowleft" label="◀" className="touch-left" />
        <span className="touch-center" aria-hidden="true" />
        <TouchButton {...buttonProps} input="arrowright" label="▶" className="touch-right" />
        <TouchButton {...buttonProps} input="arrowdown" label="▼" className="touch-down" />
      </div>
      <div className="touch-actions">
        <TouchButton {...buttonProps} input="p" label="Pause" className="touch-menu" />
        <TouchButton {...buttonProps} input="l" label="Talk" className="touch-talk" />
        <TouchButton {...buttonProps} input="shift" label="Dash" className="touch-dash" />
        <TouchButton {...buttonProps} input="h" label="Sword" className="touch-sword" />
        <TouchButton {...buttonProps} input="j" label="A" className="touch-a" />
        <TouchButton {...buttonProps} input="q" label="Prev tab" className="touch-tab-prev" />
        <TouchButton {...buttonProps} input="e" label="Next tab" className="touch-tab-next" />
        <TouchButton {...buttonProps} input="k" label="B" className="touch-b" />
      </div>
    </div>
  );
}

export default function Game() {
  const user = useSelector((state) => state.session.user);
  const location = useLocation();
  const requestedMode = new URLSearchParams(location.search).get("mode");
  const debugRequested = requestedMode === "debug";
  const playtestRequested = requestedMode === "playtest";
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const saveTimer = useRef(null);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFile, setActiveFile] = useState(null);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState("select");
  const [copySource, setCopySource] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [audioPreferences, setAudioPreferences] = useState(readAudioPreferences);
  const [completionCelebration, setCompletionCelebration] = useState(false);

  useEffect(() => {
    setGameMusicVolume(audioPreferences.music / 100);
    setGameSfxVolume(audioPreferences.sfx / 100);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AUDIO_PREFERENCES_KEY, JSON.stringify(audioPreferences));
    }
  }, [audioPreferences]);

  useEffect(() => {
    let active = true;
    async function loadFiles() {
      setLoading(true);
      const localFiles = Object.fromEntries(SLOTS.map((slot) => [slot, readLocal(slot, user)]));
      let loaded = { ...localFiles };
      let status = user ? "" : "Guest saves ready";
      if (user) {
        try {
          const response = await csrfFetch("/api/game/saves");
          const payload = await response.json();
          loaded = { 1: null, 2: null, 3: null };
          payload.saves.forEach((save) => {
            const normalized = normalizeCompletedSave(save.data);
            loaded[save.slot] = normalized;
            writeLocal(save.slot, normalized, user);
          });
          status = "Cloud saves synchronized";
        } catch {
          status = "Cloud unavailable · private local backups ready";
        }
      }
      if (active) {
        setFiles(loaded);
        setSaveStatus(status);
        setLoading(false);
      }
    }
    loadFiles();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (playtestRequested && !loading && !activeFile) {
      const query = new URLSearchParams(location.search);
      const requestedMap = query.get("map");
      const requestedRoom = query.get("room")?.split(",").map(Number);
      const roomX = Number.isFinite(requestedRoom?.[0]) ? requestedRoom[0] : 1;
      const roomY = Number.isFinite(requestedRoom?.[1]) ? requestedRoom[1] : 1;
      const playtestSave = requestedMap ? {
        version: 3,
        mapId: requestedMap,
        player: {
          x: (roomX * 16 + 8) * 64 + 32,
          y: (roomY * 10 + 5) * 64 + 32,
          hp: 6,
          maxHp: 6,
          inventory: { htmlSword: true, maps: {} },
          equippedSlots: [null, null],
        },
      } : null;
      setActiveFile({ slot: 1, data: playtestSave });
      setSaveStatus("Playtest save");
    }
  }, [playtestRequested, loading, activeFile, location.search]);

  useEffect(() => {
    if (!activeFile || !canvasRef.current) return undefined;
    let playtestTimer;
    const { slot, data } = activeFile;
    gameRef.current = createGame(canvasRef.current, {
      initialSave: normalizeCompletedSave(data),
      onSave(saveData) {
        const completedNow = Boolean(saveData?.flags?.backendApi && !saveData?.flags?.questComplete);
        const normalized = normalizeCompletedSave(saveData);
        writeLocal(slot, normalized, user);
        setFiles((current) => ({ ...current, [slot]: normalized }));
        if (completedNow) {
          setCompletionCelebration(true);
          playGameSfx(GAME_SFX.BOSS_DEFEAT);
        }
        clearTimeout(saveTimer.current);
        if (!user) {
          setSaveStatus(completedNow ? "Realm restored · saved locally" : "Saved locally");
          return;
        }
        setSaveStatus("Saving…");
        saveTimer.current = setTimeout(async () => {
          try {
            await csrfFetch(`/api/game/saves/${slot}`, {
              method: "PUT",
              body: JSON.stringify({ data: normalized }),
            });
            setSaveStatus(completedNow ? "Realm restored · cloud save complete" : "Cloud save complete");
          } catch {
            setSaveStatus("Saved privately on this device · cloud unavailable");
          }
        }, 350);
      },
    });
    if (debugRequested || playtestRequested) {
      gameRef.current.start();
      if (debugRequested) gameRef.current.enterDebugLab();
      setStarted(true);
      const query = new URLSearchParams(location.search);
      const scriptedMove = query.get("move");
      const moveSeconds = Number(query.get("seconds") || 0);
      if (playtestRequested && scriptedMove && moveSeconds > 0) {
        gameRef.current.pressKey(scriptedMove);
        playtestTimer = setTimeout(() => {
          gameRef.current?.releaseKey(scriptedMove);
        }, moveSeconds * 1000);
      }
    }
    return () => {
      clearTimeout(playtestTimer);
      clearTimeout(saveTimer.current);
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [activeFile, user, debugRequested, playtestRequested, location.search]);

  function updateAudioPreference(channel, value) {
    const fallback = DEFAULT_AUDIO_PREFERENCES[channel];
    const nextValue = clampPercent(value, fallback);
    setAudioPreferences((current) => ({ ...current, [channel]: nextValue }));
  }

  async function persistFile(slot, data) {
    const normalized = normalizeCompletedSave(data);
    writeLocal(slot, normalized, user);
    setFiles((current) => ({ ...current, [slot]: normalized }));
    if (user) {
      setSaveStatus("Syncing copied save…");
      try {
        await csrfFetch(`/api/game/saves/${slot}`, {
          method: "PUT",
          body: JSON.stringify({ data: normalized }),
        });
        setSaveStatus("Cloud copy complete");
      } catch {
        setSaveStatus("Copied privately on this device · cloud unavailable");
      }
    } else {
      setSaveStatus("Copied locally");
    }
    playGameSfx(GAME_SFX.SAVE);
  }

  async function deleteFile(slot) {
    removeLocal(slot, user);
    setFiles((current) => ({ ...current, [slot]: null }));
    if (user) {
      try {
        await csrfFetch(`/api/game/saves/${slot}`, { method: "DELETE" });
        setSaveStatus("Cloud save deleted");
      } catch {
        setSaveStatus("Removed from this device · cloud delete unavailable");
      }
    } else {
      setSaveStatus("Local save deleted");
    }
    playGameSfx(GAME_SFX.UI_CANCEL);
  }

  function chooseFile(slot) {
    const data = files[slot];
    playGameSfx(GAME_SFX.UI_CONFIRM);
    if (mode === "delete") {
      if (data && window.confirm(`Delete File ${slot}? This cannot be undone.`)) {
        deleteFile(slot);
      }
      return;
    }
    if (mode === "copy") {
      if (!copySource) {
        if (data) setCopySource(slot);
        return;
      }
      if (slot === copySource) return;
      if (data && !window.confirm(`Overwrite File ${slot}?`)) return;
      persistFile(slot, structuredClone(files[copySource]));
      setCopySource(null);
      setMode("select");
      return;
    }
    setCompletionCelebration(false);
    setActiveFile({ slot, data });
    setStarted(false);
    setSaveStatus(user ? "Cloud save ready" : "Local save ready");
  }

  function begin() {
    playGameSfx(GAME_SFX.UI_CONFIRM);
    gameRef.current?.start();
    setStarted(true);
  }

  function returnToFiles() {
    playGameSfx(GAME_SFX.UI_CANCEL);
    setCompletionCelebration(false);
    setActiveFile(null);
    setStarted(false);
    setMode("select");
  }

  function enterDebugLab() {
    playGameSfx(GAME_SFX.UI_CONFIRM);
    gameRef.current?.start();
    gameRef.current?.enterDebugLab();
    setStarted(true);
  }

  function setFileMode(nextMode) {
    playGameSfx(nextMode === "select" ? GAME_SFX.UI_CANCEL : GAME_SFX.UI_MOVE);
    setMode(nextMode);
    setCopySource(null);
  }

  function pressGameKey(key) {
    gameRef.current?.pressKey(key);
  }

  function releaseGameKey(key) {
    gameRef.current?.releaseKey(key);
  }

  if (!activeFile) {
    return (
      <main className="file-screen">
        <div className="file-panel">
          <p className="file-kicker">THE LEGEND OF DEVELOPER · THE BLIGHT OF AI</p>
          <h1>Select a File</h1>
          <p className="file-instruction">
            {mode === "copy" && (copySource ? `Choose a destination for File ${copySource}` : "Choose a file to copy")}
            {mode === "delete" && "Choose a file to delete"}
            {mode === "select" && (user ? "Your adventure uses cloud saves with a private local backup" : "Guest files are saved on this device")}
          </p>
          <div className="save-files">
            {SLOTS.map((slot) => {
              const data = files[slot];
              const player = data?.player;
              return (
                <button
                  className={`save-file ${copySource === slot ? "selected" : ""}`}
                  disabled={loading || (mode !== "select" && !data && !copySource)}
                  key={slot}
                  onClick={() => chooseFile(slot)}
                >
                  <span className="file-number">FILE {slot}</span>
                  {data ? (
                    <span className="file-details">
                      <b>
                        {data?.flags?.questComplete
                          ? "REALM RESTORED"
                          : (data?.flags?.backendApi
                            ? "CRYSTAL SIGIL CLAIMED"
                            : (data?.flags?.reactApp
                              ? "EMBER SIGIL CLAIMED"
                              : (data?.flags?.firstWebpage ? "GROVE SIGIL CLAIMED" : (player?.inventory?.htmlSword ? "BEARER OF THE BLADE" : "A NEW ADVENTURE"))))}
                      </b>
                      <span className="file-stats">
                        <span className="mini-hearts">
                          {Array.from({ length: Math.ceil((player?.maxHp || 6) / 2) }, (_, index) => (
                            <i className={(player?.hp || 6) > index * 2 ? "full" : ""} key={index}>♥</i>
                          ))}
                        </span>
                        <span>◆ {player?.coins || 0} · Keys {player?.keys || 0}</span>
                      </span>
                    </span>
                  ) : (
                    <span className="empty-file">NEW GAME</span>
                  )}
                  <span className="file-action">{data ? "CONTINUE" : "START"}</span>
                </button>
              );
            })}
          </div>
          <div className="file-tools">
            <button onClick={() => setFileMode(mode === "copy" ? "select" : "copy")}>Copy File</button>
            <button onClick={() => setFileMode(mode === "delete" ? "select" : "delete")}>Delete File</button>
            {mode !== "select" && <button onClick={() => setFileMode("select")}>Cancel</button>}
          </div>
          <AudioControls preferences={audioPreferences} onChange={updateAudioPreference} />
          {saveStatus && <p className="save-status-copy">{saveStatus}</p>}
          {!user && <p className="signin-hint">Log in or sign up to access these files from another device.</p>}
        </div>
      </main>
    );
  }

  const currentSave = files[activeFile.slot] || normalizeCompletedSave(activeFile.data);
  const restored = Boolean(currentSave?.flags?.questComplete);

  return (
    <main className="game-page">
      <header className="game-header">
        <div><small>FILE {activeFile.slot} · {restored ? "EVERDAWN RESTORED" : "RESTORE THE THREE SIGILS"}</small><h1>The Legend of Developer: The Blight of AI</h1></div>
        <div className="game-header-actions">
          <div className="controls"><span>WASD Move</span><span>Shift Dash</span><span>H Tap / Hold Blade</span><span>J Item A</span><span>K Item B</span><span>L Enter / Talk</span><span>P Map & Gear</span><span>Q/E Change Tab</span></div>
          <AudioControls preferences={audioPreferences} onChange={updateAudioPreference} />
          {(debugRequested || playtestRequested) && <button onClick={enterDebugLab}>Training Hall</button>}
          <button onClick={returnToFiles}>Save Files</button>
        </div>
      </header>
      <section className="game-frame">
        <canvas ref={canvasRef} width="1024" height="708" aria-label="The Legend of Developer: The Blight of AI game" />
        {!started && (
          <div className="game-overlay">
            <p>{restored ? "EPILOGUE · EVERDAWN RESTORED" : "CHAPTER I · THE SLEEPING GROVE"}</p>
            <h2>{restored ? "Continue Exploring" : (activeFile.data ? "Continue the Quest" : "The HTML Sword")}</h2>
            <span>
              {restored
                ? "The three sigils shine again. Revisit Everdawn, uncover secrets, and finish anything you left behind."
                : "Dark roots have sealed the roads beyond Willowbrook. Upgrade the Regular Blade, awaken the forest temple, and recover the Grove Sigil."}
            </span>
            {!activeFile.data && !restored && <small>Move with WASD or the arrow keys · H attacks · L interacts · P opens your map and gear.</small>}
            <button onClick={begin}>{activeFile.data ? "CONTINUE" : "BEGIN ADVENTURE"}</button>
          </div>
        )}
        {started && completionCelebration && (
          <div className="game-overlay game-completion-overlay" role="dialog" aria-live="polite" aria-label="Everdawn restored">
            <p>THE THREE SIGILS ARE RESTORED</p>
            <h2>Everdawn Lives</h2>
            <span>The Blight has broken. Your completed adventure is saved, and the full realm remains open for exploration.</span>
            <small>Rootbound Temple · Emberstone Ruins · Crystalwater Vault</small>
            <button onClick={() => setCompletionCelebration(false)}>CONTINUE EXPLORING</button>
          </div>
        )}
      </section>
      <MobileControls
        disabled={!started || completionCelebration}
        onPress={pressGameKey}
        onRelease={releaseGameKey}
      />
      <footer><span className="save-dot" /> {saveStatus}</footer>
    </main>
  );
}
