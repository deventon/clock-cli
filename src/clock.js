import axios from "axios";
import chalk from "chalk";
import ora from "ora";

export const startClock = async ({
  user,
  apiKey,
  customer,
  service,
  customers_id,
  services_id,
  text,
}) => {
  const spinner = ora(
    `Starting clock for ${customer} and ${service}...`,
  ).start();

  try {
    await axios.post(
      "https://my.clockodo.com/api/v2/clock",
      {
        customers_id,
        services_id,
        text,
      },
      {
        headers: {
          "X-ClockodoApiKey": apiKey,
          "X-ClockodoApiUser": user,
          "X-Clockodo-External-Application": "CLI-Clock",
        },
      },
    );

    spinner.succeed(chalk.green("Done!"));
  } catch (error) {
    spinner.fail(
      chalk.red(
        "Unable to start clock:",
        error?.response?.status,
        error?.response?.statusText,
      ),
    );
  } finally {
    console.info(chalk.blueBright("Thanks for using your shell. Beep boop!"));
  }
};

export const stopClock = async ({ user, apiKey }) => {
  const spinner = ora(`Stopping clock...`).start();

  try {
    const { data } = await axios.get("https://my.clockodo.com/api/v2/clock", {
      headers: {
        "X-ClockodoApiKey": apiKey,
        "X-ClockodoApiUser": user,
        "X-Clockodo-External-Application": "CLI-Clock",
      },
    });

    if (!data.running) {
      return spinner.fail(chalk.red("Could not stop clock: No running entry."));
    }

    const runningEntryId = data.running.id;

    await axios.delete(
      `https://my.clockodo.com/api/v2/clock/${runningEntryId}`,
      {
        headers: {
          "X-ClockodoApiKey": apiKey,
          "X-ClockodoApiUser": user,
          "X-Clockodo-External-Application": "CLI-Clock",
        },
      },
    );

    spinner.succeed(chalk.green("Clock stopped successfully."));
  } catch (error) {
    spinner.fail(
      chalk.red(
        "Unable to stop clock:",
        error.response.status,
        error.response.statusText,
      ),
    );
  }
};
