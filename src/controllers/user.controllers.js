import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadFileCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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
export {userRegister}