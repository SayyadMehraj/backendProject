import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadFileCloudinary} from "../utils/cloudinary.js"
import { uploadVideoCloudinary } from "../utils/videoCloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if([title,description].some((field) => field?.trim() === "")){
        throw new ApiError(400,"Enter the title and description properly!!")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoLocalPath){
        throw new ApiError(400,"No video file is uploaded")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400,"No thumbnail file is uploaded")
    }

    const videoUpload =await uploadVideoCloudinary(videoLocalPath)
    const thumbnailUpload =await uploadFileCloudinary(thumbnailLocalPath)

    if(!videoUpload){
        throw new ApiError(500,"Video couldn't uploaded")
    }

    if (!thumbnailUpload) {
        throw new ApiError(500,"Thumbnail couldn't uploaded")
    }

    // console.log(req.user);
    const userId = req.user?._id;
    // console.log(userId);

    const video =await Video.create({
        title,
        description,
        owner:userId,
        videoFile:videoUpload.url,
        thumbnail:thumbnailUpload.url,
        duration:videoUpload.duration
    })

    if(!video){
        throw new ApiError(500,"Something went wrong")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(202,video,"File uploaded successfully..!"))


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
