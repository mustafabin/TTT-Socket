import { ServerWebSocket } from "bun"
import RoomManager from "./roomManager"
import { JSONResponse, handleGameMessage } from "./utils"
import { roomTypes } from "./types"
const roomManager = new RoomManager()
const port = 3030
const server = Bun.serve({
  port,
  fetch(request) {
    try {
      return handleRequest(request)
    } catch (error) {
      return JSONResponse({ error: "Server error" }, 500)
    }
  },
  websocket: {
    // ! Main websocket logic
    message(ws: ServerWebSocket<any>, data: string) {
      let roomID = String(ws.data.roomID)
      let parsedData = JSON.parse(data)
      switch (parsedData?.messageType) {
        case "game":
          handleGameMessage(ws, roomID, parsedData?.actionType, parsedData, roomManager)
          break
        case "chat":
          break
        default:
          ws.send(JSON.stringify({ status: "error", error: "Invalid message type" }))
          break
      }
    },
    // ! End of main websocket logic
    close(ws, code, message) {
      let roomID = String(ws.data.roomID)
      // ! disconnect player from room
      roomManager.removePlayer(ws, roomID)
      ws.publish(roomID, JSON.stringify({ status: "user disconnected" }))
      ws.unsubscribe(roomID)
      console.log(`Socket closed - code: ${code} message: ${message}`)
    },
    open(ws) {
      let roomID = String(ws.data.roomID)
      // ! connect player to room
      let player = roomManager.assignPlayer(ws, roomID)
      let currentResult = roomManager.getRoom(roomID)?.getResult(ws)
      let response = JSON.stringify({ status: "joined", player })
      ws.subscribe(roomID)
      ws.publish(roomID, response)
      console.log(`Socket opened: ${roomID} - ${player}`)
      // ! this is to send the current result to the player incase they rejoined
      ws.send(JSON.stringify(currentResult))
    },
  },
})
function handleRequest(request: Request) {
  const url = new URL(request.url)
  console.log(`Request to ${url.pathname}`)
  let roomID: string | boolean
  switch (url.pathname) {
    case "/create":
      let roomType = url.searchParams.get("type") || "normal"
      roomID = roomManager.createNewRoom(roomType as roomTypes)
      if (roomID === false) return JSONResponse({ error: "Couldnt create room" }, 500)
      return JSONResponse({ roomID }, 200)
    case "/join":
      console.log("attempting to upgrade connection")
      roomID = url.searchParams.get("room") || false
      if (!roomID) return new Response("No room ID provided", { status: 400 })
      if (roomManager.getRoom(roomID) === undefined) return JSONResponse({ error: "Room not found" }, 404)
      const success = server.upgrade(request, { data: { roomID } })
      console.log("upgraded connection: ", success)
      if (!success) return JSONResponse({ error: "Couldnt upgrade connection" }, 500)
      return undefined
    case "/all":
      return JSONResponse({ rooms: roomManager.allRooms() }, 200)
    default:
      return JSONResponse({ error: "Invalid path" }, 404)
  }
}
console.log(`Listenin on localhost:${server.port}`)
