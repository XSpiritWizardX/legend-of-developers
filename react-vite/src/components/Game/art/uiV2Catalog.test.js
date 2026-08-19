import { UI_V2_CATALOG, catalogUiArtV2 } from "./uiV2Catalog";

describe("v2 UI art", () => {
  test("HUD resources use the cohesive v2 family", () => {
    expect(catalogUiArtV2("ui", "heartFull").source).toContain("heart-full.svg");
    expect(catalogUiArtV2("ui", "heartEmpty").source).toContain("heart-empty.svg");
    expect(catalogUiArtV2("ui", "magicMeterFrame").source).toContain("magic-meter-frame.svg");
    expect(catalogUiArtV2("ui", "creditToken").source).toContain("credit-token.svg");
    expect(catalogUiArtV2("ui", "accessKey").source).toContain("access-key.svg");
  });

  test("menus and maps share one panel language", () => {
    expect(UI_V2_CATALOG.dialogueFrame.source).toBe("/art/v2/ui/panel-frame.svg");
    expect(UI_V2_CATALOG.menuPanelFrame.source).toBe("/art/v2/ui/panel-frame.svg");
    expect(UI_V2_CATALOG.mapRoomFrame.source).toBe("/art/v2/ui/panel-frame.svg");
    expect(UI_V2_CATALOG.itemSlotFrame.source).toContain("item-slot-frame.svg");
    expect(UI_V2_CATALOG.selectionCursor.source).toContain("selection-cursor.svg");
  });

  test("map markers are all v2 assets", () => {
    expect(UI_V2_CATALOG.mapMarkerPlayer.source).toContain("map-marker-player.svg");
    expect(UI_V2_CATALOG.mapMarkerCache.source).toContain("map-marker-cache.svg");
    expect(UI_V2_CATALOG.mapMarkerShop.source).toContain("map-marker-shop.svg");
  });

  test("UI catalog does not intercept other categories", () => {
    expect(catalogUiArtV2("items", "heartFull")).toBeNull();
    expect(catalogUiArtV2("ui", "unknown")).toBeNull();
  });
});