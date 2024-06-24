import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const VideoSchema = new Schema({
    videoFile:{
        type:String, //Cloudinary url
        required:true,
    },
    thumbnail:{
        type:String, //Cloudinary url
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,//Actually it is given by the thirdparty service when a video is uploaded into that
        required:true,
    },
    view:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true})

VideoSchema.plugin(mongooseAggregatePaginate)//These plugins are made by mongoose 

export const Video = mongoose.model("Video",VideoSchema)