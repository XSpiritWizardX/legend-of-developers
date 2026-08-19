from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()

import_anchor = '''import {
  WORLD_OBJECT_KIND, activeWorldObjects, breakableBySword, canLiftWorldObject,
  facingWorldObject, moveWorldObject, pushDestination, removeWorldObject,
  worldObjectAtPoint,
} from "./worldObjects";
'''
import_replacement = import_anchor + 'import { worldObjectDrawBox } from "./worldObjectArt";\n'

if text.count(import_anchor) != 1:
    raise SystemExit("worldObjects import anchor changed; refusing engine patch")
text = text.replace(import_anchor, import_replacement, 1)

render_anchor = '''  function drawWorldObject(object, x = screenX(object.x), y = screenY(object.y), carried = false) {
    ctx.save();
    const shadowY = carried ? y + 18 : y + 12;
    ctx.fillStyle = "#02060a66";
    ctx.beginPath();
    ctx.ellipse(x, shadowY, carried ? 12 : 18, carried ? 4 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
'''
render_replacement = render_anchor + '''    const artBox = worldObjectDrawBox(object.kind, x, y, { carried });
    if (artBox && drawCatalogArt(
      ctx,
      "props",
      artBox.id,
      artBox.x,
      artBox.y,
      artBox.width,
      artBox.height,
    )) {
      ctx.restore();
      return;
    }
'''

if text.count(render_anchor) != 1:
    raise SystemExit("drawWorldObject anchor changed; refusing engine patch")
text = text.replace(render_anchor, render_replacement, 1)

ENGINE.write_text(text)
