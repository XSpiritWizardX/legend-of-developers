import { EQUIPMENT_V2_CATALOG, catalogEquipmentArtV2 } from "./equipmentV2Catalog";

const EXPECTED_ITEMS = [
  "htmlSword", "boomerang", "bow", "bombs", "hookshot", "fireRod", "iceRod", "hammer",
  "lantern", "mirror", "cape", "medallion", "devJacket", "shield", "glove", "boots",
];

describe("v2 equipment art", () => {
  test("every inventory/equipment ID has a v2 icon", () => {
    EXPECTED_ITEMS.forEach((id) => {
      expect(catalogEquipmentArtV2("items", id)?.source).toMatch(/^\/art\/v2\/items\/.+\.svg$/);
    });
    expect(Object.keys(EQUIPMENT_V2_CATALOG).sort()).toEqual([...EXPECTED_ITEMS].sort());
  });

  test("equipment catalog remains category scoped", () => {
    expect(catalogEquipmentArtV2("ui", "htmlSword")).toBeNull();
    expect(catalogEquipmentArtV2("items", "unknown")).toBeNull();
  });
});