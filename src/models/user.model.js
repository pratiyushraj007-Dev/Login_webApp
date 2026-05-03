const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const userSchema =new mongoose.Schema({
    username:String,
    email:{
        type:String,
        unique:true
    },
    password:String,
    provider:String,
    googleId:String,
    resetToken:String,
    resetTokenExpiry:Date
})

userSchema.pre("save",async function(){
    if(!this.isModified("password")) return ;
    this.password=await bcrypt.hash(this.password,10);
})
const userModel=mongoose.model("user",userSchema);
module.exports=userModel;