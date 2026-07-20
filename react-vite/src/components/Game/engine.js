import {
  DUNGEONS, isSolid, MAPS, MERCHANTS, roomExitsAt, roomNameAt, TILE, tileAt,
} from "./world";
import {
  drawPlacedRoomAsset, roomAssetSolidAt, roomAssetSortY, visibleRoomAssets,
} from "./roomAssets";
import { drawCatalogArt } from "./art/artLoader";
import { indexedRoomTileAt } from "./art/tileIndex";

const VIEW_W = 1024;
const VIEW_H = 640;
const HUD_H = 68;
const PERMANENT_ENEMY_TYPES = [
  "boss", "knight", "mage", "minibossNullKnight",
  "bossCacheColossus", "bossFluxSovereign", "bossRootWarden",
];
const isPermanentEnemy = (type) => PERMANENT_ENEMY_TYPES.includes(type);
const ITEM_ORDER = ["boomerang", "bombs", "bow", "hookshot", "fireRod", "iceRod", "hammer", "lantern", "mirror", "cape", "medallion"];
const LOADOUT_ORDER = [...ITEM_ORDER];
const MAGIC_COSTS = {
  htmlSword: 5, boomerang: 12, bombs: 10, bow: 25, hookshot: 20,
  fireRod: 30, iceRod: 30, hammer: 16, lantern: 8, mirror: 35,
  cape: 40, medallion: 60,
};
const ITEM_LABELS = {
  boomerang: "WIND DISC", bombs: "BOMBS", bow: "OAK BOW",
  arrows: "ARROWS", hookshot: "CHAINSHOT", fireRod: "EMBER ROD",
  iceRod: "FROST ROD", hammer: "STONE HAMMER", lantern: "MOON LANTERN",
  mirror: "RETURNING MIRROR", cape: "SHADOW CLOAK", medallion: "DAWN MEDALLION",
  htmlSword: "WILLOW BLADE", masterSword: "EVERDAWN BLADE",
  javascriptCore: "GROVE HEART", firstWebpage: "GROVE SIGIL",
  devJacket: "WARDEN'S MAIL", shield: "CRYSTAL SHIELD", glove: "TITAN MITTS", boots: "WIND BOOTS",
  heart: "HEART CONTAINER", key: "SMALL KEY", dungeonMap: "DUNGEON MAP",
  potion: "RED POTION",
  magicPatch: "MAGIC DRAUGHT",
};
const itemLabel = (type) => ITEM_LABELS[type] || type.replace(/([A-Z])/g, " $1").toUpperCase();

