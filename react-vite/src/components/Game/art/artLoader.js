import { catalogArt } from "./artCatalog";

const imageCache = new Map();

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

export function drawCatalogArt(ctx, category, id, x, y, width, height) {
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

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (entry.flipX) {
    ctx.translate(drawX + drawWidth, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(record.image, 0, 0, drawWidth, drawHeight);
  } else {
    ctx.drawImage(record.image, drawX, drawY, drawWidth, drawHeight);
  }
  ctx.restore();
  return true;
}
