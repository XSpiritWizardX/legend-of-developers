export default {
  id: "d03:1,1", variant: 0, wallRects: [[2, 2, 4, 1], [10, 2, 4, 1], [3, 7, 2, 1], [11, 7, 2, 1]],
  floor: [
    ".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",
    ".. sf sf sf sf sf sf sf sf sf sf sf sf sf sf ..",
    ".. sf sv sv sv sv sf sf sf sf sv sv sv sv sf ..",
    ".. sf sf sf sf sf sf sf sf sf sf sf sf sf sf ..",
    ".. sf sf sf sf sf sf sf sf sf sf sf sf sf sf ..",
    ".. sf sf sf sf sf sf sf sf sf sf sf sf sf sf ..",
    ".. sf sf sf sf sf sf sf sf sf sf sf sf sf sf ..",
    ".. sf sf sv sv sf sf sf sf sf sf sv sv sf sf ..",
    ".. sf sf sf sf sf sf sf sf sf sf sf sf sf sf ..",
    ".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",
  ],
  assets: [
    { type: "dungeonStatue", x: 3, y: 4 },
    { type: "dungeonSwitch", x: 12, y: 4 },
    { type: "dungeonBarrier", x: 7, y: 6, solid: false },
    { type: "dungeonLockedDoor", x: 7, y: 1, solid: false },
  ],
};
