import NormalRoom from "./game"

const room = new NormalRoom()
const server = Bun.serve({
  port: 3030,
  fetch(request) {
    const url = new URL(request.url)
    console.log(`Request to ${url.pathname}`)
    if (url.pathname === "/websocket") {
      if (server.upgrade(request)) return
      return new Response("Upgrade failed :(", { status: 500 })
    }

    return new Response("Welcome to Bun!")
  },
  websocket: {
    // handler called when a message is received
    message(ws, data) {
      console.log("Message received")
      let playerData = JSON.parse(data)
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
    },
    close(ws, code, message) {
      ws.unsubscribe("game")
      room.removePlayer(ws)
      console.log(`Socket closed - code: ${code} message: ${message}`)
    },
    open(ws) {
      console.log(`Socket opened`)
      ws.subscribe("game")
      let player = room.assignPlayer(ws)
      if (!player) return ws.send(JSON.stringify({ status: "error", error: "Couldnt Connect to room" }))
      ws.send(JSON.stringify({ status: "connected", player }))
    },
  },
})

console.log(`Listenin on localhost:${server.port}`)
