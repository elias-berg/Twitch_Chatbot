// This class acts as the WebSocket server for the bot, forwarding all incoming messages to the bot and
// sending all of the bot's outgoing messages to Twitch.

import Bot from './Bot';

class Server {
  /** @type {Bot} */
  _bot = null;

  constructor() {
    _bot = new Bot();
  }
}