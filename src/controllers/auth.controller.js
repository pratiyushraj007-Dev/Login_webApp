const userModel = require("../models/user.model");
const validator = require("email-validator");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const transport = nodemailer.createTransport({
    host: process.env.HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.HOST_EMAIL,
        pass: process.env.HOST_PASSWORD
    },
});

const registerUser = async (req, res) => {
    const { otp } = req.body;
    const tempToken = req.cookies.tempToken;
    let decoded;
    try {
        decoded = await jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
        return res.json({
            message: "Unauthorized or expired"
        });
    }

    if (decoded.step !== "sign-up") {
        return res.json({
            message: "Unauthorized or expired"
        });
    }
    const isMatch = await bcrypt.compare(otp, decoded.otp);
    if (!isMatch) {
        return res.json({
            message: "Invalid OTP"
        });
    }
    await userModel.create({
        username: decoded.username,
        email: decoded.email,
        password: decoded.password
    });
    return res.status(200).json({
        success: true,
        redirect: "/login"
    });

}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!validator.validate(email)) {
        res.status(400).json({
            message: "Email is invalid"
        })
    }
    const user = await userModel.findOne({ email });
    if (!user) {
        res.status(400).json({
            message: "Email does not exist in the DataBase"
        })
    }
    const username = user.username;
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
        const token = jwt.sign({
            username,
            email,
        }, process.env.JWT_SECRET)
        res.cookie("loginToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000 //7days
        });
        res.redirect("/");
    } else {
        res.status(400).json({
            message: "password does not match"
        })
    }
}

const otpGeneration = async (req, res) => {
    const { username, email, password, confirmpassword } = req.body;
    if (password !== confirmpassword) {
        return res.status(400).json({
            message: "Password and Confirm Password should be same"
        })
    }
    if (!validator.validate(email)) {
        return res.status(400).json({
            message: "Email is invalid"
        })
    }
    const isUserExist = await userModel.findOne({
        email
    })
    if (isUserExist) {
        return res.status(409).json({
            message: "User Already Exist"
        })
    }

    const otpGen = Math.floor(100000 + Math.random() * 900000).toString(); //math.random() -> 0 <=x < 1;
    const hashedOtp = await bcrypt.hash(otpGen, 10);
    const tempToken = jwt.sign({
        username,
        email,
        password,
        otp: hashedOtp,
        step: "sign-up"
    }, process.env.JWT_SECRET,
        { expiresIn: "5m" }) //expiry time 5 minute


    try {
        await transport.sendMail({
            from: process.env.HOST_EMAIL,
            to: email,
            subject: "OTP",
            text: `Your OTP is ${otpGen}`
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message:"Server error"
        })
    }
    res.cookie("tempToken", tempToken, {
        maxAge: 5 * 60 * 1000 // 5 minutes
    });

    res.status(200).json({
        message: "OTP sent successfully"
    })

}

const verifyGmail = async (req, res) => {
    try {
        const { username, email } = req.body;
        if (!validator.validate(email)) {
            return res.status(400).json({
                message: "Email is invalid"
            })
        }
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({
            message: "User not found"
        });
        if (username !== user.username) {
            return res.status(404).json({
                message: "Invalid Credential"
            })
        }
        //1.Generate token

        const token = crypto.randomBytes(32).toString("hex");

        // 2.hashed token

        const hashedToken = await bcrypt.hash(token, 5);

        //3.save hashed token

        user.resetToken = hashedToken;
        user.resetTokenExpiry = Date.now() + 5 * 60 * 1000; //5 minutes from now
        await user.save();

        //4 send token

        const resentLink = `http://localhost:3000/reset-password/${email}/${token}`;
        await transport.sendMail({
            from: process.env.HOST_EMAIL,
            to: email,
            subject: "Password Reset Link",
            text: `Your password resent link ${resentLink}`
        })
        return res.status(200).json({
            message: "Reset Password link sent to your gmail and it will valid for 5 minutes"
        })
    } catch (error) {
        return res.status(404).json({
            message: "Server error"
        })
    }
}

const resetPassword = async (req, res) => {
    const { email, password, confirmPassword, token } = req.body;
    if (!validator.validate(email)) {
        return res.status(400).json({
            message: "Email is invalid"
        })
    }
    if (password !== confirmPassword) {
        return res.status(401).json({
            message: "password and confirm password does not match"
        })
    }
    const user = await userModel.findOne({ email });
    if (user.resetTokenExpiry < Date.now()) {
        return res.status(401).json({
            message: "Token Expired"
        })
    }
    const isMatch = await bcrypt.compare(token, user.resetToken);
    if (!isMatch) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.save();
    res.status(200).json({
        message: "Password Changed Successfully"
    })
}


module.exports = { registerUser, otpGeneration, loginUser, verifyGmail, resetPassword };