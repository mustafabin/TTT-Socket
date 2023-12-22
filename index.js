const server = Bun.serve({
  port: 3030,
  fetch(request) {
    const url = new URL(request.url)
    console.log(`Request to ${url.pathname}`)
    if (url.pathname === "/websocket") {
      if (server.upgrade(request)) return;
      return new Response("Upgrade failed :(", { status: 500 });
    }

    return new Response("Welcome to Bun!")
  },
  websocket: {
    // handler called when a message is received
    message(ws, message) {
      console.log(`Received: ${message}`)
      ws.send(`You said: ${message}`);
    },
    close(ws, code, message) {
      console.log(`Socket closed - code: ${code} message: ${message}`)
    }, // a socket is closed
    open(ws) {
      console.log(`Socket opened`)
    }, // a socket is opened

  },
})

console.log(`Listenin on localhost:${server.port}`)
