import RoomManager from "./roomManager"

const roomManager = new RoomManager()
const server = Bun.serve({
  port: 3030,
  fetch(request) {
    const url = new URL(request.url)
    console.log(`Request to ${url.pathname}`)
    if (url.pathname === "/create") {
      let roomID = roomManager.createNewRoom("normal")
      if (roomID === false) return new JSONResponse({ error: "Couldnt create room" }, 500)
      return JSONResponse({ roomID }, 200)
    }
    if (url.pathname === "/join") {
      let roomID = url.searchParams.get("room")
      if (!roomID) return new Response("No room ID provided", { status: 400 })
      if (roomManager.getRoom(roomID) === undefined) return JSONResponse({ error: "Room not found" }, 404)
      const success = server.upgrade(request, { data: { roomID } })
      if (!success) return JSONResponse({ error: "Couldnt upgrade connection" }, 500)
      return undefined
    }
    if (url.pathname === "/all") {
      return JSONResponse({ rooms: roomManager.allRooms() }, 200)
    }
    return JSONResponse({ error: "Invalid path" }, 404)
  },
  websocket: {
    // ! Main websocket logic
    message(ws, data) {
      let roomID = String(ws.data.roomID)
      let coords = JSON.parse(data)?.coords
      console.log(`Message received: ${coords} Room: ${roomID}`)
      let currentRoom = roomManager.getRoom(roomID)
      if(!currentRoom) return
      let result = currentRoom.playMove(coords[0], coords[1], ws)
      let stringifiedResult = JSON.stringify(result)
      result.error ? ws.send(stringifiedResult) : ws.publish(roomID,stringifiedResult)
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
      console.log(`Socket opened: ${roomID}`)
      // ! connect player to room
      let player = roomManager.assignPlayer(ws, roomID)
      let response = JSON.stringify({ status: "joined", player })
      ws.subscribe(roomID)
      ws.publish(roomID, response)
      ws.send(response)
    },
  },
})

function JSONResponse(data, status) {
  return new Response(JSON.stringify(data), { status })
}
function handleNormalGame(ws, playerData) {
  let [row, col] = playerData.coords
  let { player } = playerData
  if (player !== room.currentTurn) return ws.send(JSON.stringify({ status: "error", error: "Not your turn" }))

  let result = room.playMove(row, col, player)
  if (result) {
    if (result.winner || result.isDraw) room.clearBoard()
    ws.publish("game", JSON.stringify({ status: "update", ...result }))
    ws.send(JSON.stringify({ status: "update", ...result }))
  } else {
    ws.send(JSON.stringify({ status: "error", error: "Invalid move" }))
  }
}
console.log(`Listenin on localhost:${server.port}`)
