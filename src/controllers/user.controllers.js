import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadFileCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"

//Here async is used beacuse only it is related to the internal system function not a webfunction
const generateAccessAndRefereshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        //Here we have saved the refreshToken but the problem is when we save it, 
        //It automatically thinks of the password save method. To overcome this
        await user.save({
            validityBeforeSave:false
        })

        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong generating tokens")
    }
}

const userRegister = asyncHandler(async(req,res) => {
    //TODO List:
    //get the details from the frontend
    //checking all the inputs are given
    //checking whether the user exists before : email, username
    //check for images;because avatar is said to be required in the model
    //is image being uploaded to the cloudinary
    //create user object - create entry in DB
    //remove password & refresh token from response
    //check user is created or not
    //return response
    const {fullName,email,username,password} = req.body
    console.log(`name: ${fullName}, email: ${email}, password: ${password}`);
    //Checking if any field is empty
    if(
        [fullName,email,username,password].some((field) => field?.trim() === "")
    ){
        console.log("Empty detected")
        throw new ApiError(400,"All the fields are complusory")
    }
    if(!email.includes("@")){
        // console.log("Doesnt contain @ symbol");
        throw new ApiError(400,"Enter valid email Id")
    }

    //Searching whether the user exists or not
    //We have already exported user so user Schema can be used to find it as it is still using Mongoose
    const existedUser =await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        // console.log("user is already  created");
        throw new ApiError(409,"User with email or username already exists!!")
    }
    //console.log(req.files);
    //Checking whether avatar is given to the server or not
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //There is a problem such that if i dont upload coverImage then it is returning error
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        // console.log("Avatar is required")
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadFileCloudinary(avatarLocalPath)
    const coverImage = await uploadFileCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    //We need to check whether the user is created or not
    //select is used which fields we DONT REQUIRE
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user..")
    }

    //Need to return the response with a detailed structure
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )

})

const loginUser = asyncHandler(async(req,res) => {
    //TODO List
    //Get the data from req.body
    //We can make the login using username or email
    //Check whether the username or email exists
    //password check
    //access and refresh tokens are generated
    //they are to send to the user through SECURE COOKIES

    const {email,username,password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }

    //If we want to check any one of the fields either username or email
    // if(!(username || email)){
    //     throw new ApiError(400,"Username or email is required")
    // }

    const user =await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshToken(user._id)     

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //By this nobody can access the cookies there are only accessed by server
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user: loggedInUser,accessToken,refreshToken
        },
        "User logged in Successfully"
        )
    )
}) 

const logoutUser = asyncHandler (async(req,res) => {
    //Above all cases we got data from user so that we performed actions
    //By in this we are not getting response
    //So we created a middleware on the request
    
    //TODO List
    //clear the cookie
    //clear refresh token
    await User.findByIdAndUpdate(
        req.user._id,
    {
        $set:{
            refreshToken:undefined,
        }
    },
    {
        new:true,
    })
    const options = {
        httpOnly:true,
        secure:true,
    }
    
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken")
    .json(new ApiResponse(200,{},"User loggedOut Successfully"))
})

const refreshAcessToken = asyncHandler(async(req,res) => {
    //Here we are using or condition because the user may be using it from the mobile
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized Access")
    }

   try {
     const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
     const user = await User.findById(decodedRefreshToken?._id) //This gives info of the user
 
     if(!user){
         throw new ApiError(401,"Invalid Refresh Token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Error")
     }
 
     const options = {
         httpOnly:true,
         secure:true
     } 
 
     const {accessToken,newRefreshToken} = await generateAccessAndRefereshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
         new ApiResponse(200,{
             accessToken,refreshToken:newRefreshToken
         },
         "Access Token Refreshed"
         )
     )
   } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
   }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid Password")
    }

    user.password = newPassword
    await user.save({validityBeforeSave:false})
    
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"))
    
})

const getCurrentUser = asyncHandler(async(req,res) => {

    return res
    .status(200)
    .json(200,req.user,"User Fetched Successfully")
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName,email} = req.body
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }
    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{email,
            fullName
        }
    },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {

    const avatarLocal = req.files[0]?.path
    console.log(avatarLocal);
    if(!avatarLocal){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar = await uploadFileCloudinary(avatarLocal)

    if(!avatar.url){
        throw new ApiError(400,"Something went while uploading file")
    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path 

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image file is Missing")
    }

    const coverImage = await uploadFileCloudinary(coverImageLocal) 

    if(!coverImage.url){
        throw new ApiError(400,"Something went wrong while uploading")
    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
        $set:{
            coverImage:coverImage.url
        },
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image updated successfully"))
})

export {userRegister,
        loginUser,
        logoutUser,
        refreshAcessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage
       }