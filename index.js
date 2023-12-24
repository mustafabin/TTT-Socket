import playMove from "./game"
let gameState = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
]
let currentTurn = "X"
let playerConnections = new Map()
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
      if (player !== currentTurn) return ws.send(JSON.stringify({ status: "error", error: "Not your turn" }))

      let result = playMove(gameState, row, col, player)
      if (result) {
        gameState = result.board
        currentTurn = result.turn
        if (result.winner || result.isDraw) {
          gameState = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
          ]
          currentTurn = "X"
        }
        ws.publish("game", JSON.stringify({ status: "update", ...result }))
        ws.send(JSON.stringify({ status: "update", ...result }))
      } else {
        ws.send(JSON.stringify({ status: "error", error: "Invalid move" }))
      }
    },
    close(ws, code, message) {
      playerConnections.delete(ws)
      ws.unsubscribe("game")
      console.log(`Socket closed - code: ${code} message: ${message}`)
    },
    open(ws) {
      console.log(`Socket opened`)
      let player = playerConnections.size === 0 ? "X" : "O"
      playerConnections.set(ws, player)
      ws.subscribe("game")

      ws.send(JSON.stringify({ status: "connected", player }))
    },
  },
})

console.log(`Listenin on localhost:${server.port}`)
