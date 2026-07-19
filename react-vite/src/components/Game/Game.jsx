import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { csrfFetch } from "../../redux/csrf";
import { createGame } from "./engine";
import "./Game.css";

const SLOTS = [1, 2, 3];
const localKey = (slot) => `legend-of-devs-save-${slot}`;

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
        <TouchButton {...buttonProps} input="h" label="Sword" className="touch-sword" />
        <TouchButton {...buttonProps} input="j" label="A" className="touch-a" />
        <TouchButton {...buttonProps} input="k" label="B" className="touch-b" />
      </div>
    </div>
  );
}

function readLocal(slot) {
  try { return JSON.parse(localStorage.getItem(localKey(slot))); }
  catch { return null; }
}

export default function Game() {
  const user = useSelector((state) => state.session.user);
  const location = useLocation();
  const debugRequested = new URLSearchParams(location.search).get("mode") === "debug";
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

  useEffect(() => {
    let active = true;
    async function loadFiles() {
      setLoading(true);
      let loaded = Object.fromEntries(SLOTS.map((slot) => [slot, readLocal(slot)]));
      if (user) {
        try {
          const response = await csrfFetch("/api/game/saves");
          const payload = await response.json();
          loaded = { 1: null, 2: null, 3: null };
          payload.saves.forEach((save) => { loaded[save.slot] = save.data; });
        } catch {
          // Local copies remain available if the API is temporarily offline.
        }
      }
      if (active) {
        setFiles(loaded);
        setLoading(false);
      }
    }
    loadFiles();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!activeFile || !canvasRef.current) return undefined;
    const { slot, data } = activeFile;
    gameRef.current = createGame(canvasRef.current, {
      initialSave: data,
      onSave(saveData) {
        localStorage.setItem(localKey(slot), JSON.stringify(saveData));
        setFiles((current) => ({ ...current, [slot]: saveData }));
        clearTimeout(saveTimer.current);
        if (!user) {
          setSaveStatus("Saved locally");
          return;
        }
        setSaveStatus("Saving…");
        saveTimer.current = setTimeout(async () => {
          try {
            await csrfFetch(`/api/game/saves/${slot}`, {
              method: "PUT",
              body: JSON.stringify({ data: saveData }),
            });
            setSaveStatus("Cloud save complete");
          } catch {
            setSaveStatus("Saved locally");
          }
        }, 350);
      },
    });
    if (debugRequested) {
      gameRef.current.start();
      gameRef.current.enterDebugLab();
      setStarted(true);
    }
    return () => {
      clearTimeout(saveTimer.current);
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [activeFile, user, debugRequested]);

  async function persistFile(slot, data) {
    localStorage.setItem(localKey(slot), JSON.stringify(data));
    if (user) {
      await csrfFetch(`/api/game/saves/${slot}`, {
        method: "PUT",
        body: JSON.stringify({ data }),
      });
    }
    setFiles((current) => ({ ...current, [slot]: data }));
  }

  async function deleteFile(slot) {
    localStorage.removeItem(localKey(slot));
    if (user) await csrfFetch(`/api/game/saves/${slot}`, { method: "DELETE" });
    setFiles((current) => ({ ...current, [slot]: null }));
  }

  function chooseFile(slot) {
    const data = files[slot];
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
    setActiveFile({ slot, data });
    setStarted(false);
    setSaveStatus(user ? "Cloud save ready" : "Local save ready");
  }

  function begin() {
    gameRef.current?.start();
    setStarted(true);
  }

  function returnToFiles() {
    setActiveFile(null);
    setStarted(false);
    setMode("select");
  }

  function enterDebugLab() {
    gameRef.current?.start();
    gameRef.current?.enterDebugLab();
    setStarted(true);
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
          <p className="file-kicker">THE LEGEND OF DEVS</p>
          <h1>Select a File</h1>
          <p className="file-instruction">
            {mode === "copy" && (copySource ? `Choose a destination for File ${copySource}` : "Choose a file to copy")}
            {mode === "delete" && "Choose a file to delete"}
            {mode === "select" && (user ? "Your adventure is saved to your account" : "Guest files are saved on this device")}
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
                          ? "JOB OFFER EARNED"
                          : (data?.flags?.backendApi
                            ? "BACKEND API ONLINE"
                            : (data?.flags?.reactApp
                              ? "REACT APP SHIPPED"
                              : (data?.flags?.firstWebpage ? "FIRST WEBPAGE LIVE" : (player?.inventory?.htmlSword ? "LEARNING THE STACK" : "BEGINNER CODER"))))}
                      </b>
                      <span className="file-stats">
                        <span className="mini-hearts">
                          {Array.from({ length: Math.ceil((player?.maxHp || 6) / 2) }, (_, index) => (
                            <i className={(player?.hp || 6) > index * 2 ? "full" : ""} key={index}>♥</i>
                          ))}
                        </span>
                        <span>¢ {player?.coins || 0} · Access {player?.keys || 0}</span>
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
            <button onClick={() => { setMode(mode === "copy" ? "select" : "copy"); setCopySource(null); }}>Copy File</button>
            <button onClick={() => { setMode(mode === "delete" ? "select" : "delete"); setCopySource(null); }}>Delete File</button>
            {mode !== "select" && <button onClick={() => { setMode("select"); setCopySource(null); }}>Cancel</button>}
          </div>
          {!user && <p className="signin-hint">Log in or sign up to access these files from another device.</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="game-page">
      <header className="game-header">
        <div><small>FILE {activeFile.slot} · BUILD YOUR CAREER</small><h1>Legend of Devs</h1></div>
        <div className="game-header-actions">
          <div className="controls"><span>WASD Move</span><span>H HTML Sword</span><span>J Slot A</span><span>K Slot B</span><span>L Enter / Talk</span><span>P Pause Screens</span><span>Q/E Change Tab</span></div>
          <button onClick={enterDebugLab}>Debug Lab</button>
          <button onClick={returnToFiles}>Save Files</button>
        </div>
      </header>
      <section className="game-frame">
        <canvas ref={canvasRef} width="1024" height="708" aria-label="Legend of Devs game" />
        {!started && (
          <div className="game-overlay">
            <p>SPRINT 01 · HELLO, WORLD</p>
            <h2>{activeFile.data ? "Resume Your Build" : "The First Commit"}</h2>
            <span>You are a beginner coder in Neon Stack City.<br />Find the HTML Sword, learn CSS and JavaScript, then publish your first webpage.</span>
            <button onClick={begin}>{activeFile.data ? "RESUME SESSION" : "START CODING"}</button>
          </div>
        )}
      </section>
      <MobileControls
        disabled={!started}
        onPress={pressGameKey}
        onRelease={releaseGameKey}
      />
      <footer><span className="save-dot" /> {saveStatus}</footer>
    </main>
  );
}
