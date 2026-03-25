import { validateAuthToken } from "./src/auth.js";
import { startWebSocketClient } from "./src/index.js";

(async () => {
  // Verify that the authentication is valid
  await validateAuthToken();

  // Start WebSocket client and register handlers
  startWebSocketClient();
})()

// WebSocket will persist the application loop until you exit the program forcefully