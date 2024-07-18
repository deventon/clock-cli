#!/usr/bin/env node
import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { parseIdFromName } from "./idMap.js";
import { getUserData, deleteApiKey } from "./userData.js";
import { startClock, stopClock } from "./clock.js";

try {
  const args = process.argv.slice(2);

  if (args.includes("relog")) {
    await deleteApiKey();
  }

  const { user, apiKey } = await getUserData();
  const getGitInfo = (p = process.cwd()) => {
    const gitHeadPath = `${p}/.git/HEAD`;

    if (fs.existsSync(p)) {
      if (fs.existsSync(gitHeadPath)) {
        const url = fs
          .readFileSync(`${p}/.git/config`, "utf-8")
          .match(/url = git@bitbucket.*\.git/)
          .shift();
        return {
          branch: fs.readFileSync(gitHeadPath, "utf-8").trim().split("/").pop(),
          repo: url.includes("frontend") ? "frontend" : "backend",
        };
      } else return getGitInfo(path.resolve(p, ".."));
    } else return false;
  };

  program.action(async () => {
    const { mode } = await inquirer.prompt([
      {
        type: "list",
        name: "mode",
        message: "Welcome to Clockodo!",
        choices: [
          "Start clock",
          "Stop clock",
          "Start development on current branch",
        ],
      },
    ]);

    if (mode === "Stop clock") {
      await stopClock({ user, apiKey });
    }
    if (mode === "Start clock") {
      const { customer } = await inquirer.prompt([
        {
          type: "list",
          name: "customer",
          message: "Select a customer",
          choices: ["DEV: Frontend", "DEV: Backend", "Internes"],
        },
      ]);

      const { service } = await inquirer.prompt([
        {
          type: "list",
          name: "service",
          message: "Select a service",
          choices: ["Programmierung", "Besprechung", "Verschiedenes"],
        },
      ]);

      const { text } = await inquirer.prompt([
        {
          type: "input",
          name: "text",
          message: "Enter a description (optional)",
        },
      ]);

      const customers_id = parseIdFromName(customer);
      const services_id = parseIdFromName(service);

      await startClock({
        user,
        apiKey,
        customer,
        service,
        customers_id,
        services_id,
        text,
      });
    }

    if (mode === "Start development on current branch") {
      const {repo, branch} = getGitInfo();

      await startClock({
        user,
        apiKey,
        customer: "DEV: Frontend",
        service: "Entwicklung",
        customers_id:
          repo === "frontend" ? 1081919 : 1081920,
        services_id: 1,
        text: branch,
      });
    }
  });

  program.parse(process.argv);
} catch (error) {
  console.error("An error has occured :(");
}
