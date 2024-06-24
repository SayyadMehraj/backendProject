import { Router } from "express";
import { userRegister,loginUser,logoutUser} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/register").post(
    //Fields are used because there are other types of images to be uploaded to diff fields
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    userRegister
)

router.route("/login").post(loginUser)

//Secured routes
router.route("/logout").post(verifyJWT,logoutUser)

export default router