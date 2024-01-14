# Bun websocket server

This is a bun server which handles the creation and handling of rooms to ensure multiplayer cabablities via a live tic tac toe game and a more advanced version of the game 


'''typescript
const server = Bun.serve({
  port,
  fetch(request) {
    // Handles request by filtering pathname
  },
  websocket: {
    message(ws: ServerWebSocket<any>, data: string) {
      // This handles every time the server recieves data via the websocket
    },
    close(ws, code, message) {
      // Handle closes gracefully by removing players and updating room paticpants 
    },
    open(ws) {
      // connect player to room
    },
  },
})
'''