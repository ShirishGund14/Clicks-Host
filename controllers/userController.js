const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;


// Register user
exports.registerController = async (req, res) => {
  try {
    // console.log('req bost',req.body);
    const { username, email, password } = req.body;
    // const avatar=req.file.filename;
    // console.log('req.file',req.file);
    // console.log('avatar',avatar);
   
    // Validation
    if (!username || !email || !password) {
      return res.send({
        success: false,
        message: "Please fill in all fields",
      });
    }


   
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.send({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await cloudinary.uploader.upload(req.file.path);
   
    const user = new userModel({
      username, 
      email, 
      password: hashedPassword,
      profilePicture:result.secure_url,
      
    });
    await user.save();
    return res.send({
      success: true,
      message: "New User Created",
      user,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error in Register callback",
      success: false,
      error,
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    return res.status(200).send({
      userCount: users.length,
      success: true,
      message: "All users data",
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get All Users",
      error,
    });
  }
};


// Login
exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
      return res.send({
        success: false,
        message: "Please provide email and password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Email is not registered",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send({
        success: false,
        message: "Invalid Password",
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });


    return res.status(200).send({
      success: true,
      message: "Login successful",
      user,
      token, // Send the token to the client
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Login Callback",
      error,
    });
  }
};




// get current user
exports.userInfoController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user=await userModel.findById(userId);
    // console.log('userid',userId)

    
    res.status(200).json({
      success: true,
      message: "User  data",
      user
    });
  } catch (error) {
    console.error(error);

  
    res.status(500).json({
      success: false,
      message: "Error in User info Controller",
      error: error.message, 
    });
  }
};



// exports.UpdateAvatar = async (req, res) => {
//   try {
//     const userId = req.body.userId; // Assuming userId is provided in the request body
    

//     // console.log('userId',userId);
//     // console.log('avatar',avatar);

//     // Check if the user exists
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Update user's avatar
//     console.log('File path',req.file.path);
//     const result = await cloudinary.uploader.upload(req.file.path);

//     user.profilePicture = result.secure_url;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Avatar updated successfully",
//       user: user, // Optionally, you can send the updated user object back to the client
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Error updating avatar",
//       error: error.message,
//     });
//   }
// };


exports.updateUserInfoController = async (req, res) => {
  try {
      const userId = req.body.userId; // Extract user ID from the authenticated user
      const { name, email } = req.body; // Extract name and email from request body
      let profilePicture;

      if (req.file) {
          profilePicture = req.file.path; // Assuming the file is handled and uploaded properly
      }

      // Check if the user exists
      const user = await userModel.findById(userId);
      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found. Please log in to update details."
          });
      }

      const result = await cloudinary.uploader.upload(req.file.path);
      // Prepare the update object
      const updateData = {};
      if (name) updateData.username = name;
      if (email) updateData.email = email;
      if (profilePicture) updateData.profilePicture = result.secure_url;

      // Update user details
      const updatedUser = await userModel.findByIdAndUpdate(
          userId,
          { $set: updateData },
          { new: true } // Return the updated user document
      );

      return res.status(200).json({
          success: true,
          message: "User details updated successfully",
          user: updatedUser
      });
  } catch (error) {
      console.error("Error in updateUserInfoController:", error);
      return res.status(500).json({
          success: false,
          message: "Error updating user details",
          error: error.message
      });
  }
};






exports.testController=async(req,res)=>{
  try {
   res.send({
    message:'end point ',
    success:true
   })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in User test Controller",
      error: error.message, 
    });
  }
}