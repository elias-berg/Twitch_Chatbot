// This class represents the chatbot itself, managing its state and behavior.

class Bot {
  constructor() {
    this.commands = new Map();
    this.commands.set("help", () => {
      return "Available commands:\n" + Array.from(this.commands.keys()).join("\n");
    });
  }

  /**
   * 
   * @param {string} command - the command string to register 
   * @param {(args, event) => string} callback - function that takes args and event, returns a response string
   */
  registerCommand(command, callback) {
    this.commands.set(command, callback);
  }

  /**
   * 
   * @param {list[string]} message - space-split message array
   * @param {dict} event - the event data associated with the message
   * @returns string - response message to send back to chat
   */
  handleMessage(payload, event) {
    console.log(payload);
    const command = payload[0].toLowerCase();
    if (this.commands.has(command)) {
      const args = payload.slice(1);
      return this.commands.get(command)(args, event);
    } else {
      console.log(`Unknown command: ${command}`);
      return "I don't recognize that command.";
    }
  }
}

export default Bot;