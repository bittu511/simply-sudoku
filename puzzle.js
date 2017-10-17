/* eslint no-unused-vars: ["off"] */

const puzzle = (string) => string[0]
  .split('\n')
  .filter((line) => line.length) // Remove any decorative empty lines
  .map((line) => line
    .replace(/[^\d]/g, '') // Remove any decorative characters
    .split('')
    .map((d) => parseInt(d))
  ).slice(0, -1)

const puzzles = { // http://elmo.sbs.arizona.edu/sandiway/sudoku/examples.html
  easy: {
    solved: puzzle`
      4, 3, 5, 2, 6, 9, 7, 8, 1,
      6, 8, 2, 5, 7, 7, 4, 9, 3,
      1, 9, 7, 8, 3, 4, 5, 6, 2,
      8, 2, 6, 1, 9, 5, 3, 4, 7,
      3, 7, 4, 6, 8, 2, 9, 1, 5,
      9, 5, 1, 7, 4, 3, 6, 2, 8,
      5, 1, 9, 3, 2, 6, 8, 7, 4,
      2, 4, 8, 9, 5, 7, 1, 3, 6,
      7, 6, 3, 4, 1, 8, 2, 5, 9,
    `,
    unsolved: puzzle`
      0, 0, 0, 2, 6, 0, 7, 0, 1,
      6, 8, 0, 0, 7, 0, 0, 9, 0,
      1, 9, 0, 0, 0, 4, 5, 0, 0,
      8, 2, 0, 1, 0, 0, 0, 4, 0,
      0, 0, 4, 6, 0, 2, 9, 0, 0,
      0, 5, 0, 0, 0, 3, 0, 2, 8,
      0, 0, 9, 3, 0, 0, 0, 7, 4,
      0, 4, 0, 0, 5, 0, 0, 3, 6,
      7, 0, 3, 0, 1, 8, 0, 0, 0,
    `
  },
  medium: {
    solved: puzzle`
      1, 2, 3, 6, 7, 8, 9, 4, 5,
      5, 8, 4, 2, 3, 9, 7, 6, 1,
      9, 6, 7, 1, 4, 5, 3, 2, 8,
      3, 7, 2, 4, 6, 1, 5, 8, 9,
      6, 9, 1, 5, 8, 3, 2, 7, 4,
      4, 5, 8, 7, 9, 2, 6, 1, 3,
      8, 3, 6, 9, 2, 4, 1, 5, 7,
      2, 1, 9, 8, 5, 7, 4, 3, 6,
      7, 4, 5, 3, 1, 6, 8, 9, 2,
    `,
    unsolved: puzzle`
      0, 2, 0, 6, 0, 8, 0, 0, 0,
      5, 8, 0, 0, 0, 9, 7, 0, 0,
      0, 0, 0, 0, 4, 0, 0, 0, 0,
      3, 7, 0, 0, 0, 0, 5, 0, 0,
      6, 0, 0, 0, 0, 0, 0, 0, 4,
      0, 0, 8, 0, 0, 0, 0, 1, 3,
      0, 0, 0, 0, 2, 0, 0, 0, 0,
      0, 0, 9, 8, 0, 0, 0, 3, 6,
      0, 0, 0, 3, 0, 6, 0, 9, 0,
    `
  },
  hard: {
    solved: puzzle`
      5, 8, 1, 6, 7, 2, 4, 3, 9,
      7, 9, 2, 8, 4, 3, 6, 5, 1,
      3, 6, 4, 5, 9, 1, 7, 8, 2,
      4, 3, 8, 9, 5, 7, 2, 1, 6,
      2, 5, 6, 1, 8, 4, 9, 7, 3,
      1, 7, 9, 3, 2, 6, 8, 4, 5,
      8, 4, 5, 2, 1, 9, 3, 6, 7,
      9, 1, 3, 7, 6, 8, 5, 2, 4,
      6, 2, 7, 4, 3, 5, 1, 9, 8,
    `,
    unsolved: puzzle`
      0, 0, 0, 6, 0, 0, 4, 0, 0,
      7, 0, 0, 0, 0, 3, 6, 0, 0,
      0, 0, 0, 0, 9, 1, 0, 8, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 5, 0, 1, 8, 0, 0, 0, 3,
      0, 0, 0, 3, 0, 6, 0, 4, 5,
      0, 4, 0, 2, 0, 0, 0, 6, 0,
      9, 0, 3, 0, 0, 0, 0, 0, 0,
      0, 2, 0, 0, 0, 0, 1, 0, 0,
    `
  }
}

const clone = a => Array.isArray(a) ? a.slice().map(clone) : a

const rowSwap = (i, j, board) => {
  const temp = board[i]
  board[i] = board[j]
  board[j] = temp
  return board
}

const colSwap = (j, k, board) => {
  for (let i = 0; i < board.length; i++) {
    let temp = board[i][j]
    board[i][j] = board[i][k]
    board[i][k] = temp
  }
  return board
}

const remap = (board) => {
  let i = random(1, 10)
  let j = random(1, 10)
  for (let p = 0; p < board.length; p++) {
    for (let k = 0; k < board[p].length; k++) {
      // TODO: OBVIOUS BUG IS OBVIOUS↓
      if (board[p][k] === i) { board[p][k] = j }
      if (board[p][k] === j) { board[p][k] = i }
    }
  }
  return board
}
const random = (i, j) => Math.floor(i + Math.random() * (j - i))

const shuffle = (board) => {
  board = clone(board)
  for (let p = 0; p < board.length; p += 3) {
    rowSwap(random(p, p + 3), random(p, p + 3), board)
    colSwap(random(p, p + 3), random(p, p + 3), board)
  }
  // TODO: Shuffle supercolumns/rows too
  // TODO: Rotate/flip the board for good measure
  for (let m = 0; m < random(0, 9); m++) { // TODO: Often looks similar.
    remap(board)
  }
  return board
}
