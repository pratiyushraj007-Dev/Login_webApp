const express = require("express");
const authController = require("../controllers/auth.controller");
const path = require("path");
const crypto = require("crypto");
const { Google, generateCodeVerifier, generateState } = require("arctic");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const google = new Google(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.CALLBACK_URL
)

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/verify-otp", authController.otpGeneration);
router.post("/login", authController.loginUser);
router.post("/verify-gmail",authController.verifyGmail);
router.post("/reset-password",authController.resetPassword)


router.get("/verify-otp", (req, res) => {
    const token = req.cookies.tempToken;
    if (!token) {
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.step !== "sign-up") {
            return res.redirect("/");
        }

        res.sendFile(path.join(__dirname, "../../views/verify-otp.html"));

    } catch (err) {
        console.log(err)
        return res.redirect("/");
    }
})

router.get("/credential", (req, res) => {
    const loginToken = req.cookies.loginToken;
    if (loginToken) {
        const decoded = jwt.verify(loginToken, process.env.JWT_SECRET);
        res.json({
            username: decoded.username,
            useremail: decoded.email
        })
    } else {
        console.log("token not found");
        res.status(401).json({
            message: "Pls login"
        })
    }
})

router.get("/google", (req, res) => {
    const loginToken=req.cookies.loginToken;
    if(loginToken){
        return res.send("You are already Logged In")
    }
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(
        state,
        codeVerifier,
        ["openid", "profile", "email"]
    );
    url.searchParams.set("prompt", "select_account");
    res.cookie("code_verifier", codeVerifier, {
        maxAge: 10 * 60 * 1000,//10 minute
    });

    res.redirect(url.toString());
})

router.get("/google/callback", async (req, res) => {
    const code = req.query.code;
    const codeVerifier=req.cookies.code_verifier;
    if (!code) return res.send("No Code");

    const token = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken=token.accessToken();
    const userRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }
    )
    const googleUser = await userRes.json();
    let user=await userModel.findOne({email:googleUser.email});
    if(!user){
        user=await userModel.create({
            username:googleUser.name,
            email:googleUser.email,
            provider:"google",
            googleId:googleUser.id
        })
    }
    const loginToken=await jwt.sign({
        username:user.username,
        email:user.email
    },process.env.JWT_SECRET);
    res.clearCookie("code_verifier");
    res.cookie("loginToken",loginToken,{
         maxAge:7*24*60*60*1000 //7days
    })
    res.redirect("/");
})


module.exports = router;