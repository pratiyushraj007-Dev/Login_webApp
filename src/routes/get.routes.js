const express=require("express");
const path=require("path");
const userModel=require("../models/user.model");
const crypto=require("crypto");
const bcrypt=require("bcrypt");

const router=express.Router();

router.get("/",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        res.sendFile(path.join(__dirname,"../../views/user.html"));
    }else{
        res.redirect("/login");
    }
})

router.get("/login",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        res.send("You are already logged in");
    }else{
        res.sendFile(path.join(__dirname, "../../views/login.html"));
    }
})

router.get("/register",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        res.send("You are already logged in");
    }else{
        res.sendFile(path.join(__dirname, "../../views/register.html"));
    }
})

router.get("/logout",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    res.clearCookie("loginToken");
    res.status(200).json({
        message:"logout successfully"
    })
})


router.get("/confirmation-gmail",(req,res)=>{
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        res.send("You are already logged In")
    }else{
        res.sendFile(path.join(__dirname,"../../views/confirmation-gmail.html"))
    }
})

router.get("/reset-password/:email/:token",async(req,res)=>{
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
    res.sendFile(path.join(__dirname,"../../views/reset-password.html"))
})
module.exports=router;