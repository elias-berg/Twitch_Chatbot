import express from 'express';
import dotenv from 'dotenv';
import open from 'open';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * This endpoint handles the OAuth redirect from Twitch.
 * It captures the authorization code from the query parameters.
 */
app.get('/', async (req, res) => {
  const { code } = req.query;

  const response = await fetch(
    "https://id.twitch.tv/oauth2/token?" +
    `client_id=${process.env.CLIENT_ID}&` +
    `client_secret=${process.env.CLIENT_SECRET}&` +
    `code=${code}&` +
    "grant_type=authorization_code&" +
    "redirect_uri=http://localhost:3000",
    {
      method: 'POST'
    }
  );

  // For now, log the response to the console and have the user add the info to the .env file manually.
  // Note: this is NOT secure.
  const data = await response.json();
  console.log(data);

  // TODO: Save the tokens into a basic DB or encrypted file

  // TODO: Add in refresh token handling

  // Indicate the flow is complete; user can close the browser tab
  res.send('You can close this window now.');
  process.exit(0);
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Open the browser to start the auth flow
  // TODO: Use the URLParams API to build this URL instead of manual string concatenation
  open(
    "https://id.twitch.tv/oauth2/authorize?" +
    "response_type=code&" +
    `client_id=${process.env.CLIENT_ID}&` +
    "redirect_uri=http://localhost:3000&" +
    "scope=user:read:chat+user:write:chat+user:bot+channel:bot&" +
    "force_verify=true"
  );
});