export function createGame(canvas, { initialSave, onSave }) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const keys = {};
  const pressed = {};
  let running = false;
  let paused = false;
  let pauseTab = 0;
  let mapOpen = false;
  let inventoryOpen = false;
  let loadoutCursor = 0;
  let last = 0;
  let frame;
  let camera = { x: 0, y: 0 };
  let message = "";
  let messageTime = 0;
  let boomerang = null;
  let bombs = [];
  let cssPulses = [];
  let weaponEffects = [];
  let merchantOpen = null;
  let merchantCursor = 0;
  let screenTransition = null;
  let particles = [];
  let screenShake = 0;
  let roomTitle = "";
  let roomTitleTime = 0;
  let debugReturnPosition = { ...MAPS.overworld.spawn };

  const saved = initialSave || {};
  const compatibleLayout = saved.version === 3;
  const state = {
    mapId: compatibleLayout ? (saved.mapId || "overworld") : "overworld",
    openedChests: saved.openedChests || {},
    killed: saved.killed || {},
    flags: saved.flags || {},
    discovered: saved.discovered || {},
  };
  const spawn = MAPS[state.mapId]?.spawn || MAPS.overworld.spawn;
  const savedMaxHp = Math.min(40, saved.player?.maxHp || 6);
  const player = {
    x: compatibleLayout ? (saved.player?.x || spawn.x) : spawn.x,
    y: compatibleLayout ? (saved.player?.y || spawn.y) : spawn.y,
    dir: saved.player?.dir || "up",
    hp: Math.min(saved.player?.hp || 6, savedMaxHp),
    maxHp: savedMaxHp,
    coins: saved.player?.coins || 0,
    keys: saved.player?.keys || 0,
    magic: saved.player?.magic ?? 100,
    maxMagic: saved.player?.maxMagic || 100,
    hasEmber: saved.player?.hasEmber || false,
    inventory: {
      boomerang: saved.player?.inventory?.boomerang || false,
      bombs: saved.player?.inventory?.bombs || 0,
      arrows: saved.player?.inventory?.arrows || 0,
      bow: saved.player?.inventory?.bow || false,
      hookshot: saved.player?.inventory?.hookshot || false,
      fireRod: saved.player?.inventory?.fireRod || false,
      iceRod: saved.player?.inventory?.iceRod || false,
      hammer: saved.player?.inventory?.hammer || false,
      lantern: saved.player?.inventory?.lantern || false,
      flippers: saved.player?.inventory?.flippers || false,
      glove: saved.player?.inventory?.glove || false,
      boots: saved.player?.inventory?.boots || false,
      devJacket: saved.player?.inventory?.devJacket || false,
      shield: saved.player?.inventory?.shield || false,
      cape: saved.player?.inventory?.cape || false,
      mirror: saved.player?.inventory?.mirror || false,
      medallion: saved.player?.inventory?.medallion || false,
      // Existing completed saves receive the sword upgrade retroactively.
      masterSword: saved.player?.inventory?.masterSword || Boolean(state.flags.backendApi),
      htmlSword: saved.player?.inventory?.htmlSword || false,
      javascriptCore: saved.player?.inventory?.javascriptCore || false,
      firstWebpage: saved.player?.inventory?.firstWebpage || false,
      maps: saved.player?.inventory?.maps || {},
    },
    selectedItem: saved.player?.selectedItem || "boomerang",
    equippedSlots: (saved.player?.equippedSlots || ["bow", "boomerang"])
      .map((item) => (item === "htmlSword" ? null : item)),
    speed: 225,
    attackTime: 0,
    invincible: 0,
    moving: false,
    walkTime: 0,
  };
  const enemiesByMap = {};
  function markCurrentScreenDiscovered() {
    const screenXIndex = Math.floor(player.x / VIEW_W);
    const screenYIndex = Math.floor(player.y / VIEW_H);
    state.discovered[`${state.mapId}:${screenXIndex},${screenYIndex}`] = true;
  }
  function findOpenPosition(mapId, tx, ty, collisionRadius) {
    const targetMap = MAPS[mapId];
    for (let searchRadius = 0; searchRadius <= 8; searchRadius += 1) {
      for (let oy = -searchRadius; oy <= searchRadius; oy += 1) {
        for (let ox = -searchRadius; ox <= searchRadius; ox += 1) {
          if (searchRadius && Math.abs(ox) !== searchRadius && Math.abs(oy) !== searchRadius) continue;
          const testX = tx + ox;
          const testY = ty + oy;
          if (testX < 1 || testY < 1 || testX >= targetMap.width - 1 || testY >= targetMap.height - 1) continue;
          const centerX = testX * TILE + TILE / 2;
          const centerY = testY * TILE + TILE / 2;
          const footprintOpen = [
            [centerX - collisionRadius, centerY - collisionRadius],
            [centerX + collisionRadius, centerY - collisionRadius],
            [centerX - collisionRadius, centerY + collisionRadius],
            [centerX + collisionRadius, centerY + collisionRadius],
          ].every(([px, py]) => {
            const footprintTileX = Math.floor(px / TILE);
            const footprintTileY = Math.floor(py / TILE);
            const indexedTile = indexedRoomTileAt(mapId, footprintTileX, footprintTileY);
            return !(indexedTile?.solid
              ?? isSolid(tileAt(mapId, footprintTileX, footprintTileY, state.flags)))
              && !roomAssetSolidAt(mapId, px, py);
          });
          if (footprintOpen) {
            return { x: centerX, y: centerY };
          }
        }
      }
    }
    return { x: targetMap.spawn.x, y: targetMap.spawn.y };
  }
  function findOpenSpawn(mapId, tx, ty, type) {
    const collisionRadius = isPermanentEnemy(type) ? 27 : 15;
    return findOpenPosition(mapId, tx, ty, collisionRadius);
  }
  function dungeonReturnPosition(dungeon) {
    return findOpenPosition(
      "overworld",
      Math.floor(dungeon.entrance.x / TILE),
      Math.floor((dungeon.entrance.y + 108) / TILE),
      18,
    );
  }
  if (
    player.x < TILE || player.y < TILE
    || player.x >= map().width * TILE - TILE
    || player.y >= map().height * TILE - TILE
  ) {
    player.x = map().spawn.x;
    player.y = map().spawn.y;
  }
  camera.x = Math.min(
    Math.floor(player.x / VIEW_W) * VIEW_W,
    Math.max(0, map().width * TILE - VIEW_W),
  );
  camera.y = Math.min(
    Math.floor(player.y / VIEW_H) * VIEW_H,
    Math.max(0, map().height * TILE - VIEW_H),
  );
  markCurrentScreenDiscovered();

  function map() { return MAPS[state.mapId]; }
  function createEnemy(mapId, [id, type, tx, ty]) {
    const spawnPoint = findOpenSpawn(mapId, tx, ty, type);
    return {
      id, type, x: spawnPoint.x, y: spawnPoint.y,
      homeX: spawnPoint.x, homeY: spawnPoint.y,
      hp: isPermanentEnemy(type) ? 14 + (MAPS[mapId].number || 0) : type === "guard" ? 4 : 2,
      phase: Math.random() * 6, hit: 0, stunned: 0,
    };
  }
  function buildEnemies(mapId) {
    if (enemiesByMap[mapId]) return;
    enemiesByMap[mapId] = MAPS[mapId].enemies
      .filter(([id, type]) => !isPermanentEnemy(type) || !state.killed[id])
      .map((definition) => createEnemy(mapId, definition));
  }
  function respawnRoomEnemies(mapId, roomCameraX, roomCameraY) {
    const activeIds = new Set(enemiesByMap[mapId].map((enemy) => enemy.id));
    MAPS[mapId].enemies.forEach((definition) => {
      const [id, type, tx, ty] = definition;
      const spawnX = tx * TILE + TILE / 2;
      const spawnY = ty * TILE + TILE / 2;
      const inRoom = spawnX >= roomCameraX && spawnX < roomCameraX + VIEW_W
        && spawnY >= roomCameraY && spawnY < roomCameraY + VIEW_H;
      if (!isPermanentEnemy(type)) delete state.killed[id];
      if (inRoom && !isPermanentEnemy(type) && !activeIds.has(id)) {
        enemiesByMap[mapId].push(createEnemy(mapId, definition));
      }
    });
  }
  buildEnemies(state.mapId);

  function snapshot() {
    return {
      version: 3,
      mapId: state.mapId,
      player: {
        x: player.x, y: player.y, dir: player.dir, hp: player.hp,
        maxHp: player.maxHp, coins: player.coins, keys: player.keys,
        magic: player.magic, maxMagic: player.maxMagic,
        hasEmber: player.hasEmber, inventory: player.inventory,
        selectedItem: player.selectedItem,
        equippedSlots: player.equippedSlots,
      },
      openedChests: state.openedChests,
      killed: state.killed,
      flags: state.flags,
      discovered: state.discovered,
    };
  }
  function save() { onSave?.(snapshot()); }
  function announce(value, seconds = 2.2) { message = value; messageTime = seconds; }
  announce(
    player.inventory.htmlSword
      ? roomNameAt(state.mapId, player.x, player.y).toUpperCase()
      : "OBJECTIVE: FIND THE WILLOW BLADE IN HERO'S GROVE",
    4,
  );
  showRoomTitle();

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }
  function text(value, x, y, size = 12, align = "left", color = "#fff") {
    ctx.font = `700 ${size}px monospace`;
    ctx.textAlign = align;
    ctx.fillStyle = "#000a";
    ctx.fillText(value, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  }
  function screenX(x) { return x - camera.x; }
  function screenY(y) { return y - camera.y + HUD_H; }
  function spawnParticles(x, y, color, count = 8, speed = 120) {
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const force = speed * (0.35 + Math.random() * 0.65);
      particles.push({
        x, y,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force,
        life: 0.3 + Math.random() * 0.35,
        maxLife: 0.65,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }
  function showRoomTitle() {
    roomTitle = roomNameAt(state.mapId, player.x, player.y).toUpperCase();
    roomTitleTime = 2.6;
  }

  function solidAt(x, y) {
    const tileX = Math.floor(x / TILE);
    const tileY = Math.floor(y / TILE);
    if (roomAssetSolidAt(state.mapId, x, y)) return true;
    const indexedTile = indexedRoomTileAt(state.mapId, tileX, tileY);
    if (indexedTile) {
      if (indexedTile.tile === "water" && player.inventory.flippers) return false;
      return indexedTile.solid;
    }
    const tile = tileAt(state.mapId, tileX, tileY, state.flags);
    if (tile === "water" && player.inventory.flippers) return false;
    return isSolid(tile);
  }
  function canMove(x, y, dx = 0, dy = 0) {
    // Link-like movement uses the leading edge of a small foot box. The
    // character's head and hat are visual overhang, not collision geometry.
    const halfWidth = 11;
    const top = -4;
    const bottom = 15;
    if (dx > 0) {
      return !solidAt(x + halfWidth, y + top)
        && !solidAt(x + halfWidth, y + 6)
        && !solidAt(x + halfWidth, y + bottom);
    }
    if (dx < 0) {
      return !solidAt(x - halfWidth, y + top)
        && !solidAt(x - halfWidth, y + 6)
        && !solidAt(x - halfWidth, y + bottom);
    }
    if (dy > 0) {
      return !solidAt(x - halfWidth, y + bottom)
        && !solidAt(x, y + bottom)
        && !solidAt(x + halfWidth, y + bottom);
    }
    return !solidAt(x - halfWidth, y + top)
      && !solidAt(x, y + top)
      && !solidAt(x + halfWidth, y + top);
  }
  function enemyCanMove(enemy, x, y) {
    const radius = isPermanentEnemy(enemy.type) ? 27 : 15;
    const open = (px, py) => {
      const tileX = Math.floor(px / TILE);
      const tileY = Math.floor(py / TILE);
      const indexedTile = indexedRoomTileAt(state.mapId, tileX, tileY);
      return !roomAssetSolidAt(state.mapId, px, py)
        && !(indexedTile?.solid
          ?? isSolid(tileAt(state.mapId, tileX, tileY, state.flags)));
    };
    return open(x - radius, y - radius) && open(x + radius, y - radius)
      && open(x - radius, y + radius) && open(x + radius, y + radius);
  }

  function changeMap(mapId, position) {
    state.mapId = mapId;
    player.x = position.x;
    player.y = position.y;
    player.invincible = 1.5;
    buildEnemies(mapId);
    boomerang = null;
    bombs = [];
    cssPulses = [];
    weaponEffects = [];
    camera.x = Math.min(
      Math.floor(player.x / VIEW_W) * VIEW_W,
      Math.max(0, MAPS[mapId].width * TILE - VIEW_W),
    );
    camera.y = Math.min(
      Math.floor(player.y / VIEW_H) * VIEW_H,
      Math.max(0, MAPS[mapId].height * TILE - VIEW_H),
    );
    respawnRoomEnemies(mapId, camera.x, camera.y);
    screenTransition = null;
    markCurrentScreenDiscovered();
    showRoomTitle();
    announce(MAPS[mapId].name.toUpperCase(), 2.6);
    save();
  }

  function reward(type) {
    if (type === "htmlSword") {
      player.inventory.htmlSword = true;
      announce("WILLOW BLADE ACQUIRED", 4);
    } else if (type === "firstWebpage") {
      player.inventory.firstWebpage = true;
      player.inventory.javascriptCore = true;
      player.inventory.boomerang = true;
      player.selectedItem = "boomerang";
      state.flags.firstWebpage = true;
      announce("GROVE SIGIL RESTORED · WIND DISC AWAKENED!", 8);
    } else if (type === "reactApp") {
      player.inventory.hookshot = true;
      state.flags.reactApp = true;
      if (!player.equippedSlots[0]) player.equippedSlots[0] = "hookshot";
      announce("EMBER SIGIL RESTORED · CHAINSHOT AWAKENED!", 8);
    } else if (type === "backendApi") {
      player.inventory.fireRod = true;
      player.inventory.shield = true;
      player.inventory.masterSword = true;
      state.flags.backendApi = true;
      if (!player.equippedSlots[1]) player.equippedSlots[1] = "fireRod";
      announce("CRYSTAL SIGIL RESTORED · WILLOW BLADE FORGED INTO THE EVERDAWN BLADE!", 8);
    } else if (["boomerang", "bow", "hookshot", "fireRod", "iceRod", "hammer", "lantern", "flippers", "glove", "boots", "devJacket", "shield", "cape", "mirror", "medallion", "masterSword"].includes(type)) {
      player.inventory[type] = true;
      if (ITEM_ORDER.includes(type)) player.selectedItem = type;
      announce(`ACQUIRED: ${itemLabel(type)}`);
    } else if (type === "bombs") {
      player.inventory.bombs += 8;
      player.selectedItem = "bombs";
      announce("ACQUIRED: 8 BOMBS");
    } else if (type === "bombBag") {
      player.inventory.bombs += 20;
      announce("BOMB CAPACITY INCREASED");
    } else if (type === "arrows") {
      player.inventory.arrows += 15;
      announce("ACQUIRED: 15 STYLE CHARGES");
    } else if (type === "potion") {
      player.hp = player.maxHp;
      announce("HEARTS RESTORED");
    } else if (type === "magicPatch") {
      player.magic = player.maxMagic;
      announce("MAGIC RESTORED");
    } else if (type === "heart") {
      if (player.maxHp >= 40) {
        player.hp = player.maxHp;
        announce("MAXIMUM 20 HEARTS REACHED");
        return;
      }
      player.maxHp = Math.min(40, player.maxHp + 2);
      player.hp = player.maxHp;
      announce("HEART CONTAINER ACQUIRED");
    } else if (type === "key") {
      player.keys += 1;
      announce("SMALL KEY ACQUIRED");
    } else if (type === "dungeonMap") {
      player.inventory.maps[state.mapId] = true;
      announce("DUNGEON MAP ACQUIRED");
    } else if (type === "finalJobOffer") {
      state.flags.questComplete = true;
      player.hasEmber = true;
      announce("THE REALM OF EVERDAWN IS RESTORED!", 8);
    }
  }

  function interact() {
    const currentMap = map();
    if (state.mapId === "overworld") {
      const dungeon = DUNGEONS.find((entry) => Math.hypot(player.x - entry.entrance.x, player.y - entry.entrance.y) < 88);
      if (dungeon) {
        changeMap(dungeon.id, MAPS[dungeon.id].spawn);
        return;
      }
      const merchant = MERCHANTS.find((entry) => Math.hypot(player.x - (entry.x * TILE + TILE / 2), player.y - (entry.y * TILE + TILE / 2)) < 82);
      if (merchant) {
        merchantOpen = merchant;
        merchantCursor = 0;
        return;
      }
    } else if (state.mapId === "debugLab" && Math.hypot(player.x - currentMap.exit.x, player.y - currentMap.exit.y) < 82) {
      changeMap("overworld", debugReturnPosition);
      announce("RETURNED FROM DEBUG LAB");
      return;
    } else if (Math.hypot(player.x - currentMap.exit.x, player.y - currentMap.exit.y) < 82) {
      const dungeon = DUNGEONS.find((entry) => entry.id === state.mapId);
      changeMap("overworld", dungeonReturnPosition(dungeon));
      return;
    }

    const chest = currentMap.chests.find((entry) => {
      const [id, tx, ty] = entry;
      if (state.openedChests[id]) return false;
      if (id.endsWith("-reward") && enemiesByMap[state.mapId].some((enemy) => isPermanentEnemy(enemy.type))) return false;
      return Math.hypot(player.x - (tx * TILE + TILE / 2), player.y - (ty * TILE + TILE / 2)) < 76;
    });
    if (chest) {
      state.openedChests[chest[0]] = true;
      reward(chest[3]);
      save();
      return;
    }

  }

  function activateItem(item) {
    if (!item) return;
    const owned = item === "bombs" ? player.inventory.bombs > 0 : Boolean(player.inventory[item]);
    if (!owned) {
      announce(`${itemLabel(item)} NOT ACQUIRED`);
      return;
    }
    if (item === "boomerang" && boomerang) return;
    if (!spendMagic(item)) return;
    if (item === "htmlSword") {
      player.attackTime = 0.2;
      swordStrike();
    }
    if (item === "boomerang") throwBoomerang();
    if (item === "bombs") placeBomb();
    if (item === "bow") fireBow();
    if (item === "hookshot") activateHookshot();
    if (item === "fireRod") activateRod("fire");
    if (item === "iceRod") activateRod("ice");
    if (item === "hammer") swingHammer();
    if (item === "lantern") {
      weaponEffects.push({ type: "lantern", x: player.x, y: player.y, time: 0, duration: 0.8 });
    }
    if (item === "mirror" && state.mapId !== "overworld" && state.mapId !== "debugLab") {
      const dungeon = DUNGEONS.find((entry) => entry.id === state.mapId);
      changeMap("overworld", dungeonReturnPosition(dungeon));
      weaponEffects.push({ type: "mirror", x: player.x, y: player.y, time: 0, duration: 0.9 });
    } else if (item === "mirror") {
      weaponEffects.push({ type: "mirror", x: player.x, y: player.y, time: 0, duration: 0.9 });
      announce("NO REPOSITORY CHECKPOINT TO REVERT TO");
    }
    if (item === "cape" && player.inventory.cape) {
      player.invincible = 5;
      weaponEffects.push({ type: "cape", x: player.x, y: player.y, time: 0, duration: 1.1 });
    }
    if (item === "medallion" && player.inventory.medallion) {
      enemiesByMap[state.mapId].forEach((enemy) => damageEnemy(enemy, 2));
      weaponEffects.push({ type: "root", x: player.x, y: player.y, time: 0, duration: 1.1 });
    }
  }

  function spendMagic(item) {
    const cost = MAGIC_COSTS[item] || 0;
    if (player.magic < cost) {
      announce("NOT ENOUGH MAGIC · WAIT FOR IT TO REFILL");
      return false;
    }
    player.magic -= cost;
    return true;
  }

  function directionVector() {
    const diagonal = Math.SQRT1_2;
    return {
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
      left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
      "up-left": { x: -diagonal, y: -diagonal },
      "up-right": { x: diagonal, y: -diagonal },
      "down-left": { x: -diagonal, y: diagonal },
      "down-right": { x: diagonal, y: diagonal },
    }[player.dir];
  }
  function spriteDirection(direction) {
    if (direction.endsWith?.("left")) return "left";
    if (direction.endsWith?.("right")) return "right";
    return direction;
  }
  function throwBoomerang() {
    if (!player.inventory.boomerang || boomerang) {
      if (!player.inventory.boomerang) announce("YOU HAVE NOT FOUND THE WIND DISC");
      return;
    }
    const dir = directionVector();
    boomerang = { x: player.x, y: player.y, vx: dir.x * 380, vy: dir.y * 380, distance: 0, returning: false };
  }
  function placeBomb() {
    if (player.inventory.bombs <= 0) {
      announce("NO BOMBS LEFT");
      return;
    }
    player.inventory.bombs -= 1;
    bombs.push({ x: player.x, y: player.y, timer: 1.25, exploded: false });
    save();
  }
  function fireBow() {
    if (!player.inventory.bow) {
      announce("YOU HAVE NOT FOUND THE OAK BOW");
      return;
    }
    const dir = directionVector();
    cssPulses.push({
      x: player.x + dir.x * 28,
      y: player.y + dir.y * 28,
      vx: dir.x * 520,
      vy: dir.y * 520,
      age: 0,
    });
    save();
  }
  function activateHookshot() {
    if (!player.inventory.hookshot) return announce("YOU HAVE NOT FOUND THE HOOKSHOT");
    const dir = directionVector();
    const startX = player.x;
    const startY = player.y;
    for (let distance = 24; distance <= 190; distance += 12) {
      const nextX = player.x + dir.x * distance;
      const nextY = player.y + dir.y * distance;
      if (!canMove(nextX, nextY)) break;
      player.x = nextX;
      player.y = nextY;
    }
    weaponEffects.push({
      type: "hookshot", x: startX, y: startY, endX: player.x, endY: player.y,
      time: 0, duration: 0.42,
    });
  }
  function activateRod(kind) {
    const key = kind === "fire" ? "fireRod" : "iceRod";
    if (!player.inventory[key]) return announce(`YOU HAVE NOT FOUND THE ${kind.toUpperCase()} ROD`);
    enemiesByMap[state.mapId].forEach((enemy) => {
      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 170) {
        if (kind === "fire") damageEnemy(enemy, 2);
        else enemy.stunned = 3;
      }
    });
    weaponEffects.push({ type: kind, x: player.x, y: player.y, time: 0, duration: 0.7 });
  }
  function swingHammer() {
    if (!player.inventory.hammer) return announce("YOU HAVE NOT FOUND THE HAMMER");
    enemiesByMap[state.mapId].forEach((enemy) => {
      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 70) damageEnemy(enemy, player.inventory.glove ? 4 : 2);
    });
    weaponEffects.push({
      type: "hammer", x: player.x, y: player.y, dir: { ...directionVector() },
      time: 0, duration: 0.48,
    });
  }
  function availableLoadout() {
    return LOADOUT_ORDER.filter((item) => (
      item === "bombs" ? player.inventory.bombs > 0 : Boolean(player.inventory[item])
    ));
  }

  function swordStrike() {
    if (!player.inventory.htmlSword) {
        announce("FIND THE WILLOW BLADE TO FIGHT MONSTERS");
      return;
    }
    const dir = directionVector();
    weaponEffects.push({
      type: "sword", x: player.x, y: player.y, dir: { ...dir },
      upgraded: Boolean(player.inventory.masterSword),
      time: 0, duration: 0.13,
    });
    let clearedBrush = false;
    const swordReach = player.inventory.masterSword ? 72 : 60;
    for (let forward = 24; forward <= swordReach; forward += 15) {
      for (const lateral of [-20, 0, 20]) {
        const sampleX = player.x + dir.x * forward + dir.y * lateral;
        const sampleY = player.y + dir.y * forward + dir.x * lateral;
        const brushX = Math.floor(sampleX / TILE);
        const brushY = Math.floor(sampleY / TILE);
        if (tileAt(state.mapId, brushX, brushY, state.flags) === "codeBrush") {
          state.flags[`brush_${brushX}_${brushY}`] = true;
          clearedBrush = true;
        }
      }
    }
    if (clearedBrush) {
      announce("CORRUPTED BRUSH CLEARED");
      save();
    }
    enemiesByMap[state.mapId].forEach((enemy) => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy);
      const enemyAngle = Math.atan2(dy, dx);
      const facingAngle = Math.atan2(dir.y, dir.x);
      const angleDifference = Math.abs(Math.atan2(
        Math.sin(enemyAngle - facingAngle),
        Math.cos(enemyAngle - facingAngle),
      ));
      const enemyRadius = isPermanentEnemy(enemy.type) ? 30 : 16;
      if (distance <= swordReach + enemyRadius && angleDifference <= 1.02) {
        damageEnemy(enemy, player.inventory.masterSword || player.inventory.glove ? 2 : 1);
      }
    });
  }
  function damageEnemy(enemy, amount) {
    if (enemy.hit > 0) return;
    enemy.hp -= amount;
    enemy.hit = 0.22;
    screenShake = Math.max(screenShake, isPermanentEnemy(enemy.type) ? 9 : 4);
    spawnParticles(
      enemy.x,
      enemy.y - 10,
      isPermanentEnemy(enemy.type) ? "#f0c75e" : "#42efd4",
      isPermanentEnemy(enemy.type) ? 16 : 9,
      isPermanentEnemy(enemy.type) ? 190 : 125,
    );
    if (enemy.hp <= 0) {
      const isBoss = isPermanentEnemy(enemy.type);
      spawnParticles(enemy.x, enemy.y, isBoss ? "#f02ea5" : "#d9fff8", isBoss ? 36 : 18, 230);
      screenShake = Math.max(screenShake, isBoss ? 18 : 7);
      if (isBoss) state.killed[enemy.id] = true;
      player.coins += isBoss ? 50 + (map().number || 0) * 5 : 2;
      if (isBoss) {
        state.flags[`complete_${state.mapId}`] = true;
        announce("TEMPLE GUARDIAN DEFEATED · CLAIM THE SIGIL", 5);
      }
      save();
    }
  }

  function updateProjectiles(dt) {
    cssPulses.forEach((pulse) => {
      pulse.age += dt;
      pulse.x += pulse.vx * dt;
      pulse.y += pulse.vy * dt;
      if (solidAt(pulse.x, pulse.y)) pulse.age = 1;
      enemiesByMap[state.mapId].forEach((enemy) => {
        if (pulse.age < 1 && Math.hypot(pulse.x - enemy.x, pulse.y - enemy.y) < 34) {
          damageEnemy(enemy, 2);
          pulse.age = 1;
        }
      });
    });
    cssPulses = cssPulses.filter((pulse) => pulse.age < 0.78);
    if (boomerang) {
      if (!boomerang.returning) {
        boomerang.x += boomerang.vx * dt;
        boomerang.y += boomerang.vy * dt;
        boomerang.distance += 380 * dt;
        const callbackTile = tileAt(
          state.mapId,
          Math.floor(boomerang.x / TILE),
          Math.floor(boomerang.y / TILE),
          state.flags,
        );
        if (callbackTile === "callbackNode") {
          state.flags.callback_firewall_1 = true;
          boomerang.returning = true;
          announce("ANCIENT SEAL BROKEN · EASTERN PATH OPEN", 5);
          save();
        } else if (callbackTile === "callbackNode2") {
          boomerang.returning = true;
          if (state.flags.complete_d02) {
            state.flags.callback_firewall_2 = true;
            announce("ANCIENT SEAL BROKEN · HIGHLAND ROAD OPEN", 5);
            save();
          } else {
            announce("THE SEAL ENDURES · RESTORE THE EMBER SIGIL", 4);
          }
        } else if (boomerang.distance > 230 || solidAt(boomerang.x, boomerang.y)) {
          boomerang.returning = true;
        }
      } else {
        const dx = player.x - boomerang.x;
        const dy = player.y - boomerang.y;
        const distance = Math.hypot(dx, dy);
        // Collect before normalizing the direction. At exactly zero distance,
        // dividing by `distance` turns both coordinates into NaN and corrupts
        // every subsequent projectile update.
        if (distance < 24) {
          boomerang = null;
        } else {
          boomerang.x += dx / distance * 470 * dt;
          boomerang.y += dy / distance * 470 * dt;
        }
      }
      if (boomerang) enemiesByMap[state.mapId].forEach((enemy) => {
        if (Math.hypot(boomerang.x - enemy.x, boomerang.y - enemy.y) < 30) enemy.stunned = 1.8;
      });
    }
    bombs.forEach((bomb) => {
      bomb.timer -= dt;
      if (bomb.timer <= 0 && !bomb.exploded) {
        bomb.exploded = true;
        enemiesByMap[state.mapId].forEach((enemy) => {
          if (Math.hypot(bomb.x - enemy.x, bomb.y - enemy.y) < 100) damageEnemy(enemy, 3);
        });
        if (state.mapId !== "overworld") {
          const centerX = Math.floor(bomb.x / TILE);
          const centerY = Math.floor(bomb.y / TILE);
          let foundSecret = false;
          for (let oy = -2; oy <= 2; oy += 1) {
            for (let ox = -2; ox <= 2; ox += 1) {
              if (tileAt(state.mapId, centerX + ox, centerY + oy, state.flags) === "crackedWall") foundSecret = true;
            }
          }
          if (foundSecret) {
            state.flags[`secret_${state.mapId}`] = true;
            announce("HIDDEN PASSAGE OPENED");
            save();
          }
        }
      }
    });
    bombs = bombs.filter((bomb) => bomb.timer > -0.32);
  }

  function update(dt) {
    screenShake = Math.max(0, screenShake - dt * 34);
    roomTitleTime = Math.max(0, roomTitleTime - dt);
    particles.forEach((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.91;
      particle.vy = particle.vy * 0.91 + 85 * dt;
    });
    particles = particles.filter((particle) => particle.life > 0);
    if (!running || paused || mapOpen || inventoryOpen || merchantOpen) return;
    if (screenTransition) {
      screenTransition.elapsed += dt;
      const progress = Math.min(1, screenTransition.elapsed / screenTransition.duration);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      camera.x = screenTransition.fromX + (screenTransition.toX - screenTransition.fromX) * eased;
      camera.y = screenTransition.fromY + (screenTransition.toY - screenTransition.fromY) * eased;
      if (progress >= 1) {
        camera.x = screenTransition.toX;
        camera.y = screenTransition.toY;
        screenTransition = null;
        respawnRoomEnemies(state.mapId, camera.x, camera.y);
        markCurrentScreenDiscovered();
        showRoomTitle();
        announce(roomNameAt(state.mapId, player.x, player.y).toUpperCase(), 1.4);
      }
      return;
    }
    player.attackTime = Math.max(0, player.attackTime - dt);
    player.invincible = Math.max(0, player.invincible - dt);
    player.magic = Math.min(player.maxMagic, player.magic + 14 * dt);
    weaponEffects.forEach((effect) => { effect.time += dt; });
    weaponEffects = weaponEffects.filter((effect) => effect.time < effect.duration);
    messageTime = Math.max(0, messageTime - dt);
    let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    let dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
    player.moving = Boolean(dx || dy);
    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      dx /= length; dy /= length;
      if (dx && dy) {
        player.dir = `${dy < 0 ? "up" : "down"}-${dx < 0 ? "left" : "right"}`;
      } else {
        player.dir = dx ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      }
      const moveSpeed = player.inventory.boots ? player.speed * 1.32 : player.speed;
      const nextX = player.x + dx * moveSpeed * dt;
      const nextY = player.y + dy * moveSpeed * dt;
      if (canMove(nextX, player.y, dx, 0)) player.x = nextX;
      if (canMove(player.x, nextY, 0, dy)) player.y = nextY;
      player.walkTime += dt * 10;
    }
    if (pressed.h) {
      player.attackTime = 0.2;
      swordStrike();
    }
    if (pressed.j) activateItem(player.equippedSlots[0]);
    if (pressed.k) activateItem(player.equippedSlots[1]);
    if (pressed.l) interact();
    if (pressed.p) {
      paused = true;
      pauseTab = 0;
      loadoutCursor = 0;
    }

    beginScreenTransitionIfNeeded();

    // A small key opens the central dungeon door when approached.
    const tx = Math.floor(player.x / TILE);
    const ty = Math.floor(player.y / TILE);
    const doorFlag = `door_${state.mapId}`;
    const facing = directionVector();
    const facingTile = tileAt(
      state.mapId,
      Math.floor((player.x + facing.x * 28) / TILE),
      Math.floor((player.y + facing.y * 28) / TILE),
      state.flags,
    );
    if (state.mapId !== "overworld" && !state.flags[doorFlag] && player.keys && facingTile === "lockedDoor") {
      player.keys -= 1;
      state.flags[doorFlag] = true;
      announce("SMALL KEY USED");
      save();
    }
    if (state.mapId !== "overworld" && tileAt(state.mapId, tx, ty, state.flags) === "switch" && !state.flags[`switch_${state.mapId}`]) {
      state.flags[`switch_${state.mapId}`] = true;
      announce("MAGIC BARRIER DISABLED");
      save();
    }

    const enemies = enemiesByMap[state.mapId];
    enemies.forEach((enemy) => {
      enemy.hit = Math.max(0, enemy.hit - dt);
      enemy.stunned = Math.max(0, enemy.stunned - dt);
      enemy.phase += dt;
      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (!enemy.stunned && distance < 310 && distance > 0) {
        const speed = enemy.type === "bat" ? 100 : isPermanentEnemy(enemy.type) ? 80 : 58;
        const nx = enemy.x + (player.x - enemy.x) / distance * speed * dt;
        const ny = enemy.y + (player.y - enemy.y) / distance * speed * dt;
        if (enemyCanMove(enemy, nx, enemy.y)) enemy.x = nx;
        if (enemyCanMove(enemy, enemy.x, ny)) enemy.y = ny;
      }
      const boss = isPermanentEnemy(enemy.type);
      if (distance < (boss ? 43 : 29) && player.invincible <= 0) {
        const incomingDamage = boss && !player.inventory.shield ? 2 : 1;
        player.hp -= incomingDamage;
        player.invincible = player.inventory.devJacket ? 1.65 : 1.1;
        screenShake = boss ? 14 : 8;
        spawnParticles(player.x, player.y, "#ff6f7d", boss ? 18 : 10, 170);
        if (player.hp <= 0) {
          player.hp = player.maxHp;
          changeMap("overworld", MAPS.overworld.spawn);
          announce("YOU HAVE FALLEN · RETURNING TO WILLOWBROOK");
        }
      }
    });
    enemiesByMap[state.mapId] = enemies.filter((enemy) => enemy.hp > 0);
    updateProjectiles(dt);
    Object.keys(pressed).forEach((key) => delete pressed[key]);
  }

  function beginScreenTransitionIfNeeded() {
    const worldWidth = map().width * TILE;
    const worldHeight = map().height * TILE;
    const maxCameraX = Math.max(0, worldWidth - VIEW_W);
    const maxCameraY = Math.max(0, worldHeight - VIEW_H);
    let toX = camera.x;
    let toY = camera.y;

    const roomX = Math.floor(camera.x / VIEW_W);
    const roomY = Math.floor(camera.y / VIEW_H);
    const exits = roomExitsAt(state.mapId, roomX, roomY);
    const canCross = (direction) => {
      const neighbor = {
        e: [roomX + 1, roomY, "w"],
        w: [roomX - 1, roomY, "e"],
        s: [roomX, roomY + 1, "n"],
        n: [roomX, roomY - 1, "s"],
      }[direction];
      return exits.includes(direction)
        && roomExitsAt(state.mapId, neighbor[0], neighbor[1]).includes(neighbor[2]);
    };

    if (player.x > camera.x + VIEW_W - 18 && camera.x < maxCameraX && canCross("e")) {
      toX = Math.min(maxCameraX, camera.x + VIEW_W);
    } else if (player.x < camera.x + 18 && camera.x > 0 && canCross("w")) {
      toX = Math.max(0, camera.x - VIEW_W);
    } else if (player.y > camera.y + VIEW_H - 18 && camera.y < maxCameraY && canCross("s")) {
      toY = Math.min(maxCameraY, camera.y + VIEW_H);
    } else if (player.y < camera.y + 18 && camera.y > 0 && canCross("n")) {
      toY = Math.max(0, camera.y - VIEW_H);
    }

    if (toX !== camera.x || toY !== camera.y) {
      if (toX - camera.x >= VIEW_W - 1) player.x = toX + 32;
      if (camera.x - toX >= VIEW_W - 1) player.x = toX + VIEW_W - 32;
      if (toY - camera.y >= VIEW_H - 1) player.y = toY + 32;
      if (camera.y - toY >= VIEW_H - 1) player.y = toY + VIEW_H - 32;
      screenTransition = {
        fromX: camera.x,
        fromY: camera.y,
        toX,
        toY,
        elapsed: 0,
        duration: 0.62,
      };
      save();
    }
  }

  const tileColors = {
    grass: "#183f3f", grassAlt: "#123737", forest: "#102b35", water: "#0b4969",
    forestWall: "#0a1e2a", bridge: "#704064", mountain: "#30334b",
    stone: "#3b4058", stoneAlt: "#30364d", village: "#293c4e", house: "#442b58",
    desert: "#533d54", desertAlt: "#443448",
    dungeonFloor: "#15172c", dungeonFloorAlt: "#101326", wall: "#090b19",
    lockedDoor: "#be8c22", crackedWall: "#30233e", barrier: "#a51c75",
    switch: "#19e6c2", codeBrush: "#103944", callbackNode: "#182650",
    callbackNode2: "#421b4d", snow: "#83e7eb", void: "#03040b",
  };
  const dungeonPalettes = {
    mainframe: ["#15172c", "#0d1124"],
    reactor: ["#20204a", "#17183b"], server: ["#173640", "#102b35"],
    crypt: ["#303249", "#292b42"], forest: ["#294236", "#243a31"],
    water: ["#294151", "#233947"], fire: ["#4b302f", "#3d292c"],
    shadow: ["#29263b", "#211f32"], sky: ["#394653", "#313d49"],
    cave: ["#3d3938", "#34302f"], ice: ["#3b4d5c", "#334552"],
    desert: ["#554735", "#493d30"], light: ["#55534b", "#494840"],
    storm: ["#32394d", "#2b3143"], void: ["#262239", "#1e1b30"],
    royal: ["#3e2f4b", "#34283f"],
  };
  function drawTiles() {
    const animationFrame = Math.floor(performance.now() / 220);
    const startX = Math.floor(camera.x / TILE);
    const startY = Math.floor(camera.y / TILE);
    const endX = Math.ceil((camera.x + VIEW_W) / TILE);
    const endY = Math.ceil((camera.y + VIEW_H) / TILE);
    for (let ty = startY; ty <= endY; ty += 1) {
      for (let tx = startX; tx <= endX; tx += 1) {
        const tile = tileAt(state.mapId, tx, ty, state.flags);
        const x = tx * TILE - camera.x;
        const y = ty * TILE - camera.y + HUD_H;
        let color = tileColors[tile] || "#222";
        if (tile === "dungeonFloor" || tile === "dungeonFloorAlt") {
          const palette = dungeonPalettes[map().theme] || dungeonPalettes.crypt;
          color = palette[tile === "dungeonFloor" ? 0 : 1];
        }
        rect(x, y, TILE + 1, TILE + 1, color);
        if (tile === "lockedDoor" && tx % 16 === 8) continue;
        const indexedTile = indexedRoomTileAt(state.mapId, tx, ty);
        const themedDungeonTiles = {
          forest: { dungeonFloor: "mf", dungeonFloorAlt: "mf", wall: "mw" },
          fire: { dungeonFloor: "rf", dungeonFloorAlt: "rf", wall: "rw" },
          water: { dungeonFloor: "sf", dungeonFloorAlt: "sf", wall: "sv" },
        };
        const themedTile = themedDungeonTiles[map().theme]?.[tile];
        const tileArtId = tile === "lockedDoor"
          ? tile
          : (indexedTile?.code || themedTile || tile);
        if (drawCatalogArt(ctx, "tiles", tileArtId, x, y, TILE, TILE)) continue;
        // Tile decorations are authored on a 48-unit detail grid and scaled
        // into the new 64×64 art format, leaving more pixels for shading.
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(TILE / 48, TILE / 48);
        ctx.translate(-x, -y);
        if (tile === "grass" || tile === "grassAlt") {
          rect(x + 4, y + 9, 20, 2, "#1b7774");
          rect(x + 34, y + 31, 10, 2, "#d52f9a");
          rect(x + 10, y + 38, 3, 3, "#45f3d2");
        }
        if (tile === "water") {
          const wave = animationFrame % 3;
          rect(x + 4 + wave * 4, y + 12, 25, 3, "#69a0b2");
          rect(x + 19 - wave * 3, y + 29, 24, 3, "#244c63");
          rect(x + 7, y + 41, 17, 2, "#4b8196");
        }
        if (tile === "forest") {
          rect(x + 5, y + 5, 38, 38, "#1e412a");
          rect(x + 12, y + 2, 25, 30, "#37683a");
          rect(x + 7, y + 9, 18, 17, "#477b43");
          rect(x + 25, y + 13, 13, 14, "#2d5c34");
          rect(x + 21, y + 31, 7, 14, "#61452e");
        }
        if (tile === "forestWall") {
          rect(x, y + 17, 48, 31, "#173824");
          rect(x + 2, y + 5, 24, 31, "#356a3a");
          rect(x + 20, y + 1, 27, 35, "#417945");
          rect(x + 17, y + 30, 9, 18, "#59402c");
        }
        if (tile === "codeBrush") {
          rect(x + 2, y + 7, 44, 38, "#0b2732");
          rect(x + 6, y + 12, 17, 25, "#12675f");
          rect(x + 22, y + 5, 20, 34, "#164b5e");
          rect(x + 10, y + 18, 28, 3, "#31e1c8");
          rect(x + 18, y + 10, 3, 29, "#d52f9a");
          text("</>", x + 24, y + 31, 9, "center", "#b9fff5");
        }
        if (tile === "callbackNode" || tile === "callbackNode2") {
          const advanced = tile === "callbackNode2";
          rect(x + 3, y + 3, 42, 42, advanced ? "#421b4d" : "#182650");
          rect(x + 7, y + 7, 34, 34, "#080d1b");
          const pulse = 4 + (animationFrame % 3) * 2;
          ctx.strokeStyle = advanced ? "#f02ea5" : "#42efd4";
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(x + 24, y + 24, 8 + pulse, 0, Math.PI * 2); ctx.stroke();
          text(advanced ? "await" : "JS", x + 24, y + 28, advanced ? 7 : 10, "center", advanced ? "#f09bd6" : "#b9fff5");
        }
        if (tile === "mountain") {
          rect(x, y, 48, 48, "#484c59");
          rect(x + 4, y + 4, 40, 9, "#707381");
          rect(x + 8, y + 16, 34, 4, "#333743");
          rect(x + 4, y + 24, 39, 8, "#626573");
          rect(x + 13, y + 38, 29, 4, "#363a47");
        }
        if (tile === "bridge") {
          for (let plank = 0; plank < 4; plank += 1) {
            rect(x + plank * 12, y + 2, 10, 44, plank % 2 ? "#9a7445" : "#ad8550");
            rect(x + plank * 12, y + 7, 10, 2, "#65472e");
          }
          rect(x, y + 4, 48, 4, "#4f3928");
          rect(x, y + 40, 48, 4, "#4f3928");
        }
        if (tile === "house") {
          rect(x + 3, y + 17, 42, 31, "#b1845d");
          rect(x, y + 7, 48, 15, "#6f3540");
          rect(x + 6, y + 2, 36, 8, "#8e4550");
          rect(x + 18, y + 29, 12, 19, "#4d342a");
          rect(x + 7, y + 28, 8, 8, "#77a0a2");
        }
        if (tile === "desert" || tile === "desertAlt") {
          rect(x + 9, y + 12, 3, 3, "#d2ad66");
          rect(x + 32, y + 36, 5, 2, "#866537");
          if ((tx + ty) % 4 === 0) {
            rect(x + 20, y + 17, 4, 18, "#557146");
            rect(x + 13, y + 21, 9, 4, "#557146");
            rect(x + 24, y + 26, 8, 4, "#557146");
          }
        }
        if (tile === "stone" || tile === "stoneAlt") {
          rect(x + 3, y + 3, 42, 3, "#858078");
          rect(x + 8, y + 26, 21, 2, "#47464a");
          rect(x + 28, y + 28, 2, 11, "#47464a");
        }
        if (tile === "dungeonFloor" || tile === "dungeonFloorAlt") {
          rect(x + 4, y + 4, 40, 2, "#263459");
          rect(x + 4, y + 42, 40, 2, "#080b18");
          if ((tx + ty) % 5 === 0) {
            rect(x + 15, y + 18, 16, 2, "#15cdb5");
            rect(x + 23, y + 18, 2, 10, "#b62b90");
          }
        }
        if (tile === "wall") {
          rect(x + 3, y + 3, 42, 10, "#34374d");
          rect(x + 7, y + 17, 34, 9, "#202338");
          rect(x + 3, y + 31, 42, 13, "#393c52");
        }
        ctx.restore();
      }
    }
  }
  function drawPlayer() {
    const x = screenX(player.x);
    const walkFrame = player.moving ? Math.floor(player.walkTime) % 4 : 0;
    const step = walkFrame === 1 ? -2 : walkFrame === 3 ? 2 : 0;
    const bob = player.moving && (walkFrame === 1 || walkFrame === 3) ? -1 : 0;
    const y = screenY(player.y) + bob;
    if (player.invincible > 0 && Math.floor(player.invincible * 12) % 2) return;
    ctx.fillStyle = "#02060a66";
    ctx.beginPath();
    ctx.ellipse(x, y + 13, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const renderDirection = spriteDirection(player.dir);
    if (drawCatalogArt(
      ctx,
      "characters",
      "playerWalk",
      x - 32,
      y - 53,
      64,
      64,
      {
        direction: renderDirection,
        frame: walkFrame,
      },
    )) {
      if (player.inventory.htmlSword && player.attackTime <= 0) {
        const facing = directionVector();
        const upgraded = player.inventory.masterSword;
        const perpendicular = { x: -facing.y, y: facing.x };
        const handX = x + facing.x * 6 + perpendicular.x * 12;
        const handY = y - 8 + facing.y * 5 + perpendicular.y * 6;
        const bladeLength = upgraded ? 34 : 29;
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = upgraded ? "#e87838" : "#7c542f";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(handX - facing.x * 5, handY - facing.y * 5);
        ctx.lineTo(handX + facing.x * 4, handY + facing.y * 4);
        ctx.stroke();
        ctx.strokeStyle = upgraded ? "#fff1a3" : "#d7fbff";
        ctx.lineWidth = upgraded ? 5 : 4;
        ctx.beginPath();
        ctx.moveTo(handX + facing.x * 3, handY + facing.y * 3);
        ctx.lineTo(
          handX + facing.x * bladeLength,
          handY + facing.y * bladeLength,
        );
        ctx.stroke();
        ctx.strokeStyle = upgraded ? "#ff9b45" : "#3fdff5";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.94, 0.94);
    ctx.translate(-x, -y);

    // Boots and legs animate independently from the upper body. The oval
    // ground shadow above anchors the character at this same foot position.
    const bootColor = player.inventory.boots ? "#42efd4" : "#111827";
    rect(x - 10 + step, y + 9, 8, 9, bootColor);
    rect(x + 2 - step, y + 9, 8, 9, bootColor);

    if (renderDirection === "down") {
      rect(x - 11, y - 7, 22, 20, "#5a2a80");
      rect(x - 14, y - 4, 5, 13, "#d6ae7b");
      rect(x + 9, y - 4, 5, 13, "#d6ae7b");
      rect(x - 9, y - 20, 18, 14, "#e3bd86");
      rect(x - 10, y - 24, 20, 8, "#10283f");
      rect(x + 7, y - 26, 10, 5, "#11bda8");
      rect(x - 5, y - 14, 3, 3, "#243039");
      rect(x + 3, y - 14, 3, 3, "#243039");
      rect(x - 4, y - 8, 8, 2, "#a16c52");
      rect(x - 5, y - 1, 10, 5, "#12dcc2");
    } else if (renderDirection === "up") {
      rect(x - 11, y - 7, 22, 20, "#5a2a80");
      rect(x - 9, y - 20, 18, 14, "#173f55");
      rect(x - 6, y - 18, 12, 4, "#225d6b");
      rect(x - 11, y - 24, 22, 9, "#10283f");
      rect(x - 17, y - 25, 12, 5, "#11bda8");
      rect(x - 8, y - 4, 16, 15, "#9b493d");
      rect(x - 5, y - 1, 10, 8, "#b55b46");
      rect(x - 2, y + 1, 4, 4, "#d7b552");
    } else {
      const facingRight = renderDirection === "right";
      const mirror = facingRight ? 1 : -1;
      rect(x - 10, y - 7, 20, 20, "#5a2a80");
      rect(x - 8, y - 20, 16, 14, "#dfb780");
      rect(x - 9, y - 24, 18, 8, "#10283f");
      rect(x + mirror * 6, y - 23, mirror * 12, 5, "#11bda8");
      rect(x + mirror * 5 - (facingRight ? 0 : 3), y - 14, 3, 3, "#243039");
      rect(x - mirror * 12 - (facingRight ? 4 : 0), y - 2, 7, 14, "#9b493d");
      rect(x + mirror * 7 - (facingRight ? 0 : 5), y - 3, 5, 13, "#d6ae7b");
    }

    // Tunic hem gives the character a stronger animated silhouette.
    rect(x - 12, y + 7, 24, 5, "#41205f");
    rect(x - 8, y + 12, 6, 3, "#41205f");
    rect(x + 2, y + 12, 6, 3, "#41205f");
    if (player.inventory.devJacket) {
      rect(x - 10, y - 6, 20, 5, "#f02ea5aa");
      rect(x - 7, y, 14, 3, "#42efd4");
    }
    if (player.inventory.glove) {
      rect(x - 15, y + 1, 5, 8, "#ffd54a");
      rect(x + 10, y + 1, 5, 8, "#ffd54a");
    }
    if (player.inventory.shield) {
      const shieldX = renderDirection === "left" ? x + 13 : x - 19;
      rect(shieldX, y - 8, 9, 22, "#1a7181");
      rect(shieldX + 2, y - 5, 5, 14, "#42efd4");
    }

    ctx.restore();
  }
  function drawDepthSortedActors() {
    const renderables = visibleRoomAssets(state.mapId, camera.x, camera.y, VIEW_W, VIEW_H)
      .filter((asset) => (
        asset.type !== "dungeonBarrier" || !state.flags[`switch_${state.mapId}`]
      ))
      .map((asset) => ({
        sortY: roomAssetSortY(asset),
        draw() {
        drawPlacedRoomAsset(
          ctx,
          asset,
          screenX(asset.worldX),
          screenY(asset.worldY),
        );
        },
      }));
    enemiesByMap[state.mapId].forEach((enemy) => {
      renderables.push({ sortY: enemy.y + 15, draw: () => drawEnemy(enemy) });
    });
    renderables.push({ sortY: player.y + 15, draw: drawPlayer });
    renderables.sort((a, b) => a.sortY - b.sortY).forEach((entry) => entry.draw());
  }
  function drawEnemy(enemy) {
    if (enemy.hit > 0 && Math.floor(enemy.hit * 15) % 2) return;
    const x = screenX(enemy.x);
    const y = screenY(enemy.y);
    const boss = isPermanentEnemy(enemy.type);
    ctx.fillStyle = boss ? "#02040b88" : "#02060a66";
    ctx.beginPath();
    ctx.ellipse(x, y + (boss ? 24 : 14), boss ? 34 : 18, boss ? 11 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (drawCatalogArt(ctx, "enemies", enemy.type, x - 32, y - 44, 64, 64)) {
      if (boss) {
        const maxHp = 14 + (map().number || 0);
        rect(x - 43, y - 59, 86, 7, "#080914dd");
        rect(x - 41, y - 57, 82 * Math.max(0, enemy.hp / maxHp), 3, "#f02ea5");
      }
      return;
    }
    const stunned = enemy.stunned > 0;
    if (enemy.type === "slime") {
      const squish = Math.sin(enemy.phase * 6) > 0.5 ? 3 : 0;
      rect(x - 17, y - 8 + squish, 34, 20 - squish, stunned ? "#ffe75c" : "#b21a7b");
      rect(x - 13, y - 14 + squish, 26, 17 - squish, stunned ? "#fff18c" : "#f02ea5");
      rect(x - 8, y - 5 + squish, 4, 5, "#17201b");
      rect(x + 5, y - 5 + squish, 4, 5, "#17201b");
      rect(x - 11, y - 11 + squish, 8, 3, "#bddd6d");
    } else if (enemy.type === "bat") {
      const flap = Math.sin(enemy.phase * 12) > 0 ? 9 : 2;
      rect(x - 8, y - 12, 16, 22, stunned ? "#ffe75c" : "#164f67");
      rect(x - 25, y - flap, 18, 8 + flap, stunned ? "#ffe75c" : "#19cdb5");
      rect(x + 7, y - flap, 18, 8 + flap, stunned ? "#ffe75c" : "#19cdb5");
      rect(x - 4, y - 6, 3, 3, "#f25f65");
      rect(x + 2, y - 6, 3, 3, "#f25f65");
    } else if (enemy.type === "guard") {
      const step = Math.sin(enemy.phase * 6) > 0 ? 2 : -2;
      rect(x - 11 + step, y + 10, 8, 9, "#302936");
      rect(x + 3 - step, y + 10, 8, 9, "#302936");
      rect(x - 15, y - 10, 30, 25, stunned ? "#ffe75c" : "#592675");
      rect(x - 12, y - 22, 24, 16, "#20bca8");
      rect(x - 7, y - 16, 4, 4, "#241d22");
      rect(x + 4, y - 16, 4, 4, "#241d22");
      rect(x + 15, y - 10, 5, 29, "#ddd2aa");
    } else {
      const pulse = Math.sin(enemy.phase * 5) > 0 ? 3 : 0;
      rect(x - 31, y - 27 + pulse, 62, 54 - pulse, stunned ? "#ffe75c" : "#401858");
      rect(x - 24, y - 39 + pulse, 48, 23, enemy.type === "mage" ? "#5e2790" : "#d51d86");
      rect(x - 15, y - 31 + pulse, 8, 7, "#ffd259");
      rect(x + 7, y - 31 + pulse, 8, 7, "#ffd259");
      rect(x - 39, y - 15, 12, 42, "#3c293e");
      rect(x + 27, y - 15, 12, 42, "#3c293e");
      rect(x - 18, y + 27, 14, 7, "#281f31");
      rect(x + 4, y + 27, 14, 7, "#281f31");
    }
  }
  function drawObjects() {
    const currentMap = map();
    currentMap.chests.forEach(([id, tx, ty, rewardType]) => {
      const x = screenX(tx * TILE + TILE / 2);
      const y = screenY(ty * TILE + TILE / 2);
      if (state.openedChests[id]) {
        rect(x - 18, y, 36, 12, "#4b3525");
        rect(x - 18, y - 16, 36, 7, "#69482d");
        rect(x - 13, y + 2, 26, 3, "#6e4b2e");
      } else {
        if (!drawCatalogArt(ctx, "props", "dungeonChest", x - 32, y - 38, 64, 64)) {
          rect(x - 18, y - 9, 36, 22, "#8a552f");
          rect(x - 16, y - 14, 32, 12, "#b87938");
          rect(x - 18, y - 3, 36, 4, "#5b3b29");
          rect(x - 4, y - 7, 8, 14, "#e6c05d");
          rect(x - 1, y - 4, 3, 4, "#6b5427");
        }
        if (rewardType === "htmlSword") {
          const bob = Math.sin(performance.now() / 260) * 4;
          ctx.globalAlpha = 0.28;
          ctx.fillStyle = "#42efd4";
          ctx.beginPath();
          ctx.arc(x, y - 50 + bob, 27, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          drawCatalogArt(ctx, "items", "htmlSword", x - 23, y - 75 + bob, 46, 46);
          text("WILLOW BLADE", x, y - 82 + bob, 8, "center", "#fff4c7");
        }
      }
    });
    if (state.mapId === "overworld") {
      DUNGEONS.forEach((dungeon) => {
        const x = screenX(dungeon.entrance.x);
        const y = screenY(dungeon.entrance.y);
        if (x < -80 || y < -80 || x > VIEW_W + 80 || y > VIEW_H + 80) return;
        rect(x - 54, y - 35, 108, 68, "#555866");
        rect(x - 48, y - 29, 96, 62, state.flags[`complete_${dungeon.id}`] ? "#3f604b" : "#292b42");
        rect(x - 38, y - 33, 76, 8, "#777986");
        rect(x - 25, y - 18, 50, 50, "#080910");
        rect(x - 32, y - 22, 7, 55, "#7b6a50");
        rect(x + 25, y - 22, 7, 55, "#7b6a50");
        text(`${dungeon.number}`, x, y + 50, 10, "center", "#d6bb70");
      });
      MERCHANTS.forEach((merchant) => {
        const x = screenX(merchant.x * TILE + TILE / 2);
        const y = screenY(merchant.y * TILE + TILE / 2);
        if (x < -60 || y < -60 || x > VIEW_W + 60 || y > VIEW_H + 60) return;
        const merchantArt = merchant.id === "village-shop"
          ? "villagerGardener"
          : "villagerMechanic";
        drawCatalogArt(ctx, "characters", merchantArt, x - 32, y - 58, 64, 88);
        text("SHOP", x, y + 39, 9, "center", "#f0d697");
      });
    } else {
      const exit = currentMap.exit;
      text("▼ RETURN TO SURFACE", screenX(exit.x), screenY(exit.y), 10, "center", "#47f2d7");
    }
    bombs.forEach((bomb) => {
      const x = screenX(bomb.x);
      const y = screenY(bomb.y);
      if (bomb.exploded) {
        const explosionDrawn = drawCatalogArt(
          ctx, "effects", "codeExplosion", x - 96, y - 96, 192, 192,
        );
        if (!explosionDrawn) {
          ctx.fillStyle = "#f4a33b99";
          ctx.beginPath(); ctx.arc(x, y, 95, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#ffe07a";
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.arc(x, y, 55, 0, Math.PI * 2); ctx.stroke();
        }
      } else {
        const fusePulse = Math.floor(bomb.timer * 12) % 2;
        rect(x - 10 - fusePulse, y - 8 - fusePulse, 20 + fusePulse * 2, 18 + fusePulse * 2, fusePulse ? "#4b204b" : "#171722");
        rect(x - 7, y - 12, 14, 7, "#29293a");
        rect(x + 4, y - 15, 3, 8, "#efb950");
        rect(x + 3 - fusePulse * 2, y - 19 - fusePulse * 2, 7 + fusePulse * 4, 7 + fusePulse * 4, fusePulse ? "#fff27a" : "#f02ea5");
      }
    });
    cssPulses.forEach((pulse) => {
      const x = screenX(pulse.x);
      const y = screenY(pulse.y);
      const spin = pulse.age * 13;
      const flare = 12 + Math.sin(pulse.age * 35) * 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(spin);
      const pulseDrawn = drawCatalogArt(
        ctx, "effects", "cssPulse", -flare * 1.5, -flare * 1.5, flare * 3, flare * 3,
      );
      if (!pulseDrawn) {
        ctx.strokeStyle = "#f02ea5";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, flare, 0, Math.PI * 2);
        ctx.stroke();
        text("{", -15, 7, 19, "center", "#42efd4");
        text("}", 15, 7, 19, "center", "#42efd4");
      }
      ctx.restore();
      ctx.fillStyle = "#b8fff6aa";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    if (boomerang) {
      const x = screenX(boomerang.x);
      const y = screenY(boomerang.y);
      const rotation = performance.now() / 115;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      const droneDrawn = drawCatalogArt(
        ctx, "items", "boomerang", -27, -27, 54, 54,
      );
      if (!droneDrawn) {
        rect(-25, -14, 22, 28, "#f2d532");
        rect(3, -14, 22, 28, "#f2d532");
        rect(-4, -4, 8, 8, "#111827");
        text("J", -14, 7, 20, "center", "#17140a");
        text("S", 14, 7, 20, "center", "#17140a");
      }
      ctx.restore();
    }
  }

  function drawWeaponEffects() {
    weaponEffects.forEach((effect) => {
      const progress = effect.time / effect.duration;
      const followsPlayer = effect.type === "sword" || effect.type === "hammer";
      const x = screenX(followsPlayer ? player.x : effect.x);
      const y = screenY(followsPlayer ? player.y : effect.y);
      ctx.save();
      if (effect.type === "sword") {
        const facing = Math.atan2(effect.dir.y, effect.dir.x);
        const upgraded = effect.upgraded;
        const bladeLength = upgraded ? 68 : 57;
        const radius = upgraded ? 59 : 49;
        const sweepProgress = Math.min(1, progress / 0.72);
        // Right-facing poses are mirrored artwork, so their screen-space
        // sweep must also be mirrored. This keeps up-right, right, and
        // down-right attacks moving downward instead of lifting upward.
        const reverseForRight = effect.dir.x > 0.1;
        const startAngle = facing + (reverseForRight ? -1.02 : 1.02);
        const sweepDirection = reverseForRight ? 1 : -1;
        const endAngle = startAngle + 2.04 * sweepProgress * sweepDirection;
        const swordAngle = endAngle;
        const fade = Math.max(0, 1 - Math.max(0, progress - 0.62) / 0.38);

        ctx.lineCap = "round";
        ctx.strokeStyle = upgraded
          ? `rgba(255,239,137,${fade})`
          : `rgba(190,249,255,${fade})`;
        ctx.lineWidth = upgraded ? 8 : 6;
        ctx.beginPath();
        ctx.arc(x, y - 4, radius, startAngle, endAngle, !reverseForRight);
        ctx.stroke();

        ctx.strokeStyle = upgraded
          ? `rgba(255,126,70,${fade})`
          : `rgba(55,224,255,${fade})`;
        ctx.lineWidth = upgraded ? 3 : 2;
        ctx.beginPath();
        ctx.arc(x, y - 4, radius + 1, startAngle, endAngle, !reverseForRight);
        ctx.stroke();

        // Render the weapon itself sweeping through the same arc that deals
        // damage, so the visual trail and combat reach agree.
        const swordX = Math.cos(swordAngle);
        const swordY = Math.sin(swordAngle);
        const handDistance = 12;
        const tipX = x + swordX * bladeLength;
        const tipY = y - 4 + swordY * bladeLength;
        ctx.strokeStyle = upgraded ? "#e87838" : "#7c542f";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(
          x + swordX * (handDistance - 8),
          y - 4 + swordY * (handDistance - 8),
        );
        ctx.lineTo(
          x + swordX * (handDistance + 4),
          y - 4 + swordY * (handDistance + 4),
        );
        ctx.stroke();
        ctx.strokeStyle = upgraded ? "#fff1a3" : "#d7fbff";
        ctx.lineWidth = upgraded ? 6 : 5;
        ctx.beginPath();
        ctx.moveTo(
          x + swordX * handDistance,
          y - 4 + swordY * handDistance,
        );
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.strokeStyle = upgraded ? "#ff9b45" : "#3fdff5";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (effect.type === "hookshot") {
        const endX = screenX(effect.endX);
        const endY = screenY(effect.endY);
        const reach = progress < 0.55 ? progress / 0.55 : (1 - progress) / 0.45;
        const tipX = x + (endX - x) * Math.max(0, reach);
        const tipY = y + (endY - y) * Math.max(0, reach);
        ctx.strokeStyle = "#42efd4";
        ctx.lineWidth = 5;
        ctx.setLineDash([10, 6]);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tipX, tipY); ctx.stroke();
        ctx.setLineDash([]);
        rect(tipX - 8, tipY - 8, 16, 16, "#f02ea5");
      }
      if (effect.type === "fire" || effect.type === "ice") {
        const hot = effect.type === "fire";
        const radius = 24 + progress * 150;
        const size = radius * 1.55;
        ctx.globalAlpha = 1 - progress * 0.75;
        const burstDrawn = drawCatalogArt(
          ctx,
          "effects",
          hot ? "firewallBurst" : "freezeBurst",
          x - size / 2,
          y - size / 2,
          size,
          size,
        );
        ctx.globalAlpha = 1;
        if (!burstDrawn) {
          ctx.strokeStyle = hot ? `rgba(255,80,90,${1 - progress})` : `rgba(80,235,255,${1 - progress})`;
          ctx.lineWidth = 9 - progress * 6;
          ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
        }
      }
      if (effect.type === "hammer") {
        const angle = -1.25 + progress * 1.8;
        const facing = Math.atan2(effect.dir.y, effect.dir.x);
        ctx.translate(x, y);
        ctx.rotate(facing + angle);
        rect(12, -5, 40, 10, "#8656a5");
        rect(42, -17, 27, 34, "#42efd4");
        ctx.rotate(-(facing + angle));
        ctx.translate(-x, -y);
        ctx.strokeStyle = `rgba(240,46,165,${1 - progress})`;
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(x, y, 30 + progress * 65, 0, Math.PI * 2); ctx.stroke();
      }
      if (effect.type === "lantern") {
        const radius = 35 + Math.sin(progress * Math.PI) * 150;
        const glow = ctx.createRadialGradient(x, y, 4, x, y, radius);
        glow.addColorStop(0, "rgba(255,245,145,.75)");
        glow.addColorStop(1, "rgba(66,239,212,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        text("</>", x, y + 7, 14, "center", "#fff59a");
      }
      if (effect.type === "mirror") {
        for (let band = 0; band < 7; band += 1) {
          const width = 45 + band * 18 + progress * 60;
          rect(x - width / 2 + Math.sin(progress * 30 + band) * 12, y - 52 + band * 17, width, 4, band % 2 ? "#42efd4aa" : "#f02ea5aa");
        }
      }
      if (effect.type === "cape") {
        ctx.strokeStyle = `rgba(240,46,165,${1 - progress})`;
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.ellipse(x, y, 28 + progress * 55, 42 + progress * 35, 0, 0, Math.PI * 2); ctx.stroke();
        rect(x - 20 - progress * 20, y - 35, 8, 70, "#42efd455");
        rect(x + 12 + progress * 20, y - 35, 8, 70, "#42efd455");
      }
      if (effect.type === "root") {
        const size = 90 + progress * 240;
        ctx.globalAlpha = 1 - progress * 0.72;
        const rootDrawn = drawCatalogArt(
          ctx, "effects", "rootSurge", x - size / 2, y - size / 2, size, size,
        );
        ctx.globalAlpha = 1;
        if (!rootDrawn) {
          for (let ring = 0; ring < 4; ring += 1) {
            const ringProgress = Math.max(0, progress - ring * 0.1);
            ctx.strokeStyle = ring % 2 ? `rgba(66,239,212,${1 - progress})` : `rgba(240,46,165,${1 - progress})`;
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.arc(x, y, ringProgress * (180 + ring * 45), 0, Math.PI * 2); ctx.stroke();
          }
        }
      }
      ctx.restore();
    });
  }

  function drawMapOverlay() {
    ctx.save();
    ctx.translate(0, HUD_H);
    rect(70, 54, 884, 532, "#070b18f8");
    if (!drawCatalogArt(ctx, "ui", "mapRoomFrame", 70, 54, 884, 532)) {
      ctx.strokeStyle = "#32dfca";
      ctx.lineWidth = 3;
      ctx.strokeRect(80, 64, 864, 512);
    }
    text(state.mapId === "overworld" ? "THE REALM OF EVERDAWN" : map().name.toUpperCase(), VIEW_W / 2, 103, 22, "center", "#42efd4");

    const scale = Math.min(10, 760 / map().width, 330 / map().height);
    const mapWidth = map().width * scale;
    const mapHeight = map().height * scale;
    const originX = (VIEW_W - mapWidth) / 2;
    const originY = 132 + (330 - mapHeight) / 2;
    const revealAll = state.mapId !== "overworld" && player.inventory.maps[state.mapId];
    const pointIsVisible = (tx, ty) => revealAll
      || state.discovered[`${state.mapId}:${Math.floor(tx / 16)},${Math.floor(ty / 10)}`];

    for (let ty = 0; ty < map().height; ty += 1) {
      for (let tx = 0; tx < map().width; tx += 1) {
        const screenKey = `${state.mapId}:${Math.floor(tx / 16)},${Math.floor(ty / 10)}`;
        const visible = revealAll || state.discovered[screenKey];
        const tile = tileAt(state.mapId, tx, ty, state.flags);
        rect(originX + tx * scale, originY + ty * scale, scale + 1, scale + 1, visible ? (tileColors[tile] || "#333541") : "#080910");
      }
    }

    ctx.strokeStyle = "#d52f9a66";
    ctx.lineWidth = 2;
    for (let sx = 0; sx <= map().width; sx += 16) {
      ctx.beginPath(); ctx.moveTo(originX + sx * scale, originY); ctx.lineTo(originX + sx * scale, originY + mapHeight); ctx.stroke();
    }
    for (let sy = 0; sy <= map().height; sy += 10) {
      ctx.beginPath(); ctx.moveTo(originX, originY + sy * scale); ctx.lineTo(originX + mapWidth, originY + sy * scale); ctx.stroke();
    }

    if (state.mapId !== "overworld") {
      const currentRoomX = Math.floor(player.x / (16 * TILE));
      const currentRoomY = Math.floor(player.y / (10 * TILE));
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        originX + currentRoomX * 16 * scale + 2,
        originY + currentRoomY * 10 * scale + 2,
        16 * scale - 4,
        10 * scale - 4,
      );
      text(
        "CURRENT CHAMBER",
        originX + (currentRoomX * 16 + 8) * scale,
        originY + currentRoomY * 10 * scale - 7,
        8,
        "center",
        "#ffffff",
      );
    }

    if (state.mapId === "overworld") {
      for (let roomX = 0; roomX < 16; roomX += 1) {
        text(`${roomX + 1}`, originX + (roomX * 16 + 8) * scale, originY - 7, 7, "center", "#d5c89c");
      }
      for (let roomY = 0; roomY < 16; roomY += 1) {
        text(String.fromCharCode(65 + roomY), originX - 9, originY + (roomY * 10 + 5) * scale + 3, 7, "center", "#d5c89c");
      }
      DUNGEONS.forEach((dungeon) => {
        if (!pointIsVisible(dungeon.entrance.x / TILE, dungeon.entrance.y / TILE)) return;
        const x = originX + dungeon.entrance.x / TILE * scale;
        const y = originY + dungeon.entrance.y / TILE * scale;
        rect(x - 5, y - 5, 10, 10, "#f0c75e");
      });
      MERCHANTS.forEach((merchant) => {
        if (!pointIsVisible(merchant.x, merchant.y)) return;
        const markerX = originX + (merchant.x + 0.5) * scale;
        const markerY = originY + (merchant.y + 0.5) * scale;
        if (!drawCatalogArt(ctx, "ui", "mapMarkerShop", markerX - 18, markerY - 18, 36, 36)) {
          rect(markerX - 4, markerY - 4, 8, 8, "#d46f55");
        }
      });
    }
    map().chests.forEach(([id, tx, ty]) => {
      if (state.openedChests[id] || !pointIsVisible(tx, ty)) return;
      const markerX = originX + (tx + 0.5) * scale;
      const markerY = originY + (ty + 0.5) * scale;
      if (!drawCatalogArt(ctx, "ui", "mapMarkerCache", markerX - 15, markerY - 15, 30, 30)) {
        rect(markerX - 3, markerY - 3, 6, 6, "#e5bd50");
      }
    });

    const playerMapX = originX + player.x / TILE * scale;
    const playerMapY = originY + player.y / TILE * scale;
    if (!drawCatalogArt(ctx, "ui", "mapMarkerPlayer", playerMapX - 17, playerMapY - 17, 34, 34)) {
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(playerMapX, playerMapY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#151622"; ctx.lineWidth = 2; ctx.stroke();
    }

    if (!revealAll) text(state.mapId === "overworld" ? "EXPLORE TO REVEAL EACH REGION" : "UNKNOWN ROOMS HIDDEN · FIND THE DUNGEON MAP", VIEW_W / 2, 500, 10, "center", "#8c8c8c");
    text(roomNameAt(state.mapId, player.x, player.y).toUpperCase(), VIEW_W / 2, 530, 12, "center", "#d5c89c");
    text("■ TEMPLE   ■ TRADER   ■ TREASURE   ● YOU", VIEW_W / 2, 553, 9, "center", "#85867f");
    text(paused ? "PAUSE MAP SCREEN" : "M  CLOSE MAP", VIEW_W / 2, 574, 10, "center", "#aaa99f");
    ctx.restore();
  }

  function drawHeart(x, y, filled) {
    if (drawCatalogArt(
      ctx, "ui", filled ? "heartFull" : "heartEmpty", x, y, 22, 21,
    )) return;
    const color = filled ? "#ed5353" : "#4a3038";
    rect(x + 3, y, 7, 5, color);
    rect(x + 12, y, 7, 5, color);
    rect(x, y + 4, 22, 7, color);
    rect(x + 3, y + 11, 16, 5, color);
    rect(x + 7, y + 16, 8, 5, color);
    if (filled) rect(x + 4, y + 3, 4, 3, "#ff8b83");
  }

  function drawMerchant() {
    if (!merchantOpen) return;
    rect(180, 82, 600, 430, "#11131ff8");
    drawCatalogArt(ctx, "ui", "menuPanelFrame", 180, 82, 600, 430);
    text(`${merchantOpen.name.toUpperCase()}'S TRADING POST`, 480, 140, 22, "center", "#42efd4");
    merchantOpen.stock.forEach(([item, price], index) => {
      const selected = merchantCursor === index;
      const label = itemLabel(item);
      const y = 174 + index * 58;
      rect(245, y, 470, 44, selected ? "#263657" : "#171a29");
      if (selected) {
        ctx.strokeStyle = "#42efd4";
        ctx.lineWidth = 3;
        ctx.strokeRect(245, y, 470, 44);
      }
      if (selected) drawCatalogArt(ctx, "ui", "selectionCursor", 250, y + 7, 36, 36);
      text(label, 290, y + 28, 14, "left", selected ? "#ffffff" : "#eee4ca");
      text(`${price} ◆`, 685, y + 28, 14, "right", "#f0c75e");
    });
    const exitIndex = merchantOpen.stock.length;
    const exitY = 174 + exitIndex * 58;
    const exitSelected = merchantCursor === exitIndex;
    rect(245, exitY, 470, 44, exitSelected ? "#4a233d" : "#171a29");
    if (exitSelected) {
      ctx.strokeStyle = "#f02ea5";
      ctx.lineWidth = 3;
      ctx.strokeRect(245, exitY, 470, 44);
    }
    if (exitSelected) drawCatalogArt(ctx, "ui", "selectionCursor", 250, exitY + 7, 36, 36);
    text("EXIT SHOP", 290, exitY + 28, 14, "left", exitSelected ? "#ffffff" : "#bbb7aa");
    text(`YOUR GOLD: ${player.coins}`, 480, 445, 12, "center", "#bfc3b5");
    text("MOVE TO SELECT · L / TALK TO CONFIRM", 480, 480, 10, "center", "#777a76");
  }

  function drawLoadoutMenu() {
    const gear = availableLoadout();
    rect(90, 72, 844, 500, "#070b18fa");
    if (!drawCatalogArt(ctx, "ui", "menuPanelFrame", 90, 72, 844, 500)) {
      ctx.strokeStyle = "#42efd4";
      ctx.lineWidth = 3;
      ctx.strokeRect(100, 82, 824, 480);
    }
    text("GEAR LOADOUT", 512, 123, 25, "center", "#42efd4");
    text("PASSIVE EQUIPMENT", 125, 158, 10, "left", "#f09bd6");
    const equipment = [
      ["CLOTHES", "devJacket"], ["SHIELD", "shield"], ["GLOVES", "glove"], ["BOOTS", "boots"],
    ];
    equipment.forEach(([slot, item], index) => {
      const x = 125 + index * 195;
      const acquired = Boolean(player.inventory[item]);
      rect(x, 170, 180, 62, acquired ? "#263657" : "#101522");
      ctx.strokeStyle = acquired ? "#42efd4" : "#343b4c";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 170, 180, 62);
      const hasItemArt = acquired
        && drawCatalogArt(ctx, "items", item, x + 8, 181, 40, 40);
      text(slot, x + (hasItemArt ? 54 : 12), 190, 9, "left", "#8ea0ad");
      text(
        acquired ? itemLabel(item) : "NOT ACQUIRED",
        x + (hasItemArt ? 111 : 90),
        217,
        10,
        "center",
        acquired ? "#ffffff" : "#59616d",
      );
    });
    text("WEAPON / ITEM SLOTS", 125, 258, 10, "left", "#f09bd6");
    text(paused ? "MOVE · J ASSIGN A · K ASSIGN B" : "MOVE · J ASSIGN A · K ASSIGN B · Q CLOSE", 899, 258, 9, "right", "#a9b9c3");
    if (!gear.length) {
      text("NO ASSIGNABLE ITEMS ACQUIRED", 512, 390, 18, "center", "#f09bd6");
      return;
    }
    gear.forEach((item, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = 135 + column * 255;
      const y = 275 + row * 64;
      const selected = index === loadoutCursor;
      rect(x, y, 230, 50, selected ? "#263657" : "#11182a");
      if (selected) {
        ctx.strokeStyle = "#f02ea5";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, 230, 50);
        drawCatalogArt(ctx, "ui", "selectionCursor", x - 25, y + 7, 36, 36);
      }
      const hasItemArt = drawCatalogArt(ctx, "items", item, x + 8, y + 5, 40, 40);
      text(itemLabel(item), x + (hasItemArt ? 54 : 14), y + 22, 10, "left", selected ? "#ffffff" : "#b8c7d0");
      const badges = [];
      if (player.equippedSlots[0] === item) badges.push("A");
      if (player.equippedSlots[1] === item) badges.push("B");
      if (item === "bombs") badges.push(`${player.inventory.bombs}`);
      badges.push(`${MAGIC_COSTS[item] || 0} MP`);
      text(badges.join(" · "), x + 214, y + 40, 10, "right", "#42efd4");
    });
  }

  function drawPauseStatus() {
    rect(150, 100, 724, 470, "#070b18fa");
    if (!drawCatalogArt(ctx, "ui", "menuPanelFrame", 150, 100, 724, 470)) {
      ctx.strokeStyle = "#42efd4";
      ctx.lineWidth = 3;
      ctx.strokeRect(160, 110, 704, 450);
    }
    text("ADVENTURER STATUS", 512, 155, 25, "center", "#42efd4");
    text(`HEARTS  ${Math.ceil(player.hp / 2)} / ${player.maxHp / 2}`, 220, 215, 15, "left", "#ed5353");
    text(`MAGIC  ${Math.floor(player.magic)} / ${player.maxMagic}`, 220, 255, 15, "left", "#f02ea5");
    text(`GOLD  ${player.coins}`, 220, 295, 15, "left", "#42efd4");
    text(`SMALL KEYS  ${player.keys}`, 220, 335, 15, "left", "#f0d697");
    text("CURRENT MILESTONE", 570, 210, 10, "center", "#8595a0");
    const milestone = state.flags.questComplete
      ? "EVERDAWN RESTORED"
      : (state.flags.backendApi
        ? "CRYSTAL SIGIL RESTORED"
        : (state.flags.reactApp
          ? "EMBER SIGIL RESTORED"
          : (state.flags.firstWebpage ? "GROVE SIGIL RESTORED" : "SEEK THE WILLOW BLADE")));
    text(milestone, 570, 242, 14, "center", "#ffffff");
    text("PASSIVE LOADOUT", 570, 300, 10, "center", "#8595a0");
    const activeEquipment = [
      player.inventory.devJacket && "JACKET",
      player.inventory.shield && "SHIELD",
      player.inventory.glove && "GLOVES",
      player.inventory.boots && "BOOTS",
    ].filter(Boolean).join(" · ") || "NONE";
    text(activeEquipment, 570, 333, 11, "center", "#42efd4");
    text("H  SWORD      J  SLOT A      K  SLOT B      L  INTERACT", 512, 495, 11, "center", "#aab7bd");
  }

  function drawPauseTabs() {
    const tabs = ["STATUS", "MAP", "GEAR"];
    tabs.forEach((tab, index) => {
      const x = 322 + index * 130;
      rect(x, 670, 120, 28, index === pauseTab ? "#f02ea5" : "#151d30");
      text(tab, x + 60, 689, 10, "center", index === pauseTab ? "#ffffff" : "#82909b");
    });
    text("Q / E  CHANGE SCREEN", 190, 689, 9, "center", "#82909b");
    text("P  RESUME", 844, 689, 9, "center", "#82909b");
  }

  function buyMerchantItem(index) {
    const offer = merchantOpen?.stock[index];
    if (!offer) return;
    const [item, price] = offer;
    if (player.coins < price) {
      announce("NOT ENOUGH GOLD");
      return;
    }
    player.coins -= price;
    reward(item);
    save();
  }

  function drawParticles() {
    particles.forEach((particle) => {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      ctx.globalAlpha = alpha;
      rect(
        screenX(particle.x) - particle.size / 2,
        screenY(particle.y) - particle.size / 2,
        particle.size,
        particle.size,
        particle.color,
      );
    });
    ctx.globalAlpha = 1;
  }

  function drawAtmosphere() {
    const theme = state.mapId === "overworld" ? "overworld" : map().theme;
    const tint = {
      overworld: "rgba(40,220,180,.035)",
      cave: "rgba(80,65,120,.09)",
      crystal: "rgba(60,220,255,.08)",
      water: "rgba(35,150,220,.08)",
      fire: "rgba(255,90,35,.08)",
      desert: "rgba(245,175,80,.07)",
      shadow: "rgba(45,25,80,.14)",
      void: "rgba(45,20,75,.16)",
      reactor: "rgba(240,45,120,.07)",
      mainframe: "rgba(35,230,205,.055)",
      server: "rgba(30,180,220,.06)",
    }[theme] || "rgba(85,75,150,.045)";
    rect(0, HUD_H, VIEW_W, VIEW_H, tint);

    const time = performance.now() / 1000;
    const moteColor = ["fire", "reactor"].includes(theme) ? "#ff9e52" : "#78f7e5";
    ctx.globalAlpha = 0.18;
    for (let index = 0; index < 18; index += 1) {
      const x = (index * 193 + time * (7 + index % 4) * 9) % VIEW_W;
      const y = HUD_H + ((index * 97 + Math.sin(time * 0.6 + index) * 35) % VIEW_H + VIEW_H) % VIEW_H;
      rect(x, y, index % 3 === 0 ? 3 : 2, index % 3 === 0 ? 3 : 2, moteColor);
    }
    ctx.globalAlpha = 1;

    const vignette = ctx.createRadialGradient(
      VIEW_W / 2, HUD_H + VIEW_H / 2, VIEW_H * 0.28,
      VIEW_W / 2, HUD_H + VIEW_H / 2, VIEW_W * 0.7,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,3,10,.34)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H);
  }

  function drawRoomTitle() {
    if (roomTitleTime <= 0 || paused || mapOpen || inventoryOpen || merchantOpen) return;
    const progress = roomTitleTime / 2.6;
    const alpha = Math.min(1, (1 - progress) * 4, progress * 2.5);
    ctx.globalAlpha = alpha;
    rect(342, HUD_H + 18, 340, 42, "#070b18dd");
    rect(354, HUD_H + 56, 316, 2, "#42efd4aa");
    text(roomTitle, VIEW_W / 2, HUD_H + 45, 13, "center", "#ecfff9");
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H + HUD_H);
    ctx.save();
    if (screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * screenShake,
        (Math.random() - 0.5) * screenShake,
      );
    }
    drawTiles();
    drawObjects();
    drawDepthSortedActors();
    drawWeaponEffects();
    drawParticles();
    ctx.restore();
    drawAtmosphere();
    if (screenTransition) {
      const progress = Math.min(1, screenTransition.elapsed / screenTransition.duration);
      const transitionAlpha = Math.sin(progress * Math.PI);
      rect(0, HUD_H, VIEW_W, VIEW_H, `rgba(3,5,15,${transitionAlpha * 0.36})`);
      ctx.globalAlpha = transitionAlpha * 0.55;
      for (let line = 0; line < 8; line += 1) {
        rect((line * 173 + progress * 500) % VIEW_W, HUD_H, 3, VIEW_H, "#42efd4");
      }
      ctx.globalAlpha = 1;
    }
    rect(0, 0, VIEW_W, 68, "#10121ded");
    rect(0, HUD_H - 2, VIEW_W, 2, "#42efd477");
    for (let hp = 0; hp < player.maxHp; hp += 2) {
      const heartIndex = hp / 2;
      drawHeart(15 + (heartIndex % 10) * 27, 5 + Math.floor(heartIndex / 10) * 26, player.hp > hp);
    }
    const hasMagicGear = player.inventory.htmlSword
      || LOADOUT_ORDER.some((item) => Boolean(player.inventory[item]));
    if (hasMagicGear) {
      text("MAGIC", 302, 25, 10, "left", "#42efd4");
      rect(353, 14, Math.round(106 * (player.magic / player.maxMagic)), 10, "#d52f9a");
      rect(353, 14, Math.round(106 * (player.magic / player.maxMagic) * 0.55), 3, "#ff83cf");
      if (!drawCatalogArt(ctx, "ui", "magicMeterFrame", 348, 9, 116, 20)) {
        ctx.strokeStyle = "#42efd4";
        ctx.strokeRect(350, 11, 112, 16);
      }
    }
    drawCatalogArt(ctx, "ui", "creditToken", 298, 37, 18, 18);
    text(`${player.coins}`, 320, 55, 11, "left", "#42efd4");
    drawCatalogArt(ctx, "ui", "accessKey", 388, 37, 18, 18);
    text(`${player.keys}`, 410, 55, 10, "left", "#f09bd6");
    text(roomNameAt(state.mapId, player.x, player.y).toUpperCase(), 700, 55, 9, "right", "#c4bd9e");
    const slotLabel = (item) => {
      if (!item || (item !== "bombs" && !player.inventory[item])) return "EMPTY";
      if (item === "bombs" && player.inventory.bombs <= 0) return "EMPTY";
      return itemLabel(item);
    };
    [["A · J", player.equippedSlots[0]], ["B · K", player.equippedSlots[1]]].forEach(([button, item], index) => {
      const x = 720 + index * 150;
      rect(x, 7, 140, 52, "#080b16");
      const equipped = slotLabel(item) !== "EMPTY";
      if (equipped) {
        drawCatalogArt(ctx, "items", item, x + 10, 11, 36, 36);
      }
      const frameDrawn = drawCatalogArt(
        ctx, "ui", "itemSlotFrame", x + 5, 8, 46, 46,
      );
      if (!frameDrawn) {
        ctx.strokeStyle = index ? "#f02ea5" : "#42efd4";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, 8, 46, 46);
      }
      text(button, x + 58, 23, 9, "left", index ? "#f09bd6" : "#42efd4");
      text(slotLabel(item), x + 95, 47, 9, "center", "#ecf8f6");
    });
    if (messageTime > 0) {
      rect(240, 494 + HUD_H, 480, 60, "#11131ef0");
      drawCatalogArt(ctx, "ui", "dialogueFrame", 240, 494 + HUD_H, 480, 60);
      text(message, 480, 530 + HUD_H, 13, "center", "#f2ddb0");
    }
    if (paused) {
      if (pauseTab === 0) drawPauseStatus();
      if (pauseTab === 1) drawMapOverlay();
      if (pauseTab === 2) drawLoadoutMenu();
      drawPauseTabs();
    }
    if (!paused && mapOpen) drawMapOverlay();
    if (!paused && inventoryOpen) drawLoadoutMenu();
    if (!mapOpen && state.mapId !== "overworld" && ["shadow", "void"].includes(map().theme) && !player.inventory.lantern) {
      const gradient = ctx.createRadialGradient(screenX(player.x), screenY(player.y), 55, screenX(player.x), screenY(player.y), 210);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,.94)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H);
    }
    drawRoomTitle();
    drawMerchant();
  }

  function loop(time) {
    const dt = Math.min(0.033, (time - last) / 1000 || 0);
    last = time;
    update(dt);
    draw();
    frame = requestAnimationFrame(loop);
  }
  function keydown(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
    const key = event.key.toLowerCase();
    if (paused) {
      if (key === "p" || key === "escape") paused = false;
      if (!event.repeat && key === "q") pauseTab = (pauseTab + 2) % 3;
      if (!event.repeat && key === "e") pauseTab = (pauseTab + 1) % 3;
      if (pauseTab === 2) {
        const gear = availableLoadout();
        if (gear.length && !event.repeat) {
          const columns = 3;
          if (key === "arrowright" || key === "d") loadoutCursor = (loadoutCursor + 1) % gear.length;
          if (key === "arrowleft" || key === "a") loadoutCursor = (loadoutCursor - 1 + gear.length) % gear.length;
          if (key === "arrowdown" || key === "s") loadoutCursor = (loadoutCursor + columns) % gear.length;
          if (key === "arrowup" || key === "w") loadoutCursor = (loadoutCursor - columns + gear.length) % gear.length;
          if (key === "j") {
            player.equippedSlots[0] = gear[loadoutCursor];
            save();
          }
          if (key === "k") {
            player.equippedSlots[1] = gear[loadoutCursor];
            save();
          }
        }
      }
      return;
    }
    if (inventoryOpen) {
      const gear = availableLoadout();
      if (key === "q" || key === "escape") inventoryOpen = false;
      if (gear.length && !event.repeat) {
        const columns = 3;
        if (key === "arrowright" || key === "d") loadoutCursor = (loadoutCursor + 1) % gear.length;
        if (key === "arrowleft" || key === "a") loadoutCursor = (loadoutCursor - 1 + gear.length) % gear.length;
        if (key === "arrowdown" || key === "s") loadoutCursor = (loadoutCursor + columns) % gear.length;
        if (key === "arrowup" || key === "w") loadoutCursor = (loadoutCursor - columns + gear.length) % gear.length;
        if (key === "j") {
          player.equippedSlots[0] = gear[loadoutCursor];
          announce(`${itemLabel(gear[loadoutCursor])} ASSIGNED TO SLOT A`);
          save();
        }
        if (key === "k") {
          player.equippedSlots[1] = gear[loadoutCursor];
          announce(`${itemLabel(gear[loadoutCursor])} ASSIGNED TO SLOT B`);
          save();
        }
      }
      return;
    }
    if (merchantOpen) {
      const optionCount = merchantOpen.stock.length + 1;
      if (key === "escape") merchantOpen = null;
      if (!event.repeat && (key === "arrowdown" || key === "s" || key === "arrowright" || key === "d")) {
        merchantCursor = (merchantCursor + 1) % optionCount;
      }
      if (!event.repeat && (key === "arrowup" || key === "w" || key === "arrowleft" || key === "a")) {
        merchantCursor = (merchantCursor - 1 + optionCount) % optionCount;
      }
      if (!event.repeat && (key === "l" || key === "enter" || key === " ")) {
        if (merchantCursor === merchantOpen.stock.length) merchantOpen = null;
        else buyMerchantItem(merchantCursor);
      }
      if (["1", "2", "3"].includes(key)) {
        const directIndex = Number(key) - 1;
        if (directIndex < merchantOpen.stock.length) {
          merchantCursor = directIndex;
          buyMerchantItem(directIndex);
        }
      }
      return;
    }
    if (!keys[key]) pressed[key] = true;
    keys[key] = true;
    if (key === "m" && mapOpen) { mapOpen = false; delete pressed.m; }
  }
  function keyup(event) { keys[event.key.toLowerCase()] = false; }
  function releaseAllKeys() {
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    Object.keys(pressed).forEach((key) => { delete pressed[key]; });
  }
  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);
  window.addEventListener("blur", releaseAllKeys);
  frame = requestAnimationFrame(loop);

  return {
    start() { running = true; },
    pressKey(key) {
      keydown({ key, repeat: Boolean(keys[key.toLowerCase()]), preventDefault() {} });
    },
    releaseKey(key) {
      keyup({ key });
    },
    enterDebugLab() {
      if (state.mapId === "debugLab") return;
      debugReturnPosition = { x: player.x, y: player.y };
      changeMap("debugLab", MAPS.debugLab.spawn);
      announce("TRAINING HALL · TRY WEAPONS AND ITEMS", 5);
    },
    destroy() {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", releaseAllKeys);
    },
  };
}
