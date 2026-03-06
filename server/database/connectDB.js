import mongoose from "mongoose";
import chalk from "chalk";

const DB_CONNECTION_STRING = process.env.DB_MONGOSH_CONNECTION_STRING;

async function connectToDB() {
    try {
        const connectionInstance = await mongoose.connect(`${DB_CONNECTION_STRING}`, { dbName: "users" });
        console.log(chalk.cyan("DB connected successfully || PORT: " + connectionInstance.connection.port));
        return;

    } catch (error) {
        console.log("Error in (server/database/connectDB.js) folder :", error)
        console.log(chalk.bgRedBright("Error connecting to Users database!!!"));
        throw error;
    }
}

export default connectToDB;

// !! BIG ERROR :- Cannot connect to mongo db atlas
