import {Application, Request,Response,NextFunction} from "express"
import MainError from "./Errors/mainError";
import GlobalErrorHandler from "./Errors/ErrorHandler";
import user from "./Router/AuthRouter"
import journal from "./Router/JourNalRouter"
import event from "./Router/EventRouter"



export const MainApp = (app:Application)=>{
  
  
  
   
    app.use("/api/event", event)
    app.use("/api/journal", journal)
    app.use("/api/user", user)
    
     
     app.all("*", (req: Request, res: Response, next: NextFunction) => {
      const error = new MainError(`Can't find ${req.originalUrl} on this server`, 404);
      next(error);
})
  
  app.use(GlobalErrorHandler)

}








  // app.use("/api", tour)
//  app.use("/api", user)