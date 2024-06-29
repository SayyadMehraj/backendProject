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
    // console.log(videoId);

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes",
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $lookup:{
                            from:"subscriptions",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribers",
                        }
                    },
                    {
                        $addFields:{
                            subscribersCount:{
                                $size:"$subscribers"
                            },
                            isSubscribed:{
                                $cond:{
                                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                                    then:true,
                                    else:false,
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            username:1,
                            "avatar.url":1,
                            subscribersCount:1,
                            isSubscribed:1,
                        }
                    }
                ]
            }
        },
       {
        $addFields:{
            likesCount:{
                $size:"$likes",
            },
            owner:{
                $first:"$owner"
            },
            isLiked:{
                $cond:{
                    if:{$in:[req.user?._id,"$likes.likedBy"]},
                    then:true,
                    else:false,
                }
            }
        }
       },
       {
        $project:{
            videoFile:1,
            title:1,
            description:1,
            likesCount:1,
            isLiked:1,
            owner:1,
            views:1,
            createdAt:1,
            duration:1,
            comments:1,
        }
    }
]);

    // console.log(video)

    if(!video){
        throw new ApiError(500,"Found fetch the video..")
    }

    //Incrementing views count
    await Video.findByIdAndUpdate(videoId,{
        $inc:{
            views:1
        }
    })

    await User.findByIdAndUpdate(req.user?._id,{
        $addToSet:{
            watchHistory:videoId,
        }
    })
    
    const videoInfo = video[0]
    // console.log(videoInfo);

    return res
    .status(200)
    .json(new ApiResponse(200,videoInfo,"Video retrived successfully.."))

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
