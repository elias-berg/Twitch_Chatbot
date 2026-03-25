import Bot from './Bot.js';
import {
  AuthHeader,
  BOT_USER_ID,
  CHAT_CHANNEL_USER_ID,
  CLIENT_ID,
  EVENTSUB_WEBSOCKET_URL,
  PRIMARY_COMMAND
} from './config.js';
import { validateAuthToken } from './auth.js';

var websocketSessionID;
var botInstance = new Bot();

let nameQueueMap = {};
botInstance.registerCommand("enter", (args, event) => {
  if (args.length === 1) {
    nameQueueMap[event.chatter_user_login] = args[0];
    return `@${event.chatter_user_login}'s entry is ${args[0]} for the draw!`;
  } else {
    return `@${event.chatter_user_login} try using the command like this: "${process.env.PRIMARY_COMMAND} enter <name>"`;
  }
});

botInstance.registerCommand("pull", (_args, event) => {
  if (event.broadcaster_user_login !== event.chatter_user_login) {
    return `@${data.payload.event.chatter_user_login}, only ${event.broadcaster_user_login} can pull from the hat.`;
  }
  
  const nameQueue = Object.values(nameQueueMap);
  if (nameQueue.length > 0) {
    const randomElement = nameQueue[Math.floor(Math.random() * nameQueue.length)];
    nameQueueMap = {};
    return `${randomElement} was picked from the hat!\nThe hat is now empty!`;
    /*setTimeout(() => {
      sendChatMessage(`The queue is now empty. Start entering again with "jewbot! enter <name>".`);
    }, 1000);*/
  } else {
    return "The queue is empty, sorry, bro.";
  }
});

let valueQueueMap = {};
botInstance.registerCommand("guess", (args, event) => {
  if (args.length === 1) {
    let valStr = args[0];
    if (valStr.startsWith('$')) {
      valStr = valStr.substring(1);
    }
    const val = parseFloat(args[0])
    valueQueueMap[event.chatter_user_login] = val;
    return `@${event.chatter_user_login} guesses ${val}...`;
  } else {
    return `@${event.chatter_user_login} try using the command like this: "${process.env.PRIMARY_COMMAND} guess [0.00-9999.99]"`;
  }
});

botInstance.registerCommand("valuate", (args, event) => {
  if (event.broadcaster_user_login !== event.chatter_user_login) {
    return `@${data.payload.event.chatter_user_login}, only ${event.broadcaster_user_login} can pull from the hat.`;
  }

  const nameQueue = Object.values(nameQueueMap);
  if (nameQueue.length > 0) {
    const randomElement = nameQueue[Math.floor(Math.random() * nameQueue.length)];
    nameQueueMap = {};
    return `${randomElement} was picked from the hat!\nThe hat is now empty!`;
    /*setTimeout(() => {
      sendChatMessage(`The queue is now empty. Start entering again with "jewbot! enter <name>".`);
    }, 1000);*/
  } else {
    return "The queue is empty, sorry, bro.";
  }
});

export function startWebSocketClient() {
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
          const message = data.payload.event.message.text.trim().toLowerCase();
          const payload = message.split(' ');
          console.log("PAYLOAD: " + payload);
          if (payload[0].toLowerCase() !== PRIMARY_COMMAND.toLowerCase()) {
            break;
          }
          let response = "";
          if (payload.length < 2) {
            response = `@${data.payload.event.chatter_user_login}, did you forget to include the command?"`;
          }
          response = botInstance.handleMessage(payload.slice(1), data.payload.event);
          console.log("RESPONSE: " + response);
          sendChatMessage(response);
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