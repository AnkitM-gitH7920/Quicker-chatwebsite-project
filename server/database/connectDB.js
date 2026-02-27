import mongoose from "mongoose";

const DB_CONNECTION_STRING = process.env.DB_MONGOSH_CONNECTION_STRING;

async function connectToDB() {
    try {
        const connectionInstance = await mongoose.connect(`${DB_CONNECTION_STRING}`, { dbName: "users" });
        console.log("DB connected successfully || PORT: " + connectionInstance.connection.port);
        return;

    } catch (error) {
        console.log("Error in database folder :", error)
        console.log("Error connecting to Users database!!!");
        throw error;
    }
}

export default connectToDB;

// !! BIG ERROR :- Cannot connect to mongo db atlas
