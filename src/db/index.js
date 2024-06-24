import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DBconnect = async () => {
    try {
        const DatabaseConnection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)        
        console.log(`\nConnection Established ${DatabaseConnection.connection.host}`);
    } catch (error) {
        console.log(`Error caused by Database:${error}`)
        process.exit(1)
    }
}

export default DBconnect