# Twitch_Chatbot

A basic chatbot made for Twitch streaming with the steps on how to run it.

This app uses Bearer auth rather than the quick-setup OAuth found in the Twitch documentation.

## Setup

### Dependencies

- Make sure you have `node` installed, as well as `npm` and `nvm`.
- Before getting started, run `nvm use` and then `npm i` to install all dependencies.

### Twitch App

1. Create a copy of the `sample.env` file named `.env`.
2. Create your twitch app via [Twitch Developer Portal](https://dev.twitch.tv/).
3. Create an application.

- Make sure the callback URLs include `http://localhost:3000`.
- Select the "Chat Bot" type.
- Create a new secret.

4. Update your `.env` with your application's `CLIENT_ID` and `CLIENT_SECRET`.

### Bot Account

1. Create a Twitch account that will be used for your bot.
2. Follow your main Twitch account with the bot.
3. Log into your main Twitch account and make the bot a moderator with:
   `/mod <your_bot_username>`
4. Before proceeding, make sure you log back in with your bot account!

### Authorization

1. Run `npm run auth`.
2. A web page should open, asking you to authenticate your bot account.
3. Click "Authorize" and you should then see output in your console you used to run the command from step 1.

You should see the output got copied into the respective `.env` variables, e.g. `access_code` into your `.env`'s `ACCESS_CODE`.

## Activate: Chatbot!

1. At this point, you just need to make sure your `BOT_USER_ID` and `CHAT_CHANNEL_USER_ID` are set in your `.env`.
2. Run `npm run bot`.
3. The bot should boot up, validate the acccess token in your `.env`, and then try to connect to the chat via websocket.
4. Now you're free to start expanding the commands for your chatbot!

## Troubleshooting

### `Parameter redirect_uri does not match registered URI`

Double-check your app's redirect URIs. Chances are you didn't list `http://localhost:3000` correctly, including if you added a stray `s` in `https`.

### `chat.message subscription missing proper authorization`

This one appears when running `npm run bot` if you forgot to set your `ACCESS_TOKEN` or if it expired.

## To Do List

- Add instructions on how to get the `BOT_USER_ID` and `CHAT_CHANNEL_USER_ID`.
- Add a simple DB rather than print out the access_token.
- Modularize the commands the bot can respond to in a configurable way.
- Start adding command actions.
