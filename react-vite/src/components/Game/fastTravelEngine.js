import { createGame as createCoreGame } from "./engine";
import {
  FAST_TRAVEL_DESTINATIONS,
  buildFastTravelSave,
  isOverworldFastTravelActivation,
  withFastTravelMirror,
} from "./fastTravel";
import { MAPS, TILE, isSolid, tileAt } from "./world";
import { roomAssetSolidAt } from "./roomAssets";
import { installSpinningSawSpawns } from "./spinningSaw";

const PLAY_SURFACE = "play";
const PAUSE_SURFACE = "pause";
const INVENTORY_SURFACE = "inventory";
const MAP_SURFACE = "map";
const TRAVEL_SURFACE = "travel";

function applyStyles(element, styles) {
  Object.assign(element.style, styles);
  return element;
}

function overworldFastTravelTileOpen(tx, ty, flags = {}) {
  const overworld = MAPS.overworld;
  if (tx < 1 || ty < 1 || tx >= overworld.width - 1 || ty >= overworld.height - 1) return false;

  const centerX = tx * TILE + TILE / 2;
  const centerY = ty * TILE + TILE / 2;
  const radius = 18;
  return [
    [centerX - radius, centerY - radius],
    [centerX + radius, centerY - radius],
    [centerX - radius, centerY + radius],
    [centerX + radius, centerY + radius],
    [centerX, centerY],
  ].every(([x, y]) => {
    const tileX = Math.floor(x / TILE);
    const tileY = Math.floor(y / TILE);
    return !isSolid(tileAt("overworld", tileX, tileY, flags))
      && !roomAssetSolidAt("overworld", x, y);
  });
}

