import { Router } from "express";
import { resgisterUser, loginUser, logoutUser, accessRefreshToken, changePassword, getCurrentUser, updateAccountDetails, changeAvatar, changeCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    resgisterUser
)

router.route("/login").post(
    loginUser
)

// secured routes
router.route("/logout").post(
    verifyJWT, logoutUser
)

router.route("/refresh-token").post(
    accessRefreshToken
)

router.route("/change-password").post(
    verifyJWT, changePassword
)

router.route("/current-user").get(
    verifyJWT, getCurrentUser
)

router.route("/update-account").patch( // PATCH is the correct HTTP method when you want to update only some fields
    verifyJWT, updateAccountDetails
)

router.route("/change-avatar").patch(
    verifyJWT, upload.single("avatar"), changeAvatar
)

router.route("/change-coverImage").patch(
    verifyJWT, upload.single("coverImage"), changeCoverImage
)

router.route("/channel/:username").get(  // from params
    verifyJWT, getUserChannelProfile
)

router.route("/history").get(
    verifyJWT, getWatchHistory
)

export default router;