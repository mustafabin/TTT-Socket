const createInitialBoard = () =>
  Array(9)
    .fill(null)
    .map(() =>
      Array(3)
        .fill(null)
        .map(() => Array(3).fill(""))
    )

const createInitialBoardStats = () => {
  const stats = new Map()
  for (let i = 0; i < 9; i++) {
    stats.set(i, { winner: "", draw: false })
  }
  return stats
}
const checkDraw = (board: Array<Array<string>>) => {
  return board.every((row) => row.every((cell) => cell !== ""))
}

const convertMapToArray = (mapToConvert: Map<number, { winner: string; draw: boolean }>) => {
  let convertedArray = Array(3)
    .fill(null)
    .map(() => Array(3).fill(null))
  mapToConvert.forEach((value, key) => {
    let row = Math.floor(key / 3)
    let col = key % 3
    convertedArray[row][col] = value.draw ? "-" : value.winner
  })
  return convertedArray
}

const checkWinner = (board: Array<Array<string>>, currentMove: Array<number>, player: string) => {
  let [currentRow, currentCol] = currentMove
  // check rows and columns
  if (board[currentRow].every((cel: string) => cel === player)) return player
  if (board.every((row: Array<string>) => row[currentCol] === player)) return player
  // check diagonals
  if (currentRow === currentCol && board.every((row: Array<string>, col: number) => row[col] === player)) return player
  if (currentRow + currentCol === 2 && board.every((row: Array<string>, col: number) => row[2 - col] === player)) return player
  // no winner
  return ""
}

export { createInitialBoard, createInitialBoardStats, checkDraw, convertMapToArray, checkWinner }
