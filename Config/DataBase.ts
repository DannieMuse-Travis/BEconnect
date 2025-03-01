import env from "dotenv";
import mongoose, { connect } from "mongoose";

env.config();

export const dbConfig = async () => {

    try {
      await mongoose.connect(process.env.DATABASE_URL!)
      .then(() => {
        console.log("db connected...🔥🔥🔥");
      })
      .catch(() => console.error());
    } catch (error) {
      return error
    }
 
};






