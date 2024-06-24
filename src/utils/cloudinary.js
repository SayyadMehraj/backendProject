//It is used to upload the files from local storage i.e.., Server to cloudinary
//This is a good practice beacause we can reupload the file if any error occurs wihtout asking user again
import {v2 as cloudinary} from "cloudinary"
//Generally v2 is named as cloudinary for better understanding
import fs from "fs" //This is used for fileHandling
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View Credentials' below to copy your API secret 
});

const uploadFileCloudinary  = async (localFilePath) => {
    try {
        if(!localFilePath) return null //It there is no such file exists
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //File got uploaded
        //console.log(`The file got uploaded ${response.url}`);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlink(localFilePath)
        //File is removed from the server to avoid miscellaneous other files to the server
        return null
    }
}

export {uploadFileCloudinary}