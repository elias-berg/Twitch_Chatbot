import { ACCESS_TOKEN, AuthHeader } from "./config.js";

export async function validateAuthToken() {
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