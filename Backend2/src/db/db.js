import mongoose from "mongoose";
import 'dotenv/config'
import { config } from "../config/index.js";
const connectdb = async()=>{
    try{
        await mongoose.connect(config.db.uri)
        console.log("Data base connected sucessfully")
    }
    catch(error){
            console.log("Data base connection failed", error)
    }
}

export default connectdb