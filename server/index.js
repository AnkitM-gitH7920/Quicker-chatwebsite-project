import app from "./app.js";
import connectToDB from "./database/connectDB.js";
import { redis } from "./utilities/redisClient.js";

const PORT = process.env.SERVER_PORT || 8080;

redis.on("connect", () => console.log("Successfully connected to redis, Starting the server..."));
redis.on("error", () => {
     console.log("Redis connection error!!!");
     console.log("Cannot start the server!!!");
     process.exit();
})

connectToDB().
     then((response) => {
          app.listen(PORT, () => console.log("Server listening at PORT : " + PORT));
     }).catch((error) => {
          console.log("Something went wrong while starting the server!!!");
          process.exit(1);
     });
