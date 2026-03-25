// Start executing the bot from here
(async () => {
  // Start WebSocket client and register handlers
  const websocketClient = new WebSocket("ws://localhost:8080/ws");
  websocketClient.onopen = () => {
    websocketClient.send("Hello Server!" );
  }
  websocketClient.onmessage = (message) => {
    console.log("Received message: " + message.data);
  }
  websocketClient.onerror = (error) => {
    console.error("WebSocket error: ", error);
  }
  console.log("WebSocket connection established.");
})();