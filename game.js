class NormalRoom {
  constructor() {
    ;(this.gameState = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]),
      (this.currentTurn = "X"),
      (this.playerConnections = new Map())
  }
  checkDraw = (board) => {
    return board.every((row) => row.every((cell) => cell !== ""))
  }
  checkWinner = (currentMove) => {
    let [currentRow, currentCol] = currentMove

    // check rows and columns
    if (this.gameState[currentRow].every((cel) => cel === this.currentTurn)) return this.currentTurn
    if (this.gameState.every((row) => row[currentCol] === this.currentTurn)) return this.currentTurn

    // check diagonals
    if (currentRow === currentCol && this.gameState.every((row, col) => row[col] === this.currentTurn)) return this.currentTurn
    if (currentRow + currentCol === 2 && this.gameState.every((row, col) => row[2 - col] === this.currentTurn)) return this.currentTurn

    // no winner
    return ""
  }
  playMove = (row, col, player) => {
    if (this.gameState[row][col] === "") {
      this.gameState[row][col] = player
      let currentWinner = this.checkWinner([row, col], player)
      this.currentTurn = this.currentTurn === "X" ? "O" : "X"
      return { winner: currentWinner, board: this.gameState, isDraw: this.checkDraw(this.gameState), turn: this.currentTurn }
    } else {
      return false
    }
  }
  clearBoard = () => {
    ;(this.gameState = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]),
      (this.currentTurn = "X")
  }
  assignPlayer(ws) {
    if (!ws) {
      // throw error since no ws
      return false
    }
    let isPlayerXAssigned = false
    let isPlayerOAssigned = false

    for (let [_, player] of this.playerConnections) {
      if (player === "X") isPlayerXAssigned = true
      else if (player === "O") isPlayerOAssigned = true

      // if both players are assigned break
      if (isPlayerXAssigned && isPlayerOAssigned) break
    }

    if (!isPlayerXAssigned) {
      this.playerConnections.set(ws, "X")
      return "X"
    }

    if (!isPlayerOAssigned) {
      this.playerConnections.set(ws, "O")
      return "O"
    }
    return false
  }
  removePlayer(ws) {
    this.playerConnections.delete(ws)
  }
}

export default NormalRoom
