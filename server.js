const dns=require("dns");
dns.setServers(["1.1.1.1","0.0.0.0"])
require("dotenv").config();
const app=require("./src/app");
const connectDB=require("./src/db/db.js");
const PORT=process.env.PORT;

connectDB();
app.listen(PORT,()=>{
    console.log(`The server is running at ${PORT}`)
})