export function createGame(canvas, { initialSave, onSave } = {}) {
  installSpinningSawSpawns(MAPS);
  let latestSave = withFastTravelMirror(initialSave);
  let coreGame = null;
  let running = false;
  let destroyed = false;
  let surface = PLAY_SURFACE;
  let overlay = null;
  let destinationButtons = [];
  let travelCursor = 0;

  function persist(saveData) {
    latestSave = withFastTravelMirror(saveData);
    onSave?.(latestSave);
  }

  function mountCore(saveData) {
    coreGame?.destroy();
    coreGame = createCoreGame(canvas, {
      initialSave: withFastTravelMirror(saveData),
      onSave: persist,
    });
    if (running) coreGame.start();
  }

  function updateTravelSelection() {
    destinationButtons.forEach((button, index) => {
      const selected = index === travelCursor;
      button.style.background = selected ? "#263657" : "#11182a";
      button.style.borderColor = selected ? "#b96f5d" : "#394759";
      button.style.color = selected ? "#ffffff" : "#d6e0e4";
      button.setAttribute("aria-selected", String(selected));
    });
    destinationButtons[travelCursor]?.focus({ preventScroll: true });
  }

  function closeFastTravelMenu() {
    overlay?.remove();
    overlay = null;
    destinationButtons = [];
    surface = PLAY_SURFACE;
  }

  function travelTo(destinationId) {
    const flags = latestSave.flags || {};
    const nextSave = buildFastTravelSave(latestSave, destinationId, {
      tileSize: TILE,
      isOpen: (tx, ty) => overworldFastTravelTileOpen(tx, ty, flags),
    });
    latestSave = nextSave;
    onSave?.(nextSave);
    closeFastTravelMenu();
    mountCore(nextSave);
  }

  function openFastTravelMenu() {
    if (overlay || destroyed) return;
    surface = TRAVEL_SURFACE;
    travelCursor = 0;

    overlay = applyStyles(document.createElement("div"), {
      position: "fixed",
      inset: "0",
      zIndex: "10000",
      display: "grid",
      placeItems: "center",
      background: "rgba(2, 5, 12, .78)",
      padding: "20px",
    });
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Returning Mirror fast travel destinations");

    const panel = applyStyles(document.createElement("section"), {
      width: "min(560px, 92vw)",
      maxHeight: "88vh",
      overflowY: "auto",
      boxSizing: "border-box",
      background: "#070b18",
      border: "3px solid #8fa39a",
      boxShadow: "0 18px 70px rgba(0, 0, 0, .7)",
      padding: "26px",
      fontFamily: "monospace",
      color: "#f4f7f5",
    });

    const title = document.createElement("h2");
    title.textContent = "RETURNING MIRROR · FAST TRAVEL";
    Object.assign(title.style, {
      margin: "0 0 8px",
      textAlign: "center",
      fontSize: "22px",
      color: "#e9dfbf",
    });
    panel.appendChild(title);

    const instructions = document.createElement("p");
    instructions.textContent = "Choose an overworld destination. Arrow keys / WASD move · Enter / L confirms · Esc cancels.";
    Object.assign(instructions.style, {
      margin: "0 0 20px",
      textAlign: "center",
      lineHeight: "1.5",
      color: "#a9b9c3",
      fontSize: "12px",
    });
    panel.appendChild(instructions);

    const destinations = document.createElement("div");
    Object.assign(destinations.style, {
      display: "grid",
      gap: "9px",
    });

    destinationButtons = FAST_TRAVEL_DESTINATIONS.map((destination, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = destination.name.toUpperCase();
      button.dataset.destinationId = destination.id;
      button.setAttribute("role", "option");
      applyStyles(button, {
        width: "100%",
        minHeight: "46px",
        padding: "10px 14px",
        border: "2px solid #394759",
        background: "#11182a",
        color: "#d6e0e4",
        font: "700 14px monospace",
        textAlign: "left",
        cursor: "pointer",
      });
      button.addEventListener("mouseenter", () => {
        travelCursor = index;
        updateTravelSelection();
      });
      button.addEventListener("click", () => travelTo(destination.id));
      destinations.appendChild(button);
      return button;
    });
    panel.appendChild(destinations);

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "CANCEL";
    applyStyles(cancel, {
      display: "block",
      margin: "18px auto 0",
      minWidth: "150px",
      padding: "10px 18px",
      border: "2px solid #704655",
      background: "#241422",
      color: "#e9c6d3",
      font: "700 12px monospace",
      cursor: "pointer",
    });
    cancel.addEventListener("click", closeFastTravelMenu);
    panel.appendChild(cancel);

    overlay.addEventListener("pointerdown", (event) => {
      if (event.target === overlay) closeFastTravelMenu();
    });
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    updateTravelSelection();
  }

  function handleTravelMenuKey(key) {
    if (!overlay) return false;
    if (["arrowdown", "arrowright", "s", "d"].includes(key)) {
      travelCursor = (travelCursor + 1) % FAST_TRAVEL_DESTINATIONS.length;
      updateTravelSelection();
      return true;
    }
    if (["arrowup", "arrowleft", "w", "a"].includes(key)) {
      travelCursor = (travelCursor - 1 + FAST_TRAVEL_DESTINATIONS.length)
        % FAST_TRAVEL_DESTINATIONS.length;
      updateTravelSelection();
      return true;
    }
    if (["enter", "l", " "].includes(key)) {
      travelTo(FAST_TRAVEL_DESTINATIONS[travelCursor].id);
      return true;
    }
    if (["escape", "q"].includes(key)) {
      closeFastTravelMenu();
      return true;
    }
    return false;
  }

  function trackSurface(key) {
    if (surface === PAUSE_SURFACE) {
      if (key === "p" || key === "escape") surface = PLAY_SURFACE;
      return;
    }
    if (surface === INVENTORY_SURFACE) {
      if (key === "q" || key === "escape") surface = PLAY_SURFACE;
      return;
    }
    if (surface === MAP_SURFACE) {
      if (key === "m") surface = PLAY_SURFACE;
      return;
    }
    if (surface !== PLAY_SURFACE) return;
    if (key === "p") surface = PAUSE_SURFACE;
    else if (key === "q") surface = INVENTORY_SURFACE;
    else if (key === "m") surface = MAP_SURFACE;
  }

  function interceptFastTravel(key, repeat = false) {
    return !repeat
      && surface === PLAY_SURFACE
      && isOverworldFastTravelActivation(latestSave, key);
  }

  function captureKeydown(event) {
    if (destroyed) return;
    const key = event.key.toLowerCase();
    if (overlay) {
      if (handleTravelMenuKey(key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }
    if (interceptFastTravel(key, event.repeat)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openFastTravelMenu();
      return;
    }
    trackSurface(key);
  }

  mountCore(latestSave);
  document.addEventListener("keydown", captureKeydown, true);

  return {
    start() {
      running = true;
      surface = PLAY_SURFACE;
      coreGame?.start();
    },
    pressKey(key) {
      const normalizedKey = String(key || "").toLowerCase();
      if (overlay) {
        handleTravelMenuKey(normalizedKey);
        return;
      }
      if (interceptFastTravel(normalizedKey)) {
        openFastTravelMenu();
        return;
      }
      trackSurface(normalizedKey);
      coreGame?.pressKey(key);
    },
    releaseKey(key) {
      if (!overlay) coreGame?.releaseKey(key);
    },
    enterDebugLab() {
      closeFastTravelMenu();
      surface = PLAY_SURFACE;
      coreGame?.enterDebugLab();
    },
    destroy() {
      destroyed = true;
      closeFastTravelMenu();
      document.removeEventListener("keydown", captureKeydown, true);
      coreGame?.destroy();
    },
  };
}
