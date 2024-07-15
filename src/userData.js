import os from "os";
import path from "path";
import fs from "fs";
import { login } from "./auth.js";

const configDir = path.join(os.homedir(), ".clock-cli");
const configFilePath = path.join(configDir, "config.json");

const saveApiKey = (user, apiKey) => {
  const config = { user, apiKey };
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  console.log("API key saved successfully.");
};

export const deleteApiKey = async () => {
  try {
    fs.rmSync(configFilePath);
  } catch (err) {
    console.error("Unable to delete login information.");
  }
};

export const getUserData = async () => {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  if (fs.existsSync(configFilePath)) {
    const { user, apiKey } = JSON.parse(
      fs.readFileSync(configFilePath, "utf8"),
    );

    return { user, apiKey };
  } else {
    const { user, apiKey } = await login();
    saveApiKey(user, apiKey);
    return { user, apiKey };
  }
};
