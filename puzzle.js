/* eslint no-unused-vars: ["off"] */

const puzzles = [
  `
  0, 3, 0, 0, 0, 0, 0, 5, 0,
  0, 0, 8, 0, 9, 1, 3, 0, 0,
  6, 0, 0, 4, 0, 0, 7, 0, 0,
  0, 0, 3, 8, 1, 0, 0, 0, 0,
  0, 0, 6, 0, 0, 0, 2, 0, 0,
  0, 0, 0, 0, 3, 4, 8, 0, 0,
  0, 0, 1, 0, 0, 8, 0, 0, 9,
  0, 0, 4, 1, 2, 0, 6, 0, 0,
  0, 6, 0, 0, 0, 0, 0, 4, 0
  `
].map(puzzle => puzzle
  .split('\n')
  .filter((line) => line.length) // Remove any decorative empty lines
  .map((line) => line
    .replace(/[^\d]/g, '') // Remove any decorative characters
    .split('')
    .map((d) => parseInt(d))
  ))

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
  let i = random(1, 9)
  let j = random(1, 9)
  for (let p = 0; p < board.length; p++) {
    for (let k = 0; k < board[p].length; k++) {
      if (board[p][k] === i) { board[p][k] = j }
      if (board[p][k] === j) { board[p][k] = i }
    }
  }
  return board
}
const random = (i, j) => Math.floor(i + Math.random() * (j - i))

const shuffle = (board) => {
  for (let p = 0; p < board.length; p += 3) {
    rowSwap(random(p, p + 3), random(p, p + 3), board)
    colSwap(random(p, p + 3), random(p, p + 3), board)
  }
  for (let m = 0; m < random(0, 9); m++) {
    remap(board)
  }
}
