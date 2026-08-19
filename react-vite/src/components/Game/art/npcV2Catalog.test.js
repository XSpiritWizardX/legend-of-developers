import { NPC_V2_CATALOG, catalogNpcArtV2 } from "./npcV2Catalog";

describe("v2 recurring NPC art", () => {
  test("merchant variants use original v2 character art", () => {
    expect(NPC_V2_CATALOG.merchantTraveler.source).toContain("merchant-traveler.svg");
    expect(NPC_V2_CATALOG.merchantTechnician.source).toContain("merchant-technician.svg");
  });

  test("quest characters use original v2 character art", () => {
    expect(NPC_V2_CATALOG.questArchivist.source).toContain("quest-archivist.svg");
    expect(NPC_V2_CATALOG.questNetworkScout.source).toContain("quest-network-scout.svg");
  });

  test("NPC catalog remains character scoped", () => {
    expect(catalogNpcArtV2("items", "merchantTraveler")).toBeNull();
    expect(catalogNpcArtV2("characters", "unknown")).toBeNull();
  });
});