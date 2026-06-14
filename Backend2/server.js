
import app from './src/app.js'
import connectdb from './src/db/db.js'
import 'dotenv/config'
import { config } from "./src/config/index.js";
import express from 'express'
import { initBestSellersCron } from './src/cron/updateBestSellers.js';



app.listen(config.port, ()=>{
    console.log(`server is running at ${config.port} port`)
})

initBestSellersCron()


connectdb()