import { isSolid, MAPS, TILE, tileAt } from "./world";

const VIEW_W = 960;
const VIEW_H = 576;
const ITEM_ORDER = ["boomerang", "bombs"];

export function createGame(canvas, { initialSave, onSave }) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const keys = {};
  const pressed = {};
  let running = false;
  let paused = false;
  let mapOpen = false;
  let last = 0;
  let frame;
  let camera = { x: 0, y: 0 };
  let message = "";
  let messageTime = 0;
  let boomerang = null;
  let bombs = [];

  const saved = initialSave || {};
  const state = {
    mapId: saved.mapId || "overworld",
    openedChests: saved.openedChests || {},
    killed: saved.killed || {},
    flags: saved.flags || {},
  };
  const spawn = MAPS[state.mapId]?.spawn || MAPS.overworld.spawn;
  const player = {
    x: saved.player?.x || spawn.x,
    y: saved.player?.y || spawn.y,
    dir: saved.player?.dir || "up",
    hp: saved.player?.hp || 6,
    maxHp: saved.player?.maxHp || 6,
    coins: saved.player?.coins || 0,
    keys: saved.player?.keys || 0,
    hasEmber: saved.player?.hasEmber || false,
    inventory: {
      boomerang: saved.player?.inventory?.boomerang || false,
      bombs: saved.player?.inventory?.bombs || 0,
      dungeonMap: saved.player?.inventory?.dungeonMap || false,
    },
    selectedItem: saved.player?.selectedItem || "boomerang",
    speed: 190,
    attackTime: 0,
    invincible: 0,
  };
  const enemiesByMap = {};

  function map() { return MAPS[state.mapId]; }
  function buildEnemies(mapId) {
    if (enemiesByMap[mapId]) return;
    enemiesByMap[mapId] = MAPS[mapId].enemies
      .filter(([id]) => !state.killed[id])
      .map(([id, type, tx, ty]) => ({
        id, type, x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2,
        homeX: tx * TILE + TILE / 2, homeY: ty * TILE + TILE / 2,
        hp: type === "boss" ? 14 : type === "guard" ? 4 : 2,
        phase: Math.random() * 6, hit: 0, stunned: 0,
      }));
  }
  buildEnemies(state.mapId);

  function snapshot() {
    return {
      version: 2,
      mapId: state.mapId,
      player: {
        x: player.x, y: player.y, dir: player.dir, hp: player.hp,
        maxHp: player.maxHp, coins: player.coins, keys: player.keys,
        hasEmber: player.hasEmber, inventory: player.inventory,
        selectedItem: player.selectedItem,
      },
      openedChests: state.openedChests,
      killed: state.killed,
      flags: state.flags,
    };
  }
  function save() { onSave?.(snapshot()); }
  function announce(value, seconds = 2.2) { message = value; messageTime = seconds; }
  announce(map().name.toUpperCase());

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
  function screenY(y) { return y - camera.y; }

  function solidAt(x, y) {
    return isSolid(tileAt(state.mapId, Math.floor(x / TILE), Math.floor(y / TILE), state.flags));
  }
  function canMove(x, y) {
    const r = 13;
    return !solidAt(x - r, y - r) && !solidAt(x + r, y - r)
      && !solidAt(x - r, y + r) && !solidAt(x + r, y + r);
  }

  function changeMap(mapId, position) {
    state.mapId = mapId;
    player.x = position.x;
    player.y = position.y;
    buildEnemies(mapId);
    boomerang = null;
    bombs = [];
    announce(MAPS[mapId].name.toUpperCase(), 2.6);
    save();
  }

  function reward(type) {
    if (type === "boomerang") {
      player.inventory.boomerang = true;
      player.selectedItem = "boomerang";
      announce("FOUND: ANCIENT BOOMERANG");
    } else if (type === "bombs") {
      player.inventory.bombs += 8;
      player.selectedItem = "bombs";
      announce("FOUND: 8 BOMBS");
    } else if (type === "heart") {
      player.maxHp += 2;
      player.hp = player.maxHp;
      announce("FOUND: HEART CONTAINER");
    } else if (type === "key") {
      player.keys += 1;
      announce("FOUND: SMALL KEY");
    } else if (type === "dungeonMap") {
      player.inventory.dungeonMap = true;
      announce("FOUND: DUNGEON MAP");
    }
  }

  function interact() {
    const currentMap = map();
    if (state.mapId === "overworld") {
      const entrance = currentMap.dungeonEntrance;
      if (Math.hypot(player.x - entrance.x, player.y - entrance.y) < 70) {
        changeMap("emberCrypt", MAPS.emberCrypt.spawn);
        return;
      }
    } else if (Math.hypot(player.x - currentMap.exit.x, player.y - currentMap.exit.y) < 65) {
      changeMap("overworld", { x: MAPS.overworld.dungeonEntrance.x, y: MAPS.overworld.dungeonEntrance.y + 85 });
      return;
    }

    const chest = currentMap.chests.find((entry) => {
      const [id, tx, ty] = entry;
      if (state.openedChests[id]) return false;
      if (id === "d1-heart" && enemiesByMap.emberCrypt.some((enemy) => enemy.type === "boss")) return false;
      return Math.hypot(player.x - (tx * TILE + 24), player.y - (ty * TILE + 24)) < 60;
    });
    if (chest) {
      state.openedChests[chest[0]] = true;
      reward(chest[3]);
      save();
      return;
    }

    if (player.selectedItem === "boomerang") throwBoomerang();
    if (player.selectedItem === "bombs") placeBomb();
  }

  function directionVector() {
    return {
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
      left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
    }[player.dir];
  }
  function throwBoomerang() {
    if (!player.inventory.boomerang || boomerang) {
      if (!player.inventory.boomerang) announce("YOU HAVE NOT FOUND THE BOOMERANG");
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
  function cycleItem() {
    const available = ITEM_ORDER.filter((item) => item === "bombs" || player.inventory[item]);
    const index = available.indexOf(player.selectedItem);
    player.selectedItem = available[(index + 1) % available.length] || "boomerang";
  }

  function swordStrike() {
    const dir = directionVector();
    const hitX = player.x + dir.x * 38;
    const hitY = player.y + dir.y * 38;
    enemiesByMap[state.mapId].forEach((enemy) => {
      if (Math.hypot(hitX - enemy.x, hitY - enemy.y) < (enemy.type === "boss" ? 55 : 38)) damageEnemy(enemy, 1);
    });
  }
  function damageEnemy(enemy, amount) {
    if (enemy.hit > 0) return;
    enemy.hp -= amount;
    enemy.hit = 0.22;
    if (enemy.hp <= 0) {
      state.killed[enemy.id] = true;
      player.coins += enemy.type === "boss" ? 50 : 2;
      if (enemy.type === "boss") {
        player.hasEmber = true;
        state.flags.emberCryptComplete = true;
        announce("THE EMBER GUARDIAN HAS FALLEN", 5);
      }
      save();
    }
  }

  function updateProjectiles(dt) {
    if (boomerang) {
      if (!boomerang.returning) {
        boomerang.x += boomerang.vx * dt;
        boomerang.y += boomerang.vy * dt;
        boomerang.distance += 380 * dt;
        if (boomerang.distance > 230 || solidAt(boomerang.x, boomerang.y)) boomerang.returning = true;
      } else {
        const dx = player.x - boomerang.x;
        const dy = player.y - boomerang.y;
        const distance = Math.hypot(dx, dy);
        boomerang.x += dx / distance * 470 * dt;
        boomerang.y += dy / distance * 470 * dt;
        if (distance < 24) boomerang = null;
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
        if (state.mapId === "emberCrypt" && Math.hypot(bomb.x - 3 * TILE, bomb.y - 5 * TILE) < 110) {
          state.flags.crackedWallOpen = true;
          announce("A SECRET PASSAGE OPENS");
          save();
        }
      }
    });
    bombs = bombs.filter((bomb) => bomb.timer > -0.32);
  }

  function update(dt) {
    if (!running || paused || mapOpen) return;
    player.attackTime = Math.max(0, player.attackTime - dt);
    player.invincible = Math.max(0, player.invincible - dt);
    messageTime = Math.max(0, messageTime - dt);
    let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    let dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      dx /= length; dy /= length;
      player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      const nextX = player.x + dx * player.speed * dt;
      const nextY = player.y + dy * player.speed * dt;
      if (canMove(nextX, player.y)) player.x = nextX;
      if (canMove(player.x, nextY)) player.y = nextY;
    }
    if (pressed.j) { player.attackTime = 0.2; swordStrike(); }
    if (pressed.k) interact();
    if (pressed.q) cycleItem();
    if (pressed.p) paused = true;
    if (pressed.m) mapOpen = true;

    // A small key opens the central dungeon door when approached.
    const tx = Math.floor(player.x / TILE);
    const ty = Math.floor(player.y / TILE);
    if (state.mapId === "emberCrypt" && !state.flags.dungeonDoorOpen && player.keys && ty === 9 && tx === 14) {
      player.keys -= 1;
      state.flags.dungeonDoorOpen = true;
      announce("THE LOCKED DOOR OPENS");
      save();
    }

    const enemies = enemiesByMap[state.mapId];
    enemies.forEach((enemy) => {
      enemy.hit = Math.max(0, enemy.hit - dt);
      enemy.stunned = Math.max(0, enemy.stunned - dt);
      enemy.phase += dt;
      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (!enemy.stunned && distance < 310 && distance > 0) {
        const speed = enemy.type === "bat" ? 100 : enemy.type === "boss" ? 80 : 58;
        const nx = enemy.x + (player.x - enemy.x) / distance * speed * dt;
        const ny = enemy.y + (player.y - enemy.y) / distance * speed * dt;
        if (!solidAt(nx, enemy.y)) enemy.x = nx;
        if (!solidAt(enemy.x, ny)) enemy.y = ny;
      }
      if (distance < (enemy.type === "boss" ? 43 : 29) && player.invincible <= 0) {
        player.hp -= enemy.type === "boss" ? 2 : 1;
        player.invincible = 1.1;
        if (player.hp <= 0) {
          player.hp = player.maxHp;
          changeMap("overworld", MAPS.overworld.spawn);
          announce("THE EMBER CALLS YOU HOME");
        }
      }
    });
    enemiesByMap[state.mapId] = enemies.filter((enemy) => enemy.hp > 0);
    updateProjectiles(dt);
    Object.keys(pressed).forEach((key) => delete pressed[key]);
  }

  const tileColors = {
    grass: "#4d7b48", grassAlt: "#477344", forest: "#284f31", water: "#315d72",
    bridge: "#8b693f", mountain: "#555866", stone: "#6a655c", village: "#756044",
    dungeonFloor: "#303249", dungeonFloorAlt: "#2b2d43", wall: "#17192b",
    lockedDoor: "#8f713b", crackedWall: "#443c43", void: "#080910",
  };
  function drawTiles() {
    const startX = Math.floor(camera.x / TILE);
    const startY = Math.floor(camera.y / TILE);
    const endX = Math.ceil((camera.x + VIEW_W) / TILE);
    const endY = Math.ceil((camera.y + VIEW_H) / TILE);
    for (let ty = startY; ty <= endY; ty += 1) {
      for (let tx = startX; tx <= endX; tx += 1) {
        const tile = tileAt(state.mapId, tx, ty, state.flags);
        const x = tx * TILE - camera.x;
        const y = ty * TILE - camera.y;
        rect(x, y, TILE + 1, TILE + 1, tileColors[tile] || "#222");
        if (tile === "grass" || tile === "grassAlt") {
          rect(x + 11, y + 13, 3, 6, "#6d9655");
          rect(x + 34, y + 31, 3, 5, "#355f38");
        }
        if (tile === "water") {
          rect(x + 8, y + 15, 25, 3, "#5c8da0");
          rect(x + 20, y + 34, 20, 2, "#244c63");
        }
        if (tile === "forest") {
          rect(x + 5, y + 5, 38, 38, "#1e412a");
          rect(x + 12, y + 2, 25, 30, "#37683a");
        }
      }
    }
  }
  function drawPlayer() {
    const x = screenX(player.x);
    const y = screenY(player.y);
    if (player.invincible > 0 && Math.floor(player.invincible * 12) % 2) return;
    rect(x - 11, y - 14, 22, 29, "#315d68");
    rect(x - 8, y - 20, 16, 12, "#c9ad7e");
    rect(x - 6, y - 23, 12, 7, "#4c2e25");
    if (player.attackTime > 0) {
      const dir = directionVector();
      rect(x + dir.x * 28 - (dir.y ? 2 : 14), y + dir.y * 28 - (dir.x ? 2 : 14), dir.y ? 4 : 28, dir.x ? 4 : 28, "#f4e5b1");
    }
  }
  function drawEnemy(enemy) {
    if (enemy.hit > 0 && Math.floor(enemy.hit * 15) % 2) return;
    const x = screenX(enemy.x);
    const y = screenY(enemy.y);
    const size = enemy.type === "boss" ? 58 : 30;
    const colors = { slime: "#9ac653", bat: "#775b89", guard: "#9d554f", boss: "#7b354b" };
    rect(x - size / 2, y - size / 2, size, size, enemy.stunned ? "#d9c45d" : colors[enemy.type]);
    rect(x - 7, y - 5, 4, 5, "#171820");
    rect(x + 4, y - 5, 4, 5, "#171820");
  }
  function drawObjects() {
    const currentMap = map();
    currentMap.chests.forEach(([id, tx, ty]) => {
      const x = screenX(tx * TILE + 24);
      const y = screenY(ty * TILE + 24);
      rect(x - 17, y - 12, 34, 25, state.openedChests[id] ? "#4b3525" : "#b47a35");
      if (!state.openedChests[id]) rect(x - 3, y - 7, 7, 12, "#e6c05d");
    });
    if (state.mapId === "overworld") {
      const entrance = currentMap.dungeonEntrance;
      const x = screenX(entrance.x);
      const y = screenY(entrance.y);
      rect(x - 50, y - 32, 100, 64, "#222337");
      rect(x - 25, y - 18, 50, 50, "#080910");
      text("K ENTER", x, y + 50, 10, "center", "#d6bb70");
    } else {
      const exit = currentMap.exit;
      text("▼ EXIT", screenX(exit.x), screenY(exit.y), 10, "center", "#d6bb70");
    }
    bombs.forEach((bomb) => {
      const x = screenX(bomb.x);
      const y = screenY(bomb.y);
      if (bomb.exploded) {
        ctx.fillStyle = "#f4a33b99";
        ctx.beginPath(); ctx.arc(x, y, 95, 0, Math.PI * 2); ctx.fill();
      } else {
        rect(x - 10, y - 10, 20, 20, "#171722");
        rect(x + 4, y - 15, 3, 8, "#efb950");
      }
    });
    if (boomerang) {
      const x = screenX(boomerang.x);
      const y = screenY(boomerang.y);
      rect(x - 12, y - 9, 7, 18, "#d9b353");
      rect(x - 5, y + 3, 17, 7, "#d9b353");
    }
  }

  function drawMapOverlay() {
    rect(120, 70, 720, 440, "#10121ff5");
    text(state.mapId === "overworld" ? "MAP OF EMBERFALL" : "EMBER CRYPT", 480, 115, 22, "center", "#f0c75e");
    if (state.mapId === "overworld") {
      rect(215, 145, 530, 300, "#355c3b");
      rect(270, 210, 75, 180, "#315d72");
      rect(620, 175, 65, 170, "#315d72");
      rect(425, 150, 110, 60, "#5b5d68");
      const px = 215 + player.x / (map().width * TILE) * 530;
      const py = 145 + player.y / (map().height * TILE) * 300;
      text("YOU", px, py, 10, "center", "#fff");
    } else if (player.inventory.dungeonMap) {
      rect(300, 145, 360, 300, "#303249");
      rect(310, 155, 340, 75, "#444761");
      rect(310, 260, 340, 75, "#444761");
      rect(310, 365, 340, 70, "#444761");
      text("YOU", 310 + player.x / (map().width * TILE) * 340, 155 + player.y / (map().height * TILE) * 280, 10, "center");
    } else text("FIND THE DUNGEON MAP", 480, 290, 14, "center", "#8c8c8c");
    text("M  CLOSE MAP", 480, 485, 11, "center", "#aaa99f");
  }

  function draw() {
    const worldWidth = map().width * TILE;
    const worldHeight = map().height * TILE;
    camera.x = Math.max(0, Math.min(worldWidth - VIEW_W, player.x - VIEW_W / 2));
    camera.y = Math.max(0, Math.min(worldHeight - VIEW_H, player.y - VIEW_H / 2));
    drawTiles();
    drawObjects();
    enemiesByMap[state.mapId].forEach(drawEnemy);
    drawPlayer();
    rect(0, 0, VIEW_W, 42, "#10121ded");
    text(`♥ ${player.hp}/${player.maxHp}`, 18, 27, 13, "left", "#ef7777");
    text(`◆ ${player.coins}`, 135, 27, 13, "left", "#f0c95c");
    text(`KEY ${player.keys}`, 235, 27, 12, "left", "#e7d49b");
    const item = player.selectedItem === "bombs" ? `BOMBS ${player.inventory.bombs}` : (player.inventory.boomerang ? "BOOMERANG" : "EMPTY");
    text(`K ${item}`, 335, 27, 12, "left", "#c6d4df");
    text(map().name.toUpperCase(), 942, 26, 11, "right", "#c4bd9e");
    if (messageTime > 0) {
      rect(250, 500, 460, 48, "#11131ef0");
      text(message, 480, 530, 13, "center", "#f2ddb0");
    }
    if (paused) {
      rect(180, 100, 600, 360, "#11131ff5");
      text("JOURNEY PAUSED", 480, 215, 23, "center", "#f0c75e");
      text("Q  CHANGE ITEM", 480, 275, 12, "center");
      text("P  RETURN TO THE VALE", 480, 325, 12, "center");
    }
    if (mapOpen) drawMapOverlay();
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
    if (!keys[key]) pressed[key] = true;
    keys[key] = true;
    if (key === "p" && paused) { paused = false; delete pressed.p; }
    if (key === "m" && mapOpen) { mapOpen = false; delete pressed.m; }
  }
  function keyup(event) { keys[event.key.toLowerCase()] = false; }
  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);
  frame = requestAnimationFrame(loop);

  return {
    start() { running = true; },
    destroy() {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
    },
  };
}
