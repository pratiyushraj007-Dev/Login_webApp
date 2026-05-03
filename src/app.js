const path=require("path");
const {Google}=require("arctic");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("../src/routes/auth.routes");
const crypto=require("crypto");
const bcrypt=require("bcrypt");
const userModel = require("./models/user.model");

const google=new Google(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.CALLBACK_URL
)

// const state=crypto.randomUUID();
// console.log(state);

const app = express();
app.use(cookieParser());
app.use(express.json());

//middleware to read form data
app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));
app.get("/",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        res.sendFile(path.join(__dirname,"../views/user.html"));
    }else{
        res.redirect("/login");
    }
})
app.use("/api/auth", authRoutes)
app.get("/login",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        res.send("You are already logged in");
    }else{
        res.sendFile(path.join(__dirname, "../views/login.html"));
    }
})
app.get("/register",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        res.send("You are already logged in");
    }else{
        res.sendFile(path.join(__dirname, "../views/register.html"));
    }
})
app.get("/logout",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    res.clearCookie("loginToken");
    res.status(200).json({
        message:"logout successfully"
    })
})

app.get("/confirmation-gmail",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        res.send("pls login first")
    }else{
        res.sendFile(path.join(__dirname,"../views/confirmation-gmail.html"))
    }
})
app.get("/reset-password/:email/:token",async(req,res)=>{
    const {email,token}=req.params;
    const user=await userModel.findOne({email});
    if(!user){
        return res.send("User not found");
    }
    const isMatch=await bcrypt.compare(token,user.resetToken);
    if(!isMatch){
        return res.send("Invalid token");
    }
    if(user.resetTokenExpiry<Date.now()){
        return res.send("Token expired");
    }
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        return res.send("You are already logged in")
    }
    res.sendFile(path.join(__dirname,"../views/reset-password.html"))
})

module.exports = app;