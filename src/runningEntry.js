import axios from "axios";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";

export const editRunningEntry = async ({ user, apiKey }) => {
  const spinner = ora(`Fetching running entry...`).start();

  const { data } = await axios.get("https://my.clockodo.com/api/v2/clock", {
    headers: {
      "X-ClockodoApiKey": apiKey,
      "X-ClockodoApiUser": user,
      "X-Clockodo-External-Application": "CLI-Clock",
    },
  });

  if (!data.running) {
    return spinner.fail(chalk.red("No running entry."));
  }

  spinner.succeed(chalk.green("Running entry fetched.\n"));

  const runningEntry = data.running;

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do with the running entry?",
      choices: ["Move start time", "Change customer", "Change service"],
    },
  ]);

  switch (action) {
    case "Move start time": {
      const { minutes } = await inquirer.prompt([
        {
          type: "number",
          name: "minutes",
          message: "How many minutes?",
        },
      ]);

      const spinner = ora(`Updating running entry...`).start();

      const { data } = await axios.put(
        `https://my.clockodo.com/api/v2/clock/${runningEntry.id}`,
        {
          time_since_before: runningEntry.time_since,
          duration_before: 0,
          duration: 60 * minutes,
        },
        {
          headers: {
            "X-ClockodoApiKey": apiKey,
            "X-ClockodoApiUser": user,
            "X-Clockodo-External-Application": "CLI-Clock",
          },
        },
      );

      const { overlapping_correction } = data;
      const { running } = data;

      const previousEntryId = overlapping_correction?.truncate_previous_entry;

      try {
        if (previousEntryId) {
          await axios.put(
            `https://my.clockodo.com/api/v2/entries/${previousEntryId}`,
            {
              transfer_time_from: runningEntry.id,
              time_until: running.time_since,
            },
            {
              headers: {
                "X-ClockodoApiKey": apiKey,
                "X-ClockodoApiUser": user,
                "X-Clockodo-External-Application": "CLI-Clock",
              },
            },
          );

          return spinner.succeed(
            chalk.green("Running entry updated, previous entry truncated.\n"),
          );
        } else if (overlapping_correction?.overlapping_free_time_since) {
          const time_since = new Date(overlapping_correction.overlapping_free_time_since).toISOString().split('.')[0]+"Z";
          await axios.put(
            `https://my.clockodo.com/api/v2/clock/${runningEntry.id}`,
            {
              time_since_before: running.time_since,
              time_since,
            },
            {
              headers: {
                "X-ClockodoApiKey": apiKey,
                "X-ClockodoApiUser": user,
                "X-Clockodo-External-Application": "CLI-Clock",
              },
            },
          );


          return spinner.succeed(
            chalk.green(
              "Running entry updated, start fit to previous entry's end time.\n",
            ),
          );
        }

        return spinner.warn(
          chalk.yellow(
            "Running entry updated, no previous entry found. Check your timetable if you did not expect this.\n",
          ),
        );
      } catch (error) { console.log(error.response.data) }
    }

    case "Change customer": {
      return console.log("Not implemented.");
    }

    case "Change service": {
      return console.log("Not implemented.");
    }
  }
};
