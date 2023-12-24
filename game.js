let checkDraw = (board) => {
  return board.every((row) => row.every((cell) => cell !== ""))
}
let checkWinner = (board, currentMove, currentTurn) => {
  let [currentRow, currentCol] = currentMove

  // check rows and columns
  if (board[currentRow].every((cel) => cel === currentTurn)) return currentTurn
  if (board.every((row) => row[currentCol] === currentTurn)) return currentTurn

  // check diagonals
  if (currentRow === currentCol && board.every((row, col) => row[col] === currentTurn)) return currentTurn
  if (currentRow + currentCol === 2 && board.every((row, col) => row[2 - col] === currentTurn)) return currentTurn

  // no winner
  return ""
}
let playMove = (currentBoard, row, col, player) => {
  if (currentBoard[row][col] === "") {
    currentBoard[row][col] = player
    let currentWinner = checkWinner(currentBoard, [row, col], player)
    player = player === "X" ? "O" : "X"
    return { winner: currentWinner, board: currentBoard, isDraw: checkDraw(currentBoard), turn: player }
  } else {
    return false
  }
}

export default playMove
