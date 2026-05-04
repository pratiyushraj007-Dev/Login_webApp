🔐 login_webApp

    login_webApp is a user authentication system built using Node.js, Express, and MongoDB.
    It implements the essential functionality required for managing user accounts and handling secure access to an application.
    
    This project covers key authentication flows, including:
    
      User registration and login
      Password hashing for secure storage
      OTP-based email verification
      Password reset using time-limited tokens
    
    It is designed to demonstrate how authentication works in real applications 
    while keeping the structure organized and easy to extend.

🚀 Features

    ✅ User Registration & Login
    🔒 Password Hashing using bcrypt
    🍪 JWT Authentication (stored in cookies)
    📧 OTP Verification via Email
    🔁 Forgot Password & Reset Password Flow
    ⏳ Reset Token Expiry Handling
    🔐 Secure Password Update System

🛠️ Tech Stack

    Backend: Node.js, Express.js
    Database: MongoDB (Mongoose)
    Authentication: JWT, bcrypt
    Email Service: Nodemailer
    Environment Config: dotenv 

📂 Project Structure

      login_webApp/
          |── node_modules/
          |
          |── public/
          |     ├── css/
          |           ├──confirmation-gmail.css
          |           ├──index.css
          |           ├──input.css
          |           ├──verify-otp.css
          |
          │── src/
          │   ├── controllers/
          |         ├── auth.controller.js
          │   ├── db/
          |         ├── db.js
          │   ├── models/
          |         ├── user.model.js
          │   ├── routes/
          |         ├── auth.routes.js
          |         ├── get.routes.js
          |   ├── app.js
          │
          |── views/
          │   ├── confirmation-gmail.html
          │   ├── login.html
          │   ├── register.html
          |   ├── reset-password.html
          |   ├── user.html
          |   ├── verify-otp.html
          |
          │── .env
          │── .gitignore
          ├── package-lock.json
          │── package.json
          │── server.js

⚙️ Installation & Setup

      1️⃣ Clone the repository
        git clone https://github.com/your-username/login_webApp.git
        cd login_webApp
      
      2️⃣ Install dependencies
        npm install
      
      3️⃣ Create .env file
        PORT=3000
        HOST=smtp.gmail.com
        HOST_EMAIL=your service gmail
        HOST_PASSWORD=your services gmail password
        MONGO_URI=your MONGO_URI
        JWT_SECRET=your JWT_SECRET
        GOOGLE_CLIENT_ID=your OAUTH_ID
        GOOGLE_CLIENT_SECRET=your OAUTH_SECRET
        CALLBACK_URL=your OAUTH_CALLBACK_URL

      ▶️ Run the Project
        npm start
  
        Server will run on:
        
        http://localhost:3000
