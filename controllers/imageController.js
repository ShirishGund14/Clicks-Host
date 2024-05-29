const imageModel = require("../models/imageModel");
const userModel = require("../models/userModel");
const commentModel = require("../models/commentModel");


exports.UploadPostController=async(req,res)=>{
    try {
       // console.log('reqfile',req.file);
        // console.log('req body',req.body);
    
        const id=req.body.userId;
        const existingUser=await userModel.findOne({_id:id});
        const post=req.file.filename;

        if(!existingUser){
            return res.send({
                success: false,
                message: "User Not found",
              });
        }

       const {description,caption}=req.body;
        const newPost=new imageModel({
            user:existingUser,
            description,
            url:post,
            caption,
        })

       await newPost.save();
       return res.send({
        success: true,
        message: "New Post Created",
        newPost
      });
  

    } catch (error) {
        console.log(error);
        return res.status(500).send({
          message: "Error in Uploading Img",
          success: false,
          error,
        });
      }
}


exports.getAllPostsController = async (req, res) => {
    try {
        // Fetch all posts from the database
        const allPosts = await imageModel.find({});
        const userId=req.body.userId;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found ,Login to save posts"
            });
        }
        
        
        return res.status(200).json({
            success: true,
            message: "All Posts Retrieved Successfully",
            posts: allPosts,
            userId,
            savedPosts: user.savedPosts,
        });
    } catch (error) {
        console.error("Error in getAllPostsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error in retrieving posts",
            error: error.message
        });
    }
};

exports.GetPostController = async (req, res) => {
    try {
        // Fetch all posts from the database
        const postId = req.params.id;
        // console.log('PostID',postId);
        const post=await imageModel.findById({_id:postId});
        const existingUser=await userModel.findById({_id:post.user}).select('-password -savedPosts -createdAt -__v');;
        
        if(!post){
            return({
                success:false,
                message:'Post not found',
            })
        }

        return res.status(200).json({
            success: true,
            message: "Post Info feteched succesfully",
            post,
            existingUser
            
        });
    } catch (error) {
        console.error("Error in getAllPostsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error in retrieving posts",
            error: error.message
        });
    }
};


exports.DeletePostController=async(req,res)=>{
try {
    const PostId=req.params.id;
    // console.log('postid',PostId);
    
    await imageModel.findByIdAndDelete({_id:PostId});

    return res.status(200).json({
        success: true,
        message: "Post deleted Successfully",
    });


} catch (error) {
    console.error("Error in DeletePostController:", error);
    return res.status(500).json({
        success: false,
        message: "Error in deleting post",
        error: error.message
    });
}
}

exports.updatePostController=async(req,res)=>{
    try {
        const PostId=req.params.id;
        const {description,caption}=req.body;
        
       const existingPost= await imageModel.findById({_id:PostId});
    
       if (!existingPost) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        });
    }
    const updatedPost = await imageModel.findByIdAndUpdate(
        PostId,
        { ...req.body },
        { new: true }
      );

    return res.status(200).json({
        success: true,
        message: "Post updated successfully",
        updatedPost
    });
    
    
    } catch (error) {
        console.error("Error in updatePostController:", error);
        return res.status(500).json({
            success: false,
            message: "Error in deleting post",
            error: error.message
        });
    }
    }


exports.SavePostController = async (req, res) => {
    try {
        const userId = req.body.userId; // Extract user ID from the authenticated user
        const postId = req.params.id; // Extract post ID from request parameters

        // Check if the user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found ,Login to save posts"
            });
        }

        // Check if the post exists
        const post = await imageModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if the post is already saved by the user
        if (user.savedPosts.includes(postId)) {
            return res.status(400).json({
                success: false,
                message: "Post already saved by the user"
            });
        }

        // Save the post to the user's savedPosts array
        user.savedPosts.push(postId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Post saved successfully",
            savedPost: post
        });
    } catch (error) {
        console.error("Error in savePostController:", error);
        return res.status(500).json({
            success: false,
            message: "Error saving post",
            error: error.message
        });
    }
};

exports.UnSavePostController = async (req, res) => {
    try {
        const userId = req.body.userId; // Extract user ID from the authenticated user
        const postId = req.params.id; // Extract post ID from request parameters

        // Check if the user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Login to unsave posts."
            });
        }

        // Check if the post is in the user's saved posts
        const postIndex = user.savedPosts.indexOf(postId);
        if (postIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "Post not saved by the user."
            });
        }

        // Remove the post from the user's savedPosts array
        user.savedPosts.splice(postIndex, 1);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Post unsaved successfully",
        });
    } catch (error) {
        console.error("Error in unSavePostController:", error);
        return res.status(500).json({
            success: false,
            message: "Error unsaving post",
            error: error.message
        });
    }
};



exports.LikePostController = async (req, res) => {
    try {
        const postId = req.params.id; 
        const userId=req.body.userId;

        // Check if the post exists
        const post = await imageModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if the user has already liked the post
        if (post.likes.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "Post already liked by the user"
            });
        }

        // Add the user's ID to the post's likes array
        post.likes.push(userId);
        await post.save();

        return res.status(200).json({
            success: true,
            message: "Post liked successfully",
            likedPost: post
        });
    } catch (error) {
        console.error("Error in LikePostController:", error);
        return res.status(500).json({
            success: false,
            message: "Error liking post",
            error: error.message
        });
    }
};



