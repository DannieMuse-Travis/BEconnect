import express,{Application,Request,Response,NextFunction} from "express"
import morgan from "morgan"
import cors from "cors"
import cookieParser from 'cookie-parser';
import dotenv from "dotenv"
import { MainApp } from "./MainApp"
import { dbConfig } from "./Config/DataBase"
import rateLimit from 'express-rate-limit';
import  helmet from "helmet"
import MongoSanitize from "express-mongo-sanitize"
// import  XSS from "xss-clean"
import path from "path"
import hpp from "hpp"
dotenv.config()



const port : number = parseInt(process.env.PORT!)
const app:Application = express()


app.set('views', path.join(__dirname, 'views'));

// Set Pug as the view engine
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname,`public`)))
app.use(cookieParser());
app.use(helmet())


const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: `Too many requests from this IP, please try again in an hour!`
});

app.use('/api', limiter);



if(process.env.NODE_ENV === `development`){
  app.use(morgan(`dev`))
}




app.use((req:Request,res:Response,next:NextFunction)=>{
    console.log("middle wear ready ✅⭐")
    // console.log(req.headers);
    next()
})

app.use(express.json({limit:`10kb`}))

app.use(MongoSanitize())

// app.use(XSS())
app.use(hpp({
}))



// NODE_ENV=development npm run dev
// NODE_ENV=production npm run dev
MainApp(app)




// console.log(process.env)
const server = app.listen(port,()=>{
  console.clear();
  console.log();
  console.clear()
  console.log("Server is Live 💥🚀⭐⚡")
  dbConfig()
 })


 process.on("uncaughtException",(error)=>{
    console.log("Server is shutting downn because of uncaughtException")
    console.log(error)
    process.exit(1)

})

process.on("unhandledRejection",(reason)=>{
    console.log("server is shutting down because of unhandledRejection")
    console.log(reason)
    server.close(()=>{
        process.exit(1)
    })
})
    
 