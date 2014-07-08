module.exports = Object.freeze({
  FLOOR: {
    name: 'FLOOR',
    tileIndex: 4,
    walkable: true,
    symbol: '.'
  },
  WALL: {
    name: 'WALL',
    tileIndex: 3,
    walkable: false,
    symbol: '#'
  },
  ENTRY: {
    name: 'ENTRY',
    tileIndex: 2,
    walkable: true,
    symbol: '^'
  },
  EXIT: {
    name: 'EXIT',
    tileIndex: 1,
    walkable: true,
    symbol: 'v'
  },
  TREASURE: {
    name: 'TREASURE',
    tileIndex: 0,
    walkable: true,
    symbol: '†'
  },
  FILLED: {
    name: 'FILLED',
    tileIndex: -1,
    walkable: null
  }
});

