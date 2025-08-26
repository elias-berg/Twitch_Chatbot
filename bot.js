import dotenv from 'dotenv';

dotenv.config();

// This is a simple Twitch chat bot that listens to messages in a channel and responds to "HeyGuys" with "VoHiYo".
const BOT_USER_ID = process.env.BOT_USER_ID;

// The access token can be generated from the auth script
// https://dev.twitch.tv/console/apps
// Example: "1234567890abcdef1234567890abcdef1234567890" (this is not a real access token, just an example)
// The OAuth token needs to have the scopes user:bot, user:read:chat, user:write:chat
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const AuthHeader = {
  "Authorization": `Bearer ${ACCESS_TOKEN}`,
};

// The Client ID can be found in the Twitch Developer Console under your application
// https://dev.twitch.tv/console/apps
// The Client ID is a string
// Example: "1234567890abcdef1234567890abcdef" (this is not a real Client ID, just an example)
const CLIENT_ID = process.env.CLIENT_ID;

// The channel's User ID can be found by using the Helix API endpoint /users?login=CHANNEL_NAME
// For example, if the channel is "twitchdev", you can use /users?login=twitchdev to get the User ID of that channel
// The User ID is a string
// Example: "123456789" (this is not a real User ID, just an example)
const CHAT_CHANNEL_USER_ID = process.env.CHAT_CHANNEL_USER_ID;


const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

var websocketSessionID;

// Start executing the bot from here
(async () => {
	// Verify that the authentication is valid
	await getAuth();

	// Start WebSocket client and register handlers
	const websocketClient = startWebSocketClient();
})();

// WebSocket will persist the application loop until you exit the program forcefully

async function getAuth() {
  if (ACCESS_TOKEN === undefined || ACCESS_TOKEN === "") {
    console.error("No ACCESS_TOKEN found in .env");
    process.exit(1);
  }

	// https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
	let response = await fetch('https://id.twitch.tv/oauth2/validate', {
		method: 'GET',
		headers: AuthHeader
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Token is not valid. /oauth2/validate returned status code " + response.status);
		console.error(data);
		process.exit(1);
	}

	console.log("Validated token.");
}

function startWebSocketClient() {
	let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);

  websocketClient.onerror = (error) => {
    console.error("WebSocket error: ", error);
  }

  websocketClient.onopen = () => {
    console.log("WebSocket connection established.");
  }

  websocketClient.onclose = () => {
    console.log("WebSocket connection closed.");
  }

  websocketClient.onmessage = (ev) => {
    console.log("WebSocket message received: " + ev.data);
		handleWebSocketMessage(JSON.parse(ev.data.toString()));
  }

	return websocketClient;
}

function handleWebSocketMessage(data) {
	switch (data.metadata.message_type) {
		case 'session_welcome': // First message you get from the WebSocket server when connecting
			websocketSessionID = data.payload.session.id; // Register the Session ID it gives us

			// Listen to EventSub, which joins the chatroom from your bot's account
			registerEventSubListeners();
			break;
		case 'notification': // An EventSub notification has occurred, such as channel.chat.message
			switch (data.metadata.subscription_type) {
				case 'channel.chat.message':
					// First, print the message to the program's console.
					console.log(`MSG #${data.payload.event.broadcaster_user_login} <${data.payload.event.chatter_user_login}> ${data.payload.event.message.text}`);

          // TODO: Add more commands here
          const payload = data.payload.event.message.text.trim().toLowerCase();
          switch (payload) {
            case "heyguys":
              sendChatMessage("VoHiYo");
              break;
            default:
              // do nothing
              break;
          }
					break;
			}
			break;
	}
}

async function sendChatMessage(chatMessage) {
	let response = await fetch('https://api.twitch.tv/helix/chat/messages', {
		method: 'POST',
		headers: {
      ...AuthHeader,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			broadcaster_id: CHAT_CHANNEL_USER_ID,
			sender_id: BOT_USER_ID,
			message: chatMessage
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Failed to send chat message");
		console.error(data);
	} else {
		console.log("Sent chat message: " + chatMessage);
	}
}

async function registerEventSubListeners() {
	// Register channel.chat.message
	let response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
		method: 'POST',
		headers: {
      ...AuthHeader,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			type: 'channel.chat.message',
			version: '1',
			condition: {
				broadcaster_user_id: CHAT_CHANNEL_USER_ID,
				user_id: BOT_USER_ID
			},
			transport: {
				method: 'websocket',
				session_id: websocketSessionID
			}
		})
	});

	const data = await response.json();
	if (response.status != 202) {
		console.error("Failed to subscribe to channel.chat.message. API call returned status code " + response.status);
		console.error(data);
		process.exit(1);
	} else {
		console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
	}
}