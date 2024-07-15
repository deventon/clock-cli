import inquirer from "inquirer";
import axios from "axios";

export async function login() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "Enter your email address:",
    },
    {
      type: "password",
      name: "password",
      message: "Enter your password:",
    },
  ]);

  // Perform login request
  try {
    const response = await axios.post(
      "https://my.clockodo.com/api/apikey",
      {
        autologin: false,
        email: answers.email,
        password: answers.password,
        start_session: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );

    const apiKey = response.data.apikey;
    console.log("Login successful!");
    return { user: answers.email, apiKey };
  } catch (error) {
    console.error(
      "Login failed:",
      error.response
        ? [
            error.response.data,
            error.response.data.errors,
            error.response.data.message,
          ]
        : "No response from server.",
    );
  }
}
