import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import morgan from "morgan"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORGIN,
    credentials:true
}))

app.use(express.json({ limit:"50mb" }))
app.use(express.urlencoded({
    extended:true,
    limit:"50mb"
}))
app.use(express.static("public")) //This allows to store some of the user data into the server

app.use(cookieParser())
//routes declaration Generally it is a standarad to declare the routes here
app.use(morgan("dev")) //HTTP request logger middleware for node.js 

//routes import
import userRouter from "./routes/user.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"


//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

//When ever it is directed to 
//http://localhost:port/api/v1/users/register

export { app }