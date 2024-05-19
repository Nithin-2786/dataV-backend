const express=require("express");
const connectdb = require("./connectDb");
const dotenv=require("dotenv").config();
const port =process.env.PORT || 5000;
const multer = require('multer');
const cors = require('cors');
const app=express();
app.use(cors())

connectdb()
app.use(express.json())
app.use("/api",require("./routes/userRoutes"))

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})