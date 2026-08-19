from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()

# Replace the original cyber/neon procedural palette with the V2 fantasy palette.
# These are presentation-only substitutions; mechanics/timings/geometry are untouched.
replacements = {
    "#42e9ff": "#9aa9a1",
    "#3fdff5": "#8e9b96",
    "#d7fbff": "#ddd8c7",
    "#42efd4": "#8fa39a",
    "#f02ea5": "#b96f5d",
    "#d52f9a": "#a76558",
    "#12dcc2": "#7d9182",
    "#11bda8": "#71887a",
    "#5a2a80": "#405777",
    "#41205f": "#334864",
    "#ffd45e": "#d4b76b",
    "#ff9b45": "#bf7d4b",
    "#fff1a3": "#e9dfbf",
    "rgba(190,249,255,": "rgba(221,216,199,",
    "rgba(55,224,255,": "rgba(142,155,150,",
    "rgba(255,211,78,": "rgba(212,183,107,",
    "rgba(255,112,45,": "rgba(191,125,75,",
    "rgba(66,239,212,": "rgba(143,163,154,",
    "rgba(240,46,165,": "rgba(185,111,93,",
    "rgba(80,235,255,": "rgba(141,165,165,",
    "rgba(255,80,90,": "rgba(185,94,80,",
}

missing = [old for old in replacements if old not in text]
if missing:
    raise SystemExit(f"expected palette anchors missing; refusing patch: {missing}")

for old, new in replacements.items():
    text = text.replace(old, new)

ENGINE.write_text(text)
