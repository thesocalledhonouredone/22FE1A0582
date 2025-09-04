// logging-middleware/index.js
import axios from "axios";

const LOG_API = "http://20.244.56.144/evaluation-service/logs";

export async function Log(stack, level, pkg, message) {
  try {
    const response = await axios.post(
      LOG_API,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LOG_TOKEN}`, // protected route
        },
      }
    );

    if (response.data?.logID) {
      console.log(
        `Log sent [${level.toUpperCase()} - ${pkg}]: ${message} (ID: ${response.data.logID})`
      );
    }
    return response.data;
  } catch (err) {
    console.error(
      `Failed to send log [${level.toUpperCase()} - ${pkg}]: ${message}`,
      err.message
    );
  }
}
