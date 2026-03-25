import dotenv from 'dotenv';

dotenv.config();

//export const TEST_MODE = process.env.TEST_MODE === 'true';

export const BOT_USER_ID = process.env.BOT_USER_ID;

// The access token can be generated from the auth script
// https://dev.twitch.tv/console/apps
// Example: "1234567890abcdef1234567890abcdef1234567890" (this is not a real access token, just an example)
// The OAuth token needs to have the scopes user:bot, user:read:chat, user:write:chat
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

export const AuthHeader = {
  "Authorization": `Bearer ${ACCESS_TOKEN}`,
};

// The Client ID can be found in the Twitch Developer Console under your application
// https://dev.twitch.tv/console/apps
// The Client ID is a string
// Example: "1234567890abcdef1234567890abcdef" (this is not a real Client ID, just an example)
export const CLIENT_ID = process.env.CLIENT_ID;

// The channel's User ID can be found by using the Helix API endpoint /users?login=CHANNEL_NAME
// For example, if the channel is "twitchdev", you can use /users?login=twitchdev to get the User ID of that channel
// The User ID is a string
// Example: "123456789" (this is not a real User ID, just an example)
export const CHAT_CHANNEL_USER_ID = process.env.CHAT_CHANNEL_USER_ID;

// The URL for Twitch's EventSub WebSocket server
export const EVENTSUB_WEBSOCKET_URL = process.env.EVENTSUB_WEBSOCKET_URL || 'wss://eventsub.wss.twitch.tv/ws';

// The primary command the chatbot is listening for in order to process a message.
// For example, if PRIMARY_COMMAND is "bot!", then the bot will only process messages that start with "bot!" and will ignore all other messages.
export const PRIMARY_COMMAND = process.env.PRIMARY_COMMAND;