import express, { urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express();
app.use(cors({
    origin:"*" ,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())


export {app}