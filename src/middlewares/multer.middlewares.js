//It is used to get files from the user and upload them in the temp folder
//Until the file gets uploaded to the cloudinary
import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //Basically it is a good practice to give file names a unique
    //So that even ever user byMistake uploads the files and they have the same name then it becomes cluster
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
     cb(null, file.originalname)
    }
  })
  
export const upload = multer({
     storage,
})