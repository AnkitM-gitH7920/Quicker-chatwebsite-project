import app from "./app.js";
import connectToUsersDB from "./database/connectDB.js";


const PORT = process.env.SERVER_PORT || 8080;


connectToUsersDB().
    then((response) => {
        app.listen(PORT, () => console.log("Server listening at PORT : " + PORT));
    }).catch((error) => {
        console.log("Something went wrong while starting the server!!!");
        process.exit(1);
    });