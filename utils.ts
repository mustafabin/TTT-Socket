import { ServerWebSocket } from "bun"
import RoomManager from "./roomManager"
import { ResultType } from "./types"

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
function handleGameMessage(ws: ServerWebSocket<any>, roomID: string, actionType: string, data: any, roomManager: RoomManager) {
  let currentRoom = roomManager.getRoom(roomID)
  if (!currentRoom) return ws.send(JSON.stringify({ status: "error", error: "Room not found" }))
  switch (actionType) {
    case "move":
      let coords = data?.coords
      console.log(`Message received: ${coords} Room: ${roomID}`)
      let moveResult = currentRoom.playMove(coords[0], coords[1], ws)
      publishToRoom(ws, roomID, moveResult)
      break
    case "reset":
      console.log(`reset requested from room: ${roomID}}`)
      currentRoom.resetGame()
      break
    default:
      ws.send(JSON.stringify({ status: "error", error: "Invalid action" }))
      break
  }
}

function publishToRoom(ws: ServerWebSocket<any>, roomID: string, data: ResultType) {
  let response = JSON.stringify(data)
  if (data.error) {
    ws.send(response)
  } else {
    ws.send(response)
    ws.publish(roomID, response)
  }
}
function JSONResponse(data: Object, status: number) {
  const res = new Response(JSON.stringify(data), { status })
  res.headers.set("Access-Control-Allow-Origin", "*")
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  return res
}
export {
  createInitialBoard,
  createInitialBoardStats,
  checkDraw,
  convertMapToArray,
  checkWinner,
  handleGameMessage,
  publishToRoom,
  JSONResponse,
}
