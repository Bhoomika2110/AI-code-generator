import helmet from "helmet";
import express from "express"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import websiteRouter from "./routes/website.routes.js"

const app = express()


const port = process.env.PORT || 5000

// ✅ Put CORS before other middleware



app.use(cors({
  origin:[
    "http://localhost:5173",
    "https://twowebsite-building-1.onrender.com"
  ],
  credentials:true
}));

app.use(
 helmet({
   crossOriginOpenerPolicy:false
 })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/website", websiteRouter)

app.listen(port, () => {
  console.log("server started")
  connectDb()
})
