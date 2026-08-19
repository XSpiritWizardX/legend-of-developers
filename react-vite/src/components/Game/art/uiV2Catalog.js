export const UI_V2_CATALOG = Object.freeze({
  heartFull: Object.freeze({ source: "/art/v2/ui/heart-full.svg", width: 22, height: 21 }),
  heartEmpty: Object.freeze({ source: "/art/v2/ui/heart-empty.svg", width: 22, height: 21 }),
  magicMeterFrame: Object.freeze({ source: "/art/v2/ui/magic-meter-frame.svg" }),
  creditToken: Object.freeze({ source: "/art/v2/ui/credit-token.svg" }),
  accessKey: Object.freeze({ source: "/art/v2/ui/access-key.svg" }),
  itemSlotFrame: Object.freeze({ source: "/art/v2/ui/item-slot-frame.svg" }),
  dialogueFrame: Object.freeze({ source: "/art/v2/ui/panel-frame.svg" }),
  menuPanelFrame: Object.freeze({ source: "/art/v2/ui/panel-frame.svg" }),
  mapRoomFrame: Object.freeze({ source: "/art/v2/ui/panel-frame.svg" }),
  mapMarkerPlayer: Object.freeze({ source: "/art/v2/ui/map-marker-player.svg" }),
  mapMarkerCache: Object.freeze({ source: "/art/v2/ui/map-marker-cache.svg" }),
  mapMarkerShop: Object.freeze({ source: "/art/v2/ui/map-marker-shop.svg" }),
  selectionCursor: Object.freeze({ source: "/art/v2/ui/selection-cursor.svg" }),
});

export function catalogUiArtV2(category, id) {
  return category === "ui" ? UI_V2_CATALOG[id] || null : null;
}
