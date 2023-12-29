import { ServerWebSocket } from "bun"

type Player = "X" | "O"
type GameState = string[][]
type HardGameState = string[][][]
type Coords = [number, number]
type ResultType = {
  status: string
  error: string
  winner: string
  board: GameState
  isDraw: boolean
  player: Player | undefined
  currentTurn: Player
}
class NormalRoom {
  private gameState: GameState
  private currentTurn: Player
  private playerConnections: Map<ServerWebSocket<any>, Player>
  private winner: Player | ""
  private isDraw: boolean
  constructor() {
    this.gameState = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]
    this.currentTurn = "X"
    this.playerConnections = new Map()
    this.winner = ""
    this.isDraw = false
  }
  private checkDraw = () => {
    this.isDraw = this.gameState.every((row) => row.every((cell) => cell !== ""))
  }
  private checkWinner = (currentMove: Coords) => {
    let [currentRow, currentCol] = currentMove

    // check rows and columns
    if (this.gameState[currentRow].every((cel) => cel === this.currentTurn)) this.winner = this.currentTurn
    if (this.gameState.every((row) => row[currentCol] === this.currentTurn)) this.winner = this.currentTurn

    // check diagonals
    if (currentRow === currentCol && this.gameState.every((row, col) => row[col] === this.currentTurn)) this.winner = this.currentTurn
    if (currentRow + currentCol === 2 && this.gameState.every((row, col) => row[2 - col] === this.currentTurn)) this.winner = this.currentTurn

    // no winner
    this.currentTurn = this.currentTurn === "X" ? "O" : "X"
    this.checkDraw()
  }
  playMove = (row: number, col: number, ws: ServerWebSocket<any>): ResultType=> {
    let player = this.playerConnections.get(ws)
    let result: ResultType = {
      status: "error",
      error: "Invalid Move",
      winner: this.winner,
      board: this.gameState,
      isDraw: this.isDraw,
      currentTurn: this.currentTurn,
      player,
    }
    // ! if any of these conditions dont pass return error
    if (!(player !== undefined && player === this.currentTurn && this.gameState[row][col] === "")) return result
    result.error = ""
    this.gameState[row][col] = player
    this.checkWinner([row, col])
    return { ...result, status: "success" }
  }
  clearBoard = () => {
    this.gameState = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]
    this.currentTurn = "X"
  }
  assignPlayer(ws: ServerWebSocket<any>) {
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
  removePlayer(ws: ServerWebSocket<any>) {
    this.playerConnections.delete(ws)
  }
}
class HardRoom extends NormalRoom{
}
export { NormalRoom, HardRoom }
