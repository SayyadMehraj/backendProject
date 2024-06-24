import dotenv from "dotenv"
import mongoose from "mongoose";
import{DB_NAME} from "./constants.js";
import DBconnect from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
    path:"./env"
})

//DB connect returns a promise it fulfilled by using then and catch
DBconnect()
.then(() => {
    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running on port:${process.env.PORT}`);

    })
})
.catch((error) => {
    console.log("Database Connection Failed !!",error);
})
app.on("error",(error) => {
        console.log("Error is caused :",error)
        throw error
})

//This is method to connect to Database 
/*
;(async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       app.on("error",(error) => {
        console.log("Error is caused by the database:",error)
        throw error

        app.listen(process.env.PORT,() => {
            console.log(`It is listening on port:${env.process.PORT}`)
        })
       })
    } catch (error) {
        console.log("This is the error found:",error)
    }
})()
*/