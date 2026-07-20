import { catalogArt } from "./artCatalog";

const imageCache = new Map();

function trimmedSheetFrame(record, sheet, column, row) {
  const sourceX = (sheet.originX || 0) + column * (sheet.strideX || sheet.frameWidth);
  const sourceY = (sheet.originY || 0) + row * (sheet.strideY || sheet.frameHeight);
  if (!sheet.trimTransparent) {
    return { x: sourceX, y: sourceY, width: sheet.frameWidth, height: sheet.frameHeight };
  }
  if (!record.trimmedFrames) record.trimmedFrames = new Map();
  const key = `${column},${row}`;
  if (record.trimmedFrames.has(key)) return record.trimmedFrames.get(key);

  const canvas = document.createElement("canvas");
  canvas.width = sheet.frameWidth;
  canvas.height = sheet.frameHeight;
  const trimContext = canvas.getContext("2d", { willReadFrequently: true });
  trimContext.drawImage(
    record.image,
    sourceX,
    sourceY,
    sheet.frameWidth,
    sheet.frameHeight,
    0,
    0,
    sheet.frameWidth,
    sheet.frameHeight,
  );
  const pixels = trimContext.getImageData(0, 0, sheet.frameWidth, sheet.frameHeight).data;
  const rowCounts = new Uint16Array(sheet.frameHeight);
  for (let py = 0; py < sheet.frameHeight; py += 1) {
    for (let px = 0; px < sheet.frameWidth; px += 1) {
      if (pixels[(py * sheet.frameWidth + px) * 4 + 3] > 8) rowCounts[py] += 1;
    }
  }
  // Generated sheets occasionally contain a detached shadow or stray pixels.
  // Keep the most substantial contiguous row band instead of expanding the
  // body bounds to include those disconnected artifacts.
  let bestTop = 0;
  let bestBottom = sheet.frameHeight - 1;
  if (sheet.keepDetached) {
    while (bestTop < sheet.frameHeight && rowCounts[bestTop] === 0) bestTop += 1;
    while (bestBottom >= bestTop && rowCounts[bestBottom] === 0) bestBottom -= 1;
  } else {
    bestBottom = -1;
    let bestWeight = 0;
    for (let py = 0; py < sheet.frameHeight;) {
      while (py < sheet.frameHeight && rowCounts[py] === 0) py += 1;
      const bandTop = py;
      let bandWeight = 0;
      while (py < sheet.frameHeight && rowCounts[py] > 0) {
        bandWeight += rowCounts[py];
        py += 1;
      }
      if (bandWeight > bestWeight) {
        bestTop = bandTop;
        bestBottom = py - 1;
        bestWeight = bandWeight;
      }
    }
  }
  let left = sheet.frameWidth;
  let right = -1;
  for (let py = bestTop; py <= bestBottom; py += 1) {
    for (let px = 0; px < sheet.frameWidth; px += 1) {
      if (pixels[(py * sheet.frameWidth + px) * 4 + 3] > 8) {
        left = Math.min(left, px);
        right = Math.max(right, px);
      }
    }
  }
  const top = bestTop;
  const bottom = bestBottom;
  const padding = 2;
  const frame = right < left
    ? { x: sourceX, y: sourceY, width: sheet.frameWidth, height: sheet.frameHeight }
    : {
      x: sourceX + Math.max(0, left - padding),
      y: sourceY + Math.max(0, top - padding),
      width: Math.min(sheet.frameWidth - left + padding, right - left + 1 + padding * 2),
      height: Math.min(sheet.frameHeight - top + padding, bottom - top + 1 + padding * 2),
    };
  record.trimmedFrames.set(key, frame);
  return frame;
}

function cachedImage(source) {
  if (!source) return null;
  if (!imageCache.has(source)) {
    const image = new Image();
    const record = { image, loaded: false, failed: false };
    image.onload = () => { record.loaded = true; };
    image.onerror = () => { record.failed = true; };
    image.src = source;
    imageCache.set(source, record);
  }
  return imageCache.get(source);
}

export function drawCatalogArt(ctx, category, id, x, y, width, height, options = {}) {
  const entry = catalogArt(category, id);
  const sources = entry?.frames || (entry?.source ? [entry.source] : []);
  sources.forEach(cachedImage);
  const frameDuration = entry?.frameDuration || 240;
  const frameIndex = sources.length > 1
    ? Math.floor(performance.now() / frameDuration) % sources.length
    : 0;
  const record = cachedImage(sources[frameIndex]);
  if (!entry || !record?.loaded || record.failed) return false;

  const drawWidth = entry.width || width;
  const drawHeight = entry.height || height;
  const drawX = x + (entry.offsetX || 0);
  const drawY = y + (entry.offsetY || 0);
  const flipX = options.flipX ?? entry.flipX;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const sheet = entry.sheet;
  if (sheet) {
    const directionIndex = Math.max(
      0,
      sheet.directions.indexOf(options.direction || "down"),
    );
    const elapsedFrame = Math.floor(performance.now() / frameDuration);
    const requestedFrame = options.frame ?? elapsedFrame;
    const animationFrame = entry.loop === false && options.frame !== undefined
      ? Math.min(sheet.framesPerDirection - 1, requestedFrame)
      : requestedFrame % sheet.framesPerDirection;
    const source = trimmedSheetFrame(record, sheet, animationFrame, directionIndex);
    const scale = sheet.trimTransparent
      ? (sheet.trimScale || Math.min(drawWidth / source.width, drawHeight / source.height))
      : 1;
    const fittedWidth = sheet.trimTransparent ? source.width * scale : drawWidth;
    const fittedHeight = sheet.trimTransparent ? source.height * scale : drawHeight;
    const fittedX = drawX + (drawWidth - fittedWidth) / 2;
    const fittedY = drawY + drawHeight - fittedHeight;
    if (flipX) {
      ctx.translate(drawX + drawWidth, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        record.image,
        source.x,
        source.y,
        source.width,
        source.height,
        drawWidth - (fittedX - drawX) - fittedWidth,
        fittedY - drawY,
        fittedWidth,
        fittedHeight,
      );
    } else {
      ctx.drawImage(
        record.image,
        source.x,
        source.y,
        source.width,
        source.height,
        fittedX,
        fittedY,
        fittedWidth,
        fittedHeight,
      );
    }
    ctx.restore();
    return true;
  }
  if (flipX) {
    ctx.translate(drawX + drawWidth, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(record.image, 0, 0, drawWidth, drawHeight);
  } else {
    ctx.drawImage(record.image, drawX, drawY, drawWidth, drawHeight);
  }
  ctx.restore();
  return true;
}
