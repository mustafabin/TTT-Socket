import { ServerWebSocket } from "bun"
import { Coords, GameState, HardGameState, Player, ResultType } from "./types"
import { createInitialBoard, createInitialBoardStats } from "./utils"
class NormalRoom {
  private gameState: GameState
  private currentTurn: Player
  private playerConnections: Map<ServerWebSocket<any>, Player>
  private winner: Player | ""
  private isDraw: boolean
  private result: ResultType
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
    this.result = {
      status: "",
      error: "",
      winner: this.winner,
      board: this.gameState,
      isDraw: this.isDraw,
      currentTurn: this.currentTurn,
      player: undefined,
    }
  }
  private checkDraw() {
    this.isDraw = this.gameState.every((row) => row.every((cell) => cell !== ""))
    this.result.isDraw = this.isDraw
  }
  private checkWinner(currentMove: Coords) {
    let [currentRow, currentCol] = currentMove

    // check rows and columns
    if (this.gameState[currentRow].every((cel) => cel === this.currentTurn)) this.winner = this.currentTurn
    if (this.gameState.every((row) => row[currentCol] === this.currentTurn)) this.winner = this.currentTurn

    // check diagonals
    if (currentRow === currentCol && this.gameState.every((row, col) => row[col] === this.currentTurn)) this.winner = this.currentTurn
    if (currentRow + currentCol === 2 && this.gameState.every((row, col) => row[2 - col] === this.currentTurn))
      this.winner = this.currentTurn

    if (this.winner !== "") return (this.result.winner = this.winner)
    // no winner
    this.currentTurn = this.currentTurn === "X" ? "O" : "X"
    this.result.currentTurn = this.currentTurn
    this.checkDraw()
  }
  playMove(row: number, col: number, ws: ServerWebSocket<any>): ResultType {
    if (this.winner !== "" || this.isDraw) return { ...this.result, status: "error", error: "Game Is Over" }
    let player = this.playerConnections.get(ws)
    this.result.player = player
    if (!(player !== undefined && player === this.currentTurn && this.gameState[row][col] === ""))
      return { ...this.result, status: "error", error: "Invalid Move" }
    this.gameState[row][col] = player
    this.checkWinner([row, col])
    this.result.status = "update"
    return this.result
  }
  getResult(ws: ServerWebSocket<any>) {
    this.result = {
      ...this.result,
      status: "assign",
      player: this.playerConnections.get(ws),
    }
    return this.result
  }
  resetGame() {
    // ! if there not a winner or a draw then the game isnt over
    if (!(this.winner !== "" || this.isDraw)) return { ...this.result, status: "error", error: "Game Is Not Over" }
    this.gameState = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]
    this.currentTurn = "X"
    this.winner = ""
    this.isDraw = false
    this.result = {
      status: "assign",
      error: "",
      winner: this.winner,
      board: this.gameState,
      isDraw: this.isDraw,
      currentTurn: this.currentTurn,
      player: undefined,
    }
    //* swaping players and sending the result
    this.playerConnections.forEach((player, ws) => {
      let newPlayer: Player = player === "X" ? "O" : "X"
      this.playerConnections.set(ws, newPlayer)
      this.result.player = newPlayer
      ws.send(JSON.stringify(this.result))
    })
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
class HardRoom {
  private gameState: HardGameState
  private currentTurn: Player
  private playerConnections: Map<ServerWebSocket<any>, Player>
  private winner: Player | ""
  private isDraw: boolean
  private result: ResultType
  private focusedGrid:number
  private gameBoardStats: Map<number, { winner: string; draw: boolean }>
  constructor() {
    this.gameState = createInitialBoard()
    this.currentTurn = "X"
    this.playerConnections = new Map()
    this.winner = ""
    this.isDraw = false
    this.focusedGrid = -1
    this.gameBoardStats = createInitialBoardStats()
    this.result = {
      status: "",
      error: "",
      winner: this.winner,
      board: this.gameState,
      isDraw: this.isDraw,
      currentTurn: this.currentTurn,
      focusedGrid: this.focusedGrid,
      gameBoardStatsArray: Array.from(this.gameBoardStats.entries()),
      player: undefined,
    }
  }

  playMove(row: number, col: number, ws: ServerWebSocket<any>, gridIndex: number = -1): ResultType {
    if (this.winner !== "" || this.isDraw) return { ...this.result, status: "error", error: "Game Is Over" }
    let player = this.playerConnections.get(ws)
    this.result.player = player
    // ! more chhecks for hard mode
    if (!(player !== undefined && player === this.currentTurn && this.gameState[gridIndex][row][col] === ""))
      return { ...this.result, status: "error", error: "Invalid Move" }

    this.gameState[gridIndex][row][col] = player
    // check winner
    this.result.status = "update"
    this.currentTurn = this.currentTurn === "X" ? "O" : "X"
    this.result.currentTurn = this.currentTurn
    return this.result
  }
  getResult(ws: ServerWebSocket<any>) {
    this.result = {
      ...this.result,
      status: "assign",
      player: this.playerConnections.get(ws),
    }
    return this.result
  }
  resetGame() {
    if (!(this.winner !== "" || this.isDraw)) return { ...this.result, status: "error", error: "Game Is Not Over" }
    this.gameState = createInitialBoard()
    this.currentTurn = "X"
    this.winner = ""
    this.isDraw = false
    this.result = {
      status: "assign",
      error: "",
      winner: this.winner,
      board: this.gameState,
      isDraw: this.isDraw,
      currentTurn: this.currentTurn,
      player: undefined,
    }
    //* swaping players and sending the result
    this.playerConnections.forEach((player, ws) => {
      let newPlayer: Player = player === "X" ? "O" : "X"
      this.playerConnections.set(ws, newPlayer)
      this.result.player = newPlayer
      ws.send(JSON.stringify(this.result))
    })
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
export { NormalRoom, HardRoom }
