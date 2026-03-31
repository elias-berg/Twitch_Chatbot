import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * This endpoint handles the OAuth redirect from Twitch.
 * It captures the authorization code from the query parameters.
 */
const refresh = async () => {
  const url = new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.append("client_id", process.env.CLIENT_ID);
  url.searchParams.append("client_secret", process.env.CLIENT_SECRET);
  url.searchParams.append("grant_type", "refresh_token");
  url.searchParams.append("refresh_token", process.env.REFRESH_TOKEN);

  const response = await fetch(url, {
      method: 'POST'
    }
  );

  // For now, log the response to the console and have the user add the info to the .env file manually.
  // Note: this is NOT secure.
  const data = await response.json();
  console.log(data);

  if (data.status && data.status != 200) {
    console.error("Failed to refresh access token: " + data.message);
    return;
  }

  // TODO: Save the tokens into a basic DB
  // Define a file path in the current directory
  const filePath = path.join('.env');
  let contents = fs.readFileSync(filePath, 'utf-8');
  contents = contents.replace(/ACCESS_TOKEN=.*/, `ACCESS_TOKEN=${data.access_token}`);
  contents = contents.replace(/REFRESH_TOKEN=.*/, `REFRESH_TOKEN=${data.refresh_token}`);
  fs.writeFileSync(filePath, contents);
};

refresh();