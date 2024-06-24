import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORGIN,
    credentials:true
}))

app.use(express.json({limit:"16Kb"}))
app.use(express.urlencoded({extended:true,limit:"16Kb"}))
app.use(express.static("public")) //This allows to store some of the user data into the server

app.use(cookieParser())
//routes declaration Generally it is a standarad to declare the routes here
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users",userRouter)

//When ever it is directed to 
//http://localhost:port/api/v1/users/register

export { app }