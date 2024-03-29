export type Player = "X" | "O"
export type GameState = string[][]
export type HardGameState = any[][][]
export type Coords = [number, number]
export type ResultType = {
  status: "" | "error" | "update" | "chat" | "assign"
  error: string
  winner: string
  board: GameState | HardGameState
  isDraw: boolean
  player: Player | undefined
  currentTurn: Player
  focusedGrid?: number
  gameBoardStatsArray?: [
    number,
    {
      winner: string
      draw: boolean
    }
  ][]
  activeGrid?: number
}
export type roomTypes = "normal" | "hard"
