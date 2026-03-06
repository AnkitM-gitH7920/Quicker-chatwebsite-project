import app from "./app.js";
import connectToDB from "./database/connectDB.js";
import { redis } from "./utilities/redisClient.js";
import chalk from "chalk";

const PORT = process.env.SERVER_PORT || 8080;

redis.on("connect", () => console.log(chalk.cyan("Successfully connected to redis, Starting the server...")));
redis.on("error", () => {
     redis.disconnect();
     console.log(chalk.bgRedBright("Redis connection error!!!"));
     console.log(chalk.redBright("Cannot start the server!!!"));
     console.log(chalk.redBright("Redis shutted down !!!"))
     process.exit();
})

connectToDB().
     then((response) => {
          app.listen(PORT, () => console.log(chalk.cyan("Server listening at PORT : " + PORT)));
     }).catch((error) => {
          console.log(chalk.bgRedBright("Something went wrong while starting the server!!!"));
          process.exit(1);
     });
