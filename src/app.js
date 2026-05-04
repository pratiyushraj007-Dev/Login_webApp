const path=require("path");
const {Google}=require("arctic");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("../src/routes/auth.routes");
const getRoutes=require("../src/routes/get.routes");


const google=new Google(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.CALLBACK_URL
)


const app = express();
app.use(cookieParser());
app.use(express.json());

//middleware to read form data
app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));
app.use("/api/auth", authRoutes)
app.use("/",getRoutes)



module.exports = app;