export type Player = "X" | "O"
export type GameState = string[][]
export type HardGameState = string[][][]
export type Coords = [number, number]
export type ResultType = {
  status: string
  error: string
  winner: string
  board: GameState
  isDraw: boolean
  player: Player | undefined
  currentTurn: Player
}
export type roomTypes = "normal" | "hard"
