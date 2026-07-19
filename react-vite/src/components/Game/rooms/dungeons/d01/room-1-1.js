export default {
  id: "d01:1,1", variant: 0,
  wallRects: [[2, 2, 4, 1], [10, 2, 4, 1], [2, 7, 3, 1], [11, 7, 3, 1]],
  floor: [
    ".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",
    ".. mf mf mf mf mf mf mf mf mf mf mf mf mf mf ..",
    ".. mf mw mw mw mw mf mf mf mf mw mw mw mw mf ..",
    ".. mf mf mf mf mf mf mf mf mf mf mf mf mf mf ..",
    ".. mf mf mf mf mf mf mf mf mf mf mf mf mf mf ..",
    ".. mf mf mf mf mf mf mf mf mf mf mf mf mf mf ..",
    ".. mf mf mf mf mf mf mf mf mf mf mf mf mf mf ..",
    ".. mf mw mw mw mf mf mf mf mf mf mw mw mw mf ..",
    ".. mf mf mf mf mf mf mf mf mf mf mf mf mf mf ..",
    ".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",
  ],
  assets: [
    { type: "dungeonStatue", x: 3, y: 4 },
    { type: "dungeonSwitch", x: 12, y: 4 },
    { type: "dungeonBarrier", x: 7, y: 6, solid: false },
    { type: "dungeonLockedDoor", x: 7, y: 1, solid: false },
  ],
};
