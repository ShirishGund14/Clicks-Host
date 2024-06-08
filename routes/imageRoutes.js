const express = require("express");
const{UploadPostController,getAllPostsController,
    DeletePostController,updatePostController,
    SavePostController,
    LikePostController,
    UnLikePostController,
    UnSavePostController,
    AddCommentController,
    DeleteCommentController,
    GetPostController,
    GetAllCommentsOfPost,
    GetMyPostsController,
    GetAllSavedPostsController,
    UpdateCommentOfPost,
    SliderImages,
    TopImages

}=require('../controllers/imageController')

const authMiddleware= require('../middlewares/authMiddleware')
const multer=require('multer')



const path = require('path');
const fs = require('fs');



// Ensure the uploads directory exists
// const uploadDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

const storage = multer.diskStorage({

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


//router object
const router = express.Router();


router.get("/feed",authMiddleware, getAllPostsController);
router.get("/welcome", SliderImages);
router.get("/Topclicks", TopImages);



router.post("/upload",upload.single('post') ,authMiddleware,UploadPostController);

router.delete("/delete/:id",authMiddleware, DeletePostController);
router.put("/update/:id",authMiddleware, updatePostController);
router.post("/save/:id",authMiddleware, SavePostController);
router.post("/unsave/:id",authMiddleware, UnSavePostController);

router.post("/like/:id",authMiddleware, LikePostController);
router.post("/unlike/:id",authMiddleware, UnLikePostController);


router.post("/add-Comment/:id",authMiddleware, AddCommentController);
router.get("/getPost/:id", GetPostController);
router.get("/myposts",authMiddleware,GetMyPostsController);
router.get("/savedPosts",authMiddleware,GetAllSavedPostsController);

router.delete("/delete-Comment/:id",authMiddleware, DeleteCommentController);
router.get("/getAll-Comments/:id",authMiddleware, GetAllCommentsOfPost);
router.put("/update-Comment/:id",authMiddleware, UpdateCommentOfPost);





module.exports = router;