exports.UnLikePostController = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId=req.body.userId;

        // Check if the post exists
        // console.log('userID',userId);
        const post = await imageModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if the user has liked the post
        const userIndex = post.likes.indexOf(userId);
        if (userIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "Post not liked by the user"
            });
        }

        // Remove the user's ID from the post's likes array
        post.likes.splice(userIndex, 1);
        await post.save();

        return res.status(200).json({
            success: true,
            message: "Post unliked successfully",
            unlikedPost: post
        });
    } catch (error) {
        console.error("Error in unlikePostController:", error);
        return res.status(500).json({
            success: false,
            message: "Error unliking post",
            error: error.message
        });
    }
};

// COMMENTS 

exports.AddCommentController = async (req, res) => {
    try {
        const userId = req.body.userId;  // Extract user ID from the authenticated user
        const postId = req.params.id;    // Extract post ID from request parameters
        const { CommentTxt } = req.body;       // Extract the comment text from the request body

        // Check if the user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please log in to comment."
            });
        }

        // Check if the post exists
        const post = await imageModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        
        // Create a new comment
        const newComment = new commentModel({
            user: userId,
            post: postId,
            text:CommentTxt
        });

        await newComment.save();

        // Add the comment to the post's comments array
        post.comments.push(newComment._id);
        await post.save();

        return res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            comment: newComment
        });
    } catch (error) {
        console.error("Error in addCommentController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding comment.",
            error: error.message
        });
    }
};


exports.DeleteCommentController = async (req, res) => {
    try {
        const userId = req.body.userId;  // Extract user ID from the authenticated user
        const commentId = req.params.id;  // Extract comment ID from request parameters

        // Check if the user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please log in to delete comments."
            });
        }

        // Check if the comment exists
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found."
            });
        }

        // Check if the user is the owner of the comment
        if (comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment."
            });
        }

        // Find the associated post
        const post = await imageModel.findById(comment.post);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        // Remove the comment from the post's comments array
        post.comments = post.comments.filter(id => id.toString() !== commentId);
        await post.save();

        // Delete the comment from the database
        await commentModel.findByIdAndDelete(commentId);

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully."
        });
    } catch (error) {
        console.error("Error in DeleteCommentController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting comment.",
            error: error.message
        });
    }
};

exports.GetAllCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await commentModel.find({ post: postId });

        // console.log('Allcomments', comments);

        // Use map to iterate over comments and modify them
        const commentsWithDetails = await Promise.all(comments.map(async (comment) => {
            const userid = comment.user;
            // await here because you're awaiting userModel.findById
            const existingUser = await userModel.findById(userid);
            // console.log('existingUser:', existingUser); // Log existingUser
            // You might want to do something with existingUser here
            // For example, you could add it to the comment object
            const commentWithDetails = {
                ...comment.toObject(), // Convert Mongoose document to plain JavaScript object
                userDetails: {
                    _id: existingUser._id,
                    username: existingUser.username,
                    profilePicture: existingUser.profilePicture // Access profilePicture directly from userModel
                }
            };
            return commentWithDetails;
        }));

        return res.status(200).json({
            success: true,
            message: "All comments retrieved successfully",
            comments: commentsWithDetails
        });
    } catch (error) {
        console.error("Error in GetAllCommentsOfPost:", error);
        return res.status(500).json({
            success: false,
            message: "Error in retrieving comments",
            error: error.message
        });
    }
};


exports.GetMyPostsController = async (req, res) => {
    try {
        // Fetch all posts from the database
        
        const userId=req.body.userId;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found ,Login to save posts"
            });
        }
        
        const myposts= await imageModel.find({user:userId});
        return res.status(200).json({
            success: true,
            message: "All My-Posts Retrieved Successfully",
            myposts,
            userId
        });
    } catch (error) {
        console.error("Error in getAllPostsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error in retrieving posts",
            error: error.message
        });
    }
};


exports.GetAllSavedPostsController = async (req, res) => {
    try {
        
        
        const userId=req.body.userId;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found ,Login to save posts"
            });
        }
        
        const savedposts=user.savedPosts;
        const AllUserSavedPosts=[];

        await Promise.all(savedposts.map(async (postId) => {
            
            const existingPost = await imageModel.findById(postId);
            // if(!existingPost) console.log('missing post',postId);
        
            AllUserSavedPosts.push(existingPost);
        }));


        return res.status(200).json({
            success: true,
            message: "All saved posts Retrieved Successfully",
            savedposts:AllUserSavedPosts,
            userId
        });
    } catch (error) {
        console.error("Error in getAllPostsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error in retrieving posts",
            error: error.message
        });
    }
};


exports.UpdateCommentOfPost = async (req, res) => {
    try {
        
        
        const userId=req.body.userId;
        const commentId=req.params.id;
        const {CommentTxt}=req.body;

        const Comment = await commentModel.findById(commentId);
        if (!commentId) {
            return res.status(404).json({
                success: false,
                message: "Comment not found "
            });
        }
        if(userId!=Comment.user){
            return res.status(404).json({
                success: false,
                message: "You can't edit other user's comment "
            });
        }
        
        Comment.text = CommentTxt;
        await Comment.save();
      

        return res.status(200).json({
            success: true,
            message: "All saved posts Retrieved Successfully",
            Comment,
            userId
        });
    } catch (error) {
        console.error("Error in getAllPostsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error in retrieving posts",
            error: error.message
        });
    }
};
