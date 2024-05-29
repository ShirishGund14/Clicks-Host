const express = require("express");
const {
  getAllUsers,
  registerController,
  loginController,
  userInfoController,
  updateUserInfoController,
  testController
} = require("../controllers/userController");


const authMiddleware= require('../middlewares/authMiddleware')

const multer = require('multer');
const path = require('path');
const fs = require('fs');



// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


//router object
const router = express.Router();

router.get("/test",authMiddleware, testController);

// GET ALL USERS || GET
router.get("/all-users", getAllUsers);

// CREATE USER || POST
router.post("/register", upload.single('avatar') ,registerController);


router.post("/login", loginController);

//get Current user
router.get('/GetUserInfo',authMiddleware,userInfoController);


router.post("/updateUserInfo",upload.single('avatar') ,authMiddleware, updateUserInfoController);



module.exports = router;