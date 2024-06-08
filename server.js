const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path=require('path');
const cloudinary = require('cloudinary').v2; // Import Cloudinary module

dotenv.config();


const userRoutes = require("./routes/userRoutes");
const imageRoutes=require('./routes/imageRoutes');


connectDB();


const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//middelwares
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());


//routes
// app.use('/uploads', express.static(path.join(__dirname, './uploads')));
// console.log('uploadfolderPath',path.join(__dirname, './uploads'));
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/posts", imageRoutes);


DEPLOY
app.use(express.static(path.join(__dirname,"./client/build")));
app.get('*',function(req,res){
  res.sendFile(path.join(__dirname,"./client/build/index.html"));
});


const PORT = process.env.PORT || 8080;


app.listen(PORT, () => {
  console.log(
    `Server Running on  mode port no ${PORT}`
  );
});