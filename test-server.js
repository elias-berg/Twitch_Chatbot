import { WebSocketServer } from 'ws';

// Start executing the bot from here
(async () => {
  const wss = new WebSocketServer({
    autoPong: true,
    path: '/ws',
    port: 8080
  });
  
  wss.on("listening", () => {
    console.log("WebSocket server is listening on ws://localhost:8080/ws");
  });

  wss.on('connection', (socket) => {
    console.log("Client connected");

    socket.on('message', (message) => {
      console.log("Received message: " + message);
      // Here you would forward the message to the bot for processing
    });

    // Example of sending a message to the client
    socket.send("Welcome to the WebSocket server!");
  });
})();