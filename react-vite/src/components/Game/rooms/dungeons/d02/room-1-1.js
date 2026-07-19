export default {
  id: "d02:1,1", variant: 0, wallRects: [[2, 2, 3, 1], [11, 2, 3, 1], [2, 7, 4, 1], [10, 7, 4, 1]],
  floor: [
    ".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",
    ".. rf rf rf rf rf rf rf rf rf rf rf rf rf rf ..",
    ".. rf rw rw rw rf rf rf rf rf rf rw rw rw rf ..",
    ".. rf rf rf rf rf rf rf rf rf rf rf rf rf rf ..",
    ".. rf rf rf rf rf rf rf rf rf rf rf rf rf rf ..",
    ".. rf rf rf rf rf rf rf rf rf rf rf rf rf rf ..",
    ".. rf rf rf rf rf rf rf rf rf rf rf rf rf rf ..",
    ".. rf rw rw rw rw rf rf rf rf rw rw rw rw rf ..",
    ".. rf rf rf rf rf rf rf rf rf rf rf rf rf rf ..",
    ".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",
  ],
  assets: [
    { type: "dungeonStatue", x: 3, y: 4 },
    { type: "dungeonSwitch", x: 12, y: 4 },
    { type: "dungeonBarrier", x: 7, y: 6, solid: false },
    { type: "dungeonLockedDoor", x: 7, y: 1, solid: false },
  ],
